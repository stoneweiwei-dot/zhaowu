import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";
import { __plumbing, MANIFEST_PATH, REPO, TRACK_DIR, SCRATCH_DIR } from "../lib/owner-music-git.js";

// Uploads must publish only changed blobs. Untouched library files stay on
// base_tree and must not be re-uploaded. No SSH, no local pack, no git fetch.

const TOKEN = "synthetic-music-token-0123456789";
const TIP = "a".repeat(40);
const TREE = "1".repeat(40);
const BLOB_A = "2".repeat(40);
const BLOB_B = "3".repeat(40);
const COMMIT = "4".repeat(40);

function jsonResponse(body, status = 200) {
  return {
    ok: status >= 200 && status < 300,
    status,
    json: async () => body,
    text: async () => JSON.stringify(body),
  };
}

test("commitChanges uploads only changed blobs and leaves the rest on base_tree", async () => {
  const previous = process.env.ZHAOWU_OWNER_MUSIC_GITHUB_TOKEN;
  process.env.ZHAOWU_OWNER_MUSIC_GITHUB_TOKEN = TOKEN;
  const calls = [];
  let blobCount = 0;
  const original = globalThis.fetch;
  globalThis.fetch = async (url, init = {}) => {
    const body = init.body ? JSON.parse(init.body) : null;
    calls.push({ url: String(url), method: init.method || "GET", body, authorization: init.headers?.authorization || "" });
    const u = String(url);
    if (u.endsWith("/git/blobs")) {
      blobCount += 1;
      return jsonResponse({ sha: blobCount === 1 ? BLOB_A : BLOB_B });
    }
    if (u.endsWith("/git/trees")) return jsonResponse({ sha: TREE });
    if (u.endsWith("/git/commits")) return jsonResponse({ sha: COMMIT });
    if (u.includes("/git/refs/heads/owner-music")) return jsonResponse({ object: { sha: COMMIT } });
    return jsonResponse({}, 404);
  };
  try {
    const untouched = Buffer.alloc(200000, 1);
    const nextTrack = Buffer.alloc(1000, 3);
    const manifest = __plumbing.manifestBuffer({ version: 1, activeId: "b", tracks: [{ id: "b" }] });
    const repo = {
      tip: TIP,
      rootTreeSha: TREE,
      treeMap: new Map([
        [MANIFEST_PATH, { mode: "100644", type: "blob", sha: "5".repeat(40) }],
        [`${TRACK_DIR}/a.mp3`, { mode: "100644", type: "blob", sha: "6".repeat(40) }],
      ]),
    };
    const changes = new Map([
      [`${TRACK_DIR}/b.mp3`, nextTrack],
      [MANIFEST_PATH, manifest],
      [`${SCRATCH_DIR}/up12345678/000.part`, null],
    ]);
    const newSha = await __plumbing.commitChanges(repo, "owner-music: add b.mp3", changes);
    assert.equal(newSha, COMMIT);
    const blobs = calls.filter((call) => call.url.endsWith("/git/blobs"));
    assert.equal(blobs.length, 2);
    const uploaded = blobs.map((call) => Buffer.from(call.body.content, "base64"));
    assert.ok(uploaded.some((buf) => buf.equals(nextTrack)));
    assert.ok(uploaded.some((buf) => buf.equals(manifest)));
    assert.ok(uploaded.every((buf) => buf.length < 20000));
    assert.ok(!calls.some((call) => call.body && JSON.stringify(call.body).includes(untouched.toString("base64").slice(0, 80))));
    for (const call of calls) assert.equal(call.authorization, `Bearer ${TOKEN}`);
    const tree = calls.find((call) => call.url.endsWith("/git/trees"));
    assert.equal(tree.body.base_tree, TREE);
    assert.deepEqual(
      tree.body.tree.map((entry) => [entry.path, entry.sha]).sort(),
      [
        [`${TRACK_DIR}/b.mp3`, BLOB_A],
        [MANIFEST_PATH, BLOB_B],
        [`${SCRATCH_DIR}/up12345678/000.part`, null],
      ].sort(),
    );
    const commit = calls.find((call) => call.url.endsWith("/git/commits"));
    assert.deepEqual(commit.body.parents, [TIP]);
    assert.equal(commit.body.tree, TREE);
    const ref = calls.find((call) => call.url.includes("/git/refs/heads/owner-music"));
    assert.equal(ref.method, "PATCH");
    assert.equal(ref.body.sha, COMMIT);
    assert.ok(calls.every((call) => call.url.startsWith(`https://api.github.com/repos/${REPO}/`)));
  } finally {
    globalThis.fetch = original;
    if (previous === undefined) delete process.env.ZHAOWU_OWNER_MUSIC_GITHUB_TOKEN;
    else process.env.ZHAOWU_OWNER_MUSIC_GITHUB_TOKEN = previous;
  }
});

test("commitChanges fails closed before any write when the server token is missing", async () => {
  const previous = process.env.ZHAOWU_OWNER_MUSIC_GITHUB_TOKEN;
  delete process.env.ZHAOWU_OWNER_MUSIC_GITHUB_TOKEN;
  let calls = 0;
  const original = globalThis.fetch;
  globalThis.fetch = async () => { calls += 1; return jsonResponse({}); };
  try {
    await assert.rejects(
      __plumbing.commitChanges({ tip: TIP, rootTreeSha: TREE, treeMap: new Map() }, "owner-music: add", new Map([[MANIFEST_PATH, Buffer.from("x")]])),
      /尚未設定伺服器憑證/,
    );
    assert.equal(calls, 0);
  } finally {
    globalThis.fetch = original;
    if (previous === undefined) delete process.env.ZHAOWU_OWNER_MUSIC_GITHUB_TOKEN;
    else process.env.ZHAOWU_OWNER_MUSIC_GITHUB_TOKEN = previous;
  }
});

test("a rejected ref update carries GitHub's real tip and does not echo the response body", async () => {
  const previous = process.env.ZHAOWU_OWNER_MUSIC_GITHUB_TOKEN;
  process.env.ZHAOWU_OWNER_MUSIC_GITHUB_TOKEN = TOKEN;
  const real = "b".repeat(40);
  const original = globalThis.fetch;
  globalThis.fetch = async (url, init = {}) => {
    const u = String(url);
    if (init.method === "POST" && u.endsWith("/git/blobs")) return jsonResponse({ sha: BLOB_A });
    if (init.method === "POST" && u.endsWith("/git/trees")) return jsonResponse({ sha: TREE });
    if (init.method === "POST" && u.endsWith("/git/commits")) return jsonResponse({ sha: COMMIT });
    if (init.method === "PATCH" && u.includes("/git/refs/")) {
      return jsonResponse({ message: "Reference cannot be updated SECRET-BODY" }, 422);
    }
    if (u.includes("/git/refs/heads/")) return jsonResponse({ object: { sha: real } });
    return jsonResponse({}, 404);
  };
  try {
    await assert.rejects(
      __plumbing.commitChanges(
        { tip: TIP, rootTreeSha: TREE, treeMap: new Map() },
        "owner-music: add",
        new Map([[MANIFEST_PATH, Buffer.from("x")]]),
      ),
      (error) => {
        assert.equal(error.actualTip, real);
        assert.match(error.message, /曲目保存失敗，請稍後再試一次/);
        assert.doesNotMatch(error.message, /SECRET-BODY|Reference cannot/);
        return true;
      },
    );
  } finally {
    globalThis.fetch = original;
    if (previous === undefined) delete process.env.ZHAOWU_OWNER_MUSIC_GITHUB_TOKEN;
    else process.env.ZHAOWU_OWNER_MUSIC_GITHUB_TOKEN = previous;
  }
});

test("owner-music-git no longer fetches or pushes over git or SSH", async () => {
  const source = await readFile(new URL("../lib/owner-music-git.js", import.meta.url), "utf8");
  assert.doesNotMatch(source, /git\.fetch\(/);
  assert.doesNotMatch(source, /isomorphic-git/);
  assert.doesNotMatch(source, /ssh2|git-receive-pack|owner-music-ssh/);
  assert.match(source, /git\/commits\/\$\{tip\}/);
  assert.match(source, /git\/trees\/\$\{rootTreeSha\}\?recursive=1/);
  assert.match(source, /git\/blobs\/\$\{entry\.sha\}/);
  assert.match(source, /base_tree: repo\.rootTreeSha/);
});
