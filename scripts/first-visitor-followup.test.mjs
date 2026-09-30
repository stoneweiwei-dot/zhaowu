import assert from "node:assert/strict";
import { test } from "node:test";
import { buildChart } from "../src/lib/bazi/chart.ts";
import { interpret } from "../src/lib/bazi/interpret.ts";
import { finalizeReading } from "../src/lib/report/final-reading.ts";
import { dateInTimeZone } from "../src/lib/local-day.ts";
import { dailyColorAlmanacRef } from "../src/lib/daily-colors.ts";
import { buildQuestionContract } from "../src/lib/report/decision-report-model.ts";

const city = { name: "Taipei", country: "Taiwan", display: "臺北，臺灣", latitude: 25.033, longitude: 121.5654, timezone: "Asia/Taipei" };
const liveCity = { name: "Sydney", country: "Australia", display: "雪梨，澳洲", latitude: -33.8688, longitude: 151.2093, timezone: "Australia/Sydney" };

test("English labelled A/B job question selects a named option with the same answer in the report", () => {
  const question = "A: new job with 20% higher pay, 30 minutes longer commute and more responsibility; B: stay in my current stable job with unchanged pay. Based on the chart, choose A or B.";
  const chart = buildChart({ question, year: 1990, month: 1, day: 15, hour: 8, minute: 30, timeUnknown: false, gender: "male", relation: "any", city, liveCity, ziPolicy: "midnight", useTrueSolar: true });
  const answer = finalizeReading(question, chart, interpret(question, chart), "en");
  assert.equal(answer.kind, "choice");
  assert.equal(buildQuestionContract(question, answer.kind, "en").answerMode, "comparison");
  assert.match(answer.directAnswer, /^Direct answer: lean towards [AB] \(/);
  assert.doesNotMatch(answer.directAnswer, /Choose the option whose worst-case cost/);
});

test("Sydney date rolls over at local midnight, keeping colour and almanac day aligned", () => {
  const before = dateInTimeZone(new Date("2026-09-30T13:59:30Z"), "Australia/Sydney");
  const after = dateInTimeZone(new Date("2026-09-30T14:00:30Z"), "Australia/Sydney");
  assert.equal(`${before.getDate()}/${before.getMonth() + 1}`, "30/9");
  assert.equal(`${after.getDate()}/${after.getMonth() + 1}`, "1/10");
  assert.equal(dailyColorAlmanacRef(after).date.getDate(), after.getDate());
});
