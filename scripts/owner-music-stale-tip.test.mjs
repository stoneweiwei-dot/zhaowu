import assert from "node:assert/strict";
import test from "node:test";
import { __plumbing } from "../lib/owner-music-git.js";

// Regression for the 2026-09-30 upload failures: GitHub's REST ref read lagged a push that had
// just landed, so the next chunk was built on a stale tip and the push was rejected with
// "cannot lock ref 'refs/heads/owner-music': is at <real> but expected <stale>".
// The rejection now carries `actualTip`; withRepo must rebuild the whole operation on it.

const STALE = "a".repeat(40);
const REAL = "b".repeat(40);

function stubGithub(t) {
  const seen = [];
  const original = globalThis.fetch;
  globalThis.fetch = async (url) => {
    const u = String(url);
    seen.push(u);
    const json = (body) => ({ ok: true, status: 200, json: async () => body });
    if (u.includes("/git/refs/heads/")) return json({ object: { sha: STALE } });
    if (u.includes("/git/trees/")) return json({ truncated: false, tree: [] });
    return { ok: false, status: 404, json: async () => ({}) };
  };
  t.after(() => { globalThis.fetch = original; });
  return seen;
}

test("withRepo rebuilds on GitHub's real tip when the push says the read tip was stale", async (t) => {
  const seen = stubGithub(t);
  const tips = [];
  const result = await __plumbing.withRepo(async (repo) => {
    tips.push(repo.tip);
    if (tips.length === 1) throw Object.assign(new Error("曲目保存失敗"), { actualTip: REAL });
    return "ok";
  });
  assert.equal(result, "ok");
  assert.deepEqual(tips, [STALE, REAL]);
  assert.ok(seen.some((u) => u.includes(`/git/trees/${REAL}`)), "second attempt must read the tree of the real tip");
});

test("withRepo does not retry ordinary failures and gives up after 3 stale-tip retries", async (t) => {
  stubGithub(t);
  let calls = 0;
  await assert.rejects(
    __plumbing.withRepo(async () => { calls += 1; throw new Error("boom"); }),
    /boom/,
  );
  assert.equal(calls, 1);

  calls = 0;
  await assert.rejects(
    __plumbing.withRepo(async () => {
      calls += 1;
      throw Object.assign(new Error("stale"), { actualTip: String(calls).repeat(40).slice(0, 40) });
    }),
    /stale/,
  );
  assert.equal(calls, 4); // first attempt + 3 retries
});
