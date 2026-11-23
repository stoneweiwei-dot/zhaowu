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
  // Numerology has no single-person data at all: it stays out of hepan,
  // and its reason no longer promises a future instruction either.
  assert.match(HEPAN_PENDING_REASONS.numerology, /先不進合盤/);
  assert.doesNotMatch(HEPAN_PENDING_REASONS.numerology, /才會加入/);
  for (const id of ["western", "vedic", "palm"]) {
    assert.doesNotMatch(HEPAN_PENDING_REASONS[id], /才會加入/);
  }
});
