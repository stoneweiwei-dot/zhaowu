import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { test } from "node:test";

const root = new URL("../", import.meta.url);
async function source(path) {
  return readFile(new URL(path, root), "utf8");
}

test("application shell keeps dynamic owner wallpaper and loose scatter out of active routes", async () => {
  const shell = await source("src/components/site-shell.tsx");
  assert.match(shell, /const isHome = pathname === "\/"/);
  assert.match(shell, /const isLogin = pathname === "\/login"/);
  assert.match(shell, /zhaowu-home-sheet-shell/);
  assert.doesNotMatch(shell, /backgroundUrl|showWallpaper|showScatter/);
  assert.doesNotMatch(shell, /zhaowu-site-wallpaper/);
  assert.doesNotMatch(shell, /auspicious-emblem-scatter/);
});

test("homepage keeps the Song parchment flow and integrates three compact gateways", async () => {
  const main = await source("src/main.tsx");
  const css = await source("src/home-sheet-ui-v5.css");
  const portals = await source("src/home-portals.css");
  const home = await source("src/routes/index.tsx");

  const v4 = main.indexOf("./visual-readability-lock-v4.css");
  const v5 = main.indexOf("./home-sheet-ui-v5.css");
  assert.ok(v4 >= 0 && v5 > v4, "home sheet lock must import after readability v4");

  assert.match(home, /zhaowu-home-sheet-page/);
  assert.match(home, /zhaowu-home-intro/);
  assert.match(home, /zhaowu-home-portals/);
  assert.doesNotMatch(home, /zhaowu-home-hero/);
  assert.doesNotMatch(home, /ZiweiHomeFeature|zhaowu-tools-section|tea-guardian/);
  assert.match(home, /to: "\/qizheng"/);
  assert.match(home, /to: "\/tianji-dual"/);
  assert.match(home, /to: "\/ziwei"/);
  assert.match(home, /七政四餘/);
  assert.match(home, /前世今生/);
  assert.match(home, /紫微斗數/);
  assert.doesNotMatch(home, /zhaowu-home-dual-entry|性格兩面|<QizhengHomePanel/);

  assert.match(css, /#analysisForm\.is-compact/);
  assert.match(css, /\.zhaowu-analysis-settings/);
  assert.match(css, /url\("\/wallpaper-song\.jpg"\)/);
  assert.match(css, /\.zhaowu-home-sheet-shell \.zhaowu-site-wallpaper/);
  assert.match(css, /background-size:\s*auto,\s*980px auto/);
  assert.match(css, /background-repeat: repeat-y/);
  assert.doesNotMatch(css, /background-attachment:\s*fixed/);

  assert.match(portals, /\.zhaowu-home-portals/);
  assert.match(portals, /grid-template-columns:\s*repeat\(3,\s*minmax\(0,\s*1fr\)\)/);
  assert.match(portals, /\.zhaowu-home-portal--sky/);
  assert.match(portals, /\.zhaowu-home-portal--fate/);
  assert.match(portals, /\.zhaowu-home-portal--ziwei/);
  assert.match(portals, /@media \(max-width: 430px\)/);
});
