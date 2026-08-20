import assert from "node:assert/strict";
import { test } from "node:test";

const { buildChart } = await import("../src/lib/bazi/chart.ts");
const { FEATURED_CITIES } = await import("../src/lib/bazi/cities.ts");
const { interpret } = await import("../src/lib/bazi/interpret.ts");
const { applyAnswerContract } = await import("../src/lib/core/answer-contract.ts");
const { buildPalm } = await import("../src/lib/palm/engine.ts");
const { writeFullReport } = await import("../src/lib/actions.ts");

const CITY = FEATURED_CITIES[0];

function base(question) {
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
  };
  const chart = buildChart(input);
  const palm = buildPalm({ year: 1988, month: 10, day: 4, hour: 3, timeUnknown: false, gender: "male" });
  const reading = applyAnswerContract(question, chart, interpret(question, chart, "unset", palm));
  return { chart, reading, palm };
}

test("完整报告与九页卡片使用同一份新版答案", async () => {
  const question = "我什麼時候適合去度假，去哪裡最好？2027 是不是不適合我出行？";
  const { chart, reading, palm } = base(question);
  const out = await writeFullReport({ data: { question, chart, reading, palm } });
  assert.match(out.text, /昭梧｜付费九页报告|昭梧｜付費九頁報告/);
  assert.match(out.text, /2027/);
  assert.match(out.text, /較順的窗口/);
  assert.match(out.text, /排序依據/);
  assert.doesNotMatch(out.text, /还必须补算|還必須補算|当前这份结果只带有|當前這份結果只帶有/);
});

test("完整报告不会恢复旧的固定人格课题模板", async () => {
  const question = "我現在工作最大的問題是什麼？";
  const { chart, reading, palm } = base(question);
  const out = await writeFullReport({ data: { question, chart, reading, palm } });
  assert.match(out.text, /本題主軸|主课题|主課題|工作/);
  assert.doesNotMatch(out.text, /關係裡和工作裡，能控制的事會被你抓得太久|关系里和工作里，能控制的事会被你抓得太久/);
});
