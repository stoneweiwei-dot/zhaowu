import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const chart = await readFile(new URL("../src/lib/bazi/chart.ts", import.meta.url), "utf8");
const remedy = await readFile(new URL("../src/lib/bazi/structural-remedy.ts", import.meta.url), "utf8");
const interpret = await readFile(new URL("../src/lib/bazi/interpret.ts", import.meta.url), "utf8");
const instructions = await readFile(new URL("../src/lib/bazi/instruction-database-base.ts", import.meta.url), "utf8");
const shell = await readFile(new URL("../src/components/site-shell.tsx", import.meta.url), "utf8");
const updates = await readFile(new URL("../src/routes/updates.tsx", import.meta.url), "utf8");
const sw = await readFile(new URL("../public/sw.js", import.meta.url), "utf8");

test("R6.2.1 runtime removes count-based strength and provisional useful-element shortcuts", () => {
  assert.doesNotMatch(chart, /helpers\s*>=\s*2/);
  assert.doesNotMatch(chart, /hits\s*>=/);
  assert.doesNotMatch(chart, /function\s+usefulElements\s*\(/);
  assert.match(chart, /const useful: Element\[\] = \[\]/);
  assert.match(chart, /usefulProvisional:\s*true/);
  assert.match(chart, /得令有根，承載偏穩/);
});

test("R6.2.1 structural remedy no longer ranks ten gods by occurrence count", () => {
  assert.doesNotMatch(remedy, /evidenceCounts/);
  assert.doesNotMatch(remedy, /counts\.[a-zA-Z]+\s*>=\s*\d/);
  assert.doesNotMatch(remedy, /rankEvidence/);
  assert.match(remedy, /不按出現次數排名/);
  assert.match(remedy, /月令主氣功能/);
});

test("R6.2.1 interpretation does not choose career or choices by top-count god or binary strength", () => {
  assert.doesNotMatch(interpret, /function\s+countGods/);
  assert.doesNotMatch(interpret, /function\s+topGod/);
  assert.doesNotMatch(interpret, /strength\.tendency\.includes\("旺"\)/);
  assert.match(interpret, /function\s+structuralFocusGod/);
  assert.match(interpret, /目前結構不足以只靠命盤判定/);
});

test("runtime instruction registry is explicitly locked to R6.2.1 governance", () => {
  assert.match(instructions, /ZW-BAZI-R6\.2\.1-GOVERNANCE/);
  assert.match(instructions, /ZW-DIRECT-ANSWER-ROUTING-R6\.2\.1/);
  assert.match(instructions, /禁止事後靜默改口|禁止事后静默改口/);
  assert.match(instructions, /UNKNOWN/);
});

test("public release history is a real route and current PWA shell includes it", () => {
  assert.match(shell, /to="\/updates"/);
  assert.match(shell, /最新版本更新內容/);
  assert.match(updates, /createFileRoute\("\/updates"\)/);
  assert.match(updates, /getPublicReleaseHistory/);
  assert.match(sw, /zhaowu-shell-r131/);
  assert.match(sw, /"\/updates"/);
});
