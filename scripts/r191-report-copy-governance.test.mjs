import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const root = new URL("../", import.meta.url);
const source = (path) => readFile(new URL(path, root), "utf8");

test("r191 customer report no longer exposes prompt-like dashboard labels", async () => {
  const paid = await source("src/components/paid-report-pages.tsx");
  const result = await source("src/components/result-view.tsx");
  const narrative = await source("src/lib/report/personal-narrative.ts");
  for (const forbidden of [
    "ZHAOWU · PERSONAL ANALYSIS",
    "YOUR QUESTION",
    "The answer first",
    "Chart basics",
    "Reasoning notes",
    "ZHAOWU · ONE CHART, ONE SCENE",
    "畫面如何反查命局",
    "画面如何反查命局",
  ]) {
    assert.ok(!paid.includes(forbidden), `paid report leaked: ${forbidden}`);
    assert.ok(!result.includes(forbidden), `result view leaked: ${forbidden}`);
    assert.ok(!narrative.includes(forbidden), `narrative leaked: ${forbidden}`);
  }
});

test("r191 R6.2.2 is governance current while deterministic runtime stays explicit", async () => {
  const agents = await source("AGENTS.md");
  const registry = await source("docs/INSTRUCTION-REGISTRY.md");
  const master = await source("docs/STONE-R6.2.2-CURRENT-MASTER.md");
  assert.match(agents, /STONE-R6\.2\.2-CURRENT-MASTER\.md/);
  assert.match(registry, /CURRENT_GOVERNANCE_MASTER/);
  assert.match(master, /R6\.2\.2 CURRENT GOVERNANCE MASTER \+ R6\.2\.1 deterministic runtime \+ P2 \+ P3/);
  assert.match(master, /原局定結構 → 大運給場 → 流年觸發 → 流月縮窗/);
});
