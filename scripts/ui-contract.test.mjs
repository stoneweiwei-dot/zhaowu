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
  assert.match(resultView, /reportSections \? <FocusedReportSections sections=\{reportSections\} \/>/);
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
  assert.match(resultView, /generateDecreeImage/);
  assert.match(decreeImage, /\/functions\/v1\/generate-decree-image/);
  assert.doesNotMatch(decreeImage, /canvas|toDataURL|svg|renderDecreePng/i);
  assert.equal((resultView.match(/onClick=\{\(\) => void onFull\(\)\}/g) ?? []).length, 1);
});

test("free decree text remains available when image generation fails", async () => {
  const resultView = await source("src/components/result-view.tsx");
  const decreePosition = resultView.indexOf("{decreeCouplet}");
  const imageGuardPosition = resultView.indexOf("{imageUrl ? (");

  assert.ok(decreePosition >= 0, "free decree text must be rendered");
  assert.ok(imageGuardPosition > decreePosition, "free decree text must render before the optional image");
  assert.doesNotMatch(resultView.slice(imageGuardPosition), /\{decreeCouplet\}/);
  assert.match(resultView, /setImageUrl\(null\); setMsg\(copy\.imageLoadFailed\)/);
});

test("free result keeps technical chart evidence inside the full report", async () => {
  const resultView = await source("src/components/result-view.tsx");
  const focused = await source("src/lib/report/focused-report.ts");

  assert.doesNotMatch(resultView, /chart\.pillars\.map|t\("dayMaster"\)|t\("monthLing"\)/);
  assert.match(focused, /title: "命理依据"/);
  assert.match(focused, /title: "Chart basis"/);
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

test("site shell keeps the real Zhaowu text seal and mounts random page-wide ornament scatter on non-login pages", async () => {
  const shell = await source("src/components/site-shell.tsx");
  const seal = await source("src/components/brand-seal.tsx");
  const marks = await source("src/components/marks.tsx");

  assert.match(shell, /import \{ BrandSeal \}/);
  assert.match(shell, /<BrandSeal \/>/);
  assert.match(shell, /import \{ SealScatter \}/);
  assert.match(shell, /<SealScatter/);
  assert.match(marks, /SCATTER_POOL/);
  assert.match(marks, /lotus-emblem\.svg/);
  assert.match(marks, /dharma-wheel-emblem\.svg/);
  assert.match(marks, /modern-endless-knot-emblem\.svg/);
  assert.match(marks, /modern-golden-fish-emblem\.svg/);
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
  assert.match(shell, /SealScatter/);
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
