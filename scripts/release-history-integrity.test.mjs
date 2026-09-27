import assert from "node:assert/strict";
import { readdir, readFile } from "node:fs/promises";
import test from "node:test";

const root = new URL("../", import.meta.url);
const reportsDir = new URL("../docs/change-reports/", import.meta.url);

test("r210 release audit backfills only releases proven by Git history", async () => {
  const names = await readdir(reportsDir);
  const required = [71,72,73,74,75,76,77,93,121,124,128,143,172,195,202];
  for (const n of required) {
    assert.ok(names.some((name) => new RegExp(`-r${n}\\.md$`).test(name)), `missing audited r${n} backfill`);
  }
  assert.equal(names.some((name) => /-r59\.md$/.test(name)), false, "r59 has no proven release commit and must not be fabricated");
});

test("r210 active truth is evidence-backed, not report-only", async () => {
  const ownerClient = await readFile(new URL("../src/lib/owner-data-client.ts", import.meta.url), "utf8");
  const current = await readFile(new URL("../docs/CURRENT-STATE.md", import.meta.url), "utf8");
  const registry = await readFile(new URL("../docs/INSTRUCTION-REGISTRY.md", import.meta.url), "utf8");
  const stats = await readFile(new URL("../src/lib/site-stats.ts", import.meta.url), "utf8");

  assert.match(ownerClient, /authorization: `Bearer \$\{SUPABASE_KEY\}`/);
  assert.match(ownerClient, /"x-signature": signedUploadToken/);
  assert.doesNotMatch(ownerClient, /authorization: `Bearer \$\{signedUploadToken\}`/);
  assert.match(current, /每個本地日曆日最多播放一次/);
  assert.match(registry, /2026-09-27 r208 命理核心最後一次收口/);
  assert.match(stats, /ZW-WEB-2026\.09\.27-r210/);
  assert.match(stats, /updateNumber: 210/);
});
