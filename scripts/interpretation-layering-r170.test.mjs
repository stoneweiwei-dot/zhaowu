import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const instructions = await readFile(new URL("../src/lib/bazi/instruction-database.ts", import.meta.url), "utf8");
const runtime = await readFile(new URL("../src/lib/bazi/runtime-contract.ts", import.meta.url), "utf8");
const baziNotes = await readFile(new URL("../src/components/bazi-knowledge-notes-section.tsx", import.meta.url), "utf8");
const ziweiGrammar = await readFile(new URL("../src/lib/ziwei/interpretation-grammar.ts", import.meta.url), "utf8");
const ziweiNotes = await readFile(new URL("../src/components/ziwei-knowledge-notes-section.tsx", import.meta.url), "utf8");
const focused = await readFile(new URL("../docs/FOCUSED-REPORT.md", import.meta.url), "utf8");
const interpret = await readFile(new URL("../src/lib/bazi/interpret.ts", import.meta.url), "utf8");
const finalReading = await readFile(new URL("../src/lib/report/final-reading.ts", import.meta.url), "utf8");
const unifiedBirthReport = await readFile(new URL("../src/components/unified-birth-report.tsx", import.meta.url), "utf8");

test("BaZi runtime keeps primary judgement above strength and quantity heuristics", () => {
  assert.match(instructions, /ZW-BAZI-METHOD-LAYERING-1\.0/);
  assert.match(instructions, /扶抑身強身弱只作結構診斷與旁證/);
  assert.match(instructions, /五行數量、百分比、字數或量化分數只可作分布描述/);
  assert.match(instructions, /神煞、納音、十二長生只作低權重旁證/);
  assert.match(runtime, /BAZI_STRUCTURE_STATES/);
  assert.match(runtime, /成而有病/);
  assert.match(runtime, /BAZI_EVIDENCE_LAYERS/);
});

test("customer report cannot present two conflicting final useful-element answers", () => {
  assert.match(focused, /Method Layering Gate/);
  assert.match(focused, /只能有一個客戶可見主結論/);
  assert.match(focused, /扶抑／身強身弱：只回答力量與承受方式/);
  assert.match(baziNotes, /不同方法有不同任務，不把兩個喜用並排給你/);
  assert.match(baziNotes, /壬辰日的人通常/);
});

test("Zi Wei five-element bureau remains calculation context, not a personality code", () => {
  assert.match(ziweiGrammar, /fiveElementBureauRule/);
  assert.match(ziweiGrammar, /不得把局數直接翻成人格/);
  for (const marker of ["2–11", "3–12", "4–13", "5–14", "6–15"]) {
    assert.ok(ziweiNotes.includes(marker), `missing bureau age marker ${marker}`);
  }
  assert.match(ziweiNotes, /五行局不是性格標籤/);
});


test("r191 treats bias as structure, mission as framing, and imagery as downstream translation", () => {
  assert.match(runtime, /十天干、十二地支沒有先天高低貴賤/);
  assert.match(runtime, /為何而生／使命／宿命／人生方向/);
  assert.match(runtime, /下游翻譯層/);
  assert.match(focused, /五行偏向本身不是缺陷/);
  assert.match(focused, /使命／為何而生／宿命/);
  assert.match(interpret, /不是把五行补齐或强行凑平均/);
  assert.match(finalReading, /不替你指定唯一使命/);
  assert.match(unifiedBirthReport, /這份命書不把五行湊平均/);
  assert.match(unifiedBirthReport, /十干沒有高下/);
});
