import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const runtime = await readFile(new URL("../src/lib/bazi/runtime-contract.ts", import.meta.url), "utf8");
const remedy = await readFile(new URL("../src/lib/bazi/structural-remedy.ts", import.meta.url), "utf8");
const instructionBase = await readFile(new URL("../src/lib/bazi/instruction-database-base.ts", import.meta.url), "utf8");
const p3 = await readFile(new URL("../docs/STONE-R6.2.1-P3-PINKU-BINGYAO-GATE.md", import.meta.url), "utf8");

test("R6.2.1 P2 is bound into the machine-readable runtime contract", () => {
  assert.match(runtime, /STONE-R6\.2\.1-P2-STRUCTURAL-DYNAMICS\.md/);
  assert.match(runtime, /穿／害只表示關係摩擦/);
  assert.match(runtime, /十神身份不因合、沖、刑、害、穿而變成另一個十神/);
  assert.match(runtime, /墓庫不得機械套用/);
  assert.match(runtime, /有路不等於有效流通/);
});

test("structural remedy does not regress to ten-god vote scoring", () => {
  assert.doesNotMatch(remedy, /evidenceCounts/);
  assert.doesNotMatch(remedy, /rankEvidence/);
  assert.doesNotMatch(remedy, /counts\./);
  assert.doesNotMatch(remedy, />=\s*3/);
  assert.doesNotMatch(remedy, /\+=\s*[12]/);
  assert.doesNotMatch(remedy, /由強到弱/);
});

test("structural remedy requires month-command or exposed-and-rooted anchoring", () => {
  assert.match(remedy, /item\.monthCommand \|\| \(item\.visible && item\.rooted\)/);
  assert.match(remedy, /killAtMonthCommand \|\| \(killVisible && killRooted\)/);
  assert.match(remedy, /有路[^\n]*有效流通/);
});


test("EC-7 and the universal subgroup mainline are bound into runtime", () => {
  assert.match(runtime, /資料校驗/);
  assert.match(runtime, /從化真假／特殊格/);
  assert.match(runtime, /PK-6 偏枯病藥 Gate/);
  assert.match(runtime, /ODL（是否有路）/);
  assert.match(runtime, /FC（流通結果）/);
  assert.match(runtime, /LBX 四軸/);
  assert.match(runtime, /事件性質/);
  assert.match(runtime, /六親定位/);
  assert.match(runtime, /流月窗口/);
  assert.match(runtime, /可信度／依據/);
  assert.match(runtime, /白話輸出/);
  assert.match(instructionBase, /ZW-BAZI-GROUP-MAINLINE-EC7/);
  assert.match(instructionBase, /已完成／壓縮沿用／N\/A／受阻／降級/);
  assert.match(instructionBase, /氣勢集中只是「主軸可能更明顯」/);
  assert.match(instructionBase, /雙強相戰只是結構張力訊號/);
  assert.match(instructionBase, /中和不等於五行平均/);
  assert.match(instructionBase, /缺項不等於病、補項不等於藥/);
  assert.match(instructionBase, /通關只在兩神真實相戰/);
  assert.match(runtime, /跑步屬木、游泳屬水、重量訓練屬金/);
  assert.match(p3, /P3-15｜EC-7/);
  assert.match(p3, /P3-16｜所有分組統一主分析流程/);
});
