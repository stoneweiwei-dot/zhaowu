import assert from "node:assert/strict";
import { readFile, stat } from "node:fs/promises";
import { test } from "node:test";

const root = new URL("../", import.meta.url);
const source = (path) => readFile(new URL(path, root), "utf8");

test("ZW-FE-03 almanac defaults to the 圖3 xuan-paper day variant with a 圖4 ink-night toggle", async () => {
  const board = await source("src/components/almanac-ink-board.tsx");
  assert.match(board, /useState<"day" \| "night">\("day"\)/);
  assert.match(board, /data-variant=\{variant\}/);
  assert.match(board, /zhaowu:almanac-variant:v1/);
  assert.match(board, /className="zw-ink-hero__art"/);
});

test("ZW-FE-03 day variant ships hero art, navy-gold ribbon titles and both hero images", async () => {
  const css = await source("src/zhaowu-design-system.css");
  assert.match(css, /\.zw-ink-board\[data-variant="day"\] \.zw-ink-hero__art/);
  assert.match(css, /almanac-hero-day-v1\.webp/);
  assert.match(css, /almanac-hero-night-v1\.webp/);
  assert.match(css, /\.zw-ink-board\[data-variant="day"\] \.zw-ink-paper > h4/);
  for (const file of ["almanac-hero-day-v1.webp", "almanac-hero-night-v1.webp", "almanac-lotus-v1.webp", "almanac-mist-v1.webp"]) {
    const info = await stat(new URL(`public/today/${file}`, root));
    assert.ok(info.size > 5_000 && info.size < 200_000, `${file} size ${info.size}`);
  }
});
