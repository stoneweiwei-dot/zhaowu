import assert from "node:assert/strict";
import { test } from "node:test";

const { buildChart } = await import("../src/lib/bazi/chart.ts");
const { FEATURED_CITIES } = await import("../src/lib/bazi/cities.ts");
const { buildOwnerCognitionReportLines } = await import("../src/lib/report/owner-cognition-lines.ts");
const { composeFocusedReportText } = await import("../src/lib/report/focused-report.ts");
const { interpret } = await import("../src/lib/bazi/interpret.ts");
const { applyAnswerContract } = await import("../src/lib/core/answer-contract.ts");
const { buildPalm } = await import("../src/lib/palm/engine.ts");

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
  const reading = applyAnswerContract(input.question, chart, interpret(input.question, chart, "unset", palm));
  return { id: "r210", locale, question: input.question, chart, reading, createdAt: "2026-09-28T00:00:00+10:00", palm };
}

test("r210 report cognition lines include functional lens, bounded stem shorthand and four-storehouse note", () => {
  const lines = buildOwnerCognitionReportLines(result().chart, "zh-Hant");
  assert.match(lines.join("\n"), /五行功能/);
  assert.match(lines.join("\n"), /天干一面/);
  assert.match(lines.join("\n"), /四庫提示/);
  assert.match(lines.join("\n"), /庫不等於財庫/);
  assert.match(lines.join("\n"), /不是人格定論/);
});

test("r210 full report text actually carries the new cognition lines", () => {
  const text = composeFocusedReportText(result());
  assert.match(text, /五行功能/);
  assert.match(text, /天干一面/);
  assert.match(text, /四庫提示/);
});

test("r210 English report stays English-only", () => {
  const text = composeFocusedReportText(result("en"));
  assert.match(text, /Five-element function/);
  assert.match(text, /Stem shorthand/);
  assert.match(text, /Storehouse note/);
  assert.doesNotMatch(text, /[\u3400-\u9fff]/);
});
