import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { test } from "node:test";

const root = new URL("../", import.meta.url);

async function source(path) {
  return readFile(new URL(path, root), "utf8");
}

test("homepage is a customer-facing brand entry, not an incident or methodology notice", async () => {
  const home = await source("src/routes/index.tsx");
  assert.match(home, /heroSlogan/);
  assert.match(home, /<AnalysisForm \/>/);
  assert.doesNotMatch(home, /ZHAOWU · SAFE|白屏|視覺先暫停|视觉先暂停/);
  assert.doesNotMatch(home, /STEPS\.map|PROOFS\.map|methodTitle|methodLead|proofPrimary|proofPast|proofBoundary|faq1q|faq2q|faq3q/);
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
  assert.doesNotMatch(renderer, /按順序閱讀|按顺序阅读|Read in order|可閱讀、可核對|可阅读、可核对|verifiable text/);
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

test("site shell keeps the real Zhaowu text seal and mounts auspicious scatter on every route", async () => {
  const shell = await source("src/components/site-shell.tsx");
  const intro = await source("src/components/intro-gate.tsx");
  const seal = await source("src/components/brand-seal.tsx");

  assert.match(shell, /import \{ BrandSeal \}/);
  assert.match(shell, /import \{ SealScatter \} from "@\/components\/marks"/);
  assert.match(shell, /<BrandSeal \/>/);
  assert.match(shell, /<SealScatter seedKey=\{pathname\} \/>/);
  assert.doesNotMatch(shell, /!isLogin \? <SealScatter/);
  assert.doesNotMatch(intro, /import \{ BrandSeal \}|<BrandSeal|zhaowu-main-seal\.svg|<Mark /);
  assert.match(intro, /昭於未見，梧於有歸。/);
  assert.match(intro, /zhaowu\.intro\.v13/);
  assert.match(intro, /\/intro\/loading-poster\.jpg/);
  assert.doesNotMatch(shell, /zhaowu-main-seal\.svg|showScatter/);
  assert.match(seal, /<span>昭<\/span>/);
  assert.match(seal, /<span>梧<\/span>/);
});

test("loading gate uses the approved animated opening and real readiness progress", async () => {
  const intro = await source("src/components/intro-gate.tsx");
  const bootstrap = await source("src/lib/bootstrap-readiness.ts");
  assert.match(intro, /\/intro\/loading-v10\.mp4/);
  assert.match(intro, /\/intro\/loading-v11\.mp4/);
  assert.match(intro, /\/intro\/loading-poster\.jpg/);
  assert.match(intro, /命理不是宿命/);
  assert.match(intro, /運勢不是答案/);
  assert.match(intro, /選擇才是開始/);
  assert.match(intro, /See the unseen\. Find your ground\./);
  assert.match(intro, /STONE 原創/);
  assert.match(intro, /bootReady/);
  assert.match(intro, /isPending/);
  assert.match(intro, /videoReady/);
  assert.match(bootstrap, /site_settings\?key=eq\.migration_state/);
  assert.match(bootstrap, /architecture\.length !== 9/);
  assert.match(bootstrap, /正在待命四柱繪意與命誥圖/);
  assert.doesNotMatch(intro, /\/emblems\//);
});

test("loading gate fades out briefly and then fully unmounts", async () => {
  const intro = await source("src/components/intro-gate.tsx");
  assert.match(intro, /setPhase\("leaving"\)/);
  assert.match(intro, /setPhase\("off"\)/);
  assert.match(intro, /window\.setTimeout\(\(\) => setPhase\("off"\), 420\)/);
  assert.match(intro, /phase === "leaving" \? "opacity-0" : "opacity-100"/);
  assert.match(intro, /if \(phase === "off"\) return null/);
  assert.doesNotMatch(intro, /phase === "out"/);
  assert.doesNotMatch(intro, /pointer-events-none opacity-0/);
});

test("homepage uses sitewide random auspicious scatter instead of a fixed motif strip", async () => {
  const home = await source("src/routes/index.tsx");
  const shell = await source("src/components/site-shell.tsx");
  const marks = await source("src/components/marks.tsx");
  const emblems = await source("src/emblems.css");

  assert.doesNotMatch(home, /STONE_MOTIFS|stone-motif-row|import \{ Mark \}|<Mark /);
  assert.match(shell, /<SealScatter seedKey=\{pathname\} \/>/);
  assert.match(marks, /SCATTER_POOL/);
  for (const name of ["lotus", "wheel", "vase", "knot", "conch", "fish", "parasol", "banner", "gourd", "bagua", "sword", "bell", "incense", "ruyi", "gate"]) {
    assert.match(marks, new RegExp(`"${name}"`));
  }
  assert.match(marks, /Date\.now\(\)/);
  assert.match(marks, /Math\.random\(\)/);
  assert.match(marks, /left = side === "left"/);
  assert.match(emblems, /\.zhaowu-seal-scatter/);
  assert.match(emblems, /\.zhaowu-scatter-piece/);
  assert.match(emblems, /mix-blend-mode:\s*normal/);
  assert.match(emblems, /body::before \{[\s\S]*content: none;[\s\S]*display: none;/);
  assert.doesNotMatch(emblems, /background-image:[\s\S]*line-ornament-/);
});

test("every mapped emblem asset exists in the public build", async () => {
  const marks = await source("src/components/marks.tsx");
  const assets = [...marks.matchAll(/"\/emblems\/([^\"]+)"/g)].map((match) => match[1]);
  assert.ok(assets.length >= 18);
  await Promise.all(assets.map((asset) => source(`public/emblems/${asset}`)));
});

test("mobile homepage prioritises the analysis form and removes explanatory filler", async () => {
  const home = await source("src/routes/index.tsx");
  assert.ok(home.indexOf("<AnalysisForm />") < home.indexOf('to="/yizhangjing"'));
  assert.match(home, /text-\[3\.5rem\][^\"]*sm:text-8xl/);
  assert.doesNotMatch(home, /text-\[5\.4rem\]/);
  assert.match(home, /className="mt-3 hidden[^\"]+sm:block">\{t\("heroBody"\)\}/);
  assert.doesNotMatch(home, /galleryBody|palmToolBody|palmToolScope|methodKicker|methodTitle|methodLead|PROOFS|STEPS|faq-title/);
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
  assert.match(i18n, /const EN: Record<CopyKey, string>/);
  assert.doesNotMatch(i18n, /EN\[key\] \?\? TABLE\[key\]\[0\]/);
});

test("homepage exposes the standalone deterministic Palm tool without a marketing explainer block", async () => {
  const home = await source("src/routes/index.tsx");
  const route = await source("src/routes/yizhangjing.tsx");
  const tool = await source("src/components/palm-standalone.tsx");

  assert.match(home, /palmToolTitle/);
  assert.match(home, /palmToolButton/);
  assert.match(home, /to="\/yizhangjing"/);
  assert.doesNotMatch(home, /galleryTitle|galleryBody|palmToolKicker|palmToolBody|palmToolScope/);
  assert.match(route, /createFileRoute\("\/yizhangjing"\)/);
  assert.match(tool, /buildPalm/);
  assert.match(tool, /scopeFour/);
  assert.match(tool, /scopeStars/);
  assert.match(tool, /scopeRealms/);
  assert.match(tool, /timeUnknown: hour === "unknown"/);
  assert.match(tool, /presentPalmHourLabel/);
  assert.doesNotMatch(tool, /fetch\(|axios|supabase|writeFullReport|analyzeBirth/);
  assert.doesNotMatch(tool, /presentPalmGuidance|copy\.cause|copy\.fruit|copy\.seed/);
  assert.match(tool, /copy\.readingBody/);
  assert.doesNotMatch(tool, /常見問題|常见问题|FAQ|為什麼|为什么|你可能會問|你可能会问/);
  assert.match(tool, /useState<"" \| "required" \| "invalid">/);
  assert.match(tool, /\{copy\[error\]\}/);
  assert.doesNotMatch(tool, /setError\(copy\.(required|invalid)\)/);
});

test("standalone Palm English presentation contains no Chinese branches or result text", async () => {
  const { buildPalm } = await import("../src/lib/palm/engine.ts");
  const { presentLunarLabel, presentPalmHourLabel, presentPalmPalace } = await import("../src/lib/palm/standalone-presentation.ts");
  const reading = buildPalm({ year: 1988, month: 10, day: 4, hour: 4, timeUnknown: false, gender: "male" });
  const han = /[\u3400-\u9fff]/;

  assert.equal(reading.palaces.length, 4);
  assert.doesNotMatch(presentLunarLabel(reading.lunarLabel, "en"), han);
  assert.doesNotMatch(presentPalmHourLabel("寅", "03:00–04:59", "en"), han);
  for (const palace of reading.palaces) {
    const presented = presentPalmPalace(palace, "en");
    assert.doesNotMatch(Object.values(presented).join(" "), han);
  }
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
