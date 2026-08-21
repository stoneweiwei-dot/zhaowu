import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { test } from "node:test";

const root = new URL("../", import.meta.url);

async function source(path) {
  return readFile(new URL(path, root), "utf8");
}

test("homepage is a customer-facing brand entry, not an incident notice", async () => {
  const home = await source("src/routes/index.tsx");
  assert.match(home, /heroSlogan/);
  assert.match(home, /methodTitle/);
  assert.match(home, /<AnalysisForm \/>/);
  assert.doesNotMatch(home, /ZHAOWU · SAFE|白屏|視覺先暫停|视觉先暂停/);
});

test("homepage surfaces the paid Four Pillars art product after the analysis flow", async () => {
  const home = await source("src/routes/index.tsx");
  const showcase = await source("src/components/paid-report-showcase.tsx");
  assert.match(home, /import \{ PaidReportShowcase \}/);
  assert.match(home, /<PaidReportShowcase \/>/);
  assert.ok(home.indexOf("<AnalysisForm />") < home.indexOf("<PaidReportShowcase />"));
  assert.match(showcase, /9:16 iPhone 收藏版/);
  assert.match(showcase, /STONE 原創/);
  assert.match(showcase, /paidReportStyle\.pillarRoles/);
  assert.match(showcase, /命局證據/);
  assert.match(showcase, /視覺象徵/);
});

test("generated nine-page reports use the 9:16 collectible renderer", async () => {
  const resultView = await source("src/components/result-view.tsx");
  const renderer = await source("src/components/paid-report-pages.tsx");
  assert.match(resultView, /import \{ PaidReportPages \}/);
  assert.match(resultView, /ninePages \? <PaidReportPages pages=\{ninePages\} \/>/);
  assert.match(renderer, /aspect-\[9\/16\]/);
  assert.match(renderer, /snap-x snap-mandatory/);
  assert.match(renderer, /STONE 原創/);
  assert.match(renderer, /paidReportStyle\.id/);
  assert.match(renderer, /Chart evidence → life meaning → visual symbol/);
});

test("site shell mounts the loading gate and scattered emblem layer", async () => {
  const shell = await source("src/components/site-shell.tsx");
  const intro = await source("src/components/intro-gate.tsx");
  const marks = await source("src/components/marks.tsx");

  assert.match(shell, /import \{ IntroGate \}/);
  assert.match(shell, /import \{ SealScatter \}/);
  assert.match(shell, /<IntroGate \/>/);
  assert.match(shell, /showScatter \? <SealScatter \/>/);
  assert.match(intro, /zhaowu\.intro\.v4/);
  assert.match(intro, /MAX_WAIT_MS = 7000/);
  assert.match(intro, /t\("introLoadingAuth"\)/);
  assert.match(intro, /t\("introLoadingPage"\)/);
  assert.equal((marks.match(/id="scatter-[a-i]" eager/g) ?? []).length, 9);
});

test("loading gate uses the paid-report 9:16 cover language", async () => {
  const intro = await source("src/components/intro-gate.tsx");
  assert.match(intro, /aspect-\[9\/16\]/);
  assert.match(intro, /命運四柱解析報告/);
  assert.match(intro, /四柱繪意 · PRIVATE EDITION/);
  assert.match(intro, /9:16 · iPhone 收藏版/);
  assert.match(intro, /STONE 原創/);
  assert.doesNotMatch(intro, /bg-\[#0d0a08\]/);
  assert.match(intro, /minWait = skipRequested \|\| reduced \|\| seenBefore\.current \? 180 : 1850/);
});

test("every mapped emblem asset exists in the public build", async () => {
  const marks = await source("src/components/marks.tsx");
  const assets = [...marks.matchAll(/"\/emblems\/([^\"]+)"/g)].map((match) => match[1]);
  assert.ok(assets.length >= 9);
  await Promise.all(assets.map((asset) => source(`public/emblems/${asset}`)));
});

test("mobile homepage prioritises the analysis form over supporting copy", async () => {
  const home = await source("src/routes/index.tsx");
  assert.ok(home.indexOf("<AnalysisForm />") < home.indexOf("STEPS.map"));
  assert.match(home, /text-\[3\.5rem\][^\"]*sm:text-8xl/);
  assert.doesNotMatch(home, /text-\[5\.4rem\]/);
  assert.match(home, /className="mt-3 hidden[^\"]+sm:block">\{t\("heroBody"\)\}/);
});

test("signed-out mobile header keeps only language and login actions", async () => {
  const shell = await source("src/components/site-shell.tsx");
  assert.match(shell, /\{user \? \([\s\S]*?<Link to="\/account"/);
  assert.doesNotMatch(shell, /min-\[390px\]:block">\{t\("tagline"\)\}/);
});

test("language control exposes Traditional, Simplified and English directly", async () => {
  const shell = await source("src/components/site-shell.tsx");
  assert.match(shell, /<select[\s\S]*id="site-language"/);
  assert.match(shell, /value="zh-Hant">繁體/);
  assert.match(shell, /value="zh-Hans">简体/);
  assert.match(shell, /value="en">EN/);
});

test("every customer-facing translation key has an English value", async () => {
  const i18n = await source("src/lib/i18n.ts");
  const table = i18n.slice(i18n.indexOf("const TABLE = {"), i18n.indexOf("} as const satisfies"));
  const english = i18n.slice(i18n.indexOf("const EN:"), i18n.indexOf("\n};", i18n.indexOf("const EN:")));
  const keys = (text) => [...text.matchAll(/^  ([A-Za-z0-9]+):/gm)].map((match) => match[1]);
  const tableKeys = keys(table);
  const englishKeys = new Set(keys(english));
  assert.deepEqual(tableKeys.filter((key) => !englishKeys.has(key)), []);
});

test("public form uses associated labels and translated relationship copy", async () => {
  const form = await source("src/components/analysis-form.tsx");
  assert.match(form, /htmlFor="analysis-question"/);
  assert.match(form, /id="birth-city"/);
  assert.match(form, /\{t\("relation"\)\}/);
  assert.doesNotMatch(form, />感情需求類型</);
});

test("featured city search accepts common English and Simplified aliases", async () => {
  const { filterFeatured, localizeCityHit } = await import("../src/lib/bazi/cities.ts");
  assert.equal(filterFeatured("Sydney")[0]?.timezone, "Australia/Sydney");
  assert.equal(filterFeatured("悉尼")[0]?.timezone, "Australia/Sydney");
  assert.equal(filterFeatured("Melbourne")[0]?.timezone, "Australia/Melbourne");
  assert.equal(filterFeatured("纽约")[0]?.timezone, "America/New_York");
  assert.equal(localizeCityHit(filterFeatured("Sydney")[0], "en").display, "Sydney, Australia");
  assert.equal(localizeCityHit(filterFeatured("悉尼")[0], "zh-Hans").display, "悉尼，澳大利亚");
});
