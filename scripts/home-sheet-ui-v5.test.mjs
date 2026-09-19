import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { test } from "node:test";

const root = new URL("../", import.meta.url);
async function source(path) {
  return readFile(new URL(path, root), "utf8");
}

test("uploaded reference keeps landscape visible behind translucent sheets and removes login grid", async () => {
  const css = await source("src/parchment-layout.css");
  assert.match(css, /url\('\/wallpaper-song\.jpg'\)/);
  assert.match(css, /position:fixed; inset:0; z-index:-1; pointer-events:none/);
  assert.match(css, /background:rgba\(250,243,230,\.73\)/);
  const quiz = await source("src/home-quiz-paper.css");
  assert.doesNotMatch(quiz, /background-color: #fbf5e9 !important/);
  assert.match(css, /background:#a73727 !important/);
  assert.match(css, /\.stone-login-screen::before,[\s\S]*content:none !important/);
});

test("application shell restores the fixed Song landscape without loose scatter", async () => {
  const shell = await source("src/components/site-shell.tsx");
  assert.match(shell, /const isHome = pathname === "\/"/);
  assert.match(shell, /const isLogin = pathname === "\/login"/);
  assert.match(shell, /zhaowu-home-sheet-shell/);
  assert.doesNotMatch(shell, /dailyWallpaperPromise/);
  assert.doesNotMatch(shell, /--zhaowu-wallpaper-url/);
  assert.doesNotMatch(shell, /zhaowu-site-wallpaper/);
  assert.doesNotMatch(shell, /auspicious-emblem-scatter/);
});

test("homepage keeps the Song parchment flow and uses a readable report directory", async () => {
  const main = await source("src/main.tsx");
  const css = await source("src/home-sheet-ui-v5.css");
  const home = await source("src/routes/index.tsx");
  const form = await source("src/components/analysis-form.tsx");
  const report = await source("src/components/unified-birth-report.tsx");

  const v4 = main.indexOf("./visual-readability-lock-v4.css");
  const v5 = main.indexOf("./home-sheet-ui-v5.css");
  assert.ok(v4 >= 0 && v5 > v4, "home sheet lock must import after readability v4");

  assert.match(home, /zhaowu-home-sheet-page/);
  assert.doesNotMatch(home, /zhaowu-home-intro/);
  assert.doesNotMatch(home, /zhaowu-home-portals|data-specialist-link|七種個人分析/);
  assert.doesNotMatch(home, /zhaowu-home-hero/);
  assert.doesNotMatch(home, /ZiweiHomeFeature|zhaowu-tools-section|tea-guardian/);
  assert.match(form, /UnifiedBirthReport/);
  assert.match(report, /完整綜合報告/);
  assert.match(report, /子平八字仍是唯一結構主判/);
  assert.doesNotMatch(home, /zhaowu-home-dual-entry|性格兩面|<QizhengHomePanel/);

  assert.match(css, /#analysisForm\.is-compact/);
  assert.match(css, /\.zhaowu-analysis-settings/);
  assert.match(css, /radial-gradient/);
  assert.match(css, /\.zhaowu-home-sheet-shell \.zhaowu-site-wallpaper/);
  assert.match(css, /background-size:\s*auto/);
  assert.match(css, /background-repeat: no-repeat/);
  assert.doesNotMatch(css, /background-attachment:\s*fixed/);

});
