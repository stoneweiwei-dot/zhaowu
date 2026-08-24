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
  assert.match(renderer, /tianlong-report-hero\.jpg/);
  assert.match(renderer, /AUSPICIOUS_MARKS/);
  assert.doesNotMatch(renderer, /第 \$\{.*頁|第 \$\{.*页|copy\.page/);
  assert.match(resultView, /generateDecreeImage/);
  assert.match(decreeImage, /\/functions\/v1\/generate-decree-image/);
  assert.doesNotMatch(decreeImage, /canvas|toDataURL|svg|renderDecreePng/i);
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

test("Tianlong/Buddhist visual language is curated inside the report with real image assets", async () => {
  const shell = await source("src/components/site-shell.tsx");
  const renderer = await source("src/components/paid-report-pages.tsx");
  assert.doesNotMatch(shell, /SealScatter/);
  assert.match(renderer, /天龍八部/);
  for (const asset of [
    "dharma-wheel-emblem.svg",
    "lotus-emblem.svg",
    "modern-endless-knot-emblem.svg",
    "modern-conch-emblem.svg",
    "modern-golden-fish-emblem.svg",
    "treasure-vase-emblem.svg",
    "modern-parasol-emblem.svg",
    "modern-victory-banner-emblem.svg",
  ]) {
    assert.match(renderer, new RegExp(asset.replaceAll(".", "\\.")));
  }
  assert.match(renderer, /<img src=\{mark\.src\}/);
  assert.match(renderer, /zhaowu-auspicious-rail/);
  assert.doesNotMatch(renderer, /\["輪",\s*"蓮",\s*"結",\s*"螺",\s*"魚",\s*"瓶"\]/);
});
