import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const root = new URL("../", import.meta.url);
const source = (path) => readFile(new URL(path, root), "utf8");

test("WFX interpretation guards prevent count-based and stereotype shortcuts", async () => {
  const runtime = await source("src/lib/bazi/runtime-contract.ts");
  const doc = await source("docs/WFX-WANGSHI-ZHIHUA-v1.0.md");
  assert.match(runtime, /WFX-WANGSHI-ZHIHUA-v1\.0\.md/);
  assert.match(runtime, /旺不得直接等於喜、用或天賦/);
  assert.match(runtime, /五行五常只作文化象義/);
  assert.match(runtime, /印旺不得直接等於有福/);
  assert.match(runtime, /城市、地理、髮色、衣著、方位與日柱俗訣/);
  assert.match(doc, /不得因某五行或十神「出現三個以上」直接判定/);
  assert.match(doc, /不能做五行集點式配平/);
  assert.match(doc, /戊辰日的辰藏戊、乙、癸/);
});

test("Guan Shi Lu publishes the corrected strength-overdrive article", async () => {
  const registry = await source("src/lib/life-view-long-form.ts");
  const article = await source("src/lib/life-view-long-form/strength-overdrive-five-elements.ts");
  const home = await source("src/components/life-view-home-section.tsx");
  assert.match(registry, /STRENGTH_OVERDRIVE_FIVE_ELEMENTS_LONG_FORM/);
  assert.ok(registry.indexOf("STRENGTH_OVERDRIVE_FIVE_ELEMENTS_LONG_FORM,") < registry.indexOf("FACE_MIND_CULTIVATION_LONG_FORM,"));
  assert.match(article, /你不是缺什麼，而是有些力量還沒有用對地方/);
  assert.match(article, /三個以上/);
  assert.match(article, /缺什麼補什麼/);
  assert.match(article, /戊辰/);
  assert.match(home, /strength-overdrive-five-elements/);
  assert.match(home, /\/quiz\/five-element-overdrive/);
});

test("Five-Element Strength Overdrive quiz stays subjective and separate from formal BaZi", async () => {
  const route = await source("src/routes/quiz.five-element-overdrive.tsx");
  const contract = await source("docs/FUN-QUIZ-FIVE-ELEMENT-OVERDRIVE-v1.0.md");
  assert.match(route, /createFileRoute\("\/quiz\/five-element-overdrive"\)/);
  assert.match(route, /你最容易把哪一種優勢，用成自己的內耗/);
  assert.match(route, /本測驗只反映目前行為傾向/);
  assert.match(route, /不判喜用神/);
  assert.match(route, /QUESTIONS\.length/);
  assert.match(route, /scored\.leaders\.map/);
  assert.doesNotMatch(route, /supabase/i);
  assert.match(contract, /10 題/);
  assert.match(contract, /並列最高分時保留並列/);
  assert.match(contract, /不建立 Supabase 新表/);
});

test("r137 WFX artifacts remain after later releases", async () => {
  const sw = await source("public/sw.js");
  const report = await source("docs/change-reports/ZW-WEB-2026.09.15-r137.md");
  assert.match(report, /WFX/);
  assert.match(report, /five-element-overdrive/);
  assert.match(sw, /zhaowu-shell-\$\{RELEASE\.slice\(0,\s*16\)\}/);
  assert.match(sw, /ZHAOWU_RELEASE_READY/);
  assert.doesNotMatch(sw, /zhaowu-shell-r1\d+/);
});
