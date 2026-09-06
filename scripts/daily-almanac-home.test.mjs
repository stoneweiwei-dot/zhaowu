import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const widget = await readFile(new URL("../src/components/daily-almanac-widget.tsx", import.meta.url), "utf8");
const route = await readFile(new URL("../src/routes/index.tsx", import.meta.url), "utf8");
const form = await readFile(new URL("../src/components/analysis-form.tsx", import.meta.url), "utf8");
const layout = await readFile(new URL("../src/home-layout-r46.css", import.meta.url), "utf8");
const hub = await readFile(new URL("../src/home-birth-hub-r60.css", import.meta.url), "utf8");
const almanacStyle = await readFile(new URL("../src/daily-almanac-r69.css", import.meta.url), "utf8");

test("homepage puts the shared birth hub before the daily almanac", () => {
  const formMount = route.indexOf("<AnalysisForm />");
  const daily = route.indexOf("<DailyAlmanacWidget />");
  assert.ok(formMount >= 0 && daily > formMount);
  assert.match(form, /id="bazi"/);
  assert.match(route, /home-layout-r46\.css/);
  assert.match(route, /home-birth-hub-r60\.css/);
});

test("daily almanac uses the canonical calendar and shows current year month day hour pillars", () => {
  assert.match(widget, /dayGanzhi, hourPillar, yearMonthPillars/);
  assert.doesNotMatch(widget, /REFERENCE_UTC/);
  assert.doesNotMatch(widget, /function ganzhiForDay/);
  assert.match(widget, /const values = \[pillars\.year, pillars\.month, pillars\.day, pillars\.hour\]/);
  assert.match(widget, /zhaowu-daily-pillars/);
  assert.match(widget, /當下年月日時干支/);
  assert.match(widget, /jieName/);
  assert.match(widget, /setInterval\(\(\) => setNow\(new Date\(\)\), 30_000\)/);
});

test("daily almanac keeps the personalised spirit slip gated by saved birth data", () => {
  assert.match(widget, /stableHash/);
  assert.match(widget, /user\?\.birthData/);
  assert.match(widget, /drawSlip/);
  assert.match(widget, /listPublicGalleryAssets/);
  assert.match(widget, /href=\{!user \? "\/login" : "#analysisForm"\}/);
});

test("r69 almanac style uses bright paper and Song-style pillar typography", () => {
  assert.match(almanacStyle, /linear-gradient\(148deg, rgba\(255,253,246/);
  assert.match(almanacStyle, /Songti TC/);
  assert.match(almanacStyle, /grid-template-columns:\s*repeat\(4/);
  assert.match(almanacStyle, /#2f6f5f/);
});

test("r46 preserves mobile-first whitespace and responsive directory grids", () => {
  assert.match(layout, /\.zhaowu-daily-almanac/);
  assert.match(layout, /border-radius:\s*34px/);
  assert.match(layout, /@media \(max-width: 560px\)/);
  assert.match(layout, /grid-template-columns:\s*repeat\(3, minmax\(0, 1fr\)\)/);
  for (const e of ["木", "火", "土", "金", "水"]) {
    assert.match(hub, new RegExp(`data-element="${e}"`));
  }
});
