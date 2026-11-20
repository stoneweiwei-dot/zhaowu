import test from "node:test";
import assert from "node:assert/strict";
import { taiYuan } from "../src/lib/bazi/calendar.ts";
import {
  buildThreeYuanAuxiliary,
  mingGongClassic,
  shenGongAuxiliary,
  solarMonthNumberFromGanzhi,
} from "../src/lib/bazi/three-yuan.ts";
import { threeYuanAuxiliaryInstructionRule } from "../src/lib/bazi/three-yuan-instruction.ts";

test("胎元固定採月干進一、月支進三", () => {
  assert.equal(taiYuan("辛酉"), "壬子");
  assert.equal(taiYuan("己巳"), "庚申");
});

test("命宮符合《三命通會》經典例：甲子年三月戌時為丁卯", () => {
  assert.equal(mingGongClassic("甲子", 3, "戌"), "丁卯");
});

test("身宮逢酉安身校驗例：甲辰月三月丑時落午，固定後世口徑為丙午", () => {
  assert.deepEqual(shenGongAuxiliary("甲辰", 3, "丑"), { branch: "午", ganZhi: "丙午" });
});

test("節令月只作命宮敏感度口徑，不取代農曆月主口徑", () => {
  assert.equal(solarMonthNumberFromGanzhi("丙寅"), 1);
  assert.equal(solarMonthNumberFromGanzhi("辛酉"), 8);
});

test("未知時辰時只保留胎元，命宮身宮不作判定", () => {
  const result = buildThreeYuanAuxiliary({
    yearGz: "戊辰",
    monthGz: "辛酉",
    localYear: 1988,
    localMonth: 10,
    localDay: 4,
    hourBranch: null,
    timeUnknown: true,
  });
  assert.equal(result.taiyuan, "壬子");
  assert.equal(result.minggong, "未定");
  assert.equal(result.shengong, "未定");
  assert.equal(result.minggongReliability, "unavailable");
});

test("instruction rule hard-locks the three-yuan layer below Four Pillars", () => {
  assert.match(threeYuanAuxiliaryInstructionRule.purpose, /低權重補證/);
  assert.equal(threeYuanAuxiliaryInstructionRule.guards.some((item) => item.includes("七柱")), true);
  assert.equal(threeYuanAuxiliaryInstructionRule.rules.some((item) => item.includes("不得加入五行票數")), true);
});
