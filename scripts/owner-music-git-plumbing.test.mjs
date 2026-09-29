import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import test from "node:test";
import { __plumbing, MANIFEST_PATH, TRACK_DIR, SCRATCH_DIR } from "../lib/owner-music-git.js";

// Guards the r223 fix: uploads must build the commit from the branch tip's tree
// (no checkout) and push ONLY new objects, so /tmp usage and push size no longer
// scale with the whole library. A real `git` validates the produced pack.

const sh = (cwd, ...args) => execFileSync("git", args, { cwd, encoding: "utf8" }).trim();

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

    const repo = { git, dir, tip };
    const manifest = await __plumbing.readManifestAt(repo);
    assert.equal(manifest.activeId, "a");
    assert.deepEqual(await __plumbing.listDirAt(repo, `${SCRATCH_DIR}/up12345678`), ["000.part"]);

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
