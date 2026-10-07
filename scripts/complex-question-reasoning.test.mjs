import test from "node:test";
import assert from "node:assert/strict";
import { buildQuestionGraph, PERSON_ROLE_CATALOG } from "../src/lib/qa/complex-question-ontology.ts";
import { readFile } from "node:fs/promises";

const reasoner = await readFile(new URL("../supabase/functions/answer-reasoner/index.ts", import.meta.url), "utf8");
const resultView = await readFile(new URL("../src/components/result-view.tsx", import.meta.url), "utf8");
const client = await readFile(new URL("../src/lib/report/complex-reasoning.ts", import.meta.url), "utf8");

test("person-role catalogue covers family, intimate, workplace, commercial, professional and special third parties", () => {
  const roles = new Set(PERSON_ROLE_CATALOG.map((item) => item.role));
  for (const role of [
    "self", "partner", "spouse", "ex_partner", "father", "mother", "child", "sibling",
    "friend", "boss", "coworker", "subordinate", "client", "business_partner", "investor",
    "teacher", "doctor", "lawyer", "landlord", "team", "company", "pet", "future_child",
    "deceased_person", "unknown_other",
  ]) assert.equal(roles.has(role), true, `missing role ${role}`);
  assert.ok(roles.size >= 40);
});

test("simple one-topic question stays on the deterministic/writer path", () => {
  const graph = buildQuestionGraph("我今年財運怎麼樣？", "money");
  assert.equal(graph.shouldReason, false);
  assert.ok(graph.domains.includes("money"));
});

test("multi-part relationship question routes to the complex reasoner", () => {
  const graph = buildQuestionGraph("我跟他曖昧半年，他最近變冷，我要不要繼續等？如果等，看到什麼時候？", "love");
  assert.equal(graph.shouldReason, true);
  assert.ok(graph.roles.includes("self"));
  assert.ok(graph.roles.includes("ambiguous_interest") || graph.roles.includes("unknown_other"));
  assert.ok(graph.domains.includes("relationship"));
  assert.ok(graph.modes.includes("conditional"));
  assert.ok(graph.modes.includes("multi-part"));
  assert.equal(graph.thirdPartyBoundaryRequired, true);
});

test("boss plus offer question recognises workplace, comparison and multiple decision conditions", () => {
  const graph = buildQuestionGraph("老闆說要升我但薪水不變，我又有另一個 offer，留還是走？明年哪個選擇比較好？", "career");
  assert.equal(graph.shouldReason, true);
  assert.ok(graph.roles.includes("boss"));
  assert.ok(graph.domains.includes("career"));
  assert.ok(graph.domains.includes("choice"));
  assert.ok(graph.modes.includes("comparison"));
  assert.ok(graph.targetYears.length >= 1);
});

test("family-health question triggers a third-party and medical boundary", () => {
  const graph = buildQuestionGraph("我爸最近身體很差，今年我是不是要特別擔心？", "self");
  assert.equal(graph.shouldReason, true);
  assert.ok(graph.roles.includes("father"));
  assert.ok(graph.domains.includes("health"));
  assert.equal(graph.thirdPartyBoundaryRequired, true);
  assert.equal(graph.highStakes, true);
  assert.ok(graph.highStakesKinds.includes("medical"));
});

test("business partner exit question recognises partnership, conflict and timing", () => {
  const graph = buildQuestionGraph("我和合夥人一直吵，要不要拆夥？如果拆，今年幾月談比較好？", "career");
  assert.equal(graph.shouldReason, true);
  assert.ok(graph.roles.includes("business_partner"));
  assert.ok(graph.domains.includes("partnership"));
  assert.ok(graph.domains.includes("conflict"));
  assert.ok(graph.modes.includes("conditional"));
});

test("ordinary fitness and a noisy setting do not become medical or interpersonal conflict", () => {
  assert.equal(buildQuestionGraph("我想鍛鍊身體，怎樣建立習慣？", "self").highStakes, false);
  assert.ok(!buildQuestionGraph("工作環境很吵，適合搬家嗎？", "home").domains.includes("conflict"));
});

test("multi-domain home plus career question routes to reasoner", () => {
  const graph = buildQuestionGraph("今年適不適合買房？但我也準備換工作，兩件事應該先做哪個？", "home");
  assert.equal(graph.shouldReason, true);
  assert.ok(graph.domains.includes("property"));
  assert.ok(graph.domains.includes("career"));
  assert.ok(graph.complexityScore >= 2);
});

test("migration and entrepreneurship sequence question is detected", () => {
  const graph = buildQuestionGraph("如果先移民再創業，和先創業再移民，哪個順序比較好？", "choice");
  assert.equal(graph.shouldReason, true);
  assert.ok(graph.domains.includes("migration"));
  assert.ok(graph.domains.includes("entrepreneurship"));
  assert.ok(graph.modes.includes("conditional"));
  assert.ok(graph.modes.includes("comparison"));
});

test("investment pick is high stakes and cannot be treated as an ordinary fortune question", () => {
  const graph = buildQuestionGraph("今年哪一隻股票最旺我？要買科技股還是加密貨幣？", "money");
  assert.equal(graph.shouldReason, true);
  assert.equal(graph.highStakes, true);
  assert.ok(graph.highStakesKinds.includes("investment"));
  assert.ok(graph.domains.includes("investment"));
});

test("legal outcome is high stakes", () => {
  const graph = buildQuestionGraph("我跟前合夥人的官司今年會不會贏？什麼時候最關鍵？", "self");
  assert.equal(graph.shouldReason, true);
  assert.ok(graph.highStakesKinds.includes("legal"));
  assert.ok(graph.domains.includes("legal"));
});

test("future-child question is bounded as a third-party question", () => {
  const graph = buildQuestionGraph("我未來孩子會是什麼性格？跟我合不合？", "self");
  assert.equal(graph.shouldReason, true);
  assert.ok(graph.roles.includes("future_child"));
  assert.equal(graph.thirdPartyBoundaryRequired, true);
});

test("deceased-person spiritual question is complex and bounded", () => {
  const graph = buildQuestionGraph("已故的家人是不是還在守護我？他想告訴我什麼？", "past");
  assert.equal(graph.shouldReason, true);
  assert.ok(graph.roles.includes("deceased_person"));
  assert.ok(graph.domains.includes("spiritual"));
});

test("reasoner is a fact synthesiser, not a second chart engine", () => {
  assert.match(reasoner, /不得重新排八字/);
  assert.match(reasoner, /evidenceIds/);
  assert.match(reasoner, /facts/);
  assert.match(reasoner, /gpt-6-luna/);
  assert.match(reasoner, /api\.openai\.com\/v1\/responses/);
  assert.doesNotMatch(reasoner, /calculateChart|buildChart|fourPillars|solarToLunar/);
});

test("client packet includes deterministic decision, structure, timing and topic facts", () => {
  for (const id of [
    "answer.direct", "answer.biggest_variable", "reading.rhythm", "reading.career",
    "reading.love", "reading.money", "reading.health", "reading.home",
    "structure.primary", "structure.remedy", "chart.strength", "chart.useful",
  ]) assert.match(client, new RegExp(id.replace(".", "\\.")));
});

test("result view shows deterministic complex synthesis immediately, then optionally tries AI reasoning", () => {
  assert.match(resultView, /buildComplexDeterministicAnswer/);
  assert.match(resultView, /complexRule\?\.answer/);
  assert.match(resultView, /buildComplexReasoningRequest/);
  assert.match(resultView, /requestComplexReasoning/);
  assert.match(resultView, /else if \(!cancelled\) void runWriter\(\)/);
  assert.match(resultView, /data-answer-source=\{writtenNow\?\.source \?\? "rule"\}/);
});

test("deterministic complex composer exists so provider failure cannot remove the upgrade", () => {
  assert.match(client, /export function buildComplexDeterministicAnswer/);
  assert.match(client, /thirdPartyBoundary/);
  assert.match(client, /highStakesBoundary/);
  assert.match(client, /domainLine/);
  assert.match(client, /multi-part/);
});
