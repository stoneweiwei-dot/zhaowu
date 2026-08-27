import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { test } from "node:test";

const root = new URL("../", import.meta.url);

async function source(path) {
  return readFile(new URL(path, root), "utf8");
}

test("all non-login application routes use the closed parchment shell without wallpaper or loose scatter", async () => {
  const shell = await source("src/components/site-shell.tsx");
  assert.match(shell, /const isHome = pathname === "\/"/);
  assert.match(shell, /const isLogin = pathname === "\/login"/);
  assert.match(shell, /\$\{!isLogin \? "zhaowu-home-sheet-shell" : ""\}/);
  assert.doesNotMatch(shell, /backgroundUrl|showWallpaper|showScatter/);
  assert.doesNotMatch(shell, /zhaowu-site-wallpaper/);
  assert.doesNotMatch(shell, /auspicious-emblem-scatter/);
  assert.match(shell, /zhaowu-home-app-frame/);
});

test("full-sheet homepage CSS is the final visual layer and contains no transparent wallpaper gutters", async () => {
  const main = await source("src/main.tsx");
  const css = await source("src/home-sheet-ui-v5.css");
  const home = await source("src/routes/index.tsx");

  const v4 = main.indexOf("./visual-readability-lock-v4.css");
  const v5 = main.indexOf("./home-sheet-ui-v5.css");
  assert.ok(v4 >= 0 && v5 > v4, "home sheet lock must import after readability v4");

  assert.match(home, /zhaowu-home-sheet-page/);
  assert.doesNotMatch(home, /zhaowu-specialist-mark/);
  assert.match(css, /\.zhaowu-home-sheet-shell \.zhaowu-site-wallpaper/);
  assert.match(css, /display: none !important/);
  assert.match(css, /\.zhaowu-home-sheet-shell \.zhaowu-home-app-frame/);
  assert.match(css, /width: 100vw !important/);
  assert.match(css, /--zv5-card: #fbf5e9/);
  assert.match(css, /background-color: var\(--zv5-card\) !important/);
});