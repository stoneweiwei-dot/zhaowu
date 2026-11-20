import assert from "node:assert/strict";
import { test } from "node:test";

const { buildMindAdviceLines } = await import("../src/lib/report/mind-advice.ts");

function result(kind, question, locale = "zh-Hans") {
  return {
    question,
    locale,
    reading: { kind },
  };
}

test("relationship reports receive boundary and self-worth advice", () => {
  const lines = buildMindAdviceLines(result("love", "这段感情还要不要继续？"));
  assert.equal(lines.length, 2);
  assert.match(lines.join("\n"), /关系不是用来证明自己值得被爱/);
  assert.match(lines.join("\n"), /边界/);
});

test("health reports keep calm-with-discomfort framing plus medical boundary", () => {
  const lines = buildMindAdviceLines(result("health", "最近身体和睡眠要注意什么？"));
  assert.match(lines.join("\n"), /平静不是没有杂念或不适/);
  assert.match(lines.join("\n"), /医疗检查/);
});

test("action-oriented reports use ordinary-life practice instead of adding a new topic", () => {
  const lines = buildMindAdviceLines(result("career", "工作下一步怎么走？"));
  assert.match(lines.join("\n"), /行动中自己找出来/);
  assert.match(lines.join("\n"), /塞车、排队、洗碗、工作受阻/);
});

test("English advice is plain English with no Chinese leakage", () => {
  const lines = buildMindAdviceLines(result("love", "What should I do about this relationship?", "en"));
  assert.match(lines.join("\n"), /relationship is not proof/i);
  assert.match(lines.join("\n"), /boundaries/i);
  assert.doesNotMatch(lines.join("\n"), /[\u3400-\u9fff]/);
});
