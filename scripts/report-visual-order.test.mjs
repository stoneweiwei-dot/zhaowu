import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

const source = async (path) => readFile(new URL(`../${path}`, import.meta.url), "utf8");

test("full report reads as one sheet: overall summary, body attention, then optional image and notes", async () => {
  const report = await source("src/components/paid-report-pages.tsx");
  const summary = report.indexOf("zhaowu-report-summary-block");
  const body = report.indexOf("<section className=\"zhaowu-report-body-block\">");
  const share = report.indexOf("<ReportShareCard result={result}");
  const notes = report.indexOf("<AnalysisNotes result={result}");
  const notesDefinition = report.indexOf("function AnalysisNotes");
  const chart = report.indexOf("<ChartSnapshot result={result}", notesDefinition);
  const visual = report.indexOf("<ReportVisualBook result={result}", notesDefinition);
  const luck = report.indexOf("<ReportLuckBook result={result}", notesDefinition);
  const governance = report.indexOf("<EvidenceGovernancePanel result={result}", notesDefinition);

  assert.ok(summary >= 0 && body > summary, "body attention follows the continuous overall summary");
  assert.ok(share > body && notes > share, "optional image remains after the text report and notes stay last");
  assert.doesNotMatch(report, /function PrioritySummary|function NarrativePlate|zhaowu-report-priority/);
  assert.ok(notesDefinition >= 0 && chart > notesDefinition, "chart stays inside collapsed notes");
  assert.ok(visual > chart, "命之書 stays after the technical chart inside notes");
  assert.ok(luck > visual, "運之書 stays after the visual book inside notes");
  assert.ok(governance > luck, "evidence governance closes the reasoning layer");
});
