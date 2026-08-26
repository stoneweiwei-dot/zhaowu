import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { test } from "node:test";

const root = new URL("../", import.meta.url);

async function source(path) {
  return readFile(new URL(path, root), "utf8");
}

test("owner console exposes one final answer and dynamic report sections", async () => {
  const account = await source("src/routes/account.tsx");
  assert.match(account, /storedReportSections/);
  assert.match(account, /最终答案来源：保存版本，不重新计算|最終答案來源：保存版本，不重新計算/);
  assert.match(account, /完整报告完成|完整報告完成/);
  assert.doesNotMatch(account, /"九頁完成"|"九页完成"|"完整／九頁"|"完整／九页"/);
  assert.doesNotMatch(account, /pages\.length === 9/);
});

test("legacy ninePages storage key is read only as compatibility, not product structure", async () => {
  const account = await source("src/routes/account.tsx");
  assert.match(account, /record\.reportSections \?\? record\.sections \?\? record\.ninePages/);
  assert.match(account, /old key is read only as storage compatibility/);
});

test("website keeps the app concept base while specialist cards use the generated ornament treatment", async () => {
  const account = await source("src/routes/account.tsx");
  const styles = await source("src/styles.css");
  const home = await source("src/home-polish-v3.css");
  const homeRoute = await source("src/routes/index.tsx");
  const login = await source("src/stone-visual-fix.css");
  const intro = await source("src/components/intro-gate.tsx");

  assert.doesNotMatch(account, /APP DESIGN BASELINE|zhaowu-app-ui-concept|designTitle|openDesign/);
  assert.match(styles, /--color-cinnabar:\s*#a7352b/);
  assert.match(styles, /linear-gradient\(rgba\(116, 100, 75, \.045\) 1px, transparent 1px\)/);
  assert.match(home, /\.zhaowu-specialist-card\.is-tianji[\s\S]*linear-gradient\(152deg, #2b123d 0%, #170823 62%, #100719 100%\)/);
  assert.match(home, /\.zhaowu-specialist-mark--tianji/);
  assert.match(homeRoute, /\/ornaments\/generated\/phoenix\.webp/);
  assert.match(homeRoute, /\/ornaments\/generated\/celestial-pearl\.webp/);
  assert.match(login, /stone-login-orbit/);
  assert.doesNotMatch(login, /stone-login-art img|loading-poster/);
  assert.doesNotMatch(intro, /loading-poster|intro-poster/);
  assert.match(intro, /\/intro\/lotus-bloom-v12\.webp/);
  assert.match(intro, /LOTUS_BLOOM_MS = 2200/);
});

test("owner-selected wallpaper remains visible without forcing pale white content cards", async () => {
  const shell = await source("src/components/site-shell.tsx");
  const main = await source("src/main.tsx");
  const wallpaper = await source("src/wallpaper-visibility-fix.css");
  const landscape = await source("src/landscape-paper.css");
  const rich = await source("src/production-wallpaper-rich.css");

  assert.match(shell, /backgroundUrl \? "zhaowu-has-wallpaper"/);
  assert.match(shell, /className=\{`zhaowu-site-wallpaper \$\{isLogin \? "is-login" : ""\}`\}/);
  assert.doesNotMatch(shell, /backgroundUrl && !isLogin \?/);
  assert.match(main, /wallpaper-visibility-fix\.css/);
  assert.match(main, /landscape-paper\.css/);
  assert.match(main, /production-wallpaper-rich\.css/);
  assert.ok(main.indexOf("wallpaper-visibility-fix.css") < main.indexOf("production-wallpaper-rich.css"));
  assert.match(wallpaper, /\.zhaowu-has-wallpaper \.zhaowu-login-card/);
  assert.match(wallpaper, /background:\s*rgba\(255,\s*252,\s*244,\s*\.60\)\s*!important/);
  assert.match(landscape, /\.zhaowu-site-wallpaper[\s\S]*display:\s*block\s*!important/);
  assert.match(rich, /\.zhaowu-has-wallpaper \.zhaowu-app-frame \.zhaowu-home-hero/);
  assert.match(rich, /linear-gradient\(150deg, rgba\(18, 55, 45, \.94\)/);
  assert.match(rich, /\.zhaowu-has-wallpaper \.zhaowu-app-frame \.seal-border:not\(\.zhaowu-focused-report\)/);
  assert.match(rich, /rgba\(238, 220, 184, \.88\)/);
});
