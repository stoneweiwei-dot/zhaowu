import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const source = await readFile(new URL("../src/components/analysis-form.tsx", import.meta.url), "utf8");

test("homepage explains Zhaowu, the analysis value, and the primary next action in all three locales", () => {
  assert.match(source, /ZHAOWU · CONSULTATION/);
  assert.match(source, /A direct answer first, followed by the chart evidence/);
  assert.match(source, /Begin analysis/);

  assert.match(source, /昭梧 · 问事/);
  assert.match(source, /先给结论，再依据命局与时间节奏说明可行选择/);
  assert.match(source, /开始分析/);
  assert.match(source, /先給結論，再依據命局與時間節奏說明可行選擇/);
  assert.match(source, /開始分析/);
});

test("homepage first impression stays compact rather than adding a blocking hero", () => {
  assert.match(source, /zhaowu-question-promise/);
  assert.doesNotMatch(source, /homepage-hero|zhaowu-hero/);
  assert.match(source, /promise: \["結論", "依據", "時機"\]/);
  assert.match(source, /customerTitle: "客人資料"/);
});
