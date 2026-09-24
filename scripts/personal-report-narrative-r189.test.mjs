import assert from "node:assert/strict";
import { test } from "node:test";

const { buildChart } = await import("../src/lib/bazi/chart.ts");
const { FEATURED_CITIES } = await import("../src/lib/bazi/cities.ts");
const { interpret } = await import("../src/lib/bazi/interpret.ts");
const { buildPalm } = await import("../src/lib/palm/engine.ts");
const { finalizeReading } = await import("../src/lib/report/final-reading.ts");
const { composeFocusedReport, composeFocusedReportText } = await import("../src/lib/report/focused-report.ts");
const { buildPersonalReportNarrative } = await import("../src/lib/report/personal-narrative.ts");

const CITY = FEATURED_CITIES[0];

function makeResult(question, locale = "zh-Hant", over = {}) {
  const input = {
    question,
    year: 1988,
    month: 10,
    day: 4,
    hour: 3,
    minute: 30,
    timeUnknown: false,
    gender: "male",
    relation: "unset",
    city: CITY,
    liveCity: null,
    ziPolicy: "midnight",
    useTrueSolar: false,
    locale,
    ...over,
  };
  const chart = buildChart(input);
  const palm = buildPalm({ year: input.year, month: input.month, day: input.day, hour: input.hour, timeUnknown: input.timeUnknown, gender: input.gender });
  const reading = finalizeReading(question, chart, interpret(question, chart, input.relation, palm), locale);
  return { id: "r189", locale, question, chart, reading, createdAt: "2026-09-23T00:00:00.000Z", palm };
}

test("完整报告仍是两个保存区块，但 summary 内实际带入一次一盘一景", () => {
  const result = makeResult("我現在工作最大的問題是什麼？");
  const sections = composeFocusedReport(result);
  assert.deepEqual(sections.map((section) => section.key), ["summary", "body"]);
  assert.equal(sections.filter((section) => section.narrative).length, 1);
  assert.equal(sections[0].narrative.contractId, "ZW-PAID-ART-REPORT-2.0");
  assert.equal(sections[0].narrative.roles.length, 4);
  assert.ok(sections[0].narrative.evidence.length >= 3);
  const text = composeFocusedReportText(result);
  assert.match(text, /你的命局，收成一幅畫/);
  assert.match(text, /這股力量能做到/);
  assert.match(text, /同一股力量的代價/);
  assert.match(text, /依據/);
  assert.match(text, /不能反過來用圖像推格局、喜用或吉凶/);
  assert.doesNotMatch(text, /第\s*0?[1-9]\s*(頁|区|區)|九頁|十五頁/);
});

test("题名同时受整盘视觉方向与本题行动影响，不是固定干支物件表", () => {
  const career = buildPersonalReportNarrative(makeResult("我該怎麼安排下一步工作？"));
  const love = buildPersonalReportNarrative(makeResult("這段關係我該怎麼做？"));
  assert.notEqual(career.title, love.title);
  assert.match(career.evidence.map((item) => item.trace).join("\n"), /年、月、日三柱|日柱/);
  assert.match(love.evidence.map((item) => item.trace).join("\n"), /本題目標/);
});

test("未知时辰时未来出口主动降级，不补造时柱法器或晚景", () => {
  const result = makeResult("我明年應不應該換工作？", "zh-Hant", { timeUnknown: true, hour: 12, minute: 0 });
  const narrative = buildPersonalReportNarrative(result);
  const outlet = narrative.roles.find((role) => role.key === "outlet");
  assert.match(outlet.body, /時辰未定/);
  assert.match(outlet.body, /不補造固定法器或晚景結論/);
  assert.doesNotMatch(narrative.evidence.at(-1).trace, /時柱\s*[甲乙丙丁戊己庚辛壬癸]/);
});

test("English narrative remains plain English with no CJK leakage", () => {
  const result = makeResult("What should I prioritise in my work over the next six months?", "en");
  const narrative = buildPersonalReportNarrative(result);
  const text = composeFocusedReportText(result);
  assert.match(narrative.heading, /Scene/);
  assert.match(text, /Basis/);
  assert.match(text, /cannot be used to infer chart structure/i);
  assert.doesNotMatch(text, /[\u3400-\u9fff]/);
});
