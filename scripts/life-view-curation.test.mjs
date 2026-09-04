import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const homeSection = readFileSync("src/components/life-view-home-section.tsx", "utf8");
const curatedSource = readFileSync("src/lib/life-view-curated.ts", "utf8");
const longFormSource = readFileSync("src/lib/life-view-long-form.ts", "utf8");
const { LIFE_VIEW_CURATED_ARTICLES } = await import("../src/lib/life-view-curated.ts");
const { LIFE_VIEW_LONG_FORM_ARTICLES } = await import("../src/lib/life-view-long-form.ts");
const { LIFE_VIEW_SHORT_FORM_ARTICLES } = await import("../src/lib/life-view-short-form.ts");

test("homepage life-view uses curated, long-form and short-form sources without stacking legacy packs", () => {
  assert.match(homeSection, /LIFE_VIEW_CURATED_ARTICLES/);
  assert.match(homeSection, /LIFE_VIEW_LONG_FORM_ARTICLES/);
  assert.match(homeSection, /LIFE_VIEW_SHORT_FORM_ARTICLES/);
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

test("curated archive remains concise, unique and tri-lingual", () => {
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

test("long-form archive preserves full-depth source material in all three languages", () => {
  assert.equal(LIFE_VIEW_LONG_FORM_ARTICLES.length, 7);
  assert.equal(new Set(LIFE_VIEW_LONG_FORM_ARTICLES.map((article) => article.id)).size, 7);
  for (const article of LIFE_VIEW_LONG_FORM_ARTICLES) {
    for (const locale of ["zh-Hant", "zh-Hans", "en"]) {
      assert.ok(article.title[locale]?.trim());
      assert.ok(article.summary[locale]?.trim());
      assert.ok(article.body[locale]?.trim());
    }
    assert.ok(article.body["zh-Hant"].length >= 1200, `${article.id} zh-Hant is over-compressed`);
    assert.ok(article.body["zh-Hans"].length >= 1200, `${article.id} zh-Hans is over-compressed`);
    assert.ok(article.body.en.length >= 3000, `${article.id} English is over-compressed`);
    assert.ok(article.body["zh-Hant"].split(/\n\n+/).length >= 8, `${article.id} needs full paragraph structure`);
  }
});

test("all active Guanshilu article ids are unique", () => {
  const all = [...LIFE_VIEW_LONG_FORM_ARTICLES, ...LIFE_VIEW_SHORT_FORM_ARTICLES, ...LIFE_VIEW_CURATED_ARTICLES];
  assert.equal(new Set(all.map((article) => article.id)).size, all.length);
});

test("new source is merged into meaningful themes instead of published as duplicate drafts", () => {
  const titles = LIFE_VIEW_CURATED_ARTICLES.map((article) => article.title["zh-Hans"]).join("\n");
  assert.match(titles, /修行在日常/);
  assert.match(titles, /善良有边界/);
  assert.match(titles, /放下与止损/);
  assert.match(titles, /知命不是宿命/);
  assert.match(titles, /真正的风水/);
  assert.match(titles, /看清规律/);
  assert.match(titles, /拥有，还是占有/);

  const longTitles = LIFE_VIEW_LONG_FORM_ARTICLES.map((article) => article.title["zh-Hans"]).join("\n");
  assert.match(longTitles, /明心见性/);
  assert.match(longTitles, /火里栽莲/);
  assert.match(longTitles, /五眼之说/);
  assert.match(longTitles, /福德与智慧/);
  assert.match(longTitles, /知因了果/);
  assert.match(longTitles, /行功立德/);
  assert.match(longTitles, /知命不认命/);
});

test("curated customer articles keep unsupported supernatural claims out", () => {
  const runtime = JSON.stringify(LIFE_VIEW_CURATED_ARTICLES);
  for (const forbidden of ["松果体", "松果體", "天眼", "接灵", "接靈", "地魂", "乩身", "冤亲债主", "冤親債主"]) {
    assert.equal(runtime.includes(forbidden), false, `${forbidden} leaked into curated public articles`);
  }
  assert.doesNotMatch(curatedSource, /疾病.{0,8}業障|疾病.{0,8}业障|業障.{0,8}疾病|业障.{0,8}疾病/);
});

test("long-form religious and cultivation material keeps evidence boundaries explicit", () => {
  const fiveEyes = LIFE_VIEW_LONG_FORM_ARTICLES.find((article) => article.id === "five-eyes-buddhist-tradition-and-modern-boundaries");
  const karma = LIFE_VIEW_LONG_FORM_ARTICLES.find((article) => article.id === "karma-cause-result-responsibility-without-judging-others");
  const wealth = LIFE_VIEW_LONG_FORM_ARTICLES.find((article) => article.id === "wealth-store-fortune-responsibility-and-contentment");
  assert.ok(fiveEyes);
  assert.ok(karma);
  assert.ok(wealth);
  assert.match(fiveEyes.body["zh-Hant"], /沒有被現代科學確立|未被現代科學確立/);
  assert.match(fiveEyes.body["zh-Hans"], /没有被现代科学确立|未被现代科学确立/);
  assert.match(karma.body["zh-Hant"], /不是醫學診斷/);
  assert.match(karma.body["zh-Hans"], /不是医学诊断/);
  assert.match(wealth.body["zh-Hant"], /不能替代.*預算|不能替代.*投資|不替代.*投資/);
  assert.match(wealth.body["zh-Hans"], /不能替代.*预算|不能替代.*投资|不替代.*投资/);
  assert.match(longFormSource, /傳統|传统/);
});
