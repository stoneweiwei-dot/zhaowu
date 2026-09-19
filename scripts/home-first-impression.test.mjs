import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const source = await readFile(new URL("../src/components/analysis-form.tsx", import.meta.url), "utf8");

test("homepage first impression is birth-first, followed by the chart and then the question", () => {
  assert.match(source, /customerTitle: "錄入生辰"/);
  assert.match(source, /customerTitle: "录入生辰"/);
  assert.match(source, /customerTitle: "Enter your birth record"/);
  assert.match(source, /id="customer-record"/);
  assert.match(source, /id="question-stage"/);
  assert.match(source, /id="bazi"/);
  assert.match(source, /BaziChart/);
  assert.match(source, /id="analysis-question"/);
  assert.match(source, /const showQuestion = Boolean\(rememberedRecord && !detailsOpen\)/);
  assert.match(source, /customer-record[\s\S]*id="bazi"[\s\S]*question-stage/);
  assert.doesNotMatch(source, /homepage-hero|zhaowu-hero/);
});

test("question sheet is concise and explicitly answer-first", () => {
  assert.match(source, /zhaowu-question-sheet/);
  assert.match(source, /questionTitle: "沿著這份命書，繼續問你真正關心的事"/);
  assert.match(source, /promise: \["直接結論", "相關依據", "現實下一步"\]/);
  assert.match(source, /question: question\.trim\(\)/);
  assert.match(source, /analyzeLife\(/);
});
