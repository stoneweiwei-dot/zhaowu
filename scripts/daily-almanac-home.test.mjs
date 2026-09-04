import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const widget = await readFile(new URL("../src/components/daily-almanac-widget.tsx", import.meta.url), "utf8");
const route = await readFile(new URL("../src/routes/index.tsx", import.meta.url), "utf8");
const layout = await readFile(new URL("../src/home-layout-r46.css", import.meta.url), "utf8");

test("homepage exposes the daily almanac before the BaZi question flow", () => {
  const daily = route.indexOf("<DailyAlmanacWidget />");
  const bazi = route.indexOf('id="bazi"');
  assert.ok(daily >= 0 && bazi > daily);
  assert.match(route, /home-layout-r46\.css/);
});

test("daily almanac is a lightweight local-day cue with a real path into the question flow", () => {
  assert.match(widget, /REFERENCE_UTC/);
  assert.match(widget, /href="#bazi"/);
  assert.match(widget, /不替代完整八字、流日或傳統擇日/);
  assert.match(widget, /setHours\(24, 0, 0, 80\)/);
});

test("r46 preserves mobile-first whitespace and responsive directory grids", () => {
  assert.match(layout, /\.zhaowu-daily-almanac/);
  assert.match(layout, /border-radius:\s*34px/);
  assert.match(layout, /@media \(max-width: 560px\)/);
  assert.match(layout, /grid-template-columns:\s*repeat\(3, minmax\(0, 1fr\)\)/);
});
