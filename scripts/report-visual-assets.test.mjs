import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const read = (path) => readFile(new URL(`../${path}`, import.meta.url), "utf8");

test("report visual registry covers 10 day masters, 12 months and grouped assets", async () => {
  const registry = await read("src/lib/report/report-visual-assets.ts");
  for (const key of ["jia-wood", "yi-wood", "bing-fire", "ding-fire", "wu-earth", "ji-earth", "geng-metal", "xin-metal", "ren-water", "gui-water"]) assert.match(registry, new RegExp(`\\"${key}\\"`));
  for (const key of ["yin-spring", "mao-spring", "chen-spring", "si-summer", "wu-summer", "wei-summer", "shen-autumn", "you-autumn", "xu-autumn", "hai-winter", "zi-winter", "chou-winter"]) assert.match(registry, new RegExp(`\\"${key}\\"`));
  for (const file of ["day-0.webp", "day-1.webp", "month-0.webp", "month-1.webp", "month-2.webp", "month-3.webp", "luck-0.webp"]) assert.match(registry, new RegExp(file.replace(".", "\\.")));
  assert.match(registry, /dayMaster:\s*10/);
  assert.match(registry, /month:\s*12/);
  assert.match(registry, /luckElement:\s*5/);
});

test("luck artwork is selected only from the first heavenly stem of calculated GanZhi", async () => {
  const registry = await read("src/lib/report/report-visual-assets.ts");
  assert.match(registry, /trim\(\)\.charAt\(0\)/);
  assert.match(registry, /stem === "甲" \|\| stem === "乙"/);
  assert.match(registry, /stem === "壬" \|\| stem === "癸"/);
});

test("sprite rendering stays 9:16, lazy-loads and fails open", async () => {
  const css = await read("src/report-visual-assets.css");
  const component = await read("src/components/report-sprite-artwork.tsx");
  assert.match(css, /aspect-ratio:\s*9\s*\/\s*16/);
  assert.match(component, /asset\.count \* 100/);
  assert.match(component, /asset\.index \* -100/);
  assert.match(component, /\/wallpaper-song\.jpg/);
  assert.match(component, /loading="lazy"/);
  assert.match(component, /report-visual-assets\.css/);
});

test("visual and luck books consume the shared mother-art registry", async () => {
  const visual = await read("src/components/report-visual-book.tsx");
  const luck = await read("src/components/report-luck-book.tsx");
  assert.match(visual, /getReportVisualAsset/);
  assert.match(visual, /ReportSpriteArtwork/);
  assert.doesNotMatch(visual, /model\.dayMaster\.imagePath/);
  assert.doesNotMatch(visual, /model\.season\.imagePath/);
  assert.match(luck, /getLuckVisualAsset/);
  assert.match(luck, /ReportSpriteArtwork/);
});
