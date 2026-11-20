import assert from "node:assert/strict";
import { test } from "node:test";

const { buildChart } = await import("../src/lib/bazi/chart.ts");
const { FEATURED_CITIES } = await import("../src/lib/bazi/cities.ts");
const { interpret } = await import("../src/lib/bazi/interpret.ts");
const { buildPalm } = await import("../src/lib/palm/engine.ts");
const { buildFreeDirectAnswer, finalizeReading } = await import("../src/lib/report/final-reading.ts");

const SYDNEY = FEATURED_CITIES.find((city) => city.timezone === "Australia/Sydney") ?? {
  name: "Sydney",
  country: "Australia",
  display: "Sydney, Australia",
  latitude: -33.8688,
  longitude: 151.2093,
  timezone: "Australia/Sydney",
};
const TECHNICAL_EN = /BaZi|Day Master|Month Command|Ten Gods|Heavenly Stem|Earthly Branch|luck cycle|five elements|chart context/i;
const TECHNICAL_ZH = /命盤|命盘|命理|八字|四柱|天干|地支|藏干|日主|月令|旺衰|身強|身强|身弱|喜用神|用神|格局|十神|大運|大运|流年|干支|扶泄|制化|調候|调候|病藥|病药|刑沖|刑冲|合害/;

function freeAnswer(question, locale, over = {}) {
  const input = {
    question,
    locale,
    year: 1990,
    month: 5,
    day: 10,
    hour: 10,
    minute: 30,
    timeUnknown: false,
    gender: "male",
    relation: "any",
    city: SYDNEY,
    liveCity: SYDNEY,
    ziPolicy: "midnight",
    useTrueSolar: true,
    ...over,
  };
  const chart = buildChart(input);
  const palm = buildPalm({
    year: input.year,
    month: input.month,
    day: input.day,
    hour: input.hour,
    timeUnknown: input.timeUnknown,
    gender: input.gender,
  });
  const final = finalizeReading(question, chart, interpret(question, chart, input.relation, palm), locale);
  return buildFreeDirectAnswer(question, chart, final, locale);
}

test("Australian English free answer is simple, natural and jargon-free", () => {
  const out = freeAnswer("What should I focus on at work this year?", "en");
  assert.match(out, /^Prioritise one main work goal this year\./);
  assert.match(out, /workload is realistic/i);
  assert.doesNotMatch(out, TECHNICAL_EN);
  assert.doesNotMatch(out, /[\u3400-\u9fff]/);
});

test("Australian job-change wording uses locally meaningful employment checks", () => {
  const out = freeAnswer("Should I change jobs for a new offer?", "en");
  assert.match(out, /base pay, super, leave, hours and commute/i);
  assert.doesNotMatch(out, TECHNICAL_EN);
});

test("Traditional and Simplified Chinese free answers use plain daily language", () => {
  const hant = freeAnswer("工作最該做什麼？", "zh-Hant");
  const hans = freeAnswer("工作最该做什么？", "zh-Hans");
  assert.match(hant, /一個最重要、能完成的工作目標/);
  assert.match(hans, /一个最重要、能完成的工作目标/);
  assert.doesNotMatch(hant, TECHNICAL_ZH);
  assert.doesNotMatch(hans, TECHNICAL_ZH);
});

test("Chinese timing answer keeps useful months but removes technical labels", () => {
  const out = freeAnswer("明年什麼時候適合換工作？", "zh-Hant");
  const hans = freeAnswer("明年什么时候适合换工作？", "zh-Hans");
  assert.match(out, /\d{4}/);
  assert.match(out, /\d{1,2}月/);
  assert.doesNotMatch(out, TECHNICAL_ZH);
  assert.doesNotMatch(out, /[甲乙丙丁戊己庚辛壬癸][子丑寅卯辰巳午未申酉戌亥]/);
  assert.match(hans, /较顺的窗口/);
  assert.doesNotMatch(hans, /整體|推進|較順|這些|行動|先後|保證/);
});
