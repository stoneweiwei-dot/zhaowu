import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const source = await readFile(new URL("../src/components/analysis-form.tsx", import.meta.url), "utf8");

test("homepage first impression is birth-first and the question appears only after birth is ready", () => {
  assert.match(source, /customerTitle: "客人資料"/);
  assert.match(source, /customerTitle: "客人资料"/);
  assert.match(source, /customerTitle: "Your birth details"/);
  assert.match(source, /id="customer-record"/);
  assert.match(source, /id="question-stage"/);
  assert.match(source, /id="analysis-question"/);
  assert.match(source, /const showQuestion = Boolean\(rememberedRecord && !detailsOpen\)/);
  assert.match(source, /customer-record[\s\S]*question-stage/);
  assert.doesNotMatch(source, /homepage-hero|zhaowu-hero/);
});

test("question sheet is concise and explicitly answer-first", () => {
  assert.match(source, /zhaowu-question-sheet/);
  assert.match(source, /questionTitle: "你真正想問的是什麼？"/);
  assert.match(source, /promise: \["直接結論", "相關依據", "現實下一步"\]/);
  assert.match(source, /question: question\.trim\(\)/);
  assert.match(source, /analyzeLife\(/);
});
