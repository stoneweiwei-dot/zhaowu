import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const articles = await readFile(new URL("../src/lib/life-view-20260903.ts", import.meta.url), "utf8");
const section = await readFile(new URL("../src/components/life-view-section.tsx", import.meta.url), "utf8");

test("recent owner material stays in the public advice layer and is tri-lingual", () => {
  assert.match(articles, /OWNER_MATERIAL/);
  assert.match(articles, /BaZi \/ Ziwei calculation truth/);
  for (const id of [
    "six-hearts-daily-practice",
    "care-without-taking-over",
    "stop-loss-is-clarity",
    "know-fate-keep-choice",
    "money-needs-order-not-anxiety",
    "five-elements-as-movement",
  ]) {
    assert.match(articles, new RegExp(`id: "${id}"`));
  }
  assert.match(articles, /"zh-Hant"/);
  assert.match(articles, /"zh-Hans"/);
  assert.match(articles, /en:/);
  assert.match(articles, /不是物理定律|not a scientific law/);
  assert.match(articles, /不是拿它去替別人的痛苦編原因|should not be used to invent reasons for another person's suffering/);
});

test("new awakening articles appear before older intake without replacing it", () => {
  const current = section.indexOf("...LIFE_VIEW_20260903_ARTICLES");
  const previous = section.indexOf("...LIFE_VIEW_20260831_ARTICLES");
  assert.ok(current >= 0);
  assert.ok(previous > current);
  assert.match(section, /five-elements-as-movement/);
  assert.match(section, /money-needs-order-not-anxiety/);
});
