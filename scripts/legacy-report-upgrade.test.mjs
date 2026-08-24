import assert from "node:assert/strict";
import { test } from "node:test";

const { buildChart } = await import("../src/lib/bazi/chart.ts");
const { interpret } = await import("../src/lib/bazi/interpret.ts");
const {
  CURRENT_ENGINE_VERSION,
  needsStoredAnalysisUpgrade,
  upgradeStoredAnalysis,
} = await import("../src/lib/report/legacy-upgrade.ts");

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

const question = "我现在这个大运流年对我八字的属性能量大小有什么影响 让我现在是身强还是弱";

function staleResult() {
  const chart = buildChart({
    question,
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
  const raw = interpret(question, chart, "same", null);
  return {
    id: "legacy-strength-record",
    question,
    chart: {
      ...chart,
      elementPercents: { 木: 0, 火: 0, 土: 0, 金: 0, 水: 0 },
    },
    reading: {
      ...raw,
      kind: "choice",
      directAnswer: "這題同時有二選一／比較要求。請比較收入、距離、責任。",
    },
    createdAt: "2026-08-24T01:11:04.009Z",
  };
}

test("旧保存记录只升级一次，并把错误二选一答案迁移成当前旺衰答案", () => {
  const stale = staleResult();
  assert.equal(needsStoredAnalysisUpgrade(stale), true);

  const upgraded = upgradeStoredAnalysis(stale);
  assert.equal(upgraded.engineVersion, CURRENT_ENGINE_VERSION);
  assert.equal(upgraded.reading.kind, "self");
  assert.doesNotMatch(upgraded.reading.directAnswer, /這題同時有二選一|这题同时有二选一|收入、距離、責任|收入、距离、责任/);
  assert.match(upgraded.reading.directAnswer, /原局日主壬水/);
  assert.match(upgraded.reading.directAnswer, /乙丑/);
  assert.match(upgraded.reading.directAnswer, /丙午/);
  assert.match(upgraded.reading.directAnswer, /中和偏旺|不能因此直接判成身弱/);

  const total = Object.values(upgraded.chart.elementPercents).reduce((sum, value) => sum + value, 0);
  assert.ok(total >= 99.8 && total <= 100.2, `unexpected total ${total}`);
  assert.equal(upgraded.chart.hemisphere, "N");

  assert.equal(needsStoredAnalysisUpgrade(upgraded), false);
  assert.strictEqual(upgradeStoredAnalysis(upgraded), upgraded);
});
