import test from "node:test";
import assert from "node:assert/strict";
import { buildChart } from "../src/lib/bazi/chart.ts";
import { analyzeBranchRelations } from "../src/lib/bazi/branch-relations.ts";
import { HIDDEN, STEMS, tenGod } from "../src/lib/bazi/calendar.ts";
import { FEATURED_CITIES } from "../src/lib/bazi/cities.ts";
import {
  buildBaziPair,
  buildHepanIndex,
  buildPalmPairSection,
  buildQizhengPairSection,
  buildZiweiPairSection,
  HEPAN_BASE_WEIGHTS,
  HEPAN_PENDING_REASONS,
  HEPAN_SYSTEM_TITLES,
  QIZHENG_PALACE_LORDS,
} from "../src/lib/hepan/pair-model.ts";
import { palmFromChart } from "../src/lib/yizhangjing/engine.ts";
import { normalizeZiweiCalendarBirth } from "../src/lib/ziwei/calendar-normalization.ts";
import { buildZiweiCoreChart } from "../src/lib/ziwei/core.ts";
import { ZHAOWU_ZIWEI_CALCULATION_PROFILE } from "../src/lib/ziwei/profiles.ts";
import {
  buildNumerologyPairSection,
  lifePathNumber,
  numerologyTier,
  NUMEROLOGY_MATRIX,
} from "../src/lib/hepan/numerology.ts";
import { aspectBetween, buildWesternPairSection } from "../src/lib/hepan/western.ts";
import { buildVedicPairSection, GANA, NADI } from "../src/lib/hepan/vedic.ts";
import { buildPlainLanguage } from "../src/lib/hepan/plain-language.ts";
import { readFileSync } from "node:fs";

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

function realInput(year, month, day, hour, minute, gender, timeUnknown = false) {
  return {
    question: "",
    locale: "zh-Hant",
    year,
    month,
    day,
    hour,
    minute,
    timeUnknown,
    gender,
    relation: "any",
    city: SYDNEY,
    liveCity: null,
    ziPolicy: "midnight",
    useTrueSolar: true,
    timeSource: "family-memory",
  };
}

function civilOf(year, month, day, hour, minute) {
  return { year, month, day, hour, minute };
}

function demoPair() {
  const chartA = buildChart(realInput(1990, 6, 15, 10, 30, "male"));
  const chartB = buildChart(realInput(1992, 3, 8, 8, 15, "female"));
  return {
    chartA,
    chartB,
    civilA: civilOf(1990, 6, 15, 10, 30),
    civilB: civilOf(1992, 3, 8, 8, 15),
  };
}

function buildZiweiFor(civil) {
  const normalized = normalizeZiweiCalendarBirth({
    civilDate: { ...civil },
    timeConfidence: "certain",
    profile: {
      id: ZHAOWU_ZIWEI_CALCULATION_PROFILE.id,
      lateZiPolicy: ZHAOWU_ZIWEI_CALCULATION_PROFILE.calendar.lateZiPolicy,
      leapMonthPolicy: ZHAOWU_ZIWEI_CALCULATION_PROFILE.calendar.leapMonthPolicy,
      yearBoundary: ZHAOWU_ZIWEI_CALCULATION_PROFILE.calendar.yearBoundary,
    },
  });
  assert.ok(normalized.coreInput);
  return buildZiweiCoreChart(normalized.coreInput, {
    mutagenProfile: ZHAOWU_ZIWEI_CALCULATION_PROFILE.mutagen,
    kuiYueProfile: ZHAOWU_ZIWEI_CALCULATION_PROFILE.kuiYue,
  });
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
  assert.match(result.formula, /70%/);
  assert.match(result.formula, /20%/);
  assert.match(result.formula, /10%/);
});

test("weights: base weights are bazi 70 / ziwei 20 / yizhangjing 10, others zero", () => {
  assert.deepEqual(HEPAN_BASE_WEIGHTS, {
    bazi: 0.7,
    ziwei: 0.2,
    numerology: 0,
    western: 0,
    vedic: 0,
    yizhangjing: 0.1,
    qizheng: 0,
    palm: 0,
  });
});

test("pending systems: without qualitative sections, seven systems score null and say plainly they have no pair method", () => {
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
    if (system.id in HEPAN_PENDING_REASONS) {
      assert.equal(system.detail, HEPAN_PENDING_REASONS[system.id]);
    }
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

test("qizheng palace lords: all twelve branches map per 《五星合格》", () => {
  assert.equal(Object.keys(QIZHENG_PALACE_LORDS).length, 12);
  assert.deepEqual(QIZHENG_PALACE_LORDS["亥"], { lord: "歲星", element: "木" });
  assert.deepEqual(QIZHENG_PALACE_LORDS["寅"], { lord: "歲星", element: "木" });
  assert.deepEqual(QIZHENG_PALACE_LORDS["巳"], { lord: "辰星", element: "水" });
  assert.deepEqual(QIZHENG_PALACE_LORDS["申"], { lord: "辰星", element: "水" });
  assert.deepEqual(QIZHENG_PALACE_LORDS["午"], { lord: "太陽", element: "—" });
  assert.deepEqual(QIZHENG_PALACE_LORDS["未"], { lord: "太陰", element: "—" });
  assert.deepEqual(QIZHENG_PALACE_LORDS["子"], { lord: "鎮星", element: "土" });
  assert.deepEqual(QIZHENG_PALACE_LORDS["辰"], { lord: "太白", element: "金" });
});

test("ziwei pair: real engine shows spouse palace stars and mutagens, no score", () => {
  const { chartA, chartB, civilA, civilB } = demoPair();
  const section = buildZiweiPairSection(chartA, civilA, chartB, civilB);
  assert.equal(section.status, "qualitative");
  assert.equal(section.score, null);
  assert.equal(section.weight, null);
  assert.match(section.detail, /不計分/);
  const text = (section.lines ?? []).join("\n");
  assert.match(text, /夫妻宮在/);
  assert.match(text, /生年祿/);
  assert.match(text, /生年忌/);
  assert.match(text, /與八字一致/);
  assert.match(text, /紫微補充的新資訊/);
  assert.match(text, /兩套系統觀察角度不同/);
  assert.match(text, /zhaowu_ziwei_v0\.5\.2/);
  // The spouse branch named in the section matches the chart's own SPOUSE palace.
  for (const civil of [civilA, civilB]) {
    const chart = buildZiweiFor(civil);
    const spouse = chart.palaces.find((p) => p.id === "SPOUSE");
    assert.ok(spouse);
    assert.ok(text.includes(`夫妻宮在${spouse.branch}`));
  }
});

test("ziwei pair: unknown birth time refuses with 不得使用", () => {
  const chartA = buildChart(realInput(1990, 6, 15, 12, 0, "male", true));
  const chartB = buildChart(realInput(1992, 3, 8, 8, 15, "female"));
  assert.equal(chartA.timeUnknown, true);
  const section = buildZiweiPairSection(
    chartA,
    civilOf(1990, 6, 15, 12, 0),
    chartB,
    civilOf(1992, 3, 8, 8, 15),
  );
  assert.equal(section.status, "pending");
  assert.equal(section.score, null);
  assert.match(section.detail, /不得使用/);
});

test("palm pair: real engine shows four palaces and six realms, no score, no past-life fact", () => {
  const { chartA, chartB, civilA, civilB } = demoPair();
  const palmA = palmFromChart(chartA, civilA);
  assert.equal(palmA.palaces.length, 4);
  assert.equal(palmA.ready, true);
  const section = buildPalmPairSection(chartA, civilA, chartB, civilB);
  assert.equal(section.status, "qualitative");
  assert.equal(section.score, null);
  assert.equal(section.weight, null);
  assert.match(section.detail, /不計分/);
  const text = (section.lines ?? []).join("\n");
  for (const palace of ["年宮", "月宮", "日宮", "時宮"]) {
    assert.ok(text.includes(palace), `missing ${palace}`);
  }
  assert.match(text, /一掌經象徵/);
  assert.match(text, /文化象意/);
  assert.match(text, /精神課題/);
  assert.match(text, /不是可驗證的歷史前世/);
  assert.doesNotMatch(text, /一定曾經是|冤親債主|帶業障|一定要出家/);
});

test("palm pair: unknown birth time leaves the hour palace unjudged", () => {
  const chartA = buildChart(realInput(1990, 6, 15, 12, 0, "male", true));
  const chartB = buildChart(realInput(1992, 3, 8, 8, 15, "female"));
  const section = buildPalmPairSection(
    chartA,
    civilOf(1990, 6, 15, 12, 0),
    chartB,
    civilOf(1992, 3, 8, 8, 15),
  );
  assert.equal(section.status, "qualitative");
  const text = (section.lines ?? []).join("\n");
  assert.match(text, /時宮：因缺出生時辰，不作判定/);
});

test("qizheng pair: palace-lord method shown, no spouse lord computed, no status claim", () => {
  const { chartA, chartB, civilA, civilB } = demoPair();
  const section = buildQizhengPairSection(chartA, civilA, chartB, civilB);
  assert.equal(section.status, "qualitative");
  assert.equal(section.score, null);
  assert.equal(section.weight, null);
  const text = (section.lines ?? []).join("\n");
  assert.match(text, /宮主制/);
  assert.match(text, /歲星/);
  assert.match(text, /辰星/);
  assert.match(text, /不排十二宮/);
  assert.match(text, /算不出來/);
  // The deleted sentence appears exactly once, inside its own disavowal —
  // quoted to forbid it, never asserted as a reading.
  assert.match(text, /「對方一定有地位和資源」這句話核驗文件已指出證據不足，本頁不寫/);
  assert.equal((text.match(/對方一定有地位/g) ?? []).length, 1);
});

test("index with qualitative sections: still bazi only, weights renormalized", () => {
  const { chartA, chartB, civilA, civilB } = demoPair();
  const result = buildHepanIndex(chartA, chartB, {
    ziwei: buildZiweiPairSection(chartA, civilA, chartB, civilB),
    yizhangjing: buildPalmPairSection(chartA, civilA, chartB, civilB),
    qizheng: buildQizhengPairSection(chartA, civilA, chartB, civilB),
  });
  assert.equal(result.presentCount, 1);
  assert.equal(result.index, result.bazi.subScore);
  assert.deepEqual(result.appliedWeights, [{ system: "bazi", weight: 1 }]);
  assert.deepEqual(
    result.systems.map((s) => s.status),
    ["scored", "qualitative", "pending", "pending", "pending", "qualitative", "qualitative", "pending"],
  );
  assert.deepEqual(
    result.systems.map((s) => s.id),
    ["bazi", "ziwei", "numerology", "western", "vedic", "yizhangjing", "qizheng", "palm"],
  );
});

test("heuristic guard: day-branch notes label the scores a compatibility heuristic, never 必吉/必凶 (UA1 C11)", () => {
  const liuheA = makeChart("壬", "子", EVEN);
  const liuheB = makeChart("癸", "丑", EVEN);
  const liuhe = buildBaziPair(liuheA, liuheB).readings[1];
  assert.equal(liuhe.score, 90);
  assert.match(liuhe.note, /合盤啟發式/);
  assert.match(liuhe.note, /六合不是必吉/);

  const clashA = makeChart("壬", "子", EVEN);
  const clashB = makeChart("甲", "午", EVEN);
  const clash = buildBaziPair(clashA, clashB).readings[1];
  assert.equal(clash.score, 40);
  assert.match(clash.note, /合盤啟發式/);
  assert.match(clash.note, /不是必凶/);
});

test("rendering guard: the index never renders as stars, grades or rarity (UA1 E03)", () => {
  const { chartA, chartB, civilA, civilB } = demoPair();
  const result = buildHepanIndex(chartA, chartB, {
    ziwei: buildZiweiPairSection(chartA, civilA, chartB, civilB),
    yizhangjing: buildPalmPairSection(chartA, civilA, chartB, civilB),
    qizheng: buildQizhengPairSection(chartA, civilA, chartB, civilB),
  });
  const text = JSON.stringify(result);
  assert.doesNotMatch(text, /★|☆|✦|✧/);
  assert.doesNotMatch(text, /SSS|SSR|稀有度|五星命格/);
  assert.doesNotMatch(text, /六合必吉|六沖必凶|一沖必凶|一合必吉/);
});

test("permanent framing: qualitative sections never promise pair instructions that will not arrive", () => {
  const { chartA, chartB, civilA, civilB } = demoPair();
  const sections = [
    buildZiweiPairSection(chartA, civilA, chartB, civilB),
    buildPalmPairSection(chartA, civilA, chartB, civilB),
    buildQizhengPairSection(chartA, civilA, chartB, civilB),
  ];
  for (const section of sections) {
    assert.equal(section.status, "qualitative");
    const text = [section.detail, ...(section.lines ?? [])].join("\n");
    assert.doesNotMatch(text, /待補|才會加入|需要站主.*指令/);
    assert.match(text, /不計分/);
    assert.match(text, /沒有合盤算法/);
  }
  // Numerology, western and vedic are reference sections now, not
  // pending: sub-scores only, never in the index, never promising a
  // future instruction.
  const refSections = [
    buildNumerologyPairSection(civilA, civilB),
    buildWesternPairSection({
      available: true,
      a: westernPos(0),
      b: westernPos(120),
      moonReliable: true,
    }),
    buildVedicPairSection({
      available: true,
      a: vedicMoon(0, 10, 0),
      b: vedicMoon(4, 10, 9),
      genderA: "male",
      genderB: "female",
      lowConfidence: false,
    }),
  ];
  for (const section of refSections) {
    assert.equal(section.status, "reference");
    assert.equal(section.weight, null);
    assert.match(section.detail, /不入主指數/);
    const text = [section.detail, ...(section.lines ?? [])].join("\n");
    assert.doesNotMatch(text, /待補|才會加入|需要站主.*指令/);
  }
  // Palm is the only pending system left: the first version does not
  // enter hepan at all, and its reason says so plainly.
  assert.deepEqual(Object.keys(HEPAN_PENDING_REASONS), ["palm"]);
  assert.match(HEPAN_PENDING_REASONS.palm, /第一版不進合盤/);
  assert.doesNotMatch(HEPAN_PENDING_REASONS.palm, /才會加入/);
});

/** All five western planets at one longitude (sign reliable). */
function westernPos(longitude) {
  const at = { longitude, signReliable: true };
  return { Sun: { ...at }, Moon: { ...at }, Venus: { ...at }, Mars: { ...at }, Saturn: { ...at } };
}

/** Sidereal Moon for vedic tests: sign 0 = Aries, nakshatra 0 = Ashwini. */
function vedicMoon(sign, degreeInSign, nakshatra) {
  return { sign, degreeInSign, nakshatra, signReliable: true };
}

test("numerology: life path reduces digits, master numbers stop early and score reduced", () => {
  assert.deepEqual(lifePathNumber({ year: 1990, month: 6, day: 15 }), {
    value: 4,
    master: false,
    reduced: 4,
  });
  assert.deepEqual(lifePathNumber({ year: 1992, month: 3, day: 8 }), {
    value: 5,
    master: false,
    reduced: 5,
  });
  assert.deepEqual(lifePathNumber({ year: 2002, month: 1, day: 6 }), {
    value: 11,
    master: true,
    reduced: 2,
  });
  assert.deepEqual(lifePathNumber({ year: 1991, month: 1, day: 1 }), {
    value: 22,
    master: true,
    reduced: 4,
  });
  assert.deepEqual(lifePathNumber({ year: 1995, month: 3, day: 6 }), {
    value: 33,
    master: true,
    reduced: 6,
  });
});

test("numerology: tiers are same-group 85, A–B friction 45, the rest neutral 65", () => {
  assert.deepEqual(numerologyTier(1, 3), { tier: "相合", score: 85 });
  assert.deepEqual(numerologyTier(2, 2), { tier: "相合", score: 85 });
  assert.deepEqual(numerologyTier(4, 5), { tier: "磨合", score: 45 });
  assert.deepEqual(numerologyTier(1, 6), { tier: "中性", score: 65 });
  assert.deepEqual(numerologyTier(2, 9), { tier: "中性", score: 65 });
  assert.equal(NUMEROLOGY_MATRIX[1][1].score, 85);
  assert.equal(NUMEROLOGY_MATRIX[1][2].score, 45);
  assert.equal(NUMEROLOGY_MATRIX[1][6].score, 65);
  assert.equal(NUMEROLOGY_MATRIX[6][9].score, 85);
});

test("numerology section: demo pair 4 × 5 is 磨合 45, reference only, matrix pending Shi", () => {
  const section = buildNumerologyPairSection(civilOf(1990, 6, 15), civilOf(1992, 3, 8));
  assert.equal(section.status, "reference");
  assert.equal(section.score, 45);
  assert.equal(section.weight, null);
  assert.match(section.detail, /不入主指數/);
  assert.match(section.detail, /矩陣待 Shi 確認/);
  assert.equal(section.readings?.length, 1);
  assert.equal(section.readings[0].score, 45);
  assert.match(section.readings[0].evidence.join(""), /甲生命靈數 4；乙生命靈數 5/);
  const text = (section.lines ?? []).join("\n");
  assert.match(text, /通用畢達哥拉斯/);
  assert.match(text, /不是 Shi 的原創規則/);
  assert.match(text, /矩陣待 Shi 確認/);
});

test("western aspects: draft orbs (trine 8, sextile 6) — not the single-chart engine's", () => {
  assert.deepEqual(aspectBetween(10, 12), { type: "合相", angle: 0, orb: 2, tier: "harmonious" });
  assert.deepEqual(aspectBetween(10, 18), { type: "合相", angle: 0, orb: 8, tier: "harmonious" });
  assert.equal(aspectBetween(10, 18.5), null);
  // Trine orb 7: inside the approved draft orb (8), outside the
  // single-chart engine's calculateMajorAspects orb (6).
  assert.deepEqual(aspectBetween(10, 137), { type: "三分相", angle: 120, orb: 7, tier: "harmonious" });
  // Sextile orb 5: inside the draft orb (6), outside the engine's (4).
  assert.deepEqual(aspectBetween(10, 75), { type: "六分相", angle: 60, orb: 5, tier: "harmonious" });
  assert.deepEqual(aspectBetween(10, 100), { type: "刑相", angle: 90, orb: 0, tier: "hard" });
  assert.deepEqual(aspectBetween(10, 190), { type: "沖相", angle: 180, orb: 0, tier: "hard" });
  assert.equal(aspectBetween(10, 45), null);
});

test("western section: five items, harmonious 85 / hard 45, no total", () => {
  const easy = buildWesternPairSection({
    available: true,
    a: westernPos(0),
    b: westernPos(120),
    moonReliable: true,
  });
  assert.equal(easy.status, "reference");
  assert.equal(easy.score, null);
  assert.equal(easy.weight, null);
  assert.deepEqual(
    easy.readings.map((r) => r.score),
    [85, 85, 85, 85, 85],
  );
  assert.match(easy.detail, /不計總分/);
  assert.match(easy.detail, /不入主指數/);

  const hard = buildWesternPairSection({
    available: true,
    a: westernPos(0),
    b: westernPos(90),
    moonReliable: true,
  });
  assert.deepEqual(
    hard.readings.map((r) => r.score),
    [45, 45, 45, 45, 45],
  );
  assert.match(hard.readings[0].note, /磨合點，不判凶/);
});

test("western section: unreliable Moon drops the Moon items, Saturn keeps its Sun pairs", () => {
  const section = buildWesternPairSection({
    available: true,
    a: westernPos(0),
    b: westernPos(120),
    moonReliable: false,
  });
  assert.deepEqual(
    section.readings.map((r) => r.id),
    ["western-venus-mars", "western-venus-venus", "western-saturn"],
  );
  assert.match((section.lines ?? []).join("\n"), /月亮星座全天不穩定/);
  assert.match((section.lines ?? []).join("\n"), /月亮相位不作判定/);
});

test("western section: ephemeris failure is an honest unavailable note, not a zero", () => {
  const section = buildWesternPairSection({ available: false, reason: "星曆暫時無法載入" });
  assert.equal(section.status, "reference");
  assert.equal(section.score, null);
  assert.equal(section.readings, undefined);
  assert.match(section.detail, /星曆暫時無法載入/);
  assert.match(section.detail, /不計分/);
});

test("vedic tables: gana and nadi are 9/9/9 with the right stars in each group", () => {
  assert.equal(GANA.length, 27);
  assert.equal(NADI.length, 27);
  for (const table of [GANA, NADI]) {
    assert.equal(table.filter((v) => v === 0).length, 9);
    assert.equal(table.filter((v) => v === 1).length, 9);
    assert.equal(table.filter((v) => v === 2).length, 9);
  }
  // Spots that were wrong in the first draft of the table.
  assert.equal(GANA[16], 0); // Anuradha is Deva
  assert.equal(GANA[21], 0); // Shravana is Deva
  assert.equal(GANA[23], 2); // Shatabhisha is Rakshasa
  assert.equal(GANA[24], 1); // Purva Bhadrapada is Manushya
  assert.equal(NADI[16], 1); // Anuradha is Madhya
  assert.equal(NADI[21], 2); // Shravana is Antya
});

test("vedic: full 36-point Guna Milan for Aries/Ashwini × Leo/Magha totals 19 (acceptable)", () => {
  const section = buildVedicPairSection({
    available: true,
    a: vedicMoon(0, 10, 0),
    b: vedicMoon(4, 10, 9),
    genderA: "male",
    genderB: "female",
    lowConfidence: false,
  });
  assert.equal(section.status, "reference");
  assert.equal(section.score, 19);
  assert.equal(section.scoreDenominator, 36);
  assert.equal(section.weight, null);
  assert.deepEqual(
    section.readings.map((r) => [r.id, r.score, r.max]),
    [
      ["vedic-varna", 1, 1],
      ["vedic-vashya", 0, 2],
      ["vedic-graha-maitri", 5, 5],
      ["vedic-bhakoot", 0, 7],
      ["vedic-tara", 3, 3],
      ["vedic-yoni", 2, 4],
      ["vedic-gana", 0, 6],
      ["vedic-nadi", 8, 8],
    ],
  );
  assert.match(section.detail, /19／36/);
  assert.match(section.detail, /可接受/);
});

test("vedic: Cancer/Pushya × Pisces/Revati totals 26 (good), Nadi differs", () => {
  const section = buildVedicPairSection({
    available: true,
    a: vedicMoon(3, 10, 7),
    b: vedicMoon(11, 10, 26),
    genderA: "female",
    genderB: "male",
    lowConfidence: false,
  });
  assert.equal(section.score, 26);
  assert.equal(section.scoreDenominator, 36);
  assert.deepEqual(
    section.readings.map((r) => r.score),
    [1, 2, 4, 0, 3, 2, 6, 8],
  );
  assert.match(section.detail, /好/);
});

test("vedic: same nadi is Nadi dosha (0, flagged not judged) and the total can sit on 18", () => {
  const section = buildVedicPairSection({
    available: true,
    a: vedicMoon(0, 10, 0),
    b: vedicMoon(2, 10, 6),
    genderA: "unspecified",
    genderB: "unspecified",
    lowConfidence: false,
  });
  assert.equal(section.score, 18);
  const nadi = section.readings.find((r) => r.id === "vedic-nadi");
  assert.equal(nadi.score, 0);
  assert.match(nadi.note, /Nadi dosha/);
  assert.match(nadi.note, /不寫死、不判凶/);
  // Half points are real: Tara 1.5 + Graha Maitri 0.5 are in the total.
  const tara = section.readings.find((r) => r.id === "vedic-tara");
  assert.equal(tara.score, 1.5);
  const maitri = section.readings.find((r) => r.id === "vedic-graha-maitri");
  assert.equal(maitri.score, 0.5);
});

test("vedic: without a birth time only the four sign kutas count, out of 15, low confidence", () => {
  const section = buildVedicPairSection({
    available: true,
    a: vedicMoon(1, 5, null),
    b: vedicMoon(5, 20, null),
    genderA: "unspecified",
    genderB: "unspecified",
    lowConfidence: true,
  });
  assert.equal(section.score, 7);
  assert.equal(section.scoreDenominator, 15);
  assert.equal(section.readings.length, 4);
  assert.deepEqual(
    section.readings.map((r) => r.id),
    ["vedic-varna", "vedic-vashya", "vedic-graha-maitri", "vedic-bhakoot"],
  );
  assert.match(section.detail, /低置信/);
  assert.match((section.lines ?? []).join("\n"), /不套用 18／24／28 門檻/);
});

test("vedic section: unavailable Moon sign is an honest note, not a zero", () => {
  const section = buildVedicPairSection({ available: false, reason: "月亮星座全天不穩定" });
  assert.equal(section.status, "reference");
  assert.equal(section.score, null);
  assert.match(section.detail, /月亮星座全天不穩定/);
  assert.match(section.detail, /不計分/);
});

test("ziwei pair: 壬年化科左輔 resolves to a palace (A school, no conflict)", () => {
  const { chartA, chartB, civilA, civilB } = demoPair();
  const section = buildZiweiPairSection(chartA, civilA, chartB, civilB);
  const text = (section.lines ?? []).join("\n");
  // 乙 is 1992-03-08, 壬申 year: 生年科 is 左輔, an auxiliary star —
  // the old majorStars-only lookup printed "落宮未在十四主星表內".
  assert.match(text, /乙生年科：左輔落.+宮/);
  assert.doesNotMatch(text, /落宮未在十四主星表內/);
  assert.match(text, /三方四正/);
  assert.match(text, /A 派：梁紫左武/);
  assert.match(text, /與定案無衝突/);
  for (const line of section.lines ?? []) {
    if (line.includes("磨合點")) assert.match(line, /不判凶/);
  }
});

test("palm pair: branch-element generation/control and six-realm overlap are shown", () => {
  const { chartA, chartB, civilA, civilB } = demoPair();
  const section = buildPalmPairSection(chartA, civilA, chartB, civilB);
  const text = (section.lines ?? []).join("\n");
  assert.match(text, /生剋/);
  assert.match(text, /用地支五行對照；引擎沒有星曜五行欄位/);
  assert.match(text, /六道：甲（/);
  assert.doesNotMatch(text, /一定曾經是|冤親債主|帶業障|一定要出家/);
});

test("qizheng pair: eleven bodies are listed by 30° branch segment, still not twelve palaces", () => {
  const { chartA, chartB, civilA, civilB } = demoPair();
  const section = buildQizhengPairSection(chartA, civilA, chartB, civilB);
  const text = (section.lines ?? []).join("\n");
  assert.match(text, /七曜黃道分段/);
  assert.match(text, /太陽/);
  assert.match(text, /太陰/);
  assert.match(text, /計都/);
  assert.match(text, /30° 一段的黃道地支分段，不是命盤十二宮/);
});

test("index with all six sections: reference sections never enter the index", () => {
  const { chartA, chartB, civilA, civilB } = demoPair();
  const result = buildHepanIndex(chartA, chartB, {
    ziwei: buildZiweiPairSection(chartA, civilA, chartB, civilB),
    yizhangjing: buildPalmPairSection(chartA, civilA, chartB, civilB),
    qizheng: buildQizhengPairSection(chartA, civilA, chartB, civilB),
    numerology: buildNumerologyPairSection(civilA, civilB),
    western: buildWesternPairSection({
      available: true,
      a: westernPos(0),
      b: westernPos(120),
      moonReliable: true,
    }),
    vedic: buildVedicPairSection({
      available: true,
      a: vedicMoon(0, 10, 0),
      b: vedicMoon(4, 10, 9),
      genderA: "male",
      genderB: "female",
      lowConfidence: false,
    }),
  });
  assert.equal(result.presentCount, 1);
  assert.equal(result.index, result.bazi.subScore);
  assert.deepEqual(result.appliedWeights, [{ system: "bazi", weight: 1 }]);
  assert.deepEqual(
    result.systems.map((s) => s.status),
    ["scored", "qualitative", "reference", "reference", "reference", "qualitative", "qualitative", "pending"],
  );
  assert.match(result.formula, /分項參考/);
  assert.match(result.formula, /不入主指數/);
  assert.match(result.formula, /不合成參考總分/);
  const western = result.systems.find((s) => s.id === "western");
  assert.equal(western.score, null);
  const vedic = result.systems.find((s) => s.id === "vedic");
  assert.equal(vedic.score, 19);
  assert.equal(vedic.scoreDenominator, 36);
  const text = JSON.stringify(result);
  assert.doesNotMatch(text, /★|☆|✦|✧/);
  assert.doesNotMatch(text, /SSS|SSR|稀有度|五星命格/);
  assert.doesNotMatch(text, /六合必吉|六沖必凶|一沖必凶|一合必吉/);
});

test("floating 合盤 button: paid report page links to /hepan, no longer expands the full report", () => {
  const source = readFileSync(new URL("../src/components/paid-report-pages.tsx", import.meta.url), "utf8");
  assert.match(source, /<Link to="\/hepan" className="zhaowu-v6-together">/);
  assert.doesNotMatch(source, /\[data-professional-report\]\)\?\.setAttribute\("open", ""\)/);
});

// --- Plain-language rendering (Shi, 2026-11-24) -------------------------
// The page shows ONLY what buildPlainLanguage returns. The backend model
// (formula, weights, per-system scores) is still computed and still
// locked by the tests above; these tests lock the plain surface:
// no jargon, no digits, correct block assignment, headline bands,
// reminder variants and the caps.

const FULL_A = { 木: 40, 火: 15, 土: 15, 金: 15, 水: 15 };
const FULL_B = { 木: 0, 火: 25, 土: 25, 金: 25, 水: 25 };
const PART_A = { 木: 40, 火: 20, 土: 20, 金: 10, 水: 10 };
const PART_B = { 木: 10, 火: 10, 土: 20, 金: 20, 水: 40 };
const SKEW = { 木: 60, 火: 10, 土: 10, 金: 10, 水: 10 };

/** The demo pair with all six sections, as the page builds it (western
 *  and vedic from the test helpers, not the live ephemeris). */
function fullDemoIndex() {
  const { chartA, chartB, civilA, civilB } = demoPair();
  return buildHepanIndex(chartA, chartB, {
    ziwei: buildZiweiPairSection(chartA, civilA, chartB, civilB),
    yizhangjing: buildPalmPairSection(chartA, civilA, chartB, civilB),
    qizheng: buildQizhengPairSection(chartA, civilA, chartB, civilB),
    numerology: buildNumerologyPairSection(civilA, civilB),
    western: buildWesternPairSection({
      available: true,
      a: westernPos(0),
      b: westernPos(120),
      moonReliable: true,
    }),
    vedic: buildVedicPairSection({
      available: true,
      a: vedicMoon(0, 10, 0),
      b: vedicMoon(4, 10, 9),
      genderA: "male",
      genderB: "female",
      lowConfidence: false,
    }),
  });
}

function plainText(plain) {
  return [plain.headline, ...plain.strengths, ...plain.patience, plain.reminder, plain.footer].join("\n");
}

const JARGON =
  /八字|紫微|一掌經|七政|生命靈數|占星|手相|六合|六沖|三合|生剋|四化|宮主|星曜|六道|相位|容許度|權重|公式|分數|大運|流年|日主|日支|五行|化忌|命宮|夫妻宮|星曆|相合|磨合|中性|計分|不計分|不入主指數|命盤|三會/;

test("plain language: demo pair shows no jargon and no digits anywhere", () => {
  const plain = buildPlainLanguage(fullDemoIndex(), "zh-Hant");
  const text = plainText(plain);
  assert.doesNotMatch(text, JARGON);
  assert.doesNotMatch(text, /\d/);
  assert.match(plain.footer, /完整版/);
  assert.doesNotMatch(plain.footer, /http/);
  assert.equal(plain.strengths.length, 3);
  assert.equal(plain.patience.length, 3);
  assert.match(plain.headline, /合得來的地方不少/);
});

test("plain language: headline bands are high >= 75, mid 55-74, low < 55", () => {
  const high = buildHepanIndex(makeChart("辛", "子", FULL_A), makeChart("壬", "丑", FULL_B));
  assert.deepEqual(
    high.bazi.readings.map((r) => r.score),
    [85, 90, 100],
  );
  assert.equal(high.index, 92);
  assert.match(buildPlainLanguage(high, "zh-Hant").headline, /合得來的地方明顯比需要磨合的地方多/);

  const mid = fullDemoIndex();
  assert.equal(mid.index, 63);
  assert.match(buildPlainLanguage(mid, "zh-Hant").headline, /合得來的地方不少，不過也有一個地方/);

  const low = buildHepanIndex(makeChart("辛", "子", PART_A), makeChart("甲", "午", PART_B));
  assert.deepEqual(
    low.bazi.readings.map((r) => r.score),
    [45, 40, 50],
  );
  assert.equal(low.index, 45);
  assert.match(buildPlainLanguage(low, "zh-Hant").headline, /要磨合的地方不少，急不得/);
});

test("plain language: day-master 85/70 go to strengths, 45 goes to patience", () => {
  const gen = buildHepanIndex(makeChart("辛", "子", EVEN), makeChart("壬", "寅", EVEN));
  assert.deepEqual(
    buildPlainLanguage(gen, "zh-Hant").strengths,
    ["一個人主動、一個人接得住，事情推得動。"],
  );

  const same = buildHepanIndex(makeChart("辛", "子", EVEN), makeChart("庚", "寅", EVEN));
  assert.deepEqual(
    buildPlainLanguage(same, "zh-Hant").strengths,
    ["想法挺像，很多事不用多說就懂。"],
  );

  const ctl = buildHepanIndex(makeChart("辛", "子", EVEN), makeChart("甲", "寅", EVEN));
  assert.deepEqual(
    buildPlainLanguage(ctl, "zh-Hant").patience,
    ["做事的方式不太一樣，容易在小事上較勁。"],
  );
});

test("plain language: day-branch 六合/半三合 go to strengths, 六沖 goes to patience", () => {
  const liuhe = buildHepanIndex(makeChart("壬", "子", EVEN), makeChart("癸", "丑", EVEN));
  assert.ok(
    buildPlainLanguage(liuhe, "zh-Hant").strengths.includes("過日子挺合拍，待在一起不累。"),
  );

  const sanhui = buildHepanIndex(makeChart("庚", "申", EVEN), makeChart("壬", "子", EVEN));
  assert.ok(
    buildPlainLanguage(sanhui, "zh-Hant").strengths.includes("剛開始要適應一下，處久了會越來越順。"),
  );

  const liuchong = buildHepanIndex(makeChart("壬", "子", EVEN), makeChart("甲", "午", EVEN));
  assert.ok(
    buildPlainLanguage(liuchong, "zh-Hant").patience.includes("生活習慣和步調差得比較多，要多留空間給對方。"),
  );

  // No relation (60) earns no sentence either way.
  const none = buildHepanIndex(makeChart("壬", "子", EVEN), makeChart("甲", "寅", EVEN));
  const plain = buildPlainLanguage(none, "zh-Hant");
  assert.doesNotMatch(plainText(plain), /過日子挺合拍|剛開始要適應|生活習慣和步調/);
});

test("plain language: elements 100 goes to strengths, 0 goes to patience, 50-69 earns nothing", () => {
  const full = buildHepanIndex(makeChart("壬", "子", FULL_A), makeChart("甲", "寅", FULL_B));
  assert.ok(
    buildPlainLanguage(full, "zh-Hant").strengths.includes("一個人缺的，另一個人剛好補得上。"),
  );

  const none = buildHepanIndex(makeChart("壬", "子", SKEW), makeChart("甲", "寅", SKEW));
  assert.equal(none.bazi.readings[2].score, 0);
  assert.ok(
    buildPlainLanguage(none, "zh-Hant").patience.includes(
      "一個人缺的，另一個人不一定補得上，遇到瓶頸容易一起卡住。",
    ),
  );

  const mid = buildHepanIndex(makeChart("壬", "子", PART_A), makeChart("甲", "寅", PART_B));
  assert.equal(mid.bazi.readings[2].score, 50);
  assert.doesNotMatch(
    plainText(buildPlainLanguage(mid, "zh-Hant")),
    /一個人缺的，另一個人剛好補得上|一個人缺的，另一個人不一定補得上/,
  );
});

test("plain language: numerology 85 goes to strengths, 45 to patience, same number gets its own line", () => {
  const neutral = (numerology) =>
    buildHepanIndex(makeChart("辛", "子", EVEN), makeChart("庚", "寅", EVEN), { numerology });

  const xianghe = neutral(
    buildNumerologyPairSection(civilOf(1990, 1, 1, 12, 0), civilOf(1992, 3, 8, 8, 15)),
  );
  assert.ok(
    buildPlainLanguage(xianghe, "zh-Hant").strengths.includes("兩個人看事情的角度挺像，節奏也合得來。"),
  );

  const mohe = neutral(
    buildNumerologyPairSection(civilOf(1990, 6, 15, 10, 30), civilOf(1992, 3, 8, 8, 15)),
  );
  assert.ok(
    buildPlainLanguage(mohe, "zh-Hant").patience.includes("做事的方式不太一樣，決定之前多商量一下。"),
  );

  const same = neutral(
    buildNumerologyPairSection(civilOf(1990, 6, 15, 10, 30), civilOf(1990, 6, 24, 10, 30)),
  );
  assert.ok(
    buildPlainLanguage(same, "zh-Hant").strengths.includes("想法很像，連盲點都像，互補要靠其他地方。"),
  );
});

test("plain language: western contributes at most one sentence per block, sun-moon first", () => {
  const neutral = (western) =>
    buildHepanIndex(makeChart("辛", "子", EVEN), makeChart("庚", "寅", EVEN), { western });
  const westHigh = [
    "平常過日子的節奏合得來，累了的時候對方也懂。",
    "兩個人親近的方式合得來，喜歡待在一起。",
    "喜歡的東西挺像，一起做點什麼都不難。",
    "情緒上互相接得住，不用多說。",
    "兩個人在一起挺穩的，長久相處不用擔心。",
  ];
  const westLow = [
    "一個人想休息、一個人想出門的時候，節奏容易對不上。",
    "親近的方式不太一樣，一個想靠近、一個想留點空間的時候多。",
    "喜歡的東西不太一樣，花錢花時間的地方容易有不同想法。",
    "情緒低落的時候，兩個人安慰人的方式不太一樣。",
    "長久相處要多花點心思，責任和界線要講清楚。",
  ];

  const easy = neutral(
    buildWesternPairSection({ available: true, a: westernPos(0), b: westernPos(120), moonReliable: true }),
  );
  const easyPlain = buildPlainLanguage(easy, "zh-Hant");
  assert.equal(easyPlain.strengths.filter((s) => westHigh.includes(s)).length, 1);
  assert.ok(easyPlain.strengths.includes(westHigh[0]));

  const hard = neutral(
    buildWesternPairSection({ available: true, a: westernPos(0), b: westernPos(90), moonReliable: true }),
  );
  const hardPlain = buildPlainLanguage(hard, "zh-Hant");
  assert.equal(hardPlain.patience.filter((s) => westLow.includes(s)).length, 1);
  assert.ok(hardPlain.patience.includes(westLow[0]));
});

test("plain language: vedic 26 goes to strengths, 19 earns nothing, 13 with a zero habit goes to patience", () => {
  const neutral = (vedic) =>
    buildHepanIndex(makeChart("辛", "子", EVEN), makeChart("庚", "寅", EVEN), { vedic });
  const vedicSec = (a, b) =>
    buildVedicPairSection({
      available: true,
      a,
      b,
      genderA: "male",
      genderB: "female",
      lowConfidence: false,
    });

  const high = neutral(vedicSec(vedicMoon(3, 10, 7), vedicMoon(11, 10, 26)));
  assert.ok(
    buildPlainLanguage(high, "zh-Hant").strengths.includes("整體來說，兩個人過日子的節奏合得來。"),
  );

  const skip = neutral(vedicSec(vedicMoon(0, 10, 0), vedicMoon(4, 10, 9)));
  const skipPlain = buildPlainLanguage(skip, "zh-Hant");
  assert.doesNotMatch(
    plainText(skipPlain),
    /整體來說，兩個人過日子的節奏合得來|有些生活習慣和性情上的地方|整體來說，兩個人要磨合的地方比較多/,
  );

  const low = neutral(vedicSec(vedicMoon(3, 10, 7), vedicMoon(9, 10, 22)));
  assert.ok(
    buildPlainLanguage(low, "zh-Hant").patience.includes("有些生活習慣和性情上的地方，要多包容一點。"),
  );
});

test("plain language: ziwei flag goes to patience, shared palm dao goes to strengths", () => {
  const demo = fullDemoIndex();
  assert.ok(
    buildPlainLanguage(demo, "zh-Hant").patience.includes("有一個地方要多花點心力，不是誰對誰錯。"),
  );

  const chartA = buildChart(realInput(1990, 6, 15, 10, 30, "male"));
  const chartB = buildChart(realInput(2000, 12, 12, 18, 0, "female"));
  const palm = buildHepanIndex(chartA, chartB, {
    yizhangjing: buildPalmPairSection(
      chartA,
      civilOf(1990, 6, 15, 10, 30),
      chartB,
      civilOf(2000, 12, 12, 18, 0),
    ),
  });
  assert.ok(
    buildPlainLanguage(palm, "zh-Hant").strengths.includes("有些在意的事，兩個人想得挺像。"),
  );

  // The demo pair shares no dao, so it earns no palm sentence.
  assert.doesNotMatch(plainText(buildPlainLanguage(demo, "zh-Hant")), /有些在意的事，兩個人想得挺像/);
});

test("plain language: reminder is contrast with conflicts, smooth with nothing to flag, steady otherwise", () => {
  const contrast = buildHepanIndex(makeChart("壬", "子", PART_A), makeChart("甲", "午", PART_B));
  assert.equal(contrast.conflicts.length, 1);
  assert.match(
    buildPlainLanguage(contrast, "zh-Hant").reminder,
    /卡住的那天，晚一點再談/,
  );

  const smooth = buildHepanIndex(makeChart("辛", "子", EVEN), makeChart("庚", "寅", EVEN));
  assert.equal(smooth.conflicts.length, 0);
  assert.deepEqual(buildPlainLanguage(smooth, "zh-Hant").patience, []);
  assert.match(buildPlainLanguage(smooth, "zh-Hant").reminder, /順的時候多/);

  const steady = buildHepanIndex(makeChart("辛", "子", EVEN), makeChart("甲", "寅", EVEN));
  assert.equal(steady.conflicts.length, 0);
  assert.equal(buildPlainLanguage(steady, "zh-Hant").patience.length, 1);
  assert.match(buildPlainLanguage(steady, "zh-Hant").reminder, /分開幾次說/);
});

test("plain language: strengths cap at 3, patience cap at 4, empty blocks stay honest", () => {
  const plain = buildPlainLanguage(fullDemoIndex(), "zh-Hant");
  assert.ok(plain.strengths.length <= 3);
  assert.ok(plain.patience.length <= 4);
  assert.ok(plain.strengths.length > 0);
  assert.ok(plain.patience.length > 0);

  const high = buildHepanIndex(makeChart("辛", "子", FULL_A), makeChart("壬", "丑", FULL_B));
  const highPlain = buildPlainLanguage(high, "zh-Hant");
  assert.equal(highPlain.strengths.length, 3);
  assert.deepEqual(highPlain.patience, []);

  const low = buildHepanIndex(makeChart("辛", "子", PART_A), makeChart("甲", "午", PART_B));
  const lowPlain = buildPlainLanguage(low, "zh-Hant");
  assert.deepEqual(lowPlain.strengths, []);
  assert.ok(lowPlain.patience.length > 0);
});

test("plain language: English output has no Chinese characters and no digits", () => {
  const plain = buildPlainLanguage(fullDemoIndex(), "en");
  const text = plainText(plain);
  assert.doesNotMatch(text, /[\u4e00-\u9fff]/);
  assert.doesNotMatch(text, /\d/);
  assert.match(plain.footer, /paid complete document/);
  assert.match(plain.headline, /fair amount comes easily/);
});
