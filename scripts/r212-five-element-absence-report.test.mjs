import assert from "node:assert/strict";
import { test } from "node:test";

const { buildChart } = await import("../src/lib/bazi/chart.ts");
const { FEATURED_CITIES } = await import("../src/lib/bazi/cities.ts");
const { buildOwnerCognitionReportLines } = await import("../src/lib/report/owner-cognition-lines.ts");
const { composeFocusedReportText } = await import("../src/lib/report/focused-report.ts");
const { interpret } = await import("../src/lib/bazi/interpret.ts");
const { applyAnswerContract } = await import("../src/lib/core/answer-contract.ts");
const { buildPalm } = await import("../src/lib/palm/engine.ts");
const { finalizeReading } = await import("../src/lib/report/final-reading.ts");

function result(locale = "zh-Hant") {
  const input = {
    question: "分析我的命局核心結構",
    year: 1988,
    month: 10,
    day: 4,
    hour: 4,
    minute: 40,
    timeUnknown: false,
    gender: "male",
    relation: "unset",
    city: FEATURED_CITIES[0],
    liveCity: null,
    ziPolicy: "midnight",
    useTrueSolar: false,
    locale,
  };
  const chart = buildChart(input);
  const palm = buildPalm({ year: input.year, month: input.month, day: input.day, hour: input.hour, timeUnknown: false, gender: input.gender });
  const rawReading = applyAnswerContract(input.question, chart, interpret(input.question, chart, "unset", palm));
  const reading = finalizeReading(input.question, chart, rawReading, locale);
  return { id: "r212", locale, question: input.question, chart, reading, createdAt: "2026-09-28T00:00:00+10:00", palm };
}

test("r212 report cognition lines include functional lens, bounded stem shorthand and four-storehouse note", () => {
  const lines = buildOwnerCognitionReportLines(result().chart, "zh-Hant");
  assert.match(lines.join("\n"), /五行功能/);
  assert.match(lines.join("\n"), /天干一面/);
  assert.match(lines.join("\n"), /四庫提示/);
  assert.match(lines.join("\n"), /庫不等於財庫/);
  assert.match(lines.join("\n"), /不是人格定論/);
});

test("r212 full report text actually carries the new cognition lines", () => {
  const text = composeFocusedReportText(result());
  assert.match(text, /五行功能/);
  assert.match(text, /天干一面/);
  assert.match(text, /四庫提示/);
});

test("r212 English report stays English-only", () => {
  const text = composeFocusedReportText(result("en"));
  assert.match(text, /Five-element function/);
  assert.match(text, /Stem shorthand/);
  assert.match(text, /Storehouse note/);
  assert.doesNotMatch(text, /[\u3400-\u9fff]/);
});


test("r212 uses only published EP01 wood / EP02 fire absence logic", () => {
  const chart = structuredClone(result().chart);
  const lines = buildOwnerCognitionReportLines(chart, "zh-Hant").join("\n");
  assert.match(lines, /缺象觀察｜EP02 火/);
  assert.doesNotMatch(lines, /缺象觀察｜EP01 木/);

  const noWood = structuredClone(chart);
  noWood.pillars = noWood.pillars.map((pillar) =>
    pillar.key === "time" ? { ...pillar, zhi: "申", ganZhi: pillar.gan + "申" } : pillar
  );
  const noWoodLines = buildOwnerCognitionReportLines(noWood, "zh-Hant").join("\n");
  assert.match(noWoodLines, /缺象觀察｜EP01 木/);
  assert.match(noWoodLines, /缺象觀察｜EP02 火/);
});

test("r212 does not assert a full-chart absence when birth time is unknown", () => {
  const chart = structuredClone(result().chart);
  chart.timeUnknown = true;
  chart.pillars = chart.pillars.map((pillar) =>
    pillar.key === "time" ? { ...pillar, ready: false, gan: "", zhi: "", ganZhi: "未定" } : pillar
  );
  const lines = buildOwnerCognitionReportLines(chart, "zh-Hant").join("\n");
  assert.doesNotMatch(lines, /缺象觀察｜EP0[12]/);
});

test("r212 does not invent unpublished Earth Metal Water episodes", () => {
  const lines = buildOwnerCognitionReportLines(result().chart, "zh-Hant").join("\n");
  assert.doesNotMatch(lines, /EP0[345]/);
  assert.doesNotMatch(lines, /缺象觀察｜(?:土|金|水)/);
});
