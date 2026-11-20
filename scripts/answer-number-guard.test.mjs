import assert from "node:assert/strict";
import test from "node:test";

const { hasUnsupportedNumbers, hasUnsupportedRelativeYear } = await import("../src/lib/report/answer-number-guard.ts");
const { acceptWriterOutput } = await import("../src/lib/report/llm-answer.ts");

test("rewrite cannot invent a year, amount or new relative year", () => {
  assert.equal(hasUnsupportedNumbers("2028年適合投資500元", ["問題是2027年投資嗎", "2027年先觀察"]), true);
  assert.equal(hasUnsupportedRelativeYear("明年可以試", ["今年先觀察"]), true);
  assert.equal(hasUnsupportedNumbers("2027年先觀察", ["問題是2027年投資嗎"]), false);
});

test("optional writer rejects unsupported figures and keeps the rule answer", () => {
  const draft = { answer: "今年工作上先把阻力核對清楚。", next: "先列出兩個選項。" };
  assert.equal(acceptWriterOutput("我今年工作如何？", "今年工作要先核對阻力，2029年再離職。", "先列出選項。", [], draft), null);
  assert.equal(acceptWriterOutput("我今年工作如何？", "明年工作會更順。", "先列出選項。", [], draft), null);
});
