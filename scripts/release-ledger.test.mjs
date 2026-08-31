import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const stats = await readFile(new URL("../src/lib/site-stats.ts", import.meta.url), "utf8");
const shell = await readFile(new URL("../src/components/site-shell.tsx", import.meta.url), "utf8");
const report = await readFile(new URL("../docs/change-reports/ZW-WEB-2026.08.31-r18.md", import.meta.url), "utf8");
const agents = await readFile(new URL("../AGENTS.md", import.meta.url), "utf8");

test("public footer always exposes current release and cumulative update count", () => {
  assert.match(stats, /ZW-WEB-2026\.09\.01-r19/);
  assert.match(stats, /updateNumber:\s*19/);
  assert.match(shell, /data-site-release/);
  assert.match(shell, /累計更新/);
  assert.match(shell, /data-latest-change-report/);
});

test("every production backend change requires a matching change report", () => {
  assert.match(report, /# 昭梧更新報告｜ZW-WEB-2026\.08\.31-r18/);
  assert.match(report, /## 本次改動/);
  assert.match(report, /## 為什麼改/);
  assert.match(report, /## 影響範圍/);
  assert.match(report, /## 回滾/);
  assert.match(agents, /MANDATORY RELEASE LEDGER/);
  assert.match(agents, /docs\/change-reports/);
  assert.match(agents, /release_history/);
});
