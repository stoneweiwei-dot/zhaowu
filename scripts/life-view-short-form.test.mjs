import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const homeSection = readFileSync("src/components/life-view-home-section.tsx", "utf8");
const { LIFE_VIEW_SHORT_FORM_ARTICLES } = await import("../src/lib/life-view-short-form.ts");

test("homepage keeps short-form notes active alongside the new long-form series without reviving legacy article packs", () => {
  assert.match(homeSection, /LIFE_VIEW_SHORT_FORM_ARTICLES/);
  assert.match(homeSection, /\[\.\.\.LIFE_VIEW_LONG_FORM_ARTICLES, \.\.\.LIFE_VIEW_SHORT_FORM_ARTICLES, \.\.\.LIFE_VIEW_CURATED_ARTICLES\]/);
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

test("short-form articles stay unique, tri-lingual and preserve the approved core lines as the collection expands", () => {
  assert.ok(LIFE_VIEW_SHORT_FORM_ARTICLES.length >= 1);

  const ids = LIFE_VIEW_SHORT_FORM_ARTICLES.map((article) => article.id);
  assert.equal(new Set(ids).size, ids.length);
  assert.ok(ids.includes("flowers-fall-mind-stays-steady"));

  for (const article of LIFE_VIEW_SHORT_FORM_ARTICLES) {
    for (const locale of ["zh-Hant", "zh-Hans", "en"]) {
      assert.ok(article.title[locale]?.trim(), `${article.id} missing ${locale} title`);
      assert.ok(article.summary[locale]?.trim(), `${article.id} missing ${locale} summary`);
      assert.ok(article.body[locale]?.trim(), `${article.id} missing ${locale} body`);
    }
  }

  const approvedHans = LIFE_VIEW_SHORT_FORM_ARTICLES.map((article) => article.body["zh-Hans"]).join("\n\n");
  assert.match(approvedHans, /花开不喜，花落不悲，缘来不拒，缘去不追/);
  assert.match(approvedHans, /不以人言乱其神，不以世事动其心/);
  assert.match(approvedHans, /因上努力，果上随缘/);
  assert.match(approvedHans, /知人，是看懂世界；自知，是看懂自己/);
});
