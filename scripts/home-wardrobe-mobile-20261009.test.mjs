import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const load = (path) => readFile(new URL(`../${path}`, import.meta.url), "utf8");
const [moduleSource, almanac, css] = await Promise.all([
  load("src/components/daily-colors-module.tsx"),
  load("src/components/daily-almanac-widget.tsx"),
  load("src/zhaowu-design-system.css"),
]);

test("chakra palette is trilingual, optional, and separate from BaZi calculation", () => {
  assert.equal((moduleSource.match(/hex: "#[A-Fa-f0-9]{6}", name:/g) ?? []).length, 7);
  for (const label of ["海底輪", "臍輪", "太陽神經叢輪", "心輪", "喉輪", "眉心輪", "頂輪"]) {
    assert.ok(moduleSource.includes(label), `missing ${label}`);
  }
  assert.match(moduleSource, /<details data-chakra-colour-ideas>/);
  assert.match(moduleSource, /不與五行或命盤喜忌直接對應，也不代表療效/);
  assert.match(moduleSource, /Not a fixed five-element or birth-chart mapping/);
  assert.match(almanac, /<ChakraColourIdeas locale=\{locale\} \/>/);
});

test("homewardrobe keeps the daily calculation and hides dense secondary choices by default", () => {
  assert.match(moduleSource, /dailyColorAlmanacRef\(date \?\? localNow\)/);
  assert.match(moduleSource, /<details data-daily-colour-choices-fold>/);
  assert.match(moduleSource, /<div role="list" data-daily-colors-choices>/);
  assert.match(almanac, /<details data-wardrobe-additional>/);
  assert.match(almanac, /\{\(embedded \|\| !onExpand\) \? <div className="zhaowu-today-guide__expanded">/);
});

test("mobile styling is vertically scrollable without five illegible choices in a row", () => {
  assert.match(css, /@media \(max-width: 580px\) \{/);
  assert.match(css, /grid-template-columns: repeat\(2, minmax\(0, 1fr\)\) !important/);
  assert.match(css, /font-size: 14px !important/);
  assert.match(css, /font-size: 12px !important/);
  assert.match(css, /html body \.zhaowu-route-home\.zhaowu-home-sheet-shell::before/);
  assert.match(css, /background-attachment: scroll !important/);
  assert.match(css, /-webkit-backdrop-filter: none !important/);
});
