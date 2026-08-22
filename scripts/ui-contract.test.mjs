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

test("homepage keeps one analysis path and does not inject a second art-product showcase", async () => {
  const home = await source("src/routes/index.tsx");
  assert.match(home, /<AnalysisForm \/>/);
  assert.doesNotMatch(home, /PaidReportShowcase|paid-report-showcase/);
});

test("generated nine-page reports use an honest sequential text renderer", async () => {
  const resultView = await source("src/components/result-view.tsx");
  const renderer = await source("src/components/paid-report-pages.tsx");
  assert.match(resultView, /import \{ PaidReportPages \}/);
  assert.match(resultView, /ninePages \? <PaidReportPages pages=\{ninePages\} \/>/);
  assert.match(renderer, /space-y-4/);
  assert.match(renderer, /page\.body\.map/);
  assert.doesNotMatch(renderer, /PAGE_VISUAL|aspect-\[9\/16\]|snap-x|bg-gradient|<Mark|STONE 原創|visual symbol|視覺象徵/);
  assert.doesNotMatch(resultView, /renderDecreePng|decreeImagePackage|onNine|onDecree|生成個人命誥圖|生成九頁報告＋命誥圖/);
  assert.equal((resultView.match(/onClick=\{\(\) => void onFull\(\)\}/g) ?? []).length, 1);
});

test("owner background client always uses Supabase JSON instead of the Vercel SPA rewrite", async () => {
  const backgrounds = await source("src/lib/background-assets.ts");
  const config = await source("src/lib/supabase-config.ts");
  const stats = await source("src/lib/site-stats.ts");
  const reports = await source("src/lib/supabase-rest.ts");
  assert.match(backgrounds, /from "@\/lib\/supabase-config"/);
  assert.match(stats, /from "@\/lib\/supabase-config"/);
  assert.match(reports, /from "@\/lib\/supabase-config"/);
  assert.match(config, /VITE_SUPABASE_URL \|\| DEFAULT_SUPABASE_URL/);
  assert.match(backgrounds, /try \{[\s\S]*JSON\.parse\(text\)[\s\S]*\} catch \{/);
  assert.match(backgrounds, /背景服務回應格式錯誤/);
});

test("site shell and loading use the real Zhaowu text seal, not the old emblem asset", async () => {
  const shell = await source("src/components/site-shell.tsx");
  const intro = await source("src/components/intro-gate.tsx");
  const seal = await source("src/components/brand-seal.tsx");

  assert.match(shell, /import \{ BrandSeal \}/);
  assert.match(shell, /<BrandSeal \/>/);
  assert.match(intro, /import \{ BrandSeal \}/);
  assert.match(intro, /<BrandSeal size="lg" decorative/);
  assert.match(intro, /zhaowu\.intro\.v7/);
  assert.doesNotMatch(shell, /zhaowu-main-seal\.svg|SealScatter|showScatter/);
  assert.doesNotMatch(intro, /zhaowu-main-seal\.svg|<Mark /);
  assert.match(seal, /<span>昭<\/span>/);
  assert.match(seal, /<span>梧<\/span>/);
});

test("loading gate keeps the paid-report 9:16 cover without decorative icon clutter", async () => {
  const intro = await source("src/components/intro-gate.tsx");
  assert.match(intro, /aspect-\[9\/16\]/);
  assert.match(intro, /命運四柱解析報告/);
  assert.match(intro, /四柱繪意/);
  assert.match(intro, /年柱 · 月柱 · 日柱 · 時柱/);
  assert.match(intro, /9:16 · iPhone 收藏版/);
  assert.match(intro, /STONE 原創/);
  assert.doesNotMatch(intro, /\/emblems\//);
  assert.doesNotMatch(intro, /bg-\[#0d0a08\]/);
  assert.match(intro, /MAX_WAIT_MS = 7000/);
  assert.match(intro, /minWait = skipRequested \|\| reduced \|\| seenBefore\.current \? 180 : 1850/);
});

test("loading gate fully unmounts instead of leaving a translucent ghost over the homepage", async () => {
  const intro = await source("src/components/intro-gate.tsx");
  assert.match(intro, /setPhase\("off"\)/);
  assert.match(intro, /if \(phase === "off"\) return null/);
  assert.doesNotMatch(intro, /phase === "out"/);
  assert.doesNotMatch(intro, /transition-opacity/);
  assert.doesNotMatch(intro, /pointer-events-none opacity-0/);
});

test("homepage and global CSS do not paint decorative emblem wallpaper", async () => {
  const home = await source("src/routes/index.tsx");
  const emblems = await source("src/emblems.css");
  assert.doesNotMatch(home, /import \{ Mark \}|<Mark /);
  assert.match(emblems, /body::before \{[\s\S]*content: none;[\s\S]*display: none;/);
  assert.doesNotMatch(emblems, /background-image:[\s\S]*line-ornament-/);
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

test("homepage exposes the standalone deterministic Palm tool", async () => {
  const home = await source("src/routes/index.tsx");
  const route = await source("src/routes/yizhangjing.tsx");
  const tool = await source("src/components/palm-standalone.tsx");

  assert.match(home, /to="\/yizhangjing"/);
  assert.match(route, /createFileRoute\("\/yizhangjing"\)/);
  assert.match(tool, /buildPalm/);
  assert.match(tool, /timeUnknown: hour === "unknown"/);
  assert.doesNotMatch(tool, /fetch\(|axios|supabase|writeFullReport|analyzeBirth/);
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
