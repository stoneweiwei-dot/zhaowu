import test from "node:test";
import assert from "node:assert/strict";
import { prepareWechatDraft } from "../src/lib/wechat-draft.ts";
test("normalizes local WeChat copy without claiming publication", () => {
  const result = prepareWechatDraft({ title: " 測試標題 ", summary: "測試摘要", body: "第一段\r\n\r\n\r\n第二段" });
  assert.deepEqual(result.warnings, []);
  assert.equal(result.title, "測試標題");
  assert.match(result.formatted, /第一段\n\n第二段/);
  assert.match(result.formatted, /昭梧觀象/);
});
test("blocks missing text and flags overlong fields", () => {
  assert.ok(prepareWechatDraft({ title: "", summary: "", body: "" }).warnings.includes("TITLE_REQUIRED"));
  const result = prepareWechatDraft({ title: "標".repeat(65), summary: "文".repeat(121), body: "<script>alert(1)</script>" });
  assert.deepEqual(result.warnings, ["TITLE_TOO_LONG", "SUMMARY_TOO_LONG", "UNSAFE_HTML_REVIEW"]);
});
