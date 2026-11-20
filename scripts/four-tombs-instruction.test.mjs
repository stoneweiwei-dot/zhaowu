import assert from "node:assert/strict";
import { test } from "node:test";

const {
  FOUR_TOMB_BRANCHES,
  fourTombsInstructionRule,
  getApplicableInstructionRules,
  getFourTombsTriggerContext,
  getInstructionRule,
} = await import("../src/lib/bazi/instruction-database.ts");

const FOUR_TOMBS_RULE_ID = "ZW-FOUR-TOMBS-MUKU-1.0";

function ids(context) {
  return getApplicableInstructionRules(context).map((rule) => rule.id);
}

test("四庫專門協議已註冊為 production", () => {
  assert.equal(fourTombsInstructionRule.status, "production");
  assert.equal(fourTombsInstructionRule.layer, "bazi");
  assert.deepEqual([...FOUR_TOMB_BRANCHES], ["辰", "戌", "丑", "未"]);
  assert.equal(getInstructionRule(FOUR_TOMBS_RULE_ID)?.id, FOUR_TOMBS_RULE_ID);
});

test("原局四柱任一出現辰戌丑未，都自動啟用四庫協議", () => {
  for (const branch of FOUR_TOMB_BRANCHES) {
    const context = { natalBranches: ["子", "卯", branch, "酉"] };
    assert.equal(getFourTombsTriggerContext(context), "natal", `${branch} should trigger natal mode`);
    assert.ok(ids(context).includes(FOUR_TOMBS_RULE_ID), `${branch} should inject four-tombs rule`);
  }
});

test("原局無四庫而大運／流年出現四庫，只在歲運觸發層啟用", () => {
  const context = {
    natalBranches: ["子", "卯", "午", "酉"],
    activeBranches: ["未"],
  };
  assert.equal(getFourTombsTriggerContext(context), "transit");
  assert.ok(ids(context).includes(FOUR_TOMBS_RULE_ID));
});

test("原局與歲運皆無辰戌丑未時，不注入四庫專門協議", () => {
  const context = {
    natalBranches: ["子", "卯", "午", "酉"],
    activeBranches: ["申", "亥"],
  };
  assert.equal(getFourTombsTriggerContext(context), null);
  assert.ok(!ids(context).includes(FOUR_TOMBS_RULE_ID));
});

test("四庫協議優先於一般斷事協議進入 applicable rules", () => {
  const applicable = getApplicableInstructionRules({ natalBranches: ["辰", "酉", "寅", "申"] });
  const fourTombsIndex = applicable.findIndex((rule) => rule.id === FOUR_TOMBS_RULE_ID);
  const genericIndex = applicable.findIndex((rule) => rule.id === "ZW-BAZI-EVENT-INFERENCE-1.0");
  assert.ok(fourTombsIndex >= 0);
  assert.ok(genericIndex >= 0);
  assert.ok(fourTombsIndex < genericIndex, "four-tombs rule must run before generic event inference");
});

test("四庫規則明文禁止本氣／庫氣十神混用與懸空歲運斷語", () => {
  const body = [...fourTombsInstructionRule.rules, ...fourTombsInstructionRule.guards].join("\n");
  assert.match(body, /本氣十神與庫氣十神混用/);
  assert.match(body, /壬日主見辰/);
  assert.match(body, /雙辰自刑/);
  assert.match(body, /沒有原局／大運／流年干支證據/);
  assert.match(body, /不得只斷「化土」/);
});
