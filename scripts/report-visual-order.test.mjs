import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

const source = async (path) => readFile(new URL(`../${path}`, import.meta.url), "utf8");

test("prominent supporting points stay ahead of the collapsed visual and reasoning layer", async () => {
  const report = await source("src/components/paid-report-pages.tsx");
  const priorityCall = report.indexOf("<PrioritySummary result={result}");
  const shareCall = report.indexOf("<ReportShareCard result={result}");
  const notesCall = report.indexOf("<AnalysisNotes result={result}");
  const notesDefinition = report.indexOf("function AnalysisNotes");
  const chart = report.indexOf("<ChartSnapshot result={result}", notesDefinition);
  const visual = report.indexOf("<ReportVisualBook result={result}", notesDefinition);
  const luck = report.indexOf("<ReportLuckBook result={result}", notesDefinition);
  const governance = report.indexOf("<EvidenceGovernancePanel result={result}", notesDefinition);

  assert.ok(priorityCall >= 0, "priority summary must exist");
  assert.ok(shareCall > priorityCall && notesCall > shareCall, "collapsed reasoning notes stay at the bottom");
  assert.ok(notesDefinition >= 0 && chart > notesDefinition, "chart stays inside reasoning notes");
  assert.ok(visual > chart, "命之書 stays after the technical chart inside notes");
  assert.ok(luck > visual, "運之書 stays after the visual book inside notes");
  assert.ok(governance > luck, "evidence governance closes the reasoning layer");
});
