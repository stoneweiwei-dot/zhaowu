import assert from "node:assert/strict";
import { test } from "node:test";

const { buildChart } = await import("../src/lib/bazi/chart.ts");
const { FEATURED_CITIES } = await import("../src/lib/bazi/cities.ts");
const { interpret, classifyQuestion } = await import("../src/lib/bazi/interpret.ts");
const { applyAnswerContract, inferQuestionKind } = await import("../src/lib/core/answer-contract.ts");
const { buildPalm } = await import("../src/lib/palm/engine.ts");
const { composeFocusedReport, composeFocusedReportText } = await import("../src/lib/report/focused-report.ts");
const { finalizeReading } = await import("../src/lib/report/final-reading.ts");

const CITY = FEATURED_CITIES[0];

function makeResult(question, relation = "unset", over = {}) {
  const input = {
    question,
    year: 1988,
    month: 10,
    day: 4,
    hour: 3,
    minute: 30,
    timeUnknown: false,
    gender: "male",
    relation,
    city: CITY,
    liveCity: null,
    ziPolicy: "midnight",
    useTrueSolar: false,
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
  const reading = applyAnswerContract(question, chart, interpret(question, chart, relation, palm));
  reading.kind = inferQuestionKind(question, classifyQuestion(question));
  return { id: "qa-focused-report", question, chart, reading, createdAt: "2026-08-24T00:00:00.000Z", palm };
}

function section(result, key) {
  return composeFocusedReport(result).find((item) => item.key === key);
}

test("简明报告固定三段式：核心直断 + 近期建议 + 核心依据", () => {
  const result = makeResult("我現在工作最大的問題是什麼？");
  const sections = composeFocusedReport(result);
  assert.deepEqual(sections.map((item) => item.key), ["summary", "action", "basis"]);
  assert.equal(sections[0].title, "核心直斷");
  assert.equal(sections[1].title, "近期建議");
  assert.equal(sections[2].title, "核心依據");
  const summary = section(result, "summary").body.join("\n");
  assert.ok(summary.includes(result.reading.work));
  assert.ok(!summary.includes(result.reading.love));
  assert.ok(!summary.includes(result.reading.money));
});

test("感情题内容回到核心直断，保持三段式结构", () => {
  const result = makeResult("我感情裡最容易重複什麼問題？", "same");
  const sections = composeFocusedReport(result);
  assert.equal(sections.length, 3);
  assert.match(section(result, "summary").body.join("\n"), /持续联系|持續聯繫|见面|見面|关系|關係/);
});

test("多主题题仍只回答用户真的问到的主题，但放在同一份核心直断里", () => {
  const result = makeResult("我工作最大的問題和財務最大的問題分別是什麼？");
  const summary = section(result, "summary").body.join("\n");
  assert.match(summary, /工作｜|工作/);
  assert.match(summary, /财务｜|財務｜/);
  assert.doesNotMatch(summary, /关系｜|關係｜/);
});

test("旅行题保留城市、窗口和执行顺序，仍为三段式报告", () => {
  const result = makeResult("我什麼時候適合去度假，去哪裡最好？2027 是不是不適合我出行？");
  const sections = composeFocusedReport(result);
  assert.equal(sections.length, 3);
  const summary = section(result, "summary").body.join("\n");
  assert.match(summary, /2027/);
  assert.match(summary, /沖繩|京都|東京|雪梨|台南|清邁|杭州|墾丁|新加坡|首爾|釜山|奈良|西安|峇里|維也納|黃金海岸/);
  const action = section(result, "action").body.join("\n");
  assert.match(action, /先定|執行順序|Confirm/);
});

test("未知时辰的限制显示在核心依据，不伪造时柱和运限", () => {
  const result = makeResult("明年什麼時候適合換工作？", "unset", { timeUnknown: true, hour: 12, minute: 0 });
  const basis = section(result, "basis").body.join("\n");
  assert.match(basis, /出生时间未确定|出生時間未確定/);
  assert.match(basis, /降级|參考/);
});

test("近期建议包含行动指南和时间上下文", () => {
  const result = makeResult("我何時適合換工作？");
  const action = section(result, "action").body.join("\n");
  assert.ok(action.length > 0);
  assert.match(action, /十年|大運|週期|cycle|career|职位|職位/i);
});

test("简明报告标题为昭梧｜专属简明报告，不再出现九页或分区文案", () => {
  const result = makeResult("我何時適合換工作？");
  const report = composeFocusedReportText(result);
  assert.match(report, /昭梧｜専屬簡明報告|昭梧｜专属简明报告/);
  assert.doesNotMatch(report, /九页|九頁|ZW-NINE|第\s*0?[1-9]\s*(区|區|页|頁)/);
  assert.equal(composeFocusedReport(result).length, 3);
});

test("直接答案在三段式报告的第一段中只出现一次", () => {
  const result = makeResult("我何時適合換工作？");
  const sections = composeFocusedReport(result);
  const exact = sections.flatMap((item) => item.body).filter((line) => line === result.reading.directAnswer);
  assert.ok(exact.length <= 1);
  assert.equal(sections[0].key, "summary");
  assert.ok(sections[0].body.length > 0);
});

test("English report stays plain-language and uses three-section structure", () => {
  const question = "What should I prioritise in my work over the next six months?";
  const result = makeResult(question);
  result.locale = "en";
  result.reading = finalizeReading(question, result.chart, result.reading, "en");
  const report = composeFocusedReportText(result);
  const sections = composeFocusedReport(result);
  assert.deepEqual(sections.map((item) => item.key), ["summary", "action", "basis"]);
  assert.deepEqual(sections.map((item) => item.title), ["Core insight", "Next steps", "Foundation"]);
  assert.match(report, /Zhaowu \| Personal insight report/);
  assert.doesNotMatch(report, /[\u3400-\u9fff]/);
});
