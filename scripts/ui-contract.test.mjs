import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { test } from "node:test";

const root = new URL("../", import.meta.url);
async function source(path) {
  return readFile(new URL(path, root), "utf8");
}

test("homepage is a customer-facing entry without a duplicate giant brand hero", async () => {
  const home = await source("src/routes/index.tsx");
  assert.doesNotMatch(home, /zhaowu-home-intro/);
  assert.match(home, /id="bazi"/);
  assert.match(home, /<AnalysisForm \/>/);
  assert.doesNotMatch(home, /ZiweiHomeFeature|zhaowu-tools-section/);
  assert.doesNotMatch(home, /zhaowu-home-hero/);
  assert.doesNotMatch(home, /ZHAOWU · SAFE|白屏|視覺先暫停|视觉先暂停/);
  assert.doesNotMatch(
    home,
    /STEPS\.map|PROOFS\.map|methodTitle|methodLead|proofPrimary|proofPast|proofBoundary|faq1q|faq2q|faq3q/,
  );
});

test("homepage keeps one analysis path and does not inject a second art-product showcase", async () => {
  const home = await source("src/routes/index.tsx");
  assert.match(home, /<AnalysisForm \/>/);
  assert.doesNotMatch(home, /PaidReportShowcase|paid-report-showcase/);
});

test("full reports render one continuous summary then body attention, while decree image delivery stays server-side", async () => {
  const resultView = await source("src/components/result-view.tsx");
  const renderer = await source("src/components/paid-report-pages.tsx");
  const focused = await source("src/lib/report/focused-report.ts");
  const decreeImage = await source("src/lib/report/decree-image.ts");
  const decreeDelivery = await source(
    "supabase/functions/view-decree-image/index.ts",
  );

  assert.match(resultView, /import \{ FocusedReportSections \}/);
  assert.match(
    resultView,
    /reportSections \? <FocusedReportSections sections=\{reportSections\} result=\{result\} \/>/,
  );
  assert.match(focused, /key: "summary"/);
  assert.match(focused, /key: "body"/);
  assert.match(focused, /buildBodyAttentionLines/);
  assert.match(focused, /composeFocusedReport/);
  assert.doesNotMatch(
    focused,
    /return \[page1, page2, page3, page4, page5, page6, page7, page8, page9\]/,
  );

  assert.match(renderer, /zhaowu-report-continuous-sheet/);
  assert.match(renderer, /continuousReportContent/);
  assert.match(renderer, /zhaowu-report-summary-block/);
  assert.match(renderer, /zhaowu-report-body-block/);
  assert.doesNotMatch(
    renderer,
    /REPORT_ORNAMENTS|ReportDragonSticker|zhaowu-report-ornament|zhaowu-auspicious-rail/,
  );
  assert.doesNotMatch(renderer, /padStart\(2, "0"\)/);

  assert.match(resultView, /generateDecreeImage/);
  assert.match(decreeImage, /"view-decree-image" \| "generate-decree-image"/);
  assert.match(
    decreeImage,
    /requestFunction\(session, "generate-decree-image", reportId/,
  );
  assert.match(decreeDelivery, /createSignedUrl\(imagePath, 3600\)/);
  assert.doesNotMatch(decreeImage, /canvas|toDataURL|svg|renderDecreePng/i);
  assert.equal(
    (resultView.match(/onClick=\{\(\) => void onFull\(\)\}/g) ?? []).length,
    1,
  );
});

test("tea guardian stays separate from the homepage, report and personal decree image", async () => {
  const resultView = await source("src/components/result-view.tsx");
  const home = await source("src/routes/index.tsx");
  const focused = await source("src/lib/report/focused-report.ts");
  const teaRoute = await source("src/routes/tea-guardian.tsx");
  const tea = await source("src/lib/tea-guardian.ts");
  const gallery = await source("src/lib/gallery-match.ts");
  const edge = await source(
    "supabase/functions/generate-decree-image/index.ts",
  );

  assert.doesNotMatch(resultView, /TeaGuardianReport|tea-guardian/);
  assert.doesNotMatch(home, /tea-guardian|茶仙守護|茶仙守护/);
  assert.doesNotMatch(focused, /teaGuardian|茶仙守護|茶仙守护/);
  assert.match(teaRoute, /TeaGuardian/);
  assert.match(tea, /recommendGuardianFromChart/);
  assert.match(gallery, /isPersonalDecreeAsset/);
  assert.match(edge, /isPersonalDecreeAsset/);
});

test("free decree text remains available when image generation fails", async () => {
  const resultView = await source("src/components/result-view.tsx");
  const decreePosition = resultView.indexOf("{decreeCouplet}");
  const imagePosition = resultView.indexOf("<CharacterPanel");
  assert.ok(decreePosition >= 0, "free decree text must be rendered");
  assert.ok(
    imagePosition > decreePosition,
    "free decree text must render before the optional image",
  );
  assert.doesNotMatch(
    resultView.slice(imagePosition),
    /\{decreeCouplet\}/,
  );
  assert.match(
    resultView,
    /setImageUrl\(null\); setMsg\(copy\.imageLoadFailed\)/,
  );
});

test("free result keeps technical chart evidence inside the unified overall summary", async () => {
  const resultView = await source("src/components/result-view.tsx");
  const focused = await source("src/lib/report/focused-report.ts");
  assert.doesNotMatch(
    resultView,
    /chart\.pillars\.map|t\("dayMaster"\)|t\("monthLing"\)/,
  );
  assert.match(focused, /命盘落点/);
  assert.match(focused, /question-relevant chart facts/);
  assert.match(focused, /Overall summary/);
});

test("report visual system is one warm paper sheet without legacy purple or ornamental layers", async () => {
  const styles = await source("src/focused-report.css");
  const renderer = await source("src/components/paid-report-pages.tsx");
  assert.match(styles, /zhaowu-report-continuous-sheet/);
  assert.match(styles, /#f8efdf/);
  assert.match(styles, /zhaowu-report-body-block/);
  assert.doesNotMatch(styles, /#2b123d|#180a27|#100719/);
  assert.doesNotMatch(
    renderer,
    /phoenix\.webp|celestial-pearl\.webp|lotus\.webp|dragon\.webp/,
  );
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
  assert.match(
    backgrounds,
    /try \{[\s\S]*JSON\.parse\(text\)[\s\S]*\} catch \{/,
  );
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

test("active full-report renderer has no report dragon or ornament rail", async () => {
  const renderer = await source("src/components/paid-report-pages.tsx");
  const active = await source("src/home-sheet-ui-v5.css");
  assert.doesNotMatch(renderer, /ReportDragonSticker/);
  assert.doesNotMatch(renderer, /REPORT_ORNAMENTS/);
  assert.match(active, /zhaowu-report-dragon/);
  assert.match(active, /display: none !important/);
});

test("Dharma Palm standalone keeps the four-life trail without decorative emblem logos", async () => {
  const route = await source("src/routes/yizhangjing.tsx");
  const palm = await source("src/components/palm-standalone.tsx");
  assert.match(route, /PalmStandalone/);
  assert.match(palm, /traceTitle/);
  assert.match(palm, /four-life symbolic trail/);
  assert.match(palm, /zhaowu:d60-birth/);
  assert.doesNotMatch(palm, /AUSPICIOUS_EMBLEMS|\/emblems\/|BrandSeal/);
});

test("customer birth form shows fixed time-policy status without exposing controls", async () => {
  const form = await source("src/components/analysis-form.tsx");
  const actions = await source("src/lib/actions.ts");
  const chart = await source("src/lib/bazi/chart.ts");
  assert.doesNotMatch(form, /setZiPolicy|setUseTrueSolar/);
  assert.match(form, /已套用真太陽時校正/);
  assert.match(form, /子時不換日（以午夜為界）/);
  assert.match(form, /ziPolicy: "midnight"/);
  assert.match(form, /useTrueSolar: true/);
  assert.match(actions, /ziPolicy: "midnight"/);
  assert.match(actions, /useTrueSolar: true/);
  assert.match(chart, /換日固定以真太陽時午夜為界/);
});
