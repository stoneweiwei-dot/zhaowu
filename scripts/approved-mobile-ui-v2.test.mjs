import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const read = (path) => readFile(new URL(`../${path}`, import.meta.url), "utf8");

test("approved mobile visual lock is loaded after all legacy visual layers", async () => {
  const main = await read("src/main.tsx");
  assert.match(main, /approved-mobile-ui-v2\.css/);
  assert.ok(main.indexOf("approved-mobile-ui-v2.css") > main.indexOf("production-visual-reset.css"));
  assert.ok(main.indexOf("approved-mobile-ui-v2.css") > main.indexOf("gallery-unification.css"));
});

test("wallpaper stays visible through warm parchment cards instead of a white front slab", async () => {
  const css = await read("src/approved-mobile-ui-v2.css");
  assert.match(css, /\.zhaowu-has-wallpaper \.zhaowu-app-frame[\s\S]*rgba\(244, 234, 215, \.20\)/);
  assert.match(css, /--zv2-paper:\s*rgba\(247, 239, 224, \.48\)/);
  assert.match(css, /\.zhaowu-site-header[\s\S]*rgba\(248, 240, 225, \.54\)/);
  assert.match(css, /\.zhaowu-decree-gallery/);
  assert.match(css, /grid-template-columns:\s*1\.45fr \.78fr \.78fr/);
  assert.doesNotMatch(css, /background:\s*(?:#fff|white)\s*!important/);
});
