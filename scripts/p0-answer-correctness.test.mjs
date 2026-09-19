import assert from "node:assert/strict";
import { test } from "node:test";

const { buildChart } = await import("../src/lib/bazi/chart.ts");
const { interpret } = await import("../src/lib/bazi/interpret.ts");
const { applyAnswerContract, inspectAnswerRequirements, inferQuestionKind } = await import("../src/lib/core/answer-contract.ts");

const SANMING = {
  name: "Sanming",
  country: "China",
  display: "三明市，福建省，中国",
  latitude: 26.2639,
  longitude: 117.6387,
  timezone: "Asia/Shanghai",
};

const SYDNEY = {
  name: "Sydney",
  country: "Australia",
  display: "悉尼，新南威尔士州，澳大利亚",
  latitude: -33.8688,
  longitude: 151.2093,
  timezone: "Australia/Sydney",
};

function chart() {
  return buildChart({
    question: "我现在这个大运流年对我八字的属性能量大小有什么影响，让我现在是身强还是弱？",
    year: 1988,
    month: 10,
    day: 4,
    hour: 4,
    minute: 40,
    timeUnknown: false,
    gender: "male",
    relation: "same",
    city: SANMING,
    liveCity: SYDNEY,
    ziPolicy: "midnight",
    useTrueSolar: true,
  });
}

test("身强还是弱属于旺衰题，不得被“还是”误判成二选一", () => {
  const q = "我现在这个大运流年对我八字的属性能量大小有什么影响，让我现在是身强还是弱？";
  assert.equal(inferQuestionKind(q, "self"), "self");
  assert.equal(inspectAnswerRequirements(q).asksCompare, false);

  const c = chart();
  const raw = interpret(q, c, "same", null);
  const reading = applyAnswerContract(q, c, raw);
  assert.doesNotMatch(reading.directAnswer, /這題同時有二選一|这题同时有二选一|比較要求|比较要求|收入、距離|收入、距离/);
  assert.match(reading.directAnswer, /原局日主壬水/);
  assert.match(reading.directAnswer, /乙丑/);
  assert.match(reading.directAnswer, /丙午/);
  assert.match(reading.directAnswer, /大運|大运/);
  assert.match(reading.directAnswer, /流年/);
  assert.match(reading.directAnswer, /不能因此直接判成身弱|仍屬偏旺|仍属偏旺|中和偏旺/);
});


test("天賦題先交付具體能力，再說盤面依據，不用格局或旺衰充當答案", () => {
  const q = "我的天賦是什麼？";
  const c = chart();
  const reading = applyAnswerContract(q, c, interpret(q, c, "same", null));
  const first = reading.directAnswer.split(/[。！？!?]/)[0] ?? "";
  assert.equal(inferQuestionKind(q, "self"), "self");
  assert.match(first, /天賦|能力|研究|整理|判斷|整合|輸出|管理|協作|表達/);
  assert.doesNotMatch(first, /格局|正印格|偏旺|旺衰|日主/);
  assert.match(reading.directAnswer, /常見表現/);
  assert.match(reading.directAnswer, /依據是月令主氣/);
  assert.match(reading.directAnswer, /命理推論.*現實證明/);
  assert.match(reading.rhythm, /依據：/);
  assert.match(reading.action, /最近三件|現實證據/);
});

test("五行结构占比不得继续全部为 0", () => {
  const c = chart();
  const values = Object.values(c.elementPercents);
  assert.ok(values.some((value) => value > 0));
  const total = values.reduce((sum, value) => sum + value, 0);
  assert.ok(total >= 99.8 && total <= 100.2, `unexpected total ${total}`);
});

test("完整問答流程：天賦、追問工作、感情與月份各自回答，不回到同一段格局摘要", async () => {
  const actions = await import("../src/lib/actions.ts");
  const { buildDecisionReportModel } = await import("../src/lib/report/decision-report-model.ts");
  const baseInput = {
    question: "我的天賦是什麼？",
    locale: "zh-Hant",
    year: 1988,
    month: 10,
    day: 4,
    hour: 4,
    minute: 40,
    timeUnknown: false,
    gender: "male",
    relation: "same",
    city: SANMING,
    liveCity: SYDNEY,
    ziPolicy: "midnight",
    useTrueSolar: true,
  };

  const talent = await actions.analyzeLife({ data: baseInput });
  assert.match(talent.reading.directAnswer, /研究、吸收、整理複雜資訊|建立方法/);
  assert.doesNotMatch((talent.reading.directAnswer.split(/[。！？!?]/)[0] ?? ""), /格局|旺衰|偏旺/);
  const talentModel = buildDecisionReportModel(talent);
  assert.equal(talentModel.confidence, "medium");
  assert.equal(talentModel.confidenceLabel, "有依據");
  assert.doesNotMatch(talentModel.confidenceBasis, /資料足以支撐|资料足以支撑|較高|较高/);

  const work = await actions.followUpLife({ data: { question: "那我適合什麼工作？", base: talent, relation: "same" } });
  assert.equal(work.reading.kind, "career");
  assert.match(work.reading.directAnswer, /較適合優先看的工作類型/);
  assert.match(work.reading.directAnswer, /研究|教學|知識管理|專業支援|管理|顧問|設計|協作|開拓/);
  assert.doesNotMatch((work.reading.directAnswer.split(/[。！？!?]/)[0] ?? ""), /職業判斷以|格局|旺衰/);
  assert.doesNotMatch(work.reading.directAnswer, /我的天賦是什麼/);

  const love = await actions.followUpLife({ data: { question: "那感情呢？", base: talent, relation: "same" } });
  assert.equal(love.reading.kind, "love");
  assert.match(love.reading.directAnswer, /關係|关系|聯繫|联系|投入|承諾|承诺|下一步/);
  assert.doesNotMatch(love.reading.directAnswer, /正印格|天賦|天赋/);

  const timing = await actions.followUpLife({ data: { question: "明年幾月適合換工作？", base: talent, relation: "same" } });
  assert.equal(timing.reading.kind, "career");
  assert.match(timing.reading.directAnswer, /較順的窗口|较顺的窗口/);
  assert.match(timing.reading.directAnswer, /\d{1,2}月/);
  assert.doesNotMatch(timing.reading.directAnswer, /天賦|天赋|性格盲點|性格盲点/);
});

test("出生盘 hemisphere 只取出生地，不被现居悉尼覆盖", () => {
  const c = chart();
  assert.equal(c.cityLabel, SANMING.display);
  assert.equal(c.liveCityLabel, SYDNEY.display);
  assert.equal(c.hemisphere, "N");
});
