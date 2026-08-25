import test from "node:test";
import assert from "node:assert/strict";
import { buildCosmicProfile, isCosmicSymbolicQuestion } from "../src/lib/symbolic/cosmic-profile.ts";
import { applyCustomerAnswerHotfix } from "../src/lib/report/customer-answer-hotfix.ts";

const chart = {
  pillars: [],
  dayMaster: "壬",
  dayMasterElement: "水",
  monthBranch: "酉",
  lunarDate: "",
  civilStamp: "",
  trueSolarStamp: "",
  timezone: "Asia/Shanghai",
  cityLabel: "Shanghai",
  liveCityLabel: "Sydney",
  longitude: 121.47,
  hemisphere: "N",
  ziPolicy: "midnight",
  usedTrueSolar: true,
  timeUnknown: false,
  gender: "male",
  elements: { 木: 3, 火: 1, 土: 4, 金: 2, 水: 4 },
  elementPercents: { 木: 21.4, 火: 7.1, 土: 28.6, 金: 14.3, 水: 28.6 },
  strength: { tendency: "中和偏旺", summary: "", deLing: true, deDi: true, deShi: false },
  useful: [],
  drain: [],
  usefulProvisional: true,
  dayun: [],
  currentDayun: { ganZhi: "乙丑", startYear: 2020, endYear: 2029, startAge: 32, endAge: 41, current: true },
  currentYear: "丙午",
  taiyuan: "",
  minggong: "",
  provenance: "test",
};

const reading = {
  kind: "self",
  directAnswer: "旧的人格模板，不应该出现在星际种子问题里。",
  rhythm: "旧节奏",
  work: "",
  love: "",
  money: "",
  body: "",
  home: "",
  action: "旧建议",
  decree: "",
  lastLine: "",
  guide: { colors: [], avoidColors: [], directions: { favor: [], rest: [] }, hours: { favor: [], drain: [] }, pet: "" },
};

test("detects cosmic soul / starseed questions", () => {
  assert.equal(isCosmicSymbolicQuestion("我的灵魂维度 star seed 最接近什么"), true);
  assert.equal(isCosmicSymbolicQuestion("我今年适合换工作吗"), false);
});

test("water-metal profile resolves to Sirius rather than generic self copy", () => {
  const profile = buildCosmicProfile(chart, "zh-Hans");
  assert.equal(profile.primary, "sirius");
  assert.match(profile.directAnswer, /天狼星 Sirius/);
  assert.match(profile.directAnswer, /4D→5D/);
  assert.match(profile.disclaimer, /象征性/);
});

test("customer hotfix routes starseed question into symbolic module", () => {
  const result = applyCustomerAnswerHotfix("我的灵魂维度 star seed 最接近什么", chart, reading);
  assert.match(result.directAnswer, /天狼星 Sirius/);
  assert.doesNotMatch(result.directAnswer, /旧的人格模板/);
  assert.match(result.rhythm, /3D|4D|5D/);
  assert.match(result.action, /现实|系统|边界|输出/);
});
