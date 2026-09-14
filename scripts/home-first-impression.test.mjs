import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const source = await readFile(new URL("../src/components/analysis-form.tsx", import.meta.url), "utf8");

test("homepage first impression is the shared birth record, not a self-Q&A sheet", () => {
  assert.match(source, /customerTitle: "客人資料"/);
  assert.match(source, /customerTitle: "客人资料"/);
  assert.match(source, /customerTitle: "Client details"/);
  assert.match(source, /保存生辰/);
  assert.match(source, /Save birth record/);
  assert.doesNotMatch(source, /ZHAOWU · CONSULTATION/);
  assert.doesNotMatch(source, /此刻，你最想了解/);
  assert.doesNotMatch(source, /先給結論，再依據命局與時間節奏說明可行選擇/);
  assert.doesNotMatch(source, /先给结论，再依据命局与时间节奏说明可行选择/);
  assert.doesNotMatch(source, /A direct answer first, followed by the chart evidence/);
  assert.doesNotMatch(source, /Begin analysis/);
  assert.doesNotMatch(source, /開始分析/);
  assert.doesNotMatch(source, /开始分析/);
});

test("homepage first impression stays compact rather than adding a blocking hero", () => {
  assert.doesNotMatch(source, /zhaowu-question-promise/);
  assert.doesNotMatch(source, /zhaowu-question-sheet/);
  assert.doesNotMatch(source, /homepage-hero|zhaowu-hero/);
  assert.doesNotMatch(source, /promise: \["結論", "依據", "時機"\]/);
  assert.match(source, /id="customer-record"/);
});
