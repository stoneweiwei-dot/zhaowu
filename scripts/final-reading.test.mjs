import assert from "node:assert/strict";
import { test } from "node:test";

const { buildChart } = await import("../src/lib/bazi/chart.ts");
const { FEATURED_CITIES } = await import("../src/lib/bazi/cities.ts");
const { interpret } = await import("../src/lib/bazi/interpret.ts");
const { buildPalm } = await import("../src/lib/palm/engine.ts");
const { finalizeReading } = await import("../src/lib/report/final-reading.ts");
const { composeNinePages } = await import("../src/lib/report/nine-page.ts");

const CITY = FEATURED_CITIES[0];

function result(question) {
  const input = {
    question,
    year: 1988,
    month: 10,
    day: 4,
    hour: 4,
    minute: 40,
    timeUnknown: false,
    gender: "male",
    relation: "same",
    city: CITY,
    liveCity: null,
    ziPolicy: "midnight",
    useTrueSolar: false,
  };
  const chart = buildChart(input);
  const palm = buildPalm({ year: 1988, month: 10, day: 4, hour: 4, timeUnknown: false, gender: "male" });
  const reading = finalizeReading(question, chart, interpret(question, chart, "same", palm));
  return { id: "test", question, chart, reading, createdAt: new Date().toISOString(), palm };
}

test("个人命诰引用月令、日支、旺衰而不是只按日主套话", () => {
  const out = result("我现在最该怎么安排事业？");
  const dayZhi = out.chart.pillars.find((p) => p.key === "day")?.zhi;
  assert.ok(out.reading.decree.includes(`${out.chart.monthBranch}月令`));
  assert.ok(out.reading.decree.includes(`日支${dayZhi}`));
  assert.ok(out.reading.decree.includes(out.chart.strength.tendency));
  assert.doesNotMatch(out.reading.decree, /^留住.+的本色，但不要讓它變成凡事由你硬扛/);
});

test("九页第5页使用同一份 final reading 的命诰", () => {
  const out = result("我现在最该怎么安排事业？");
  const pages = composeNinePages(out);
  const decreePage = pages.find((p) => p.key === "decree");
  assert.ok(decreePage);
  assert.equal(decreePage.body[0], out.reading.decree);
});
