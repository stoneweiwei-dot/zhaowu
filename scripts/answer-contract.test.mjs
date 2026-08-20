import assert from "node:assert/strict";
import { test } from "node:test";

const { buildChart } = await import("../src/lib/bazi/chart.ts");
const { FEATURED_CITIES } = await import("../src/lib/bazi/cities.ts");
const { interpret, classifyQuestion } = await import("../src/lib/bazi/interpret.ts");
const { applyAnswerContract, inspectAnswerRequirements } = await import("../src/lib/core/answer-contract.ts");
const { buildPalm } = await import("../src/lib/palm/engine.ts");

const CITY = FEATURED_CITIES[0];

function input(question) {
  return {
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
}

function contracted(question, relation = "unset") {
  const raw = input(question);
  const chart = buildChart(raw);
  const palm = buildPalm({
    year: raw.year,
    month: raw.month,
    day: raw.day,
    hour: raw.hour,
    timeUnknown: raw.timeUnknown,
    gender: raw.gender,
  });
  return {
    chart,
    reading: applyAnswerContract(question, chart, interpret(question, chart, relation, palm)),
  };
}

test("旅行＋2027＋去哪裡：不得拿目前窗口或人格句冒充答案", () => {
  const q = "我什麼時候適合去度假，去哪裡最好？2027 是不是不適合我出行？";
  const req = inspectAnswerRequirements(q);
  const { reading } = contracted(q);
  assert.equal(req.asksTravel, true);
  assert.equal(req.asksWhen, true);
  assert.equal(req.asksWhere, true);
  assert.deepEqual(req.targetYears, [2027]);
  assert.match(reading.directAnswer, /2027/);
  assert.match(reading.directAnswer, /流年／流月作用鏈/);
  assert.match(reading.directAnswer, /目的地比較模組/);
  assert.doesNotMatch(reading.directAnswer, /窗口已經在眼前/);
  assert.doesNotMatch(reading.action, /固定同一時間睡覺/);
});

test("感情時間題：分類即使是 love，也必須先承認沒有月級應期", () => {
  const q = "我什麼時候遇到適合長期交往的人？";
  assert.equal(classifyQuestion(q), "love");
  const { reading } = contracted(q, "same");
  assert.match(reading.directAnswer, /流年／流月作用鏈/);
  assert.match(reading.directAnswer, /不能負責任地給出具體月份/);
});

test("工作時間題：不能用職能模板代替『何時』", () => {
  const q = "我何時適合換工作？";
  assert.equal(classifyQuestion(q), "career");
  const { reading } = contracted(q);
  assert.match(reading.directAnswer, /要真正回答時間/);
  assert.doesNotMatch(reading.directAnswer, /三十天內只交一件/);
});

test("健康恢復時間題：不得給保證式日期，必須守醫療邊界", () => {
  const q = "我的手痛大概什麼時候會恢復？";
  const { reading } = contracted(q);
  assert.match(reading.directAnswer, /不能由命盤替代醫療判斷/);
  assert.match(reading.directAnswer, /不能給保證式日期/);
  assert.match(reading.action, /就醫|醫生|医疗|醫療/);
});

test("家宅地點題：沒有平面圖／坐向／正式取用，不得說哪裡最好", () => {
  const q = "我住哪個方向、哪個城市最好？";
  const { chart, reading } = contracted(q);
  assert.equal(chart.usefulProvisional, true);
  assert.match(reading.directAnswer, /不能單獨回答/);
  assert.match(reading.directAnswer, /正式取用尚未完成/);
});

test("投資標的題：不得用命盤指定股票或買賣點", () => {
  const q = "我今年買哪一檔股票最好？";
  const { reading } = contracted(q);
  assert.match(reading.directAnswer, /不能負責任地替你指定/);
  assert.match(reading.directAnswer, /收益保證/);
});

test("普通二選一仍保留真正選邊，不被過度攔截", () => {
  const q = "我應該留在現在的工作，還是換到新公司？";
  const { reading } = contracted(q);
  assert.match(reading.directAnswer, /選|选/);
  assert.doesNotMatch(reading.directAnswer, /目的地比較模組/);
});

test("前世題保留一掌經已排結果，不被通用契約覆蓋", () => {
  const q = "我前世落在哪一道？";
  const { reading } = contracted(q);
  assert.match(reading.directAnswer, /(佛道|仙道|人道|修羅道|鬼道|畜生道)/);
});

test("一般自我題可以正常回答，但行動不再一律套睡眠模板", () => {
  const q = "我最大的性格盲點是什麼？";
  const { reading } = contracted(q);
  assert.ok(reading.directAnswer.length > 20);
  assert.match(reading.action, /真實事件|核對/);
  assert.doesNotMatch(reading.action, /固定同一時間睡覺/);
});
