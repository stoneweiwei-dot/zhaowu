import assert from "node:assert/strict";
import { readdir } from "node:fs/promises";
import test from "node:test";

const reportsDir = new URL("../docs/change-reports/", import.meta.url);

test("closeout keeps all historical release reports proven by Git history", async () => {
  const names = await readdir(reportsDir);
  const required = [71,72,73,74,75,76,77,93,121,124,128,143,172,195,202];
  for (const n of required) {
    assert.ok(names.some((name) => new RegExp(`-r${n}\\.md$`).test(name)), `missing audited r${n} backfill`);
  }
  assert.equal(names.some((name) => /-r59\.md$/.test(name)), false, "r59 has no proven release commit and must not be fabricated");
});
