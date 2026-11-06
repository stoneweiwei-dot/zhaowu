import test from "node:test";
import assert from "node:assert/strict";
import { checkDraftPermission, createAndVerifyDraft, getStableToken, validArticle } from "./wechat-draft-api.mjs";
const ok = (body) => ({ ok: true, json: async () => body });
test("credential exchange never leaks secret in result", async () => {
  let requestBody = null;
  const fetchImpl = async (_url, options) => { requestBody = JSON.parse(options.body); return ok({ access_token: "test-token", expires_in: 7200 }); };
  const token = await getStableToken("app", "private-secret", fetchImpl);
  assert.equal(token, "test-token");
  assert.equal(requestBody.secret, "private-secret");
});
test("permission check surfaces unauthorized code without credentials", async () => {
  await assert.rejects(checkDraftPermission("token", async () => ok({ errcode: 48001, errmsg: "api unauthorized" })), /WECHAT_API_48001/);
  const checked = await checkDraftPermission("token", async () => ok({ errcode: 0, total_count: 2 }));
  assert.equal(checked.count, 2);
});
test("invalid article fails before upload and does not allow unsafe HTML", () => {
  assert.throws(() => validArticle({ title: "a", digest: "", content: "<p>a</p>" }, ""), /TITLE_CONTENT_THUMB_REQUIRED/);
  assert.throws(() => validArticle({ title: "a", content: "<script>x<\\/script>" }, "thumb"), /UNSAFE_HTML/);
});
test("creates once, verifies draft, never calls publish endpoint", async () => {
  const paths = [];
  const fetchImpl = async (url) => {
    paths.push(url.pathname);
    return ok(paths.length === 1 ? { media_id: "draft1" } : { news_item: [{ title: "a" }] });
  };
  const result = await createAndVerifyDraft(validArticle({ title: "a", digest: "", content: "<p>b</p>" }, "thumb"), "token", fetchImpl);
  assert.deepEqual(paths, ["/cgi-bin/draft/add", "/cgi-bin/draft/get"]);
  assert.equal(result.status, "draft_verified_not_published");
});
