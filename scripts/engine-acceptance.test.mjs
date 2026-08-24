import assert from "node:assert/strict";
import { test } from "node:test";

const { buildPalm } = await import("../src/lib/palm/engine.ts");
const { buildChart } = await import("../src/lib/bazi/chart.ts");
const { FEATURED_CITIES } = await import("../src/lib/bazi/cities.ts");
const { interpret, composeFullReport } = await import("../src/lib/bazi/interpret.ts");

const TAIPEI = FEATURED_CITIES[0];

function sample(over = {}) {
  return {
    question: "我想知道前世落在哪一道",
    year: 1988,
    month: 10,
    day: 4,
    hour: 3,
    minute: 30,
    timeUnknown: false,
    gender: "male",
    relation: "unset",
    city: TAIPEI,
    liveCity: null,
    ziPolicy: "midnight",
    useTrueSolar: false,
    ...over,
  };
}

test("1988-10-04 寅时男命：一掌经四宫 辰亥戌子", () => {
  const palm = buildPalm({
    year: 1988,
    month: 10,
    day: 4,
    hour: 3,
    timeUnknown: false,
    gender: "male",
  });
  assert.equal(palm.ready, true);
  assert.deepEqual(
    palm.palaces.map((p) => `${p.zhi}${p.star}${p.dao}`),
    ["辰天奸星修羅道", "亥天壽星仙道", "戌天藝星修羅道", "子天貴星佛道"],
  );
});

test("1988-10-04 必须是酉月，不是戌月", () => {
  const chart = buildChart(sample());
  assert.equal(chart.monthBranch, "酉");
});

test("gender=unspecified：一掌经整盘不判", () => {
  const palm = buildPalm({
    year: 1988,
    month: 10,
    day: 4,
    hour: 3,
    timeUnknown: false,
    gender: "unspecified",
  });
  assert.equal(palm.ready, false);
  assert.deepEqual(palm.palaces, []);
  assert.equal(palm.latest, null);
  assert.match(palm.firstSentence, /缺性別/);
});

test("timeUnknown=true：一掌经只排年月日，八字不伪造午时柱", () => {
  const input = sample({ timeUnknown: true, hour: 12, minute: 0, gender: "male" });
  const palm = buildPalm({
    year: input.year,
    month: input.month,
    day: input.day,
    hour: input.hour,
    timeUnknown: true,
    gender: "male",
  });
  const chart = buildChart(input);
  const time = chart.pillars.find((p) => p.key === "time");

  assert.equal(palm.ready, false);
  assert.equal(palm.latest, null);
  assert.deepEqual(palm.palaces.map((p) => p.key), ["year", "month", "day"]);
  assert.equal(time?.ready, false);
  assert.equal(time?.ganZhi, "未定");
  assert.notEqual(time?.zhi, "午");
  assert.equal(time?.gan, "");
  assert.equal(chart.minggong, "未定");
  assert.deepEqual(chart.dayun, []);
  assert.equal(chart.currentDayun, null);
  assert.match(chart.provenance, /不偽造午時柱/);
});

test("elementPercents 只作结构展示，但不得再伪造为全 0", () => {
  const chart = buildChart(sample());
  const values = Object.values(chart.elementPercents);
  assert.ok(values.some((value) => value > 0));
  const total = values.reduce((sum, value) => sum + value, 0);
  assert.ok(total >= 99.8 && total <= 100.2, `unexpected total ${total}`);
  assert.equal(chart.usefulProvisional, true);
});

test("流通粗候选不得派生颜色、方位、时段或宠物结论", () => {
  const question = "我适合什么颜色、方位和生活节奏？";
  const chart = buildChart(sample({ question }));
  const reading = interpret(question, chart, "unset", null);
  const report = composeFullReport(question, chart, reading, null);

  assert.equal(chart.usefulProvisional, true);
  assert.deepEqual(reading.guide.colors, []);
  assert.deepEqual(reading.guide.avoidColors, []);
  assert.deepEqual(reading.guide.directions.favor, []);
  assert.deepEqual(reading.guide.directions.rest, []);
  assert.deepEqual(reading.guide.hours.favor, []);
  assert.deepEqual(reading.guide.hours.drain, []);
  assert.equal(reading.guide.pet, "");
  assert.match(report, /正式取用尚未完成/);
  assert.doesNotMatch(report, /較有利顏色：/);
  assert.doesNotMatch(report, /較有利方位：/);
  assert.doesNotMatch(report, /寵物取象：/);
});