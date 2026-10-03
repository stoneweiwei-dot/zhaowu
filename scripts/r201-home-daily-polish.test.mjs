import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const root = new URL("../", import.meta.url);
const source = (path) => readFile(new URL(path, root), "utf8");

test("Today removes the standalone homepage comic and exposes three independent sections", async () => {
  const home = await source("src/routes/index.tsx");
  const daily = await source("src/components/daily-almanac-widget.tsx");
  assert.doesNotMatch(home, /SongComicToday/);
  assert.match(home, /useState<"today" \| "quiz" \| "notes" \| null>\("today"\)/);
  assert.doesNotMatch(daily, /zhaowu-today-guide__tabs/);
  assert.doesNotMatch(daily, /hidden=\{page !==/);
  assert.match(daily, /zhaowu-today-section is-almanac/);
  assert.match(daily, /zhaowu-today-section is-wardrobe/);
  assert.match(daily, /zhaowu-today-section is-spirit/);
  assert.match(daily, /DailyColorsModule variant="embed"/);
});

test("r201 restores useful wardrobe content in the embedded mini app", async () => {
  const colors = await source("src/components/daily-colors-module.tsx");
  const daily = await source("src/components/daily-almanac-widget.tsx");
  assert.match(colors, /data-daily-colors-featured/);
  assert.match(colors, /data-daily-color-featured-swatch/);
  assert.match(colors, /copy\.description/);
  assert.match(colors, /page\.pick/);
  assert.match(daily, /zhaowu-today-guide__wardrobe-notes/);
  assert.match(daily, /tone\.jewellery/);
  assert.match(daily, /tone\.mask/);
});

test("Today spirit slip uses the dedicated full-surface Song-mineral artwork", async () => {
  const daily = await source("src/components/daily-almanac-widget.tsx");
  const css = await source("src/zhaowu-design-system.css");
  assert.match(daily, /zhaowu-spirit-slip-layout/);
  assert.match(daily, /\/today\/spirit-slip-song-mineral-v1\.webp/);
  assert.match(daily, /zhaowu-spirit-slip-backdrop-art/);
  assert.doesNotMatch(daily, /listPublicGalleryAssets|galleryPublicUrl|GalleryAsset/);
  assert.match(css, /body > \.zhaowu-spirit-slip[\s\S]*aspect-ratio:\s*9\s*\/\s*16/);
  assert.match(css, /\.zhaowu-spirit-slip-backdrop-art[\s\S]*object-fit:\s*cover/);
});
