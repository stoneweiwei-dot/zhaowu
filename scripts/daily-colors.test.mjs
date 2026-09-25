import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const source = await readFile(new URL("../src/lib/daily-colors.ts", import.meta.url), "utf8");
const moduleSource = await readFile(new URL("../src/components/daily-colors-module.tsx", import.meta.url), "utf8");
const correspondenceSource = await readFile(new URL("../src/lib/five-element-correspondences.ts", import.meta.url), "utf8");
const route = await readFile(new URL("../src/routes/daily-colors.tsx", import.meta.url), "utf8");
const home = await readFile(new URL("../src/routes/index.tsx", import.meta.url), "utf8");
const almanac = await readFile(new URL("../src/components/daily-almanac-widget.tsx", import.meta.url), "utf8");
const night = await readFile(new URL("../src/night-readability-r127.css", import.meta.url), "utf8");
const main = await readFile(new URL("../src/legacy-visual-compat.css", import.meta.url), "utf8");

test("five dressing states stay centralized with trilingual names", () => {
  for (const id of ["qingyun", "jianghua", "kunning", "liujin", "hanxu"]) {
    assert.match(source, new RegExp(`id: "${id}"`));
  }
  assert.match(source, /Qingyun/);
  assert.match(source, /Jianghua/);
  assert.match(source, /Kunning/);
  assert.match(source, /Liujin/);
  assert.match(source, /Hanxu/);
  assert.match(source, /Energy \/ Growth \/ Momentum/);
  assert.match(source, /Radiance \/ Expression \/ Passion/);
  assert.match(source, /Rest \/ Stability \/ Recovery/);
  assert.match(source, /Clarity \/ Focus \/ Decision/);
  assert.match(source, /Stillness \/ Reflection \/ Reset/);
});

test("quotes stay cultural prompts rather than luck guarantees", () => {
  assert.match(source, /Qingyun/);
  assert.match(source, /Jianghua/);
  assert.match(source, /not a promise to change luck/);
  assert.match(source, /不是改運、招財或古籍穿著律令/);
  assert.doesNotMatch(source, /一定招財/);
  assert.doesNotMatch(source, /必然改運/);
});

test("home folds the compact colour guide into today's almanac and keeps the full page", () => {
  assert.match(route, /createFileRoute\("\/daily-colors"\)/);
  assert.match(route, /DailyColorsModule variant="page"/);
  assert.doesNotMatch(home, /DailyColorsModule variant="home"/);
  assert.match(almanac, /DailyColorsModule variant="embed"/);
  assert.match(moduleSource, /to="\/daily-colors"/);
  assert.match(moduleSource, /data-daily-color-swatch/);
  assert.match(moduleSource, /state\.swatches/);
  assert.match(source, /dailyColorAlmanacRef/);
  assert.match(source, /dayGanzhi/);
  assert.match(source, /#1f6b4a/);
  assert.match(source, /#c0392b/);
  assert.match(source, /#d4a017/);
  assert.match(source, /#d4b074/);
  assert.match(source, /#1e4d7b/);
});

test("night last-wins CSS keeps question ink light and swatches vivid", () => {
  assert.match(main, /night-readability-r127\.css/);
  assert.match(night, /#analysisForm \.zhaowu-question-sheet h2/);
  assert.match(night, /color: #fffaf0 !important/);
  assert.match(night, /data-daily-color-swatch/);
  assert.match(night, /background: var\(--swatch\) !important/);
  assert.match(night, /data-daily-colors="embed"/);
});


test("five-element correspondence guide preserves the classical mapping and functional-use boundary", () => {
  for (const value of ["角音", "徵音", "宮音", "商音", "羽音"]) assert.match(correspondenceSource, new RegExp(value));
  for (const value of ["風", "火", "濕", "燥", "寒"]) assert.match(correspondenceSource, new RegExp(value));
  for (const value of ["青", "赤", "黃", "白", "黑"]) assert.match(correspondenceSource, new RegExp(value));
  assert.match(correspondenceSource, /表面缺失但不宜增加/);
  assert.match(correspondenceSource, /先要母氣或通關/);
  assert.match(correspondenceSource, /不能反過來用這張表決定喜用神/);
  assert.match(moduleSource, /data-five-element-correspondence-compact/);
  assert.match(moduleSource, /data-five-element-correspondence-grid/);
  assert.match(moduleSource, /FIVE_ELEMENT_USE_STATES/);
});
