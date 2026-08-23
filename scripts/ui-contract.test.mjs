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

test("generated nine-page reports use an honest sequential text renderer and only real server image generation", async () => {
  const resultView = await source("src/components/result-view.tsx");
  const renderer = await source("src/components/paid-report-pages.tsx");
  const decreeImage = await source("src/lib/report/decree-image.ts");
  assert.match(resultView, /import \{ PaidReportPages \}/);
  assert.match(resultView, /ninePages \? <PaidReportPages pages=\{ninePages\} \/>/);
  assert.match(renderer, /space-y-4/);
  assert.match(renderer, /page\.body\.map/);
  assert.doesNotMatch(renderer, /PAGE_VISUAL|aspect-\[9\/16\]|snap-x|bg-gradient|<Mark|STONE 原創|visual symbol|視覺象徵/);
  assert.doesNotMatch(renderer, /按順序閱讀|按顺序阅读|Read in order|可閱讀、可核對|可阅读、可核对|verifiable text/);
  assert.doesNotMatch(resultView, /renderDecreePng|decreeImagePackage|onNine|onDecree|生成九頁報告＋命誥圖/);
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

test("site shell keeps the real Zhaowu text seal and mounts auspicious scatter on every route", async () => {
  const shell = await source("src/components/site-shell.tsx");
  const seal = await source("src/components/brand-seal.tsx");

  assert.match(shell, /import \{ BrandSeal \}/);
  assert.match(shell, /import \{ SealScatter \} from "@\/components\/marks"/);
  assert.match(shell, /<BrandSeal \/>/);
  assert.match(shell, /<SealScatter seedKey=\{pathname\} \/>/);
  assert.match(shell, /!isLogin \? <SealScatter/);
  assert.doesNotMatch(shell, /<IntroGate/);
  assert.doesNotMatch(shell, /zhaowu-main-seal\.svg|showScatter/);
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

test("homepage uses sitewide random hollow-line ornament scatter instead of a fixed motif strip", async () => {
  const home = await source("src/routes/index.tsx");
  const shell = await source("src/components/site-shell.tsx");
  const marks = await source("src/components/marks.tsx");
  const emblems = await source("src/emblems.css");
  const pool = marks.slice(marks.indexOf("const SCATTER_POOL"), marks.indexOf("type ScatterItem"));

  assert.doesNotMatch(home, /STONE_MOTIFS|stone-motif-row|import \{ Mark \}|<Mark /);
  assert.match(shell, /<SealScatter seedKey=\{pathname\} \/>/);
  assert.match(marks, /SCATTER_POOL/);
  for (let i = 1; i <= 6; i += 1) {
    const n = String(i).padStart(2, "0");
    assert.match(pool, new RegExp(`line-ornament-${n}\\.svg`));
  }
  assert.doesNotMatch(pool, /lotus-emblem|dharma-wheel-emblem|modern-|treasure-vase-emblem|ruyi-emblem/);
  assert.match(marks, /Date\.now\(\)/);
  assert.match(marks, /Math\.random\(\)/);
  assert.match(marks, /left = side === "left"/);
  assert.match(emblems, /\.zhaowu-seal/);
});
