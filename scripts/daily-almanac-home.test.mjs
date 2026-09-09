import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const widget = await readFile(new URL("../src/components/daily-almanac-widget.tsx", import.meta.url), "utf8");
const route = await readFile(new URL("../src/routes/index.tsx", import.meta.url), "utf8");
const form = await readFile(new URL("../src/components/analysis-form.tsx", import.meta.url), "utf8");
const layout = await readFile(new URL("../src/home-layout-r46.css", import.meta.url), "utf8");
const hub = await readFile(new URL("../src/home-birth-hub-r60.css", import.meta.url), "utf8");
const almanacStyle = await readFile(new URL("../src/daily-almanac-r69.css", import.meta.url), "utf8");
const design = await readFile(new URL("../src/zhaowu-design-system.css", import.meta.url), "utf8");

test("homepage puts a compact daily almanac first and keeps client details separate", () => {
  const formMount = route.indexOf("<AnalysisForm />");
  const daily = route.indexOf("<DailyAlmanacWidget />");
  assert.ok(daily >= 0 && formMount > daily);
  assert.match(widget, /<details className="zhaowu-daily-details">/);
  assert.match(form, /id="customer-record" className="zhaowu-customer-record"/);
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

test("r69 almanac style is compact, quiet, and keeps Song-style pillar typography", () => {
  assert.match(almanacStyle, /min-height:\s*0 !important/);
  assert.match(almanacStyle, /border-radius:\s*14px !important/);
  assert.match(almanacStyle, /Songti TC/);
  assert.match(almanacStyle, /grid-template-columns:\s*repeat\(4/);
  assert.match(almanacStyle, /zhaowu-daily-details/);
  assert.match(design, /zhaowu-home-stage--daily[\s\S]*margin-top:\s*0 !important/);
});

test("r46 preserves mobile-first whitespace and responsive directory grids", () => {
  assert.match(layout, /\.zhaowu-daily-almanac/);
  assert.match(layout, /border-radius:\s*34px/);
  assert.match(layout, /@media \(max-width: 560px\)/);
  assert.match(layout, /grid-template-columns:\s*repeat\(3, minmax\(0, 1fr\)\)/);
  for (const e of ["\u6728", "\u706b", "\u571f", "\u91d1", "\u6c34"]) {
    assert.match(hub, new RegExp(`data-element="${e}"`));
  }
});

test("r96 almanac paints four distinct pillar colours and hides duplicate yi labels", () => {
  assert.match(widget, /data-pillar=\{PILLAR_KEYS\[index\]\}/);
  assert.match(widget, /lunarDateLabel/);
  assert.match(almanacStyle, /data-pillar="year"/);
  assert.match(almanacStyle, /data-pillar="hour"/);
  assert.match(almanacStyle, /#b23a2f/);
  assert.match(almanacStyle, /#2f6b5a/);
  assert.match(almanacStyle, /small:empty/);
});
