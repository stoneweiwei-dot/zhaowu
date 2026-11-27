import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { AI_DISCARNATE_INTELLIGENCE_ARTICLE as article } from "../src/lib/life-view-long-form/ai-discarnate-intelligence.ts";

test("AI essay keeps nine bilingual sections and does not reference the missing gallery originals", () => {
  assert.equal(article.illustrations?.length ?? 0, 0);
  const source = readFileSync("src/lib/life-view-long-form/ai-discarnate-intelligence.ts", "utf8");
  assert.doesNotMatch(source, /ai-discarnate-intelligence-20261022/);
  assert.doesNotMatch(source, /\.png/);
  for (const locale of ["zh-Hant", "zh-Hans", "en"]) {
    assert.equal(article.body[locale].split(/\n\n+/).length, 9);
  }
  assert.ok(readFileSync("src/lib/life-view-long-form.ts","utf8").includes("AI_DISCARNATE_INTELLIGENCE_ARTICLE"));
});
