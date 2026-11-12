import assert from "node:assert/strict";
import test from "node:test";
import { ARTICLE_CATALOG } from "../src/components/life-view-home-section.tsx";

const restoredIds = [
  "world-as-mirror-not-physics",
  "emotion-does-not-run-the-decision",
  "clarity-studies-patterns-rules-people",
  "care-without-taking-over",
  "money-needs-order-not-anxiety",
  "five-elements-as-movement",
  "frequency-is-not-the-entrance",
  "sensitivity-needs-boundaries",
  "love-reveals-the-unfinished-self",
  "capacity-is-real-energy",
  "fate-has-bounds-choice-has-space",
  "follow-the-flow-not-surrender",
  "five-pillars-of-practice",
  "break-the-deadlock",
  "awakening-and-reality",
  "belief-and-world",
  "relationships-and-boundaries",
  "emotion-and-judgement",
  "long-term-practice"
];
const superseded = {
  "karma-is-not-blame": "karma-cause-result-responsibility-without-judging-others",
  "from-huangquan-to-rebirth": "yellow-springs-and-buddhist-rebirth",
  "feng-shui-begins-in-conduct": "feng-shui-is-also-conduct",
  "do-not-take-it-as-final": "do-not-take-everything-as-final-truth",
  "six-hearts-daily-practice": "six-practices-of-the-heart",
  "stop-loss-is-clarity": "letting-go-and-cutting-losses",
  "know-fate-keep-choice": "know-fate-keep-choice-curated"
};

test("catalog restores exactly 19 orphan ids alongside the existing 55 without duplicates", () => {
  assert.equal(ARTICLE_CATALOG.length, 74);
  const ids = new Set(ARTICLE_CATALOG.map((article) => article.id));
  assert.equal(ids.size, 74);
  assert.equal(restoredIds.length, 19);
  for (const id of restoredIds) assert.ok(ids.has(id), `missing restored essay: ${id}`);
  for (const [id, successor] of Object.entries(superseded)) {
    assert.ok(!ids.has(id), `superseded draft published: ${id}`);
    assert.ok(ids.has(successor), `missing successor: ${successor}`);
  }
  for (const id of ["china-accessibility-diagnosis", "intimacy-symbolism-boundaries"]) {
    assert.ok(!ids.has(id), `intentionally removed essay published: ${id}`);
  }
});
