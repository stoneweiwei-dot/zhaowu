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
  const required = ["天賦", "適合工作", "格局", "身強身弱", "用神", "病藥", "大運", "流年", "工作", "感情", "財運", "二選一", "應期", "六親", "D60", "紫微", "未知時辰", "多問題混合"];
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

test("talent questions require concrete abilities rather than a generic structure summary", () => {
  const q = "我的天賦是什麼？";
  assert.equal(detectQaIntent(q), "self");
  assert.equal(detectQuestionFocus(q), "talent");
  assert.equal(directAnswerCoversQuestion(q, "這張盤以正印格為主，日主偏旺。"), false);
  assert.equal(directAnswerCoversQuestion(q, "你的天賦就是能力很強。"), false);
  assert.equal(directAnswerCoversQuestion(q, "較有依據的能力是研究、整理複雜資訊並建立方法，也常表現在教學與知識管理。"), true);
});

test("job-fit questions require actual work types rather than a career principle", () => {
  const q = "我適合什麼工作？";
  assert.equal(detectQaIntent(q), "career");
  assert.equal(detectQuestionFocus(q), "job_fit");
  assert.equal(directAnswerCoversQuestion(q, "職業判斷以能否形成穩定做功與承載為核心。"), false);
  assert.equal(directAnswerCoversQuestion(q, "較適合優先看的工作類型。"), false);
  assert.equal(directAnswerCoversQuestion(q, "較適合優先看的工作類型是研究、教學、知識管理與專業支援。"), true);
});

test("self subtopics require matching answer coverage", () => {
  assert.equal(detectQuestionFocus("這個命局的用神到底是什麼？"), "useful");
  assert.equal(directAnswerCoversQuestion("這個命局的用神到底是什麼？", "目前主格是正官格。"), false);
  assert.equal(directAnswerCoversQuestion("這個命局的用神到底是什麼？", "正式取用未定，目前只有調候候選。"), true);
  assert.equal(detectQuestionFocus("D60 能不能作旁證？"), "d60");
});

test("relationship outlook requires an actual outlook answer, not a generic relationship paragraph", () => {
  const q = "這段感情還有沒有繼續發展的空間？";
  assert.equal(detectQaIntent(q), "love");
  assert.equal(detectQuestionFocus(q), "love_outlook");
  assert.equal(directAnswerCoversQuestion(q, "感情需要溝通，也要尊重彼此。"), false);
  assert.equal(directAnswerCoversQuestion(q, "不能可靠直接判成一定有或沒有發展空間；先看聯繫、投入與承諾是否成立。"), true);
});

test("money-risk questions require the actual risk to be named", () => {
  const q = "接下來一年財務上最該防什麼？";
  assert.equal(detectQaIntent(q), "money");
  assert.equal(detectQuestionFocus(q), "money_risk");
  assert.equal(directAnswerCoversQuestion(q, "財運有起伏，做事要保守。"), false);
  assert.equal(directAnswerCoversQuestion(q, "最該防現金流失控，以及沒有最大損失與退出條件時繼續加碼。"), true);
});

test("choice questions cannot pass with generic advice", () => {
  const q = "留在現在公司，還是接受新工作？哪個更合適？";
  assert.equal(detectQaIntent(q), "choice");
  assert.equal(detectQuestionFocus(q), "choice");
  assert.equal(directAnswerCoversQuestion(q, "工作上要穩中求進。"), false);
  assert.equal(directAnswerCoversQuestion(q, "目前條件不足，暫不強選 A 或 B；先用同一組條件比較兩個選項。"), true);
});

test("compound unknown-time plus job-fit question must answer both halves", () => {
  const q = "不知道出生時辰，我適合什麼工作？";
  assert.equal(detectQuestionFocus(q), "unknown_time");
  assert.equal(directAnswerCoversQuestion(q, "可以判一部分，時辰相關內容要降級。"), false);
  assert.equal(directAnswerCoversQuestion(q, "可以判一部分，時辰相關內容要降級；工作類型仍可先看研究、教學與專業支援等功能方向。"), true);
});

test("generic filler is rejected even when the answer is otherwise long enough", async () => {
  const { evaluateAnswerQuality } = await import("../src/lib/qa/answer-quality.ts");
  const fake = {
    question: "這份工作還值得繼續做嗎？",
    reading: {
      kind: "career",
      directAnswer: "直接回答：目前不能可靠判成值得繼續或不值得繼續；需要現職條件。",
      rhythm: "一切都是最好的安排。",
      action: "比較收入、責任與退出成本。",
      lastLine: "",
    },
    methodProtocol: {
      mode: "deterministic-zero-ai",
      primary: { name: "子平八字", role: "主判" },
      selected: [],
    },
  };
  const result = evaluateAnswerQuality(fake, "career");
  assert.equal(result.failed, true);
  assert.equal(result.failReasons.includes("generic_filler_present"), true);
});


test("customer copy removes generic motivational filler instead of showing it to users", async () => {
  const { customerCopy } = await import("../src/lib/report/customer-copy.ts");
  assert.equal(customerCopy("一切都是最好的安排。真正要看的是聯繫是否持續。"), "真正要看的是聯繫是否持續。");
});
