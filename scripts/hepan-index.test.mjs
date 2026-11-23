import test from "node:test";
import assert from "node:assert/strict";
import { buildChart } from "../src/lib/bazi/chart.ts";
import { analyzeBranchRelations } from "../src/lib/bazi/branch-relations.ts";
import { HIDDEN, STEMS, tenGod } from "../src/lib/bazi/calendar.ts";
import { FEATURED_CITIES } from "../src/lib/bazi/cities.ts";
import {
  buildBaziPair,
  buildHepanIndex,
  HEPAN_PENDING_REASONS,
  HEPAN_SYSTEM_TITLES,
} from "../src/lib/hepan/pair-model.ts";

// Verified fixture: 1990-06-15 10:30 Sydney male.
// Correct pillars 庚午／壬午／辛亥／癸巳, day master 辛金 (true solar 10:34).
// The pair model is tested against the REAL engine here, never a hand-typed
// chart, so the fixture cannot drift from the calendar rules. Targeted
// score cases below use hand-built charts only to isolate one reading.

const STEM_ELEMENT = "木木火火土土金金水水";

function elementOfStem(stem) {
  return STEM_ELEMENT[STEMS.indexOf(stem)];
}

function makePillar(key, label, gan, zhi, dayStem) {
  return {
    key,
    label,
    gan,
    zhi,
    ganZhi: `${gan}${zhi}`,
    nayin: "—",
    shiShenGan: key === "day" ? "日主" : tenGod(dayStem, gan),
    hide: (HIDDEN[zhi] ?? []).map((stem) => ({
      gan: stem,
      shiShen: tenGod(dayStem, stem),
      element: elementOfStem(stem),
    })),
    diShi: "—",
    xunKong: "—",
    ganElement: elementOfStem(gan),
    zhiElement: elementOfStem(zhi),
    ready: true,
  };
}

/** Minimal chart: the pair model only reads the day pillar, the day
 *  master (+element) and elementPercents. Other pillars are fixed dummies. */
function makeChart(dayGan, dayZhi, elementPercents) {
  return {
    pillars: [
      makePillar("year", "年柱", "甲", "子", dayGan),
      makePillar("month", "月柱", "乙", "丑", dayGan),
      makePillar("day", "日柱", dayGan, dayZhi, dayGan),
      makePillar("time", "時柱", "丙", "寅", dayGan),
    ],
    dayMaster: dayGan,
    dayMasterElement: elementOfStem(dayGan),
    elementPercents,
  };
}

const EVEN = { 木: 20, 火: 20, 土: 20, 金: 20, 水: 20 };

const SYDNEY = FEATURED_CITIES.find((city) => city.display === "雪梨，澳洲");

function realInput(year, month, day, hour, minute, gender) {
  return {
    question: "",
    locale: "zh-Hant",
    year,
    month,
    day,
    hour,
    minute,
    timeUnknown: false,
    gender,
    relation: "any",
    city: SYDNEY,
    liveCity: null,
    ziPolicy: "midnight",
    useTrueSolar: true,
    timeSource: "family-memory",
  };
}

test("real engine fixture: 1990-06-15 10:30 Sydney builds 庚午／壬午／辛亥／癸巳", () => {
  const chart = buildChart(realInput(1990, 6, 15, 10, 30, "male"));
  assert.deepEqual(
    chart.pillars.map((p) => p.ganZhi),
    ["庚午", "壬午", "辛亥", "癸巳"],
  );
  assert.equal(chart.dayMaster, "辛");
  assert.equal(chart.dayMasterElement, "金");
});

test("real pair: index equals bazi sub-score while only bazi has rules", () => {
  const a = buildChart(realInput(1990, 6, 15, 10, 30, "male"));
  const b = buildChart(realInput(1992, 3, 8, 8, 15, "female"));
  assert.equal(b.pillars.find((p) => p.key === "day")?.ready, true);
  const result = buildHepanIndex(a, b);
  assert.equal(Number.isInteger(result.index), true);
  assert.ok(result.index >= 0 && result.index <= 100);
  assert.equal(result.index, result.bazi.subScore);
  assert.equal(result.presentCount, 1);
  assert.deepEqual(result.appliedWeights, [{ system: "bazi", weight: 1 }]);
  assert.equal(result.bazi.readings.length, 3);
  for (const reading of result.bazi.readings) {
    assert.equal(Number.isInteger(reading.score), true);
    assert.ok(reading.score >= 0 && reading.score <= 100);
    assert.ok(reading.evidence.length > 0);
  }
  const subMean = Math.round(
    result.bazi.readings.reduce((sum, r) => sum + r.score, 0) / 3,
  );
  assert.equal(result.bazi.subScore, subMean);
  assert.match(result.formula, /歸一/);
});

test("pending systems: seven systems score null and say plainly they have no pair method", () => {
  const a = buildChart(realInput(1990, 6, 15, 10, 30, "male"));
  const b = buildChart(realInput(1992, 3, 8, 8, 15, "female"));
  const result = buildHepanIndex(a, b);
  const pending = result.systems.filter((s) => s.status === "pending");
  assert.deepEqual(
    pending.map((s) => s.id),
    ["ziwei", "numerology", "western", "vedic", "yizhangjing", "qizheng", "palm"],
  );
  for (const system of pending) {
    assert.equal(system.score, null);
    assert.equal(system.weight, null);
    assert.match(system.detail, /不計分/);
    assert.equal(system.detail, HEPAN_PENDING_REASONS[system.id]);
  }
  assert.equal(Object.keys(HEPAN_SYSTEM_TITLES).length, 8);
});

test("day branch: 子丑六合 scores 90", () => {
  const a = makeChart("壬", "子", EVEN);
  const b = makeChart("癸", "丑", EVEN);
  const pair = buildBaziPair(a, b);
  assert.equal(pair.readings[1].score, 90);
  assert.match(pair.readings[1].evidence.join(""), /子丑六合/);
});

test("day branch: 子午六沖 scores 40", () => {
  const a = makeChart("壬", "子", EVEN);
  const b = makeChart("甲", "午", EVEN);
  const pair = buildBaziPair(a, b);
  assert.equal(pair.readings[1].score, 40);
  assert.match(pair.readings[1].evidence.join(""), /子午六沖/);
});

test("day branch: 申子半三合 scores 80 and matches the engine's full triple", () => {
  const triple = analyzeBranchRelations([
    { id: "x:1", branch: "申", source: "natal" },
    { id: "x:2", branch: "子", source: "natal" },
    { id: "x:3", branch: "辰", source: "natal" },
  ]);
  assert.ok(triple.some((r) => r.kind === "三合" && r.transformation === "水"));
  const a = makeChart("庚", "申", EVEN);
  const b = makeChart("壬", "子", EVEN);
  const pair = buildBaziPair(a, b);
  assert.equal(pair.readings[1].score, 80);
  assert.match(pair.readings[1].evidence.join(""), /半三合水局條件未全/);
});

test("day branch: 子寅 with no relation scores 60", () => {
  const a = makeChart("壬", "子", EVEN);
  const b = makeChart("甲", "寅", EVEN);
  const pair = buildBaziPair(a, b);
  assert.equal(pair.readings[1].score, 60);
});

test("day master: same element 70, generates 85, controls 45", () => {
  const sameA = makeChart("辛", "子", EVEN);
  const sameB = makeChart("庚", "寅", EVEN);
  assert.equal(buildBaziPair(sameA, sameB).readings[0].score, 70);

  const genA = makeChart("辛", "子", EVEN);
  const genB = makeChart("壬", "寅", EVEN);
  assert.equal(buildBaziPair(genA, genB).readings[0].score, 85);

  const ctlA = makeChart("辛", "子", EVEN);
  const ctlB = makeChart("甲", "寅", EVEN);
  assert.equal(buildBaziPair(ctlA, ctlB).readings[0].score, 45);
});

test("elements: partial cover scores 50, even split is neutral 60, full cover is 100", () => {
  const a = makeChart("壬", "子", { 木: 40, 火: 20, 土: 20, 金: 10, 水: 10 });
  const b = makeChart("甲", "寅", { 木: 10, 火: 10, 土: 20, 金: 20, 水: 40 });
  assert.equal(buildBaziPair(a, b).readings[2].score, 50);

  const evenA = makeChart("壬", "子", EVEN);
  const evenB = makeChart("甲", "寅", EVEN);
  assert.equal(buildBaziPair(evenA, evenB).readings[2].score, 60);

  const fullA = makeChart("壬", "子", { 木: 40, 火: 15, 土: 15, 金: 15, 水: 15 });
  const fullB = makeChart("甲", "寅", { 木: 0, 火: 25, 土: 25, 金: 25, 水: 25 });
  assert.equal(buildBaziPair(fullA, fullB).readings[2].score, 100);
});

test("conflicts: a 45-point spread inside bazi is flagged, a 10-point spread is not", () => {
  // 日主相生 85, 日支六沖 40, 五行互補 50 -> spread 45.
  const clashA = makeChart("壬", "子", { 木: 40, 火: 20, 土: 20, 金: 10, 水: 10 });
  const clashB = makeChart("甲", "午", { 木: 10, 火: 10, 土: 20, 金: 20, 水: 40 });
  const clash = buildHepanIndex(clashA, clashB);
  assert.deepEqual(
    clash.bazi.readings.map((r) => r.score),
    [85, 40, 50],
  );
  assert.equal(clash.bazi.subScore, 58);
  assert.equal(clash.index, 58);
  assert.equal(clash.conflicts.length, 1);
  assert.match(clash.conflicts[0], /分歧/);

  const calmA = makeChart("辛", "子", EVEN);
  const calmB = makeChart("庚", "寅", EVEN);
  const calm = buildHepanIndex(calmA, calmB);
  assert.deepEqual(
    calm.bazi.readings.map((r) => r.score),
    [70, 60, 60],
  );
  assert.equal(calm.conflicts.length, 0);
});
