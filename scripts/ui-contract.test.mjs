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
  const decreeDelivery = await source("supabase/functions/view-decree-image/index.ts");
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
  assert.match(decreeImage, /"view-decree-image" \| "generate-decree-image"/);
  assert.match(decreeImage, /requestFunction\(session, "generate-decree-image", reportId/);
  assert.match(decreeDelivery, /createSignedUrl\(imagePath, 3600\)/);
  assert.doesNotMatch(decreeImage, /canvas|toDataURL|svg|renderDecreePng/i);
  assert.equal((resultView.match(/onClick=\{\(\) => void onFull\(\)\}/g) ?? []).length, 1);
});

test("tea guardian stays outside the four question-focused report sections", async () => {
  const resultView = await source("src/components/result-view.tsx");
  const account = await source("src/routes/account.tsx");
  const focused = await source("src/lib/report/focused-report.ts");
  const tea = await source("src/lib/tea-guardian.ts");
  assert.match(resultView, /<TeaGuardianReport chart=\{chart\}/);
  assert.match(account, /<TeaGuardianReport chart=\{snapshot\.chart\}/);
  assert.doesNotMatch(focused, /teaGuardian|茶仙守護|茶仙守护/);
  assert.match(tea, /recommendGuardianFromChart/);
  assert.match(tea, /不等於直接補某個五行/);
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

test("report visual system keeps its legacy asset layer available underneath the active parchment lock", async () => {
  const styles = await source("src/focused-report.css");
  const renderer = await source("src/components/paid-report-pages.tsx");
  const active = await source("src/home-sheet-ui-v5.css");
  assert.match(styles, /linear-gradient\(155deg, #2b123d 0%, #180a27 55%, #100719 100%\)/);
  assert.match(styles, /zhaowu-report-hero-pearl/);
  assert.match(styles, /#e2bd76/);
  assert.match(active, /\.zhaowu-home-sheet-shell \.zhaowu-focused-report/);
  assert.match(active, /background-color: var\(--zv5-card-strong\) !important/);
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

test("site shell keeps the real Zhaowu text seal without random page-wide ornament scatter", async () => {
  const shell = await source("src/components/site-shell.tsx");
  const seal = await source("src/components/brand-seal.tsx");

  assert.match(shell, /import \{ BrandSeal \}/);
  assert.match(shell, /<BrandSeal \/>/);
  assert.doesNotMatch(shell, /SealScatter/);
  assert.doesNotMatch(shell, /auspicious-emblem-scatter/);
  assert.match(shell, /zhaowu-app-frame/);
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
  const renderer = await source("src/components/paid-report-pages.tsx");
  assert.match(renderer, /天龍八部/);
  for (const asset of [
    "phoenix.webp",
    "celestial-pearl.webp",
    "lotus.webp",
    "dragon.webp",
  ]) {
    assert.match(renderer, new RegExp(asset.replace(".", "\\.")));
  }
});

test("every rendered report section receives a content-aware watercolor dragon without blocking text", async () => {
  const renderer = await source("src/components/paid-report-pages.tsx");
  const dragon = await source("src/components/report-dragon-sticker.tsx");
  assert.match(renderer, /ReportDragonSticker/);
  assert.match(dragon, /selectReportDragon/);
  assert.match(dragon, /pointer-events-none/);
});

test("Dharma Palm standalone uses a four-life trail, richer symbolic prose and real Buddhist ornament assets", async () => {
  const palm = await source("src/routes/yizhangjing.tsx");
  assert.match(palm, /fourLifeTrail/);
  assert.match(palm, /BUDDHIST_ORNAMENTS/);
  assert.doesNotMatch(palm, /svg|data:image\/svg/i);
});