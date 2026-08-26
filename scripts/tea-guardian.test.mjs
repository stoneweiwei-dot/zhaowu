import assert from "node:assert/strict";
import test from "node:test";
import { matchTeaGuardians, quizComplete, tasteFromQuiz, TEA_PROFILES, TEA_QUIZ } from "../src/lib/tea/guardian.ts";

function chart(overrides = {}) {
  return {
    dayMaster: "壬",
    dayMasterElement: "水",
    useful: ["金", "水"],
    drain: ["火"],
    usefulProvisional: false,
    ...overrides,
  };
}

test("tea guardian catalog keeps a broad multi-region selection", () => {
  assert.ok(TEA_PROFILES.length >= 20);
  assert.ok(TEA_PROFILES.some((tea) => tea.id === "wuyi-dahongpao"));
  assert.ok(TEA_PROFILES.some((tea) => tea.id === "xihu-longjing"));
  assert.ok(TEA_PROFILES.some((tea) => tea.id === "uji-gyokuro"));
  assert.ok(TEA_PROFILES.some((tea) => tea.id === "darjeeling-second-flush"));
});

test("quiz has eight questions and requires all of them", () => {
  assert.equal(TEA_QUIZ.length, 8);
  assert.equal(quizComplete({}), false);
  const answers = Object.fromEntries(TEA_QUIZ.map((q) => [q.id, q.options[0].id]));
  assert.equal(quizComplete(answers), true);
  assert.ok(tasteFromQuiz(answers));
});

test("matching is deterministic for the same chart and answers", () => {
  const answers = Object.fromEntries(TEA_QUIZ.map((q) => [q.id, q.options[0].id]));
  const first = matchTeaGuardians({ chart: chart(), answers, locale: "zh-Hans", limit: 3 });
  const second = matchTeaGuardians({ chart: chart(), answers, locale: "zh-Hans", limit: 3 });
  assert.deepEqual(first.map((item) => item.tea.id), second.map((item) => item.tea.id));
  assert.deepEqual(first.map((item) => item.score), second.map((item) => item.score));
});

test("chart-only matching still returns guardian tea without quiz data", () => {
  const matches = matchTeaGuardians({ chart: chart(), locale: "zh-Hans", limit: 3 });
  assert.equal(matches.length, 3);
  assert.ok(matches.every((item) => item.destinyScore !== null));
  assert.ok(matches.every((item) => item.tasteScore === null));
});

test("taste-only matching works without a Bazi chart", () => {
  const answers = Object.fromEntries(TEA_QUIZ.map((q) => [q.id, q.options.at(-1).id]));
  const matches = matchTeaGuardians({ answers, locale: "en", limit: 3 });
  assert.equal(matches.length, 3);
  assert.ok(matches.every((item) => item.destinyScore === null));
  assert.ok(matches.every((item) => item.tasteScore !== null));
});
