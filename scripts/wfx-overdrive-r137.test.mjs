import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

async function source(path) {
  return readFile(new URL(`../${path}`, import.meta.url), "utf8");
}

test("WFX interpretation guards prevent count-based and stereotype shortcuts", async () => {
  const contract = await source("docs/specs/WFX-FIVE-ELEMENT-STRENGTH-OVERDRIVE-v1.0.md");
  const quiz = await source("src/lib/five-element-overdrive-quiz.ts");
  assert.match(contract, /不是八字命理正式判斷/);
  assert.match(contract, /不做「缺什麼補什麼」/);
  assert.match(contract, /並列最高分時保留並列/);
  assert.doesNotMatch(quiz, /maxScore.*\+\s*1|winner.*first/i);
});

test("Guan Shi Lu publishes the corrected strength-overdrive article", async () => {
  const content = await source("src/lib/guanshi-content.ts");
  assert.match(content, /五行真正的問題，不是你「缺什麼」/);
  assert.match(content, /十神不按「個數」投票/);
  assert.match(content, /月令/);
  assert.match(content, /得地/);
  assert.match(content, /得勢/);
  assert.match(content, /寒暖燥濕/);
  assert.match(content, /不等於正式命理結論/);
});

test("Five-Element Strength Overdrive quiz stays subjective and separate from formal BaZi", async () => {
  const route = await source("src/routes/fun-tests.five-element-overdrive.tsx");
  const contract = await source("docs/specs/WFX-FIVE-ELEMENT-STRENGTH-OVERDRIVE-v1.0.md");
  assert.match(route, /FIVE_ELEMENT_OVERDRIVE_QUESTIONS/);
  assert.match(route, /scoreFiveElementOverdrive/);
  assert.doesNotMatch(route, /supabase/i);
  assert.match(contract, /10 題/);
  assert.match(contract, /並列最高分時保留並列/);
  assert.match(contract, /不建立 Supabase 新表/);
});

test("r137 WFX artifacts remain after later releases", async () => {
  const sw = await source("public/sw.js");
  const report = await source("docs/change-reports/ZW-WEB-2026.09.15-r137.md");
  assert.match(report, /WFX/);
  assert.match(report, /five-element-overdrive/);
  assert.match(sw, /zhaowu-shell-\$\{RELEASE\.slice\(0,\s*16\)\}/);
  assert.match(sw, /ZHAOWU_RELEASE_READY/);
  assert.doesNotMatch(sw, /zhaowu-shell-r1\d+/);
});
