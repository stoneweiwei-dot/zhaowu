import assert from "node:assert/strict";
import test from "node:test";
import { formatSacredDay, SACRED_DAY_SOURCE_COUNT } from "../src/lib/almanac/sacred-days.ts";

test("the observance calendar covers all four requested traditions", () => {
  assert.ok(SACRED_DAY_SOURCE_COUNT >= 40);
  for (const tradition of ["佛教", "道教", "儒家", "民間信仰"]) {
    const dates = { 佛教: [4, 8], 道教: [1, 9], 儒家: [8, 27], 民間信仰: [3, 23] };
    const [month, day] = dates[tradition];
    assert.match(formatSacredDay(month, day, "zh-Hant"), new RegExp(tradition));
  }
});

test("same-day observances are retained together with their tradition labels", () => {
  const midAutumnGhostFestival = formatSacredDay(7, 15, "zh-Hant");
  assert.match(midAutumnGhostFestival, /盂蘭盆節/);
  assert.match(midAutumnGhostFestival, /中元地官聖誕/);
  assert.match(midAutumnGhostFestival, /中元普度/);
  assert.match(formatSacredDay(7, 15, "en"), /Buddhist.*Taoist.*Folk/);
});

test("known lunar variants and the separate solar Confucius date are represented", () => {
  assert.match(formatSacredDay(7, 29, "zh-Hant"), /地藏菩薩/);
  assert.match(formatSacredDay(7, 30, "zh-Hant"), /地藏菩薩/);
  assert.match(formatSacredDay(8, 27, "zh-Hant"), /孔子誕辰/);
  assert.match(formatSacredDay(1, 1, "zh-Hant", "9-28"), /孔子誕辰紀念暨祭孔/);
  assert.doesNotMatch(formatSacredDay(1, 1, "zh-Hant", "9-27"), /孔子誕辰紀念暨祭孔/);
});

test("all locales return a readable fallback for dates without a listed observance", () => {
  assert.match(formatSacredDay(5, 2, "zh-Hant"), /未列主要聖日/);
  assert.match(formatSacredDay(5, 2, "zh-Hans"), /未列主要圣日/);
  assert.match(formatSacredDay(5, 2, "en"), /No major observance listed/);
  assert.match(formatSacredDay(5, 8, "zh-Hant"), /傳統六齋日/);
});
