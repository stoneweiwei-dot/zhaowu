import assert from "node:assert/strict";
import test from "node:test";
import { countFromLink, FALLBACK, measureHistory } from "./development-history.mjs";

test("pagination last page gives an exact commit count", () => {
  assert.equal(countFromLink('<https://api.github.com/repos/x/y/commits?sha=abc&per_page=1&page=2>; rel="next", <https://api.github.com/repos/x/y/commits?sha=abc&per_page=1&page=2259>; rel="last"'), 2259);
  assert.equal(countFromLink(null), null);
  assert.equal(countFromLink('<https://api.github.com/?page=0>; rel="last"'), null);
});
test("unavailable or inconsistent upstream uses the dated verified fallback", async () => {
  assert.deepEqual(await measureHistory("a".repeat(40), async () => { throw new Error("offline"); }), FALLBACK);
  assert.deepEqual(await measureHistory("a".repeat(40), async () => ({ ok: true, json: async () => [{ sha: "b".repeat(40) }], headers: new Headers({ link: '<https://api.github.com/?page=3000>; rel="last"' }) })), FALLBACK);
});
test("exact target sha and API pagination are used together", async () => {
  const sha = "a".repeat(40);
  const measured = await measureHistory(sha, async () => ({ ok: true, json: async () => [{ sha }], headers: new Headers({ link: '<https://api.github.com/?page=2259>; rel="last"' }) }));
  assert.equal(measured.sha, sha);
  assert.equal(measured.count, 2259);
});
