import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const source = await readFile(new URL("../src/components/analysis-form.tsx", import.meta.url), "utf8");

test("homepage explains Zhaowu, the analysis value, and the primary next action in all three locales", () => {
  assert.match(source, /ZHAOWU · BAZI READING/);
  assert.match(source, /Start with the answer/);
  assert.match(source, /Start BaZi analysis · See answer/);

  assert.match(source, /昭梧 · 子平问事/);
  assert.match(source, /先给结论，再说明命局依据/);
  assert.match(source, /开始命理分析 · 看答案/);
  assert.match(source, /先給結論，再說明命局依據/);
  assert.match(source, /開始命理分析 · 看答案/);
});

test("homepage first impression stays compact rather than adding a blocking hero", () => {
  assert.match(source, /zhaowu-question-promise/);
  assert.doesNotMatch(source, /homepage-hero|zhaowu-hero/);
  assert.match(source, /promise: \["先答問題", "再講依據", "最後給時機"\]/);
});
