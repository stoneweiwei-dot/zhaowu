import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { test } from "node:test";

const {
  CULTIVATION_ENVIRONMENT_GUIDANCE,
  buildCultivationEnvironmentAdviceLines,
} = await import("../src/lib/report/cultivation-environment-advice.ts");
const { buildMindAdviceLines } = await import("../src/lib/report/mind-advice.ts");

function result(kind, question, locale = "zh-Hans") {
  return { question, locale, reading: { kind } };
}

test("修心與環境模組鎖定總綱、八主題與非 Truth Layer 邊界", () => {
  assert.equal(CULTIVATION_ENVIRONMENT_GUIDANCE.id, "ZW-CULTIVATION-ENVIRONMENT-GUIDANCE-1.0");
  assert.equal(CULTIVATION_ENVIRONMENT_GUIDANCE.themes.length, 8);
  assert.match(CULTIVATION_ENVIRONMENT_GUIDANCE.masterPrinciple["zh-Hant"], /外局可調，內心亦須調/);
  assert.match(CULTIVATION_ENVIRONMENT_GUIDANCE.masterPrinciple["zh-Hant"], /風水可以作參考，但不能取代人的選擇、行動與現實處理/);
  assert.match(CULTIVATION_ENVIRONMENT_GUIDANCE.guards.join("\n"), /不得反向修改八字／紫微 Calculation Truth/);
});

test("住家與風水問題只回兩條可執行修心環境建議", () => {
  const lines = buildMindAdviceLines(result("home", "我最近住家风水和房间环境要怎么调整？"));
  assert.equal(lines.length, 2);
  assert.match(lines[0], /外在格局会影响生活，但不是唯一决定因素/);
  assert.match(lines[1], /不是性格或命运的诊断/);
});

test("家人問題合併孝親與各自課題但保留界線", () => {
  const lines = buildMindAdviceLines(result("choice", "我和父母一直為我的選擇爭執，我應該怎麼辦？", "zh-Hant"));
  assert.equal(lines.length, 2);
  assert.match(lines.join("\n"), /孝親不等於失去界線/);
  assert.match(lines.join("\n"), /家人的人生不是你一個人能代替完成/);
});

test("口舌衝突不要求壓抑情緒，改成需求與界線", () => {
  const lines = buildMindAdviceLines(result("love", "我们最近一直吵架，我很生气，怎么处理？"));
  assert.equal(lines.length, 2);
  assert.match(lines[0], /口德不是把情绪吞回去/);
  assert.match(lines[0], /需求与边界/);
});

test("慈悲不傷生不交換財運或保證福報", () => {
  const lines = buildCultivationEnvironmentAdviceLines(result("self", "我想从不杀生和慈悲开始调整生活"));
  assert.ok(lines);
  assert.equal(lines.length, 2);
  assert.match(lines[0], /不拿来交换财运或保证福报/);
  assert.doesNotMatch(lines.join("\n"), /殺生會讓所有生靈離開所以財福消失|杯盤桌椅都在聽/);
});

test("English environment guidance stays plain English with no Chinese leakage", () => {
  const lines = buildMindAdviceLines(result("home", "How should I change my home environment and feng shui?", "en"));
  assert.equal(lines.length, 2);
  assert.match(lines.join("\n"), /surroundings|space/i);
  assert.match(lines.join("\n"), /not diagnoses/i);
  assert.doesNotMatch(lines.join("\n"), /[\u3400-\u9fff]/);
});

test("generic health advice still keeps medical boundary when no environment theme matches", () => {
  const lines = buildMindAdviceLines(result("health", "最近身体和睡眠要注意什么？"));
  assert.equal(lines.length, 2);
  assert.match(lines.join("\n"), /医疗检查/);
});

test("source code contains explicit anti-superstition guardrails", async () => {
  const source = await readFile(new URL("../src/lib/report/cultivation-environment-advice.ts", import.meta.url), "utf8");
  assert.match(source, /不得宣稱杯盤桌椅或物件會聽見人的話/);
  assert.match(source, /不得宣稱殺生會直接導致財福消失/);
  assert.match(source, /每份報告最多調用兩條/);
});
