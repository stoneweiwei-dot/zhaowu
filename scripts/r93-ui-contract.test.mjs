import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { test } from "node:test";

const index = await readFile(new URL("../index.html", import.meta.url), "utf8");
const runtimeCopy = await readFile(new URL("../public/customer-facing-copy-r93.js", import.meta.url), "utf8");
const analysisForm = await readFile(new URL("../src/components/analysis-form.tsx", import.meta.url), "utf8");
const intro = await readFile(new URL("../src/components/intro-gate.tsx", import.meta.url), "utf8");
const articleAssets = await Promise.all([
  "bazi-health-five-phases.svg",
  "bazi-health-body-map.svg",
  "bazi-health-timing-rings.svg",
  "bazi-health-balance.svg",
].map((name) => readFile(new URL(`../public/articles/${name}`, import.meta.url), "utf8")));

test("customer-facing birth copy is owned by React with no legacy DOM rewrite", () => {
  assert.doesNotMatch(index, /customer-facing-copy-r93\.js/);
  assert.match(runtimeCopy, /intentionally inert/);
  assert.doesNotMatch(runtimeCopy, /MutationObserver|querySelector|setText/);
  assert.match(analysisForm, /customerTitle:\s*"客人資料"/);
  assert.match(analysisForm, /customerTitle:\s*"客人资料"/);
  assert.match(analysisForm, /customerTitle:\s*"Client details"/);
});

test("intro fallback restores animated lotus composition rather than tiny poster lockup", () => {
  assert.match(intro, /zhaowu-lotus-intro__fallback-art/);
  assert.match(intro, /zhaowu-lotus-intro__lotus--1/);
  assert.match(intro, /zhaowu-lotus-intro__lotus--2/);
  assert.doesNotMatch(intro, /zhaowu-lotus-intro__fallback-lockup/);
});

test("health article illustrations use r93 traditional visual treatment", () => {
  for (const svg of articleAssets) {
    assert.match(svg, /data-zhaowu-article-art="r93"/);
    assert.match(svg, /Song-inspired|宋式|山水|五行|歲運|身體|平衡/);
  }
});
