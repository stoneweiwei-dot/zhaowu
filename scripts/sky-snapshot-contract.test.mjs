import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
const read = (path) => readFileSync(new URL(`../${path}`, import.meta.url), "utf8");
test("dated snapshots retain the Sydney 2 November source record in all three languages", () => {
  const src = read("src/components/daily-sky-observation.tsx");
  for (const time of ["01:46", "12:17", "07:28", "02:22", "02:34", "04:57"]) assert.ok(src.includes(time), time);
  for (const label of ["日期觀測紀錄", "日期观测记录", "Dated sky observation"]) assert.ok(src.includes(label), label);
  assert.match(src, /2026-11-02/);
  assert.match(src, /historical|歷史|历史/i);
  assert.match(src, /not a live sky feed/);
});
test("public sky route uses native picture and avoids synthetic planet orbits", () => {
  const src = read("src/routes/sky-events.tsx");
  assert.match(src, /mythic-atlas\/originals\/12-stars-and-constellations\.webp/);
  assert.doesNotMatch(src, /sky-event-orbit|<span>\{glyph\}<\/span>/);
  const css = read("src/sky-events.css");
  assert.match(css, /sky-event-timeline\{display:grid;grid-template-columns:minmax\(0,1fr\)/);
  assert.match(css, /prefers-reduced-motion:reduce/);
});
