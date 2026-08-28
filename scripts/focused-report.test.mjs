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

test("完整报告固定收口为总体概括 + 身体注意两块", () => {
  const result = makeResult("我現在工作最大的問題是什麼？");
  const sections = composeFocusedReport(result);
  assert.deepEqual(sections.map((item) => item.key), ["summary", "body"]);
  assert.equal(sections[0].title, "总体概括");
  assert.equal(sections[1].title, "身体需要注意");
  const summary = section(result, "summary").body.join("\n");
  assert.ok(summary.includes(result.reading.work));
  assert.ok(!summary.includes(result.reading.love));
  assert.ok(!summary.includes(result.reading.money));
});

test("感情题不再新增第三、第四个 session，关系内容并回总体概括", () => {
  const result = makeResult("我感情裡最容易重複什麼問題？", "same");
  const sections = composeFocusedReport(result);
  assert.equal(sections.length, 2);
  assert.match(section(result, "summary").body.join("\n"), /持续联系|持續聯繫|见面|見面|关系|關係/);
});

test("多主题题仍只回答用户真的问到的主题，但放在同一份总体概括里", () => {
  const result = makeResult("我工作最大的問題和財務最大的問題分別是什麼？");
  const summary = section(result, "summary").body.join("\n");
  assert.match(summary, /工作｜/);
  assert.match(summary, /财务｜|財務｜/);
  assert.doesNotMatch(summary, /关系｜|關係｜/);
});

test("旅行题保留城市、窗口和执行顺序，但不拆成多个 session", () => {
  const result = makeResult("我什麼時候適合去度假，去哪裡最好？2027 是不是不適合我出行？");
  const sections = composeFocusedReport(result);
  assert.equal(sections.length, 2);
  const summary = section(result, "summary").body.join("\n");
  assert.match(summary, /2027/);
  assert.match(summary, /沖繩|京都|東京|雪梨|台南|清邁|杭州|墾丁|新加坡|首爾|釜山|奈良|西安|峇里|維也納|黃金海岸/);
  assert.match(summary, /执行顺序|執行順序|先定/);
});

test("未知时辰的限制留在总体概括，不伪造时柱和运限", () => {
  const result = makeResult("明年什麼時候適合換工作？", "unset", { timeUnknown: true, hour: 12, minute: 0 });
  const summary = section(result, "summary").body.join("\n");
  assert.match(summary, /出生时间未确定|出生時間未確定/);
  assert.match(summary, /不把时柱与大运起运当作硬结论依据|不把時柱與大運起運當作硬結論依據/);
});

test("身体注意栏使用地支部位、季令和对冲轴，并明确不是诊断", () => {
  const result = makeResult("我何時適合換工作？");
  const body = section(result, "body").body.join("\n");
  assert.match(body, /优先观察|優先觀察/);
  assert.match(body, /季令加权|季令加權/);
  assert.match(body, /传统象义身体地图|傳統象義身體地圖/);
  assert.match(body, /不是体检或诊断|不是體檢或診斷/);
});

test("完整报告不再出现固定九页或 01 02 03 式章节文案", () => {
  const result = makeResult("我何時適合換工作？");
  const report = composeFocusedReportText(result);
  assert.match(report, /昭梧｜专属完整报告/);
  assert.doesNotMatch(report, /九页|九頁|ZW-NINE|第\s*0?[1-9]\s*(区|區|页|頁)/);
  assert.equal(composeFocusedReport(result).length, 2);
});

test("直接答案在结构化报告中只出现一次", () => {
  const result = makeResult("我何時適合換工作？");
  const sections = composeFocusedReport(result);
  const exact = sections.flatMap((item) => item.body).filter((line) => line === result.reading.directAnswer);
  assert.ok(exact.length <= 1);
  assert.equal(sections[0].key, "summary");
});

test("English report stays plain-language and also uses only summary + body", () => {
  const question = "What should I prioritise in my work over the next six months?";
  const result = makeResult(question);
  result.locale = "en";
  result.reading = finalizeReading(question, result.chart, result.reading, "en");
  const report = composeFocusedReportText(result);
  const sections = composeFocusedReport(result);
  assert.deepEqual(sections.map((item) => item.title), ["Overall summary", "Body areas to watch"]);
  assert.match(report, /Zhaowu \| Personal full report/);
  assert.doesNotMatch(report, /Day Master|Month Command|Ten-year cycle|BaZi/i);
  assert.doesNotMatch(report, /[\u3400-\u9fff]/);
});
