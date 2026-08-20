import assert from "node:assert/strict";
import { test } from "node:test";

const { buildChart } = await import("../src/lib/bazi/chart.ts");
const { FEATURED_CITIES } = await import("../src/lib/bazi/cities.ts");
const { interpret, classifyQuestion } = await import("../src/lib/bazi/interpret.ts");
const { applyAnswerContract, inspectAnswerRequirements, inferQuestionKind } = await import("../src/lib/core/answer-contract.ts");
const { analyzeForecastYear } = await import("../src/lib/bazi/forecast.ts");
const { buildPalm } = await import("../src/lib/palm/engine.ts");

const CITY = FEATURED_CITIES[0];

function input(question, over = {}) {
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
    ...over,
  };
}

function contracted(question, relation = "unset", over = {}) {
  const raw = input(question, over);
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

test("target-year forecast actually computes 12 monthly periods", () => {
  const chart = buildChart(input("2027 旅行"));
  const f = analyzeForecastYear(chart, 2027, "travel");
  assert.equal(f.year, 2027);
  assert.equal(f.months.length, 12);
  assert.equal(f.best.length, 3);
  assert.equal(f.caution.length, 2);
  assert.ok(f.months.every((m) => /^\S{2}$/.test(m.monthGanZhi)));
});

test("旅行＋2027＋去哪裡：必须直接回答年份、月份、依据与旅行类型", () => {
  const q = "我什麼時候適合去度假，去哪裡最好？2027 是不是不適合我出行？";
  const req = inspectAnswerRequirements(q);
  const { reading } = contracted(q);
  assert.equal(req.asksTravel, true);
  assert.equal(req.asksWhen, true);
  assert.equal(req.asksWhere, true);
  assert.deepEqual(req.targetYears, [2027]);
  assert.match(reading.directAnswer, /2027/);
  assert.match(reading.directAnswer, /較順的窗口/);
  assert.match(reading.directAnswer, /月（/);
  assert.match(reading.directAnswer, /排序依據/);
  assert.match(reading.directAnswer, /旅行型態/);
  assert.doesNotMatch(reading.directAnswer, /目前引擎沒有目的地比較模組/);
  assert.doesNotMatch(reading.directAnswer, /窗口已經在眼前/);
  assert.doesNotMatch(reading.action, /固定同一時間睡覺/);
});

test("明年＋下半年：自动解析相对年份并只在指定月份范围排序", () => {
  const q = "明年下半年什麼時候最適合換工作？";
  const now = new Date().getFullYear();
  const req = inspectAnswerRequirements(q);
  const { reading } = contracted(q);
  assert.deepEqual(req.targetYears, [now + 1]);
  assert.deepEqual(req.targetMonths, [7, 8, 9, 10, 11, 12]);
  assert.match(reading.directAnswer, new RegExp(String(now + 1)));
  assert.match(reading.directAnswer, /你指定的月份範圍內/);
});

test("大后年不能同时误识别成后年", () => {
  const now = new Date().getFullYear();
  const req = inspectAnswerRequirements("大后年哪幾個月適合換工作？");
  assert.deepEqual(req.targetYears, [now + 3]);
});

test("中文十一月、十二月不能误撞成一月、二月", () => {
  assert.deepEqual(inspectAnswerRequirements("十一月財運如何？").targetMonths, [11]);
  assert.deepEqual(inspectAnswerRequirements("十二月工作如何？").targetMonths, [12]);
});

test("指定 9月、10月：不会拿全年其他月份当答案", () => {
  const q = "2027 年 9月和10月哪個月財運比較好？";
  const req = inspectAnswerRequirements(q);
  const { reading } = contracted(q);
  assert.deepEqual(req.targetMonths, [9, 10]);
  assert.match(reading.directAnswer, /9月（|10月（/);
  assert.match(reading.directAnswer, /你指定的月份範圍內/);
});

test("感情時間題：必须回答时间窗口，不回人格模板", () => {
  const q = "我什麼時候遇到適合長期交往的人？";
  assert.equal(inferQuestionKind(q, classifyQuestion(q)), "love");
  const { reading } = contracted(q, "same");
  assert.match(reading.directAnswer, /先直接回答時間/);
  assert.match(reading.directAnswer, /較順的窗口/);
  assert.match(reading.directAnswer, /月（/);
  assert.doesNotMatch(reading.directAnswer, /目前這個結果只保存/);
});

test("工作時間題：必须给月份窗口", () => {
  const q = "我何時適合換工作？";
  assert.equal(inferQuestionKind(q, classifyQuestion(q)), "career");
  const { reading } = contracted(q);
  assert.match(reading.directAnswer, /較順的窗口/);
  assert.match(reading.directAnswer, /月（/);
  assert.doesNotMatch(reading.directAnswer, /三十天內只交一件/);
});

test("学业考试题进入事业学业主题，不掉回 self", () => {
  const q = "明年考試和升學哪幾個月比較順？";
  assert.equal(inferQuestionKind(q, classifyQuestion(q)), "career");
  const { reading } = contracted(q);
  assert.match(reading.directAnswer, /較順的窗口/);
  assert.doesNotMatch(reading.directAnswer, /性格盲點/);
});

test("財運時間題：必须给月份窗口", () => {
  const q = "2027 哪幾個月財運比較好？";
  const { reading } = contracted(q);
  assert.match(reading.directAnswer, /2027/);
  assert.match(reading.directAnswer, /較順的窗口/);
  assert.match(reading.directAnswer, /月（/);
});

test("多主题时间题：感情和工作必须分开排，不能只答一个", () => {
  const q = "明年感情和工作哪一個先有明顯變化？";
  const { reading } = contracted(q, "same");
  assert.match(reading.directAnswer, /感情｜/);
  assert.match(reading.directAnswer, /工作／事業／學業｜/);
  assert.match(reading.directAnswer, /分開排/);
  assert.match(reading.directAnswer, /較順的窗口/);
});

test("多主题非时间题：工作和财务必须各自回答", () => {
  const q = "我工作最大的問題和財務最大的問題分別是什麼？";
  const { reading } = contracted(q);
  assert.match(reading.directAnswer, /工作／事業／學業｜/);
  assert.match(reading.directAnswer, /財務｜/);
  assert.match(reading.directAnswer, /分開回答/);
});

test("父母朋友同事类关系题不套正缘桃花模板", () => {
  const q = "我和父母最近關係為什麼這麼緊張？";
  const { reading } = contracted(q);
  assert.match(reading.directAnswer, /非戀愛關係題/);
  assert.match(reading.directAnswer, /不套正緣或桃花模板/);
});

test("法律官司题不预测胜败", () => {
  const q = "這個官司我會不會贏？";
  const { reading } = contracted(q);
  assert.match(reading.directAnswer, /不能保證勝敗/);
  assert.match(reading.directAnswer, /律師|法律意見/);
});

test("宠物题在正式取用未完成时不硬推颜色和品种", () => {
  const q = "我適合養什麼寵物和什麼顏色？";
  const { chart, reading } = contracted(q);
  assert.equal(chart.usefulProvisional, true);
  assert.match(reading.directAnswer, /正式取用尚未完成/);
  assert.doesNotMatch(reading.directAnswer, /最適合.*銀灰|最適合.*紅棕/);
});

test("备孕生育题不作保证", () => {
  const q = "我適不適合現在備孕要孩子？";
  const { reading } = contracted(q);
  assert.match(reading.directAnswer, /不能替代生殖健康評估/);
  assert.match(reading.directAnswer, /醫療檢查/);
});

test("健康恢復時間題：不做保證日期，但回答健康本題", () => {
  const q = "我的手痛大概什麼時候會恢復？";
  const { reading } = contracted(q);
  assert.match(reading.directAnswer, /命理這裡可以看壓力與生活節奏/);
  assert.match(reading.directAnswer, /醫生判斷/);
  assert.doesNotMatch(reading.directAnswer, /旅行|工作窗口|目的地/);
});

test("家宅地點題：回答家宅，不亂指定東西南北", () => {
  const q = "我住哪個方向、哪個城市最好？";
  const { chart, reading } = contracted(q);
  assert.equal(chart.usefulProvisional, true);
  assert.match(reading.directAnswer, /先回答能回答的部分/);
  assert.match(reading.directAnswer, /正式取用尚未完成/);
});

test("投資標的題：回答財務節奏但不指定股票", () => {
  const q = "我今年買哪一檔股票最好？";
  const { reading } = contracted(q);
  assert.match(reading.directAnswer, /財務節奏/);
  assert.match(reading.directAnswer, /不把任何標的說成必賺/);
});

test("普通二選一：不假装已比较没有提供的两个选项条件", () => {
  const q = "我應該留在現在的工作，還是換到新公司？";
  const { reading } = contracted(q);
  assert.match(reading.directAnswer, /二選一|比較要求/);
  assert.match(reading.directAnswer, /沒有分開提供/);
  assert.doesNotMatch(reading.directAnswer, /旅行型態/);
});

test("前世題保留一掌經結果", () => {
  const q = "我前世落在哪一道？";
  const { reading } = contracted(q);
  assert.match(reading.directAnswer, /(佛道|仙道|人道|修羅道|鬼道|畜生道)/);
});

test("未知出生时间：时间窗口必须自动降级精度", () => {
  const q = "明年什麼時候適合換工作？";
  const { reading } = contracted(q, "unset", { timeUnknown: true, hour: 12, minute: 0 });
  assert.match(reading.directAnswer, /出生時間未確定/);
  assert.match(reading.directAnswer, /精度會低一級/);
});

test("一般自我題可以正常回答，行動不再一律套睡眠模板", () => {
  const q = "我最大的性格盲點是什麼？";
  const { reading } = contracted(q);
  assert.ok(reading.directAnswer.length > 20);
  assert.match(reading.action, /真實事件|核對/);
  assert.doesNotMatch(reading.action, /固定同一時間睡覺/);
});
