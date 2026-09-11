import test from "node:test";
import assert from "node:assert/strict";
import { ANSWER_QUALITY_CORPUS } from "../src/lib/qa/answer-quality-corpus.ts";
import {
  detectQaIntent,
  detectQuestionFocus,
  directAnswerCoversQuestion,
  questionsAreEquivalent,
  redactQuestion,
} from "../src/lib/qa/answer-quality.ts";

test("P0 corpus covers all required answer-quality topics", () => {
  const required = ["格局", "身強身弱", "用神", "病藥", "大運", "流年", "工作", "感情", "財運", "二選一", "應期", "六親", "D60", "紫微", "未知時辰", "多問題混合"];
  const topics = new Set(ANSWER_QUALITY_CORPUS.map((item) => item.topic));
  for (const topic of required) assert.equal(topics.has(topic), true, `missing QA topic: ${topic}`);
});

test("deterministic QA intent router catches obvious targeted questions", () => {
  const checks = [
    ["這份工作還值得繼續做嗎？", "career"],
    ["這段感情還有沒有繼續發展的空間？", "love"],
    ["接下來一年財務上最該防什麼？", "money"],
    ["留在現在公司，還是接受新工作？哪個更合適？", "choice"],
    ["工作轉機大概在什麼時候出現？", "timing"],
    ["這個八字到底是什麼格局？", "self"],
  ];
  for (const [question, expected] of checks) assert.equal(detectQaIntent(question), expected, question);
});

test("semantic re-ask guard catches equivalent repeat wording", () => {
  assert.equal(questionsAreEquivalent("這份工作還值得繼續做嗎？", "所以這份工作到底還值不值得繼續做？"), true);
  assert.equal(questionsAreEquivalent("今年財運怎麼樣？", "這段感情還能繼續嗎？"), false);
});

test("analytics text redacts obvious contact and birth-like numeric data", () => {
  const redacted = redactQuestion("test@example.com 1988-10-04 04:40 0412345678 這份工作值得做嗎");
  assert.equal(redacted.includes("test@example.com"), false);
  assert.equal(redacted.includes("1988-10-04"), false);
  assert.equal(redacted.includes("0412345678"), false);
});

test("decision questions require an actual decision or explicit cannot-judge statement", () => {
  const q = "這份工作還值得繼續做嗎？";
  assert.equal(detectQuestionFocus(q), "decision");
  assert.equal(directAnswerCoversQuestion(q, "職業判斷以能否形成穩定做功與承載為核心。"), false);
  assert.equal(directAnswerCoversQuestion(q, "直接回答：目前不能可靠判成值得繼續或不值得繼續；需要現職條件。"), true);
});

test("self subtopics require matching answer coverage", () => {
  assert.equal(detectQuestionFocus("這個命局的用神到底是什麼？"), "useful");
  assert.equal(directAnswerCoversQuestion("這個命局的用神到底是什麼？", "目前主格是正官格。"), false);
  assert.equal(directAnswerCoversQuestion("這個命局的用神到底是什麼？", "正式取用未定，目前只有調候候選。"), true);
  assert.equal(detectQuestionFocus("D60 能不能作旁證？"), "d60");
});
