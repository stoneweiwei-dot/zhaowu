import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const source = await readFile(new URL("../src/lib/daily-colors.ts", import.meta.url), "utf8");
const moduleSource = await readFile(new URL("../src/components/daily-colors-module.tsx", import.meta.url), "utf8");
const route = await readFile(new URL("../src/routes/daily-colors.tsx", import.meta.url), "utf8");
const home = await readFile(new URL("../src/routes/index.tsx", import.meta.url), "utf8");
const almanac = await readFile(new URL("../src/components/daily-almanac-widget.tsx", import.meta.url), "utf8");
const css = await readFile(new URL("../src/five-element-wardrobe-r100.css", import.meta.url), "utf8");

test("Colour Intent centralises all fourteen symbolic colours in three languages", () => {
  for (const id of ["red","orange","yellow","green","blue","aqua","purple","pink","brown","black","white","grey","gold","silver"]) {
    assert.match(source, new RegExp('id: "' + id + '"'));
  }
  assert.match(source, /昭梧 · 今日色意/);
  assert.match(source, /ZHAOWU · COLOUR INTENT/);
  assert.match(source, /今天的我，需要被提醒成為什麼樣的人/);
  assert.match(source, /what quality do I need to remember today/);
});

test("every colour exposes core, suitable, less and reminder content", () => {
  assert.match(source, /core: "紅色常被用來象徵/);
  assert.match(source, /suitable: \["需要鼓起勇氣"/);
  assert.match(source, /less: "如果已經急躁/);
  assert.match(source, /reminder: "不要只是在心裡想/);
  assert.match(moduleSource, /page\.core/);
  assert.match(moduleSource, /page\.suitable/);
  assert.match(moduleSource, /page\.less/);
  assert.match(moduleSource, /page\.reminder/);
  assert.match(moduleSource, /data-daily-color-detail/);
});

test("the almanac bridge stays light and never becomes lucky-colour or favourable-element logic", () => {
  assert.match(source, /木: "green"/);
  assert.match(source, /火: "red"/);
  assert.match(source, /土: "brown"/);
  assert.match(source, /金: "gold"/);
  assert.match(source, /水: "blue"/);
  assert.match(source, /它不是喜用神，也不是幸運色/);
  assert.match(source, /not a favourable-element judgement or a lucky colour/);
  assert.match(source, /不宣稱顏色本身會帶來固定結果/);
  assert.doesNotMatch(source, /一定招財/);
  assert.doesNotMatch(source, /必然改運/);
});

test("home keeps Colour Intent inside Today Guide and full guide at /daily-colors", () => {
  assert.match(route, /createFileRoute\("\/daily-colors"\)/);
  assert.match(route, /DailyColorsModule variant="page"/);
  assert.doesNotMatch(home, /DailyColorsModule variant="home"/);
  assert.match(home, /今日色意/);
  assert.match(almanac, /DailyColorsModule variant="embed"/);
  assert.match(almanac, /wardrobe: "今日色意"/);
  assert.match(moduleSource, /to="\/daily-colors"/);
});

test("iPhone layout is vertical two-column and does not require horizontal card scrolling", () => {
  assert.match(css, /@media \(max-width: 640px\)/);
  assert.match(css, /grid-template-columns: repeat\(2, minmax\(0, 1fr\)\)/);
  assert.match(css, /grid-auto-flow: row/);
  assert.doesNotMatch(css, /overflow-x:\s*auto/);
  assert.match(css, /\[data-daily-color-swatch\] i/);
  assert.match(css, /background: var\(--swatch\)/);
});
