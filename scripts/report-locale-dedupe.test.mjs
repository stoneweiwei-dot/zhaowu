import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { test } from "node:test";

const root = new URL("../", import.meta.url);
async function source(path) { return readFile(new URL(path, root), "utf8"); }

test("report UI has only one plain-language answer flow and body-attention presentation for new reports", async () => {
  const renderer = await source("src/components/paid-report-pages.tsx");
  for (const title of ["你現在最需要知道的事", "身體需要留意", "你现在最需要知道的事", "身体需要留意", "What matters now", "Body areas to watch"]) {
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
