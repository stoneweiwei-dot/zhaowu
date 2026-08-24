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
  assert.doesNotMatch(reading.directAnswer, /二選一|二选一|比較要求|比较要求|收入、距離|收入、距离/);
  assert.match(reading.directAnswer, /原局日主壬水/);
  assert.match(reading.directAnswer, /乙丑/);
  assert.match(reading.directAnswer, /丙午/);
  assert.match(reading.directAnswer, /大運|大运/);
  assert.match(reading.directAnswer, /流年/);
  assert.match(reading.directAnswer, /不能因此直接判成身弱|仍屬偏旺|仍属偏旺|中和偏旺/);
});

test("五行结构占比不得继续全部为 0", () => {
  const c = chart();
  const values = Object.values(c.elementPercents);
  assert.ok(values.some((value) => value > 0));
  const total = values.reduce((sum, value) => sum + value, 0);
  assert.ok(total >= 99.8 && total <= 100.2, `unexpected total ${total}`);
});

test("出生盘 hemisphere 只取出生地，不被现居悉尼覆盖", () => {
  const c = chart();
  assert.equal(c.cityLabel, SANMING.display);
  assert.equal(c.liveCityLabel, SYDNEY.display);
  assert.equal(c.hemisphere, "N");
});
