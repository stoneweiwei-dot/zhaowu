import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const homeSection = readFileSync("src/components/life-view-home-section.tsx", "utf8");
const { LIFE_VIEW_SHORT_FORM_ARTICLES } = await import("../src/lib/life-view-short-form.ts");

test("homepage prepends the curated short-form series without reviving legacy article packs", () => {
  assert.match(homeSection, /LIFE_VIEW_SHORT_FORM_ARTICLES/);
  assert.match(homeSection, /\[\.\.\.LIFE_VIEW_SHORT_FORM_ARTICLES, \.\.\.LIFE_VIEW_CURATED_ARTICLES\]/);
  for (const legacy of [
    "LIFE_VIEW_20260903_LATE_ARTICLES",
    "LIFE_VIEW_20260903_ARTICLES",
    "LIFE_VIEW_20260831_ARTICLES",
    "LIFE_VIEW_PRACTICE_ARTICLES",
    "LIFE_VIEW_FILE_ARTICLES",
    "LIFE_VIEW_ARTICLES",
  ]) {
    assert.equal(homeSection.includes(legacy), false, `${legacy} should remain archive-only`);
  }
});

test("short-form article is unique, tri-lingual and preserves the approved core lines", () => {
  assert.equal(LIFE_VIEW_SHORT_FORM_ARTICLES.length, 1);
  const article = LIFE_VIEW_SHORT_FORM_ARTICLES[0];
  assert.equal(article.id, "flowers-fall-mind-stays-steady");
  for (const locale of ["zh-Hant", "zh-Hans", "en"]) {
    assert.ok(article.title[locale]?.trim());
    assert.ok(article.summary[locale]?.trim());
    assert.ok(article.body[locale]?.trim());
  }
  assert.match(article.body["zh-Hans"], /花开不喜，花落不悲，缘来不拒，缘去不追/);
  assert.match(article.body["zh-Hans"], /不以人言乱其神，不以世事动其心/);
  assert.match(article.body["zh-Hans"], /因上努力，果上随缘/);
  assert.match(article.body["zh-Hans"], /知人，是看懂世界；自知，是看懂自己/);
});
