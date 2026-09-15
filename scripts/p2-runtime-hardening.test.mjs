import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const runtime = await readFile(new URL("../src/lib/bazi/runtime-contract.ts", import.meta.url), "utf8");
const remedy = await readFile(new URL("../src/lib/bazi/structural-remedy.ts", import.meta.url), "utf8");

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
