import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { test } from "node:test";

const form = await readFile(new URL("../src/components/analysis-form.tsx", import.meta.url), "utf8");
const intro = await readFile(new URL("../src/components/intro-gate.tsx", import.meta.url), "utf8");
const articleAssets = await Promise.all([
  "bazi-health-five-phases.svg",
  "bazi-health-body-map.svg",
  "bazi-health-timing-rings.svg",
  "bazi-health-balance.svg",
].map((name) => readFile(new URL(`../public/articles/${name}`, import.meta.url), "utf8")));

test("customer-facing birth section never uses back-office client wording", () => {
  assert.doesNotMatch(form, /客人資料|客人资料|Client details|SHARED RECORD/);
  assert.match(form, /建立你的命盤/);
  assert.match(form, /建立你的命盘/);
  assert.match(form, /Build your chart/);
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
