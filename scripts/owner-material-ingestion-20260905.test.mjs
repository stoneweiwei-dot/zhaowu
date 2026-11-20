import assert from "node:assert/strict";
import { test } from "node:test";

const {
  getApplicableInstructionRules,
  getInstructionRule,
} = await import("../src/lib/bazi/instruction-database.ts");

const AUX = "ZW-AUX-PALACES-BOUNDARY-1.0";
const LUCK = "ZW-NATAL-LUCK-PHASE-1.0";
const OWNER = "ZW-OWNER-MATERIAL-APP-20260905-1.0";

function body(rule) {
  return [...(rule?.rules ?? []), ...(rule?.guards ?? []), ...(rule?.outputContract ?? [])].join("\n");
}

test("2026-09-05 owner app rules are registered as production", () => {
  for (const id of [AUX, LUCK, OWNER]) {
    const rule = getInstructionRule(id);
    assert.equal(rule?.status, "production", `${id} must be production`);
  }
  const ids = getApplicableInstructionRules({}).map((rule) => rule.id);
  assert.ok(ids.includes(AUX));
  assert.ok(ids.includes(LUCK));
  assert.ok(ids.includes(OWNER));
});

test("胎元命宮身宮 stays auxiliary and cannot decide wealth health or lifespan alone", () => {
  const text = body(getInstructionRule(AUX));
  assert.match(text, /來源、流派、曆法、起算方式與時辰邊界/);
  assert.match(text, /只屬輔助象義層/);
  assert.match(text, /禁止單憑胎元/);
  assert.match(text, /禁止單憑命宮/);
  assert.match(text, /禁止單憑身宮/);
});

test("原局與歲運分層，歲運不得倒寫出生格局", () => {
  const text = body(getInstructionRule(LUCK));
  assert.match(text, /原局先定月令、根氣、透藏、格局、調候、病藥、流通與承載/);
  assert.match(text, /不得因此把出生四柱與原局基本格局機械改名/);
  assert.match(text, /禁止「喜用五行出現＝一定吉／必發」/);
});

test("壬辰只保留確定性藏干十神，隔離單柱宿命斷語", () => {
  const text = body(getInstructionRule(OWNER));
  assert.match(text, /辰藏戊、乙、癸/);
  assert.match(text, /七殺、傷官、劫財/);
  assert.match(text, /不得由日柱單獨輸出/);
  assert.match(text, /禁止單一壬辰日柱固定人格、富貴、婚姻、疾病、壽命或職業/);
});
