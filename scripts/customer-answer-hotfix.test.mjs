import assert from "node:assert/strict";
import { test } from "node:test";

const { buildChart } = await import("../src/lib/bazi/chart.ts");
const { interpret } = await import("../src/lib/bazi/interpret.ts");
const { finalizeReading } = await import("../src/lib/report/final-reading.ts");

const CITY = {
  name: "Sanming",
  country: "China",
  display: "三明市，福建省，中国",
  latitude: 26.2639,
  longitude: 117.6387,
  timezone: "Asia/Shanghai",
};

function result(question) {
  const input = {
    question,
    year: 1988,
    month: 10,
    day: 4,
    hour: 4,
    minute: 40,
    timeUnknown: false,
    gender: "male",
    relation: "same",
    city: CITY,
    liveCity: null,
    ziPolicy: "midnight",
    useTrueSolar: true,
  };
  const chart = buildChart(input);
  return { chart, reading: finalizeReading(question, chart, interpret(question, chart, "same", null)) };
}

test("五行属性主导必须回答真实结构分布，不再回人格模板", () => {
  const { reading } = result("我的五行属性主导");
  assert.match(reading.directAnswer, /木\d|火\d|土\d|金\d|水\d/);
  assert.match(reading.directAnswer, /分布/);
  assert.match(reading.directAnswer, /日主.*壬水/);
  assert.doesNotMatch(reading.directAnswer, /吸收得比誰都快|吸收得比谁都快|七天的行為|七天的行为/);
});

test("具体适合去的国家和城市属于旅行目的地问题", () => {
  const { reading } = result("具体适合去的国家和城市");
  assert.match(reading.directAnswer, /東京|东京|新加坡|首爾|首尔|沖繩|冲绳|京都|釜山|台南|西安|清邁|清迈|峇里|巴厘|維也納|维也纳|黃金海岸|黄金海岸/);
  assert.doesNotMatch(reading.directAnswer, /吸收得比誰都快|吸收得比谁都快/);
});

test("指定两个月的旅行窗口不能同时出现在较顺与保守列表", () => {
  const { reading } = result("2027年1月到3月适合出行旅游度假吗？");
  assert.match(reading.directAnswer, /較順的窗口/);
  const best = reading.directAnswer.match(/較順的窗口：([^。]+)/)?.[1] ?? "";
  const caution = reading.directAnswer.match(/較需要保守安排：([^。]+)/)?.[1] ?? "";
  for (const month of ["1月", "2月", "3月"]) {
    assert.ok(!(best.includes(month) && caution.includes(month)), `${month} appears in both best and caution`);
  }
});

test("English Seoul caution question answers cautions in English instead of dumping Chinese timing windows", () => {
  const { reading } = result("What should I be careful of in my upcoming trip to Seoul?");
  assert.match(reading.directAnswer, /For Seoul/);
  assert.match(reading.directAnswer, /itinerary|transfers|travel advice/i);
  assert.doesNotMatch(reading.directAnswer, /較順的窗口|较顺的窗口/);
});
