import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const root = new URL("../", import.meta.url);
const source = (path) => readFile(new URL(path, root), "utf8");

test("r184 restores a one-time home intro without making it a report-route dependency", async () => {
  const shell = await source("src/components/site-shell.tsx");
  const policy = await source("src/lib/intro-gate-policy.ts");
  assert.match(shell, /import \{ IntroGate \}/);
  assert.match(shell, /\{isHome \? <IntroGate \/> : null\}/);
  assert.match(policy, /zhaowu\.intro\.seen\.public\.v1/);
  assert.match(policy, /storage\?\.getItem\(INTRO_SEEN_KEY\) === "1"/);
  assert.match(policy, /INTRO_GATE_HARD_EXIT_MS/);
});

test("r184 keeps the primary answer clear of reasoning metadata", async () => {
  const result = await source("src/components/result-view.tsx");
  const primaryStart = result.indexOf('<article className="zhaowu-result-card');
  const evidenceStart = result.indexOf('<details className="zhaowu-result-evidence');
  const primary = result.slice(primaryStart, evidenceStart);
  const evidence = result.slice(evidenceStart);
  assert.doesNotMatch(primary, /data-answer-meta/);
  assert.match(primary, /data-primary-answer/);
  assert.match(primary, /data-next-action/);
  assert.match(evidence, /data-answer-meta/);
  assert.match(result, /查看補充重點/);
  assert.match(result, /判斷備註/);
});

test("r184 limits prominent report support and moves reasoning to bottom notes", async () => {
  const report = await source("src/components/paid-report-pages.tsx");
  assert.match(report, /function PrioritySummary/);
  assert.match(report, /\.slice\(0, 3\)/);
  assert.match(report, /zhaowu-report-method-notes/);
  assert.match(report, /<ChartSnapshot result=\{result\}/);
  assert.match(report, /<EvidenceGovernancePanel result=\{result\}/);
  assert.doesNotMatch(report, /<DecisionCards result=/);
});

test("r184 night mode establishes a readable text contrast floor", async () => {
  const css = await source("src/zhaowu-design-system.css");
  assert.match(css, /html\[data-zw-theme="night"\] \{[\s\S]*--zw-ink-soft: #e2d7c4/);
  assert.match(css, /\.text-ink-mute[\s\S]*color: #c6b9a4 !important/);
  assert.match(css, /opacity: 1 !important/);
});
