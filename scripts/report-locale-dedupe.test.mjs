import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { test } from "node:test";

const root = new URL("../", import.meta.url);
async function source(path) { return readFile(new URL(path, root), "utf8"); }

test("report UI has only one plain-language answer-first flow and body-attention presentation for new reports", async () => {
  const renderer = await source("src/components/paid-report-pages.tsx");
  for (const title of ["問題", "答案", "身體提醒", "问题", "身体提醒", "Question", "Answer", "Body notes"]) {
    assert.match(renderer, new RegExp(title));
  }
  for (const removed of ["你這次問的是", "先給答案", "你这次问的是", "先给答案", "What you asked", "The answer first", "Reasoning notes", "Chart basics"]) {
    assert.doesNotMatch(renderer, new RegExp(removed));
  }
  assert.match(renderer, /continuousReportContent/);
  assert.match(renderer, /sections\.flatMap\(\(section\) => section\.body \?\? \[\]\)/);
  assert.match(renderer, /uniqueLines/);
  assert.match(renderer, /supportingSummary\.map/);
  assert.match(renderer, /content\.body\.map/);
  assert.match(renderer, /function PrioritySummary/);
  assert.match(renderer, /zhaowu-report-priority/);
  assert.match(renderer, /zhaowu-report-method-notes/);
  assert.match(renderer, /\.slice\(0, 3\)/);
  assert.doesNotMatch(renderer, /padStart\(2, "0"\)/);
  assert.doesNotMatch(renderer, /REPORT_ORNAMENTS|ReportDragonSticker/);
});
