import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const homeSection = readFileSync("src/components/life-view-home-section.tsx", "utf8");
const { LIFE_VIEW_SHORT_FORM_ARTICLES } = await import("../src/lib/life-view-short-form.ts");

test("homepage keeps short-form notes active alongside the long-form series without reviving legacy article packs", () => {
  assert.match(homeSection, /LIFE_VIEW_SHORT_FORM_ARTICLES/);
  assert.match(homeSection, /LIFE_VIEW_LONG_FORM_ARTICLES/);
  assert.match(homeSection, /LIFE_VIEW_CURATED_ARTICLES/);
  assert.match(homeSection, /ARTICLES\.sort\(\(a, b\) => b\.publishedAt\.localeCompare\(a\.publishedAt\)\)/);
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

test("short-form archive can keep growing while IDs remain unique and every note stays tri-lingual", () => {
  assert.ok(LIFE_VIEW_SHORT_FORM_ARTICLES.length >= 7, "published short-form notes must not be truncated");
  const ids = LIFE_VIEW_SHORT_FORM_ARTICLES.map((article) => article.id);
  assert.equal(new Set(ids).size, ids.length, "short-form article IDs must stay unique");

  for (const article of LIFE_VIEW_SHORT_FORM_ARTICLES) {
    for (const locale of ["zh-Hant", "zh-Hans", "en"]) {
      assert.ok(article.title[locale]?.trim(), `${article.id} missing ${locale} title`);
      assert.ok(article.summary[locale]?.trim(), `${article.id} missing ${locale} summary`);
      assert.ok(article.body[locale]?.trim(), `${article.id} missing ${locale} body`);
    }
  }
});

test("approved short-form themes remain as standalone notes", () => {
  const byId = new Map(LIFE_VIEW_SHORT_FORM_ARTICLES.map((article) => [article.id, article]));

  assert.match(byId.get("flowers-fall-mind-stays-steady")?.body["zh-Hans"] ?? "", /花开不喜，花落不悲，缘来不拒，缘去不追/);
  assert.match(byId.get("flowers-fall-mind-stays-steady")?.body["zh-Hans"] ?? "", /不以人言乱其神，不以世事动其心/);
  assert.match(byId.get("effort-in-causes-ease-with-results")?.body["zh-Hans"] ?? "", /因上努力，果上随缘/);
  assert.match(byId.get("know-yourself-master-yourself")?.body["zh-Hans"] ?? "", /知人，是看懂世界；自知，是看懂自己/);
});
