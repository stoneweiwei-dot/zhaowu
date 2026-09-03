import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

const source = async (path) => readFile(new URL(`../${path}`, import.meta.url), "utf8");

test("direct-answer report flow stays ahead of every visual reading layer", async () => {
  const report = await source("src/components/paid-report-pages.tsx");
  const flow = report.indexOf('<div className="zhaowu-report-flow">');
  const visual = report.indexOf("<ReportVisualBook result={result}");
  const luck = report.indexOf("<ReportLuckBook result={result}");
  const share = report.indexOf("<ReportShareCard result={result}");

  assert.ok(flow >= 0, "report flow must exist");
  assert.ok(visual > flow, "命之書 must not appear before the direct-answer report");
  assert.ok(luck > flow, "運之書 must not appear before the direct-answer report");
  assert.ok(share > flow, "share card must not appear before the direct-answer report");
  assert.ok(visual < luck && luck < share, "visual layers keep the approved reading order");
});
