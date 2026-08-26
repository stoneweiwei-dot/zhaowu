import assert from "node:assert/strict";
import { test } from "node:test";

const { buildChart } = await import("../src/lib/bazi/chart.ts");
const { FEATURED_CITIES } = await import("../src/lib/bazi/cities.ts");
const { interpret } = await import("../src/lib/bazi/interpret.ts");
const { buildPalm } = await import("../src/lib/palm/engine.ts");
const { finalizeReading } = await import("../src/lib/report/final-reading.ts");
const { writeFullReport } = await import("../src/lib/actions.ts");

const TECHNICAL = /\b(?:bazi|four pillars?|day master|month command|month branch|heavenly stems?|earthly branches?|ten[- ]year cycle|luck pillar|useful god|favourable element|favorable element|seven killings?|direct resource|indirect resource|output star|wealth star|companion star)\b/i;

function englishCase(question) {
  const input = {
    question,
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
    locale: "en",
  };
  const chart = buildChart(input);
  const palm = buildPalm({ year: input.year, month: input.month, day: input.day, hour: input.hour, timeUnknown: false, gender: "male" });
  const reading = finalizeReading(question, chart, interpret(question, chart, "unset", palm), "en");
  return { chart, palm, reading };
}

test("English full report is independently written in ordinary language", async () => {
  const question = "Should I change jobs this year, and when would be the better time?";
  const { chart, palm, reading } = englishCase(question);
  const out = await writeFullReport({ data: { question, chart, reading, palm, locale: "en" } });

  assert.match(out.text, /^ZHAOWU \| Personal report/);
  assert.match(out.text, /Bottom line/);
  assert.match(out.text, /What matters for work/);
  assert.match(out.text, /What to do next/);
  assert.doesNotMatch(out.text, /Chart basis/);
  assert.doesNotMatch(out.text, TECHNICAL);
});

test("English non-timing report does not invent an unnecessary timing section", async () => {
  const question = "What should I focus on at work right now?";
  const { chart, palm, reading } = englishCase(question);
  const out = await writeFullReport({ data: { question, chart, reading, palm, locale: "en" } });

  assert.match(out.text, /Bottom line/);
  assert.doesNotMatch(out.text, /\nTiming\n/);
  assert.doesNotMatch(out.text, TECHNICAL);
});
