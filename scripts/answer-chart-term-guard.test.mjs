import assert from "node:assert/strict";
import test from "node:test";

const { hasUnsupportedChartTerms } = await import("../src/lib/report/answer-chart-term-guard.ts");
const { acceptWriterOutput } = await import("../src/lib/report/llm-answer.ts");

const SOURCES = ["今年適合換工作嗎", "可以考慮，但先把手上的案子收尾。", "本週內整理一份履歷。"];

test("a rewrite may not introduce stem/branch notation the engine never supplied", () => {
  for (const output of [
    "你的命局是壬辰年，今年動比較穩。",
    "你是壬水的底子，適合往外走。",
    "辛酉合金的部分先放著，專心收尾。",
    "辰酉合的影響今年比較明顯。",
    "庚金的性子適合談判。",
  ]) {
    assert.equal(hasUnsupportedChartTerms(output, SOURCES), true, output);
  }
});

test("restating notation that was supplied stays allowed", () => {
  const sources = [...SOURCES, "日柱壬辰，辰酉合金。"];
  assert.equal(hasUnsupportedChartTerms("壬辰這一柱先穩住。", sources), false);
  assert.equal(hasUnsupportedChartTerms("辰酉合金的部分可以先放著。", sources), false);
  // Supplying one pillar does not license a different one.
  assert.equal(hasUnsupportedChartTerms("甲子年會更順。", sources), true);
});

test("ordinary customer wording is never mistaken for chart notation", () => {
  for (const output of [
    "可以考慮，但先把手上的案子收尾。",
    "未來兩個月先把孩子的事安排好，中午之前把申請送出去。",
    "這個時辰出門比較順，日子挑在週末。",
    "先把樣子做出來，其他的事再說。",
    "申請表填完就好，不用想太多。",
    "他這個人做事有條理，長期來看會穩。",
  ]) {
    assert.equal(hasUnsupportedChartTerms(output, SOURCES), false, output);
  }
});

// The engine's own r207/r211 copy legitimately names stems (甲木取象…). The guard must not forbid
// that copy — it must forbid the model reaching for it when the engine did not hand it over.
test("deterministic engine copy is restatable, but only when it was actually supplied", () => {
  const engineLine = "甲木取象如挺立之木，重方向與骨架；遇事常先確立原則，再向外生長。";
  assert.equal(hasUnsupportedChartTerms("你這一型重方向與骨架，先把原則立好。", SOURCES), false);
  assert.equal(hasUnsupportedChartTerms("甲木的你重方向與骨架。", [...SOURCES, engineLine]), false);
  assert.equal(hasUnsupportedChartTerms("甲木的你重方向與骨架。", SOURCES), true);
});

test("acceptWriterOutput rejects a rewrite that states the chart", () => {
  const draft = { answer: "可以考慮，但先把手上的案子收尾。", next: "本週內整理一份履歷。" };
  assert.equal(
    acceptWriterOutput("今年適合換工作嗎", "你的命局是壬辰年，可以考慮換工作。", draft.next, [], draft),
    null,
  );
});

test("facts supplied to the writer license the notation they contain", () => {
  const draft = { answer: "可以考慮，但先把手上的案子收尾。", next: "本週內整理一份履歷。" };
  const sources = [...SOURCES, "長處：壬水的流動與連結"];
  assert.equal(hasUnsupportedChartTerms("壬水的流動讓你適合往外走。", sources), false);
  assert.equal(
    acceptWriterOutput("今年適合換工作嗎", "壬水的流動讓你適合往外走。", draft.next, [], draft),
    null,
    "without the fact in sources the same sentence must still be refused",
  );
});
