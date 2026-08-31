import assert from "node:assert/strict";
import { test } from "node:test";

const {
  getApplicableInstructionRules,
  getInstructionRule,
  humanCenteredGuidanceInstructionRule,
  zhaowuInstructionDatabase,
} = await import("../src/lib/bazi/instruction-database.ts");

const RULE_ID = "ZW-HUMAN-GUIDANCE-CORE-1.0";

test("人本自主協議已註冊為最高優先級 production core rule", () => {
  assert.equal(humanCenteredGuidanceInstructionRule.id, RULE_ID);
  assert.equal(humanCenteredGuidanceInstructionRule.status, "production");
  assert.equal(humanCenteredGuidanceInstructionRule.layer, "core");
  assert.equal(humanCenteredGuidanceInstructionRule.priority, 0);
  assert.equal(zhaowuInstructionDatabase[0]?.id, RULE_ID);
  assert.equal(getInstructionRule(RULE_ID)?.id, RULE_ID);
});

test("所有分析情境都先注入人本自主協議", () => {
  const contexts = [
    {},
    { natalBranches: ["子", "卯", "午", "酉"] },
    { natalBranches: ["辰", "酉", "寅", "申"], activeBranches: ["未"] },
  ];

  for (const context of contexts) {
    const applicable = getApplicableInstructionRules(context);
    assert.equal(applicable[0]?.id, RULE_ID);
  }
});

test("人本自主協議保留界線、隨緣行動與反魔法因果護欄", () => {
  const body = [
    ...humanCenteredGuidanceInstructionRule.rules,
    ...humanCenteredGuidanceInstructionRule.guards,
    ...(humanCenteredGuidanceInstructionRule.outputContract ?? []),
  ].join("\n");

  assert.match(body, /我能控制/);
  assert.match(body, /父母/);
  assert.match(body, /隨緣/);
  assert.match(body, /口德/);
  assert.match(body, /受害者責難/);
  assert.match(body, /魔法式因果/);
  assert.match(body, /一個優先下一步/);
});