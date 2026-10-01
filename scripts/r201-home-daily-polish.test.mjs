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
  // r228: the almanac (sacred days first) is the opening page; the wardrobe page is one tab away.
  assert.match(daily, /const \[page, setPage\] = useState\(0\)/);
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

test("r228 replaces the spirit-slip gallery art with an original paper lot", async () => {
  const daily = await source("src/components/daily-almanac-widget.tsx");
  const css = await source("src/zhaowu-design-system.css");
  assert.match(daily, /zhaowu-lot__strip/);
  assert.match(daily, /zhaowu-lot__poem/);
  assert.doesNotMatch(daily, /zhaowu-spirit-slip-layout|galleryPublicUrl|<img[^>]*asset/);
  assert.match(css, /\.zhaowu-lot__poem \{[^}]*writing-mode: vertical-rl/);
  assert.match(css, /\.zhaowu-lot \{ display: grid; grid-template-columns: 124px minmax\(0, 1fr\)/);
});
