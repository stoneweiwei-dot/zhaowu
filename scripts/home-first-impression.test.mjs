import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const source = await readFile(new URL("../src/components/analysis-form.tsx", import.meta.url), "utf8");

test("homepage explains Zhaowu, the analysis value, and the primary next action in all three locales", () => {
  assert.match(source, /ZHAOWU · BAZI DECISION ANALYSIS/);
  assert.match(source, /Zhaowu uses BaZi as the primary system/);
  assert.match(source, /Start BaZi analysis · See answer/);

  assert.match(source, /昭梧 · 子平八字命理分析/);
  assert.match(source, /昭梧以子平四柱为主判/);
  assert.match(source, /开始命理分析 · 看答案/);
  assert.match(source, /昭梧以子平四柱為主判/);
  assert.match(source, /開始命理分析 · 看答案/);
});

test("homepage first impression stays compact rather than adding a blocking hero", () => {
  assert.match(source, /zhaowu-question-promise/);
  assert.doesNotMatch(source, /homepage-hero|zhaowu-hero/);
  assert.match(source, /promise: \["問題直答", "命局結構", "大運節奏"\]/);
});
