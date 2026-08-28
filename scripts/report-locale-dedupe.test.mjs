import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { test } from "node:test";

const root = new URL("../", import.meta.url);
async function source(path) { return readFile(new URL(path, root), "utf8"); }

test("report UI has only overall summary and body-attention presentation for new reports", async () => {
  const renderer = await source("src/components/paid-report-pages.tsx");
  for (const title of ["總體概括", "身體需要注意", "总体概括", "身体需要注意", "Overall summary", "Body areas to watch"]) {
    assert.match(renderer, new RegExp(title));
  }
  assert.match(renderer, /continuousReportContent/);
  assert.match(renderer, /sections\.flatMap\(\(section\) => section\.body \?\? \[\]\)/);
  assert.match(renderer, /uniqueLines/);
  assert.match(renderer, /content\.summary\.map/);
  assert.match(renderer, /content\.body\.map/);
  assert.doesNotMatch(renderer, /padStart\(2, "0"\)/);
  assert.doesNotMatch(renderer, /REPORT_ORNAMENTS|ReportDragonSticker/);
});
