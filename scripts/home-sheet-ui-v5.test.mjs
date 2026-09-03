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

test("homepage keeps the Song parchment flow and uses a compact method directory", async () => {
  const main = await source("src/main.tsx");
  const css = await source("src/home-sheet-ui-v5.css");
  const portals = await source("src/home-portals.css");
  const home = await source("src/routes/index.tsx");

  const v4 = main.indexOf("./visual-readability-lock-v4.css");
  const v5 = main.indexOf("./home-sheet-ui-v5.css");
  assert.ok(v4 >= 0 && v5 > v4, "home sheet lock must import after readability v4");

  assert.match(home, /zhaowu-home-sheet-page/);
  assert.doesNotMatch(home, /zhaowu-home-intro/);
  assert.match(home, /zhaowu-home-portals/);
  assert.doesNotMatch(home, /zhaowu-home-hero/);
  assert.doesNotMatch(home, /ZiweiHomeFeature|zhaowu-tools-section|tea-guardian/);
  assert.match(home, /to: "\/qizheng"/);
  assert.match(home, /to: "\/astrology"/);
  assert.match(home, /to: "\/yizhangjing"/);
  assert.match(home, /to: "\/ziwei"/);
  assert.match(home, /七政四餘/);
  assert.match(home, /西洋星盤/);
  assert.match(home, /前世今生/);
  assert.match(home, /紫微斗數/);
  assert.match(home, /zhaowu-home-portal-hint/);
  assert.doesNotMatch(home, /portalCopy\.learn|portalCopy\.best/);
  assert.doesNotMatch(home, /zhaowu-home-dual-entry|性格兩面|<QizhengHomePanel/);

  assert.match(css, /#analysisForm\.is-compact/);
  assert.match(css, /\.zhaowu-analysis-settings/);
  assert.match(css, /radial-gradient/);
  assert.match(css, /\.zhaowu-home-sheet-shell \.zhaowu-site-wallpaper/);
  assert.match(css, /background-size:\s*auto/);
  assert.match(css, /background-repeat: no-repeat/);
  assert.doesNotMatch(css, /background-attachment:\s*fixed/);

  assert.match(portals, /\.zhaowu-home-portals/);
  assert.match(portals, /grid-template-columns:\s*repeat\(2,\s*minmax\(0,\s*1fr\)\)/);
  assert.match(portals, /min-height:\s*74px/);
  assert.match(portals, /@media \(max-width: 640px\)/);
  assert.match(portals, /grid-template-columns:\s*1fr/);
});
