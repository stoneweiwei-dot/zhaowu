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

test("full reports use question-focused sections and only real server image generation", async () => {
  const resultView = await source("src/components/result-view.tsx");
  const renderer = await source("src/components/paid-report-pages.tsx");
  const focused = await source("src/lib/report/focused-report.ts");
  const decreeImage = await source("src/lib/report/decree-image.ts");
  assert.match(resultView, /import \{ FocusedReportSections \}/);
  assert.match(resultView, /canPreviewPaid && reportSections/);
  assert.match(resultView, /<FocusedReportSections sections=\{reportSections\} \/>/);
  assert.match(focused, /4 个固定核心区/);
  assert.match(focused, /composeFocusedReport/);
  assert.doesNotMatch(focused, /return \[page1, page2, page3, page4, page5, page6, page7, page8, page9\]/);
  assert.doesNotMatch(renderer, /tianlong-report-hero\.jpg/);
  assert.match(renderer, /zhaowu-report-hero-phoenix/);
  assert.match(renderer, /onError=\{\(event\) => \{ event\.currentTarget\.hidden = true; \}\}/);
  assert.match(renderer, /REPORT_ORNAMENTS/);
  assert.match(renderer, /AUSPICIOUS MOTIFS × DESTINY NARRATIVE/);
  assert.match(renderer, /mark\.label\[locale\]/);
  assert.match(renderer, /zhaowu-report-ornament/);
  assert.doesNotMatch(renderer, /第 \$\{.*頁|第 \$\{.*页|copy\.page/);
  assert.doesNotMatch(resultView, /generateDecreeImage|onImage|imageUrl/);
  assert.match(decreeImage, /\/functions\/v1\/generate-decree-image/);
  assert.doesNotMatch(decreeImage, /canvas|toDataURL|svg|renderDecreePng/i);
  assert.match(resultView, /<PaidReportCounter/);
  assert.match(resultView, /onPreview=\{\(\) => void onFull\(\)\}/);
});

test("free results do not generate the paid report or image", async () => {
  const resultView = await source("src/components/result-view.tsx");
  const counter = await source("src/components/paid-report-counter.tsx");
  const tiers = await source("src/lib/report/report-tier-contract.ts");
  const saveStart = resultView.indexOf("async function onSave()");
  const renderStart = resultView.indexOf("  return (");
  const saveBody = resultView.slice(saveStart, renderStart);

  assert.match(saveBody, /createEngineReportRecord/);
  assert.doesNotMatch(saveBody, /ensureFullReport|saveReportRecord|generateDecreeImage/);
  assert.match(resultView, /if \(!canPreviewPaid\) return;/);
  assert.match(counter, /disabled aria-disabled="true"/);
  assert.match(counter, /付款功能尚未開放/);
  assert.match(tiers, /checkoutEnabled: false/);
  assert.match(tiers, /generatedImage: false/);
  assert.match(tiers, /昭梧・宋式天地化形/);
});

test("free decree text remains available when image generation fails", async () => {
  const resultView = await source("src/components/result-view.tsx");
  const decreePosition = resultView.indexOf("{decreeCouplet}");
  const counterPosition = resultView.indexOf("<PaidReportCounter");

  assert.ok(decreePosition >= 0, "free decree text must be rendered");
  assert.ok(counterPosition > decreePosition, "free decree text must render before the paid counter");
  assert.doesNotMatch(resultView.slice(counterPosition), /\{decreeCouplet\}/);
});

test("report visual system uses a deep aubergine and antique-gold treatment without a corrupt hero dependency", async () => {
  const styles = await source("src/focused-report.css");
  const renderer = await source("src/components/paid-report-pages.tsx");
  assert.match(styles, /linear-gradient\(155deg, #2b123d 0%, #180a27 55%, #100719 100%\)/);
  assert.match(styles, /zhaowu-report-hero-pearl/);
  assert.match(styles, /#e2bd76/);
  assert.doesNotMatch(renderer, /\/visuals\/tianlong-report-hero\.jpg/);
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

test("site shell keeps the real Zhaowu text seal and no longer mounts random page-wide ornament scatter", async () => {
  const shell = await source("src/components/site-shell.tsx");
  const seal = await source("src/components/brand-seal.tsx");

  assert.match(shell, /import \{ BrandSeal \}/);
  assert.match(shell, /<BrandSeal \/>/);
  assert.doesNotMatch(shell, /import \{ SealScatter \}/);
  assert.doesNotMatch(shell, /<SealScatter/);
  assert.doesNotMatch(shell, /<IntroGate/);
  assert.match(seal, /<span>昭<\/span>/);
  assert.match(seal, /<span>梧<\/span>/);
});

test("home opens without a blocking intro overlay", async () => {
  const shell = await source("src/components/site-shell.tsx");
  assert.doesNotMatch(shell, /<IntroGate/);
  assert.doesNotMatch(shell, /loading-v11\.mp4/);
  assert.doesNotMatch(shell, /loading-v10\.mp4/);
});

test("site shell unblocks the first screen instead of fading a loading gate", async () => {
  const shell = await source("src/components/site-shell.tsx");
  assert.doesNotMatch(shell, /setPhase\("leaving"\)/);
});

test("generated auspicious visual language is curated inside the report with real image assets", async () => {
  const shell = await source("src/components/site-shell.tsx");
  const renderer = await source("src/components/paid-report-pages.tsx");
  assert.doesNotMatch(shell, /SealScatter/);
  assert.match(renderer, /天龍八部/);
  for (const asset of [
    "phoenix.webp",
    "celestial-pearl.webp",
    "lotus.webp",
    "dragon.webp",
    "pomegranate.webp",
    "endless-knot.webp",
    "twin-fish.webp",
    "crane.webp",
  ]) {
    assert.match(renderer, new RegExp(asset.replaceAll(".", "\\.")));
  }
  assert.match(renderer, /<img src=\{mark\.src\}/);
  assert.match(renderer, /zhaowu-auspicious-rail/);
  assert.match(renderer, /zhaowu-report-ornament/);
  assert.doesNotMatch(renderer, /\["輪",\s*"蓮",\s*"結",\s*"螺",\s*"魚",\s*"瓶"\]/);
});

test("every rendered report section receives a content-aware watercolor dragon without blocking text", async () => {
  const renderer = await source("src/components/paid-report-pages.tsx");
  const account = await source("src/routes/account.tsx");
  const sticker = await source("src/components/report-dragon-sticker.tsx");
  const selector = await source("src/lib/report/report-dragon.ts");

  assert.match(renderer, /<ReportDragonSticker section=\{section\}/);
  assert.match(account, /<ReportDragonSticker section=\{section\} compact/);
  assert.match(sticker, /backgroundImage: `url\(\/mascot\/report-dragons\/volume-0\$\{dragon\.sheet\}\.webp\)`/);
  assert.match(selector, /selectReportDragon/);
  assert.match(selector, /REPORT_DRAGON_ASSETS/);
  assert.doesNotMatch(sticker, /onLoad|await|Suspense/);
});

test("Dharma Palm standalone uses a four-life trail, richer symbolic prose and real Buddhist ornament assets", async () => {
  const palm = await source("src/components/palm-standalone.tsx");
  const presentation = await source("src/lib/palm/standalone-presentation.ts");
  assert.match(palm, /traceTitle/);
  assert.match(palm, /realmFrom/);
  assert.match(palm, /lotus-emblem\.svg/);
  assert.match(palm, /dharma-wheel-emblem\.svg/);
  assert.match(presentation, /前世若依一掌經象意來看/);
  assert.match(presentation, /把傲氣練進手藝裡的修羅/);
  assert.doesNotMatch(presentation, /前世就是/);
});
