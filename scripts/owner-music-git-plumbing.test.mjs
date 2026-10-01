import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import test from "node:test";
import { __plumbing, MANIFEST_PATH, REPO, TRACK_DIR, SCRATCH_DIR } from "../lib/owner-music-git.js";

// Guards the r223/r224 fix: uploads must learn the existing branch structure
// via GitHub's read-only Git Data REST API (ref + recursive tree listing +
// on-demand blob reads) instead of a git fetch, which has no partial-clone
// filter and downloads every blob reachable from the tip commit (i.e. the
// whole library) on every single-track edit. commitChanges must then push
// ONLY new objects, referencing every untouched sibling by its existing oid.
// A real `git` validates the produced pack.

const sh = (cwd, ...args) => execFileSync("git", args, { cwd, encoding: "utf8" }).trim();

// Simulates GitHub's recursive tree listing (path/mode/type/sha, no blob
// content) by reading it straight out of the local test repo. `-t` is
// required: plain `ls-tree -r` lists only blobs, but GitHub's recursive=1
// response also includes an entry per intermediate directory (mode 040000,
// type tree) — childrenAt()/rewrite() need those to know which untouched
// subtrees to preserve by oid without ever reading their contents.
function lsTreeMap(dir, tip) {
  const out = sh(dir, "ls-tree", "-r", "-t", tip);
  const treeMap = new Map();
  for (const line of out.split("\n").filter(Boolean)) {
    const [meta, entryPath] = line.split("\t");
    const [mode, type, sha] = meta.split(" ");
    treeMap.set(entryPath, { mode, type, sha });
  }
  return treeMap;
}

// Stubs global fetch to serve only GitHub's blob-content endpoint, sourced
// from the local git object database — proves readFileAt/readManifestAt never
// need any other network call, and never touch objects outside `changes`.
function stubBlobFetch(git, dir, allowedShas) {
  const original = globalThis.fetch;
  const prefix = `https://api.github.com/repos/${REPO}/git/blobs/`;
  const seen = new Set();
  globalThis.fetch = async (url) => {
    assert.ok(String(url).startsWith(prefix), `unexpected network call: ${url}`);
    const sha = String(url).slice(prefix.length);
    assert.ok(allowedShas.has(sha), `blob-read requested for an oid outside the expected set: ${sha}`);
    seen.add(sha);
    const { blob } = await git.readBlob({ fs, dir, oid: sha });
    return { ok: true, json: async () => ({ encoding: "base64", content: Buffer.from(blob).toString("base64") }) };
  };
  return { seen, restore: () => { globalThis.fetch = original; } };
}

test("commitChanges packs only new objects and preserves everything else", async () => {
  const git = await __plumbing.loadGitRuntime();
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), "zw-music-test-"));
  try {
    await git.init({ fs, dir, defaultBranch: "owner-music" });
    const write = (rel, buf) => {
      fs.mkdirSync(path.dirname(path.join(dir, rel)), { recursive: true });
      fs.writeFileSync(path.join(dir, rel), buf);
    };
    write(MANIFEST_PATH, `${JSON.stringify({ version: 1, activeId: "a", tracks: [{ id: "a", filename: "a.mp3" }] })}\n`);
    write(`${TRACK_DIR}/a.mp3`, Buffer.alloc(200000, 1));
    write("public/audio/originals/o.mp3", Buffer.alloc(300000, 2));
    write(`${SCRATCH_DIR}/up12345678/000.part`, Buffer.from("part"));
    for (const f of [MANIFEST_PATH, `${TRACK_DIR}/a.mp3`, "public/audio/originals/o.mp3", `${SCRATCH_DIR}/up12345678/000.part`]) {
      await git.add({ fs, dir, filepath: f });
    }
    const tip = await git.commit({ fs, dir, message: "base", author: { name: "t", email: "t@t" } });
    const treeMap = lsTreeMap(dir, tip);

    // Reading the manifest and listing a scratch dir must resolve purely from
    // the tree listing plus, for the manifest, ONE blob-content read — never
    // the 300KB/200KB unrelated audio blobs.
    const manifestSha = treeMap.get(MANIFEST_PATH).sha;
    const stub = stubBlobFetch(git, dir, new Set([manifestSha]));
    let manifest;
    try {
      const repo = { git, dir, tip, treeMap };
      manifest = await __plumbing.readManifestAt(repo);
      assert.equal(manifest.activeId, "a");
      assert.deepEqual(await __plumbing.listDirAt(repo, `${SCRATCH_DIR}/up12345678`), ["000.part"]);
      assert.deepEqual([...stub.seen], [manifestSha], "only the manifest blob should have been read");
    } finally {
      stub.restore();
    }

    const repo = { git, dir, tip, treeMap };
    const next = { version: 1, activeId: "b", tracks: [{ id: "b", filename: "b.mp3" }, ...manifest.tracks] };
    const changes = new Map([
      [`${TRACK_DIR}/b.mp3`, Buffer.alloc(1000, 3)],
      [MANIFEST_PATH, __plumbing.manifestBuffer(next)],
      [`${SCRATCH_DIR}/up12345678/000.part`, null],
    ]);
    let pushed = null;
    const newSha = await __plumbing.commitChanges(repo, null, "owner-music: add b.mp3", changes, async (_k, packfile, oldSha, sha) => {
      pushed = { packfile, oldSha, sha };
    });
    assert.equal(pushed.oldSha, tip);
    assert.equal(pushed.sha, newSha);
    // 500KB of pre-existing binaries must NOT be in the pushed pack.
    assert.ok(pushed.packfile.length < 20000, `pack too large: ${pushed.packfile.length}`);

    // Apply the pack onto a copy that only has the old tip, exactly like the remote.
    const remote = fs.mkdtempSync(path.join(os.tmpdir(), "zw-music-remote-"));
    try {
      sh(remote, "init", "-q", "--bare");
      sh(dir, "push", "-q", remote, `${tip}:refs/heads/owner-music`);
      execFileSync("git", ["unpack-objects", "-q"], { cwd: remote, input: pushed.packfile });
      sh(remote, "update-ref", "refs/heads/owner-music", newSha);
      sh(remote, "fsck", "--strict");
      const files = sh(remote, "ls-tree", "-r", "--name-only", newSha).split("\n").sort();
      assert.deepEqual(files, [MANIFEST_PATH, "public/audio/originals/o.mp3", `${TRACK_DIR}/a.mp3`, `${TRACK_DIR}/b.mp3`].sort());
      assert.equal(sh(remote, "rev-parse", `${newSha}^`), tip);
    } finally {
      fs.rmSync(remote, { recursive: true, force: true });
    }
  } finally {
    fs.rmSync(dir, { recursive: true, force: true });
  }
});

test("owner-music-git no longer performs a git fetch of the branch", async () => {
  const { readFile } = await import("node:fs/promises");
  const source = await readFile(new URL("../lib/owner-music-git.js", import.meta.url), "utf8");
  assert.doesNotMatch(source, /git\.fetch\(/, "a git fetch downloads every blob reachable from the tip — the exact regression this test guards against");
  assert.doesNotMatch(source, /isomorphic-git\/http\/node/);
  assert.doesNotMatch(source, /addRemote/);
  assert.match(source, /git\/trees\/\$\{tip\}\?recursive=1/);
  assert.match(source, /git\/blobs\/\$\{entry\.sha\}/);
});
