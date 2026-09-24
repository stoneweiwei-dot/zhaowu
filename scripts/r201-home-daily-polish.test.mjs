import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const root = new URL("../", import.meta.url);
const source = (path) => readFile(new URL(path, root), "utf8");

test("r201 removes the standalone homepage comic and makes Today useful immediately", async () => {
  const home = await source("src/routes/index.tsx");
  const daily = await source("src/components/daily-almanac-widget.tsx");
  assert.doesNotMatch(home, /SongComicToday/);
  assert.match(home, /useState<"today" \| "quiz" \| "notes" \| null>\("today"\)/);
  assert.match(daily, /useState\(embedded \? 1 : 0\)/);
  assert.match(daily, /zhaowu-today-guide__tabs/);
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

test("r201 constrains spirit-slip gallery art instead of hard-inserting source dimensions", async () => {
  const daily = await source("src/components/daily-almanac-widget.tsx");
  const css = await source("src/zhaowu-design-system.css");
  assert.match(daily, /zhaowu-spirit-slip-layout/);
  assert.match(daily, /loading="lazy"/);
  assert.match(css, /\.zhaowu-spirit-slip-art[\s\S]*aspect-ratio:\s*9\s*\/\s*16/);
  assert.match(css, /\.zhaowu-spirit-slip-art img[\s\S]*object-fit:\s*cover/);
  assert.match(css, /@media\(max-width:520px\)[\s\S]*grid-template-columns:104px minmax\(0,1fr\)/);
});
