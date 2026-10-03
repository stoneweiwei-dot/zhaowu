import assert from "node:assert/strict";
import test from "node:test";

const { measure, summarize, CORPUS, HOLDOUT, HOLDOUT2, HOLDOUT3 } = await import("./fixtures/answer-coverage-run.mjs");

// Regression guard for the answer layer. The three HOLDOUT sets were used to tune once each,
// so their scores here guard against regressions; they are not an estimate of real coverage
// (first-run, untuned scores were 76% / 77% / 81%, see docs in the PR).
const SETS = [
  ["corpus", CORPUS, 97],
  ["holdout", HOLDOUT, 95],
  ["holdout2", HOLDOUT2, 93],
  ["holdout3", HOLDOUT3, 90],
];

for (const [name, set, floor] of SETS) {
  test(`answer coverage ${name} stays >= ${floor}% and every answer keeps the first-screen contract`, async () => {
    const rows = await measure({}, set);
    const s = summarize(rows);
    const broken = rows.filter((r) => r.fails.some((f) => f !== "off-topic"));
    assert.deepEqual(broken.map((r) => `${r.question} ${r.fails}`), [], "format/jargon/sentence-count violations");
    assert.ok(s.pct >= floor, `${name}: ${s.pct}% < ${floor}%\n${rows.filter((r) => !r.ok).map((r) => r.question).join("\n")}`);
  });
}
