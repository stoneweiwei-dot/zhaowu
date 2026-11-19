import assert from "node:assert/strict";
import test from "node:test";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const { buildChart } = await import("../src/lib/bazi/chart.ts");
const { FEATURED_CITIES } = await import("../src/lib/bazi/cities.ts");
const { interpret } = await import("../src/lib/bazi/interpret.ts");

const CITY = FEATURED_CITIES[0];

function sample(over = {}) {
  return {
    question: "留在現在公司，還是接受新工作？",
    year: 1988,
    month: 10,
    day: 4,
    hour: 3,
    minute: 30,
    timeUnknown: false,
    gender: "male",
    relation: "unset",
    city: CITY,
    liveCity: null,
    ziPolicy: "midnight",
    useTrueSolar: false,
    ...over,
  };
}

// Chart A：月令主氣透干且第二層有可見主線（正印格，殺印相生），傾向承接新的承擔。
const chartA = buildChart(sample());
// Chart B：月令主氣未透干、只定格局方向（正官格方向），傾向先顧好手上的結構。
const chartB = buildChart(
  sample({ year: 1985, month: 7, day: 22, hour: 14, minute: 0, gender: "female" }),
);

const QUESTION = "留在現在公司，還是接受新工作？";

test("moveScore has been deleted from interpret.ts", () => {
  const here = dirname(fileURLToPath(import.meta.url));
  const source = readFileSync(join(here, "..", "src", "lib", "bazi", "interpret.ts"), "utf8");
  assert.doesNotMatch(source, /moveScore/, "keyword-count scoring must be gone");
});

test("(a) two-option answer opens with a conclusion sentence and a premise", () => {
  for (const chart of [chartA, chartB]) {
    const answer = interpret(QUESTION, chart).directAnswer;
    assert.match(answer, /^直接回答：偏向 /, answer);
    assert.match(answer, /前提是/, answer);
    assert.doesNotMatch(answer, /不能可靠|無明確偏向/, answer);
  }
});

test("(b) the same question leans differently on two different charts", () => {
  const a = interpret(QUESTION, chartA).directAnswer;
  const b = interpret(QUESTION, chartB).directAnswer;
  assert.notEqual(a, b);
  assert.match(a, /接受新工作/, a);
  assert.match(b, /留在現在公司/, b);
});

test("(c) the answer states a reversal condition and its chart basis", () => {
  for (const chart of [chartA, chartB]) {
    const answer = interpret(QUESTION, chart).directAnswer;
    assert.match(answer, /反轉條件/, answer);
    assert.match(answer, /如果.*更完整/, answer);
    assert.match(answer, /依據：用神為/, answer);
    assert.match(answer, /主格/, answer);
    assert.match(answer, /現實檢核/, answer);
  }
});

test("rewording the options without changing their meaning does not flip the leaning", () => {
  const reworded = "維持目前的職位，還是轉到另一家公司？";
  const a = interpret(reworded, chartA).directAnswer;
  const b = interpret(reworded, chartB).directAnswer;
  assert.match(a, /轉到另一家公司/, a);
  assert.match(b, /維持目前的職位/, b);
  assert.notEqual(a, b);
});

test("yes/no questions get a conditional leaning, never a bare refusal", () => {
  const q = "我該不該離職？";
  const a = interpret(q, chartA).directAnswer;
  const b = interpret(q, chartB).directAnswer;
  assert.match(a, /^直接回答：偏向可以試，前提是/, a);
  assert.match(b, /^直接回答：偏向先不全押，前提是/, b);
  for (const answer of [a, b]) {
    assert.match(answer, /反轉條件/, answer);
    assert.doesNotMatch(answer, /不能可靠|條件不足/, answer);
  }
});

test("a choice question with no comparable options says which condition is missing", () => {
  const answer = interpret("選哪一個比較好？", chartA).directAnswer;
  assert.match(answer, /無明確偏向/, answer);
  assert.match(answer, /缺少可比較的兩個明確選項/, answer);
});
