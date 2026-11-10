import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync, existsSync } from "node:fs";
import { buildDailySkySnapshot, upsertObservationSource } from "./generate-daily-sky-observation.mjs";

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

test("Sydney 3 November snapshot includes three languages, rise/set and sourced phase", () => {
  const src = read("src/components/daily-sky-observation.tsx");
  assert.match(src, /date: "2026-11-03"/);
  for (const datum of ["02:22", "13:25", "07:50", "38.9%"]) assert.ok(src.includes(datum), datum);
  for (const term of ["殘月", "残月", "Waning crescent", "not passed two-engine validation"]) assert.ok(src.includes(term), term);
  assert.match(src, /3 Nov 2026/);
});

test("Sydney 11 November 2026 snapshot preserves prior records, matches trilingual verified numbers, and marks unverified S/A events as data unavailable", () => {
  const src = read("src/components/daily-sky-observation.tsx");
  for (const historicalDate of ["2026-10-31", "2026-11-01", "2026-11-02", "2026-11-03", "2026-11-11"]) {
    assert.ok(src.includes(`date: "${historicalDate}"`), `missing snapshot ${historicalDate}`);
  }
  for (const datum of ["06:29", "21:36", "14:01", "3.4%", "02:00", "02:02", "04:23", "04:11", "16–26°C", "50%"]) {
    assert.ok(src.includes(datum), `missing 2026-11-11 datum ${datum}`);
  }
  for (const term of ["盈眉月", "Waxing crescent", "資料暫缺", "资料暂缺", "Data unavailable"]) {
    assert.ok(src.includes(term), `missing term ${term}`);
  }
  assert.doesNotMatch(src, /今日無重大行星事件|今日无重大行星事件/);
  assert.match(src, /https:\/\/www\.bom\.gov\.au\/places\/nsw\/north-sydney\/forecast/);
});

test("daily sky observation generator computes matching Sydney ephemeris values and is idempotent", () => {
  assert.ok(existsSync(new URL("../.github/workflows/daily-sky-observation-update.yml", import.meta.url)));
  const snap = buildDailySkySnapshot("2026-11-11");
  assert.equal(snap.date, "2026-11-11");
  for (const lang of ["zh-Hant", "zh-Hans", "en"]) {
    for (const num of ["06:29", "21:36", "14:01", "3.4%", "02:00", "02:02", "04:23", "04:11"]) {
      assert.ok(
        snap.moon[lang].includes(num) || snap.planets[lang].includes(num),
        `${lang} generated snapshot missing ${num}`,
      );
    }
  }
  const src = read("src/components/daily-sky-observation.tsx");
  const noop = upsertObservationSource(src, snap, { force: false });
  assert.equal(noop.updated, false);
  assert.equal(noop.content, src);
});
