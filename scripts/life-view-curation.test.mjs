import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const homeSection = readFileSync("src/components/life-view-home-section.tsx", "utf8");
const curatedSource = readFileSync("src/lib/life-view-curated.ts", "utf8");
const { LIFE_VIEW_CURATED_ARTICLES } = await import("../src/lib/life-view-curated.ts");

test("homepage life-view uses one curated source instead of stacking legacy article packs", () => {
  assert.match(homeSection, /LIFE_VIEW_CURATED_ARTICLES/);
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

test("curated archive is concise, unique and tri-lingual", () => {
  assert.equal(LIFE_VIEW_CURATED_ARTICLES.length, 8);
  assert.equal(new Set(LIFE_VIEW_CURATED_ARTICLES.map((article) => article.id)).size, 8);
  for (const article of LIFE_VIEW_CURATED_ARTICLES) {
    for (const locale of ["zh-Hant", "zh-Hans", "en"]) {
      assert.ok(article.title[locale]?.trim());
      assert.ok(article.summary[locale]?.trim());
      assert.ok(article.body[locale]?.trim());
    }
  }
});

test("new source is merged into meaningful themes instead of published as seven duplicate drafts", () => {
  const titles = LIFE_VIEW_CURATED_ARTICLES.map((article) => article.title["zh-Hans"]).join("\n");
  assert.match(titles, /修行在日常/);
  assert.match(titles, /善良有边界/);
  assert.match(titles, /放下与止损/);
  assert.match(titles, /知命不是宿命/);
  assert.match(titles, /真正的风水/);
  assert.match(titles, /看清规律/);
  assert.match(titles, /拥有，还是占有/);
});

test("curated customer articles keep unsupported supernatural claims out", () => {
  const runtime = JSON.stringify(LIFE_VIEW_CURATED_ARTICLES);
  for (const forbidden of ["松果体", "松果體", "天眼", "接灵", "接靈", "地魂", "乩身", "冤亲债主", "冤親債主"]) {
    assert.equal(runtime.includes(forbidden), false, `${forbidden} leaked into curated public articles`);
  }
  assert.doesNotMatch(curatedSource, /疾病.{0,8}業障|疾病.{0,8}业障|業障.{0,8}疾病|业障.{0,8}疾病/);
});
