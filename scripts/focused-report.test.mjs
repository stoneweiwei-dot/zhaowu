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
  const reading = applyAnswerContract(
    question,
    chart,
    interpret(question, chart, relation, palm),
  );
  reading.kind = inferQuestionKind(question, classifyQuestion(question));
  return {
    id: "qa-focused-report",
    question,
    chart,
    reading,
    createdAt: "2026-08-24T00:00:00.000Z",
    palm,
  };
}

function section(result, key) {
  return composeFocusedReport(result).find((item) => item.key === key);
}

test("职业题只生成四个核心区，不为凑数量塞感情和财务", () => {
  const result = makeResult("我現在工作最大的問題是什麼？");
  const sections = composeFocusedReport(result);
  assert.deepEqual(sections.map((item) => item.key), ["conclusion", "basis", "timing", "action"]);
  const text = sections.flatMap((item) => item.body).join("\n");
  assert.ok(text.includes(result.reading.work));
  assert.ok(!text.includes(result.reading.love));
  assert.ok(!text.includes(result.reading.money));
});

test("感情题才追加关系条件区", () => {
  const result = makeResult("我感情裡最容易重複什麼問題？", "same");
  const sections = composeFocusedReport(result);
  assert.deepEqual(sections.map((item) => item.key), ["conclusion", "basis", "timing", "action", "relationship"]);
  assert.match(section(result, "relationship").body.join("\n"), /持续联系|持續聯繫|见面|見面|关系|關係/);
  const all = sections.flatMap((item) => item.body).join("\n");
  assert.ok(!all.includes(result.reading.work));
  assert.ok(!all.includes(result.reading.money));
});

test("多主题题只在命理依据区分开用户真的问到的主题", () => {
  const result = makeResult("我工作最大的問題和財務最大的問題分別是什麼？");
  const basis = section(result, "basis").body.join("\n");
  assert.match(basis, /工作｜/);
  assert.match(basis, /财务｜|財務｜/);
  assert.doesNotMatch(basis, /关系｜|關係｜/);
});

test("旅行题保留城市、窗口和执行顺序，但仍只有四个核心区", () => {
  const result = makeResult("我什麼時候適合去度假，去哪裡最好？2027 是不是不適合我出行？");
  const sections = composeFocusedReport(result);
  assert.equal(sections.length, 4);
  const text = sections.flatMap((item) => item.body).join("\n");
  assert.match(text, /2027/);
  assert.match(text, /沖繩|京都|東京|雪梨|台南|清邁|杭州|墾丁|新加坡|首爾|釜山|奈良|西安|峇里|維也納|黃金海岸/);
  assert.match(section(result, "action").body.join("\n"), /执行顺序|執行順序|先定/);
});

test("未知时辰只在依据区说明限制，不伪造时柱与大运", () => {
  const result = makeResult("明年什麼時候適合換工作？", "unset", {
    timeUnknown: true,
    hour: 12,
    minute: 0,
  });
  const basis = section(result, "basis").body.join("\n");
  assert.match(basis, /出生时间未确定|出生時間未確定/);
  assert.match(basis, /不把时柱与大运起运当作硬结论依据|不把時柱與大運起運當作硬結論依據/);
});

test("完整报告不再出现固定九页产品文案或内部验收状态", () => {
  const result = makeResult("我何時適合換工作？");
  const report = composeFocusedReportText(result);
  assert.match(report, /昭梧｜专属完整报告/);
  assert.doesNotMatch(report, /九页|九頁|第 9 页|第 9 頁|ZW-NINE|資料未接入|资料未接入|内部验收|內部驗收/);
  assert.equal(composeFocusedReport(result).length, 4);
});

test("直接答案在结构化报告中只出现一次", () => {
  const result = makeResult("我何時適合換工作？");
  const sections = composeFocusedReport(result);
  const exact = sections.flatMap((item) => item.body).filter((line) => line === result.reading.directAnswer);
  assert.equal(exact.length, 1);
  assert.equal(sections[0].key, "conclusion");
  assert.equal(sections[0].title, "直接结论");
});


test("English UI keeps the direct answer and full report in English", () => {
  const question = "What should I prioritise in my work over the next six months?";
  const result = makeResult(question);
  result.locale = "en";
  result.reading = finalizeReading(question, result.chart, result.reading, "en");

  const report = composeFocusedReportText(result);
  const sections = composeFocusedReport(result);
  assert.equal(result.reading.kind, "career");
  assert.match(result.reading.directAnswer, /Prioritize one clearly owned workstream/i);
  assert.deepEqual(
    sections.map((item) => item.title),
    ["Direct conclusion", "Chart basis", "Timing and rhythm", "Practical action"],
  );
  assert.match(report, /Zhaowu \| Personal full report/);
  assert.doesNotMatch(report, /[\u3400-\u9fff]/);
});
