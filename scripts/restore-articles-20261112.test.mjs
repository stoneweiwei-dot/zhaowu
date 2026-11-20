import assert from "node:assert/strict";
import test from "node:test";
import { ARTICLE_CATALOG } from "../src/components/life-view-home-section.tsx";

const restoredIds = [
  "world-as-mirror-not-physics",
  "money-needs-order-not-anxiety",
  "five-elements-as-movement",
  "frequency-is-not-the-entrance",
  "sensitivity-needs-boundaries",
  "love-reveals-the-unfinished-self",
  "capacity-is-real-energy",
  "follow-the-flow-not-surrender",
  "five-pillars-of-practice",
  "break-the-deadlock",
  "belief-and-world",
  "relationships-and-boundaries",
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

test("catalog restores 13 distinct orphans and one new essay alongside 55 existing entries", () => {
  assert.equal(ARTICLE_CATALOG.length, 69);
  const ids = new Set(ARTICLE_CATALOG.map((article) => article.id));
  assert.equal(ids.size, 69);
  assert.equal(restoredIds.length, 13);
  for (const id of restoredIds) assert.ok(ids.has(id), `missing restored essay: ${id}`);
  assert.ok(ids.has("emotional-intelligence-four-practices-20261112"), "missing new emotional intelligence essay");
  for (const id of ["emotion-does-not-run-the-decision","clarity-studies-patterns-rules-people","care-without-taking-over","fate-has-bounds-choice-has-space","awakening-and-reality","emotion-and-judgement"]) assert.ok(!ids.has(id), `duplicate topic returned to catalog: ${id}`);
  for (const [id, successor] of Object.entries(superseded)) {
    assert.ok(!ids.has(id), `superseded draft published: ${id}`);
    assert.ok(ids.has(successor), `missing successor: ${successor}`);
  }
  for (const id of ["china-accessibility-diagnosis", "intimacy-symbolism-boundaries"]) {
    assert.ok(!ids.has(id), `intentionally removed essay published: ${id}`);
  }
});
