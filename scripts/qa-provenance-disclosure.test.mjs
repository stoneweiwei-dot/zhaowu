import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const root = new URL("../", import.meta.url);
const source = (path) => readFile(new URL(path, root), "utf8");
const { analyzeLife } = await import("../src/lib/actions.ts");
const { buildComplexDeterministicAnswer, verdictBasisNote } = await import("../src/lib/report/complex-reasoning.ts");
const { buildDecisionReportModel } = await import("../src/lib/report/decision-report-model.ts");
const { FEATURED_CITIES } = await import("../src/lib/bazi/cities.ts");

const JARGON = /日主|月令|格局|十神|用神|身強|身强|身弱|day master|month command/i;

async function run(question, locale = "zh-Hant") {
  return analyzeLife({
    data: {
      question,
      locale,
      year: 1988, month: 10, day: 4, hour: 4, minute: 40,
      timeUnknown: false, gender: "male", relation: "unset",
      city: FEATURED_CITIES[0], liveCity: null, ziPolicy: "midnight", useTrueSolar: false,
    },
  });
}

test("fixed offer verdict is disclosed as a decision framework, not a chart conclusion", async () => {
  const result = await run("老闆說可能升我但薪水不變，我又有另一個 offer，留還是走？");
  const answer = buildComplexDeterministicAnswer(result);
  assert.ok(answer);
  // The owner-accepted verdict wording stays exactly as locked by r228.
  assert.match(answer.verdict, /^先留，不急著走。/);
  assert.equal(answer.verdictBasis, "decision-framework");
  assert.ok(answer.basisNote.length > 0);
  assert.match(answer.basisNote, /通用的取捨框架/);
  assert.doesNotMatch(answer.basisNote, JARGON);
});

test("comparison questions that miss the offer pattern are labelled, never silent", async () => {
  const result = await run("如果先移民再創業，和先創業再移民，哪個順序比較好？");
  const answer = buildComplexDeterministicAnswer(result);
  assert.ok(answer);
  assert.notEqual(answer.verdictBasis, "decision-framework");
  assert.ok(["answer-engine", "generic-fallback"].includes(answer.verdictBasis));
  // A note is shown exactly when the verdict did not come from the answer engine.
  assert.equal(answer.basisNote === "", answer.verdictBasis === "answer-engine");
  if (answer.verdictBasis === "generic-fallback") assert.match(answer.basisNote, /不是從你的命盤推出的結論/);
});

test("basis notes exist for every locale and stay empty for the answer engine", () => {
  assert.equal(verdictBasisNote("answer-engine", "zh-Hant"), "");
  assert.equal(verdictBasisNote("answer-engine", "en"), "");
  for (const basis of ["decision-framework", "generic-fallback"]) {
    const hant = verdictBasisNote(basis, "zh-Hant");
    const hans = verdictBasisNote(basis, "zh-Hans");
    const en = verdictBasisNote(basis, "en");
    assert.ok(hant && hans && en, `${basis} note missing a locale`);
    assert.notEqual(hant, hans);
    assert.match(en, /[A-Za-z]/);
    assert.doesNotMatch(en, /[一-鿿]/);
    // Unknown or undefined locales fall back to Traditional Chinese like the verdict text does.
    assert.equal(verdictBasisNote(basis, undefined), hant);
    assert.equal(verdictBasisNote(basis, "ko"), hant);
  }
});

test("decision model exposes field-level provenance and marks chart-independent fields", async () => {
  const result = await run("老闆說可能升我但薪水不變，我又有另一個 offer，留還是走？");
  const model = buildDecisionReportModel(result);
  const keys = ["directAnswer", "nextAction", "reasons", "timing", "actions", "confidence", "biggestVariable", "risks"];
  assert.deepEqual(Object.keys(model.provenance).sort(), [...keys].sort());
  const allowed = new Set(["reading-engine", "special-composer", "leak-fallback", "question-template"]);
  for (const key of keys) assert.ok(allowed.has(model.provenance[key]), `${key} has invalid provenance`);
  // These are lookup tables keyed on question classification; they must stay labelled as such.
  for (const key of ["confidence", "biggestVariable", "risks"]) assert.equal(model.provenance[key], "question-template");
  assert.equal(model.provenance.reasons, "reading-engine");
});

test("the disclosure sits in the default-visible answer, not inside the collapsed evidence", async () => {
  const view = await source("src/components/result-view.tsx");
  const disclosure = view.indexOf("data-answer-basis");
  const verdict = view.indexOf("data-decision-verdict");
  const collapsed = view.indexOf("data-technical-evidence");
  assert.ok(disclosure > 0, "result-view must render data-answer-basis");
  assert.ok(verdict > 0 && disclosure > verdict, "disclosure must follow the verdict");
  assert.ok(collapsed > disclosure, "disclosure must come before the collapsed evidence block");
  assert.match(view, /complexRule\.basisNote \?/);
  // The owner-locked verdict wiring must be untouched.
  assert.match(view, /lockDeterministicVerdict = Boolean\(complexRule\?\.comparison\)/);
});
