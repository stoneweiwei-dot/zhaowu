import assert from "node:assert/strict";
import test from "node:test";
import { buildPetDecision, isPetDecisionQuestion } from "../src/lib/report/pet-decision.ts";

const result = {
  question: "我適合養什麼寵物 在澳洲悉尼",
  locale: "zh-Hant",
  chart: {
    dayMaster: "壬",
    dayMasterElement: "水",
    strength: { tendency: "偏旺" },
  },
};

test("STO-17 pet decision answers the pet question before practical caveats", () => {
  assert.equal(isPetDecisionQuestion(result.question), true);
  const out = buildPetDecision(result, "zh-Hant");
  assert.match(out.directAnswer, /直接回答：首選/);
  assert.match(out.directAnswer, /成貓/);
  assert.match(out.directAnswer, /悉尼/);
  assert.equal(out.sections.length, 3);
  const report = out.sections.flatMap((section) => section.body).join("\n");
  assert.doesNotMatch(report, /工作運|事業運|財運|感情運|桃花/);
});
