import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { test } from "node:test";

const root = new URL("../", import.meta.url);
async function source(path) { return readFile(new URL(path, root), "utf8"); }

test("application shell keeps dynamic owner wallpaper and loose scatter out of active routes", async () => {
  const shell = await source("src/components/site-shell.tsx");
  assert.match(shell, /const isHome = pathname === "\/"/);
  assert.match(shell, /const isLogin = pathname === "\/login"/);
  assert.match(shell, /zhaowu-home-sheet-shell/);
  assert.doesNotMatch(shell, /backgroundUrl|showWallpaper|showScatter/);
  assert.doesNotMatch(shell, /zhaowu-site-wallpaper/);
  assert.doesNotMatch(shell, /auspicious-emblem-scatter/);
});

test("homepage matches the compact landscape sheet instead of stacking product cards", async () => {
  const main = await source("src/main.tsx");
  const css = await source("src/home-sheet-ui-v5.css");
  const home = await source("src/routes/index.tsx");

  const v4 = main.indexOf("./visual-readability-lock-v4.css");
  const v5 = main.indexOf("./home-sheet-ui-v5.css");
  assert.ok(v4 >= 0 && v5 > v4, "home sheet lock must import after readability v4");

  assert.match(home, /zhaowu-home-sheet-page/);
  assert.match(home, /zhaowu-home-intro/);
  assert.doesNotMatch(home, /zhaowu-home-hero/);
  assert.doesNotMatch(home, /ZiweiHomeFeature|zhaowu-tools-section|tea-guardian|tianji-dual/);
  assert.match(css, /url\("\/wallpaper-song\.jpg"\)/);
  assert.match(css, /--zv5-card: rgba\(251, 245, 233, \.72\)/);
  assert.match(css, /backdrop-filter: blur\(1\.5px\) saturate\(\.92\)/);
  assert.match(css, /\.zhaowu-home-sheet-shell \.zhaowu-site-wallpaper/);
  assert.match(css, /background-size: auto, 980px auto/);
  assert.match(css, /background-repeat: repeat-y/);
  assert.doesNotMatch(css, /background-size: auto 100%/);
  assert.doesNotMatch(css, /background-attachment:\s*fixed/);
});
