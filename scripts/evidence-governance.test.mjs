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

test("paid report surfaces the governance panel before visual and luck books", () => {
  const governance = report.indexOf("<EvidenceGovernancePanel");
  const visual = report.indexOf("<ReportVisualBook");
  const luck = report.indexOf("<ReportLuckBook");
  assert.ok(governance >= 0 && visual > governance && luck > visual);
  assert.match(panel, /NEXUS|證據治理|证据治理|EVIDENCE GOVERNANCE/);
});
