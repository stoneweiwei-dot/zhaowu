import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const model = await readFile(new URL("../src/lib/report/evidence-governance.ts", import.meta.url), "utf8");
const panel = await readFile(new URL("../src/components/evidence-governance-panel.tsx", import.meta.url), "utf8");
const report = await readFile(new URL("../src/components/paid-report-pages.tsx", import.meta.url), "utf8");

test("evidence governance keeps explicit A/B/C/D levels and withheld outcomes", () => {
  assert.match(model, /EvidenceLevel = "A" \| "B" \| "C" \| "D"/);
  assert.match(model, /formal-structure-remedy/);
  assert.match(model, /state: "withheld"/);
  assert.match(model, /usefulProvisional/);
});

test("paid report keeps governance inside the collapsed bottom reasoning layer", () => {
  const priorityCall = report.indexOf("<PrioritySummary result={result}");
  const shareCall = report.indexOf("<ReportShareCard result={result}");
  const notesCall = report.indexOf("<AnalysisNotes result={result}");
  const notesDefinition = report.indexOf("function AnalysisNotes");
  const governance = report.indexOf("<EvidenceGovernancePanel", notesDefinition);
  assert.ok(priorityCall >= 0 && shareCall > priorityCall && notesCall > shareCall);
  assert.ok(notesDefinition >= 0 && governance > notesDefinition);
  assert.match(report, /zhaowu-report-method-notes/);
  assert.match(panel, /NEXUS|證據治理|证据治理|EVIDENCE GOVERNANCE/);
});
