import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { test } from "node:test";

const root = new URL("../", import.meta.url);

async function source(path) {
  return readFile(new URL(path, root), "utf8");
}

test("owner console exposes one final answer and dynamic report sections", async () => {
  const account = await source("src/routes/account.tsx");
  assert.match(account, /storedReportSections/);
  assert.match(account, /最终答案来源：保存版本，不重新计算|最終答案來源：保存版本，不重新計算/);
  assert.match(account, /完整报告完成|完整報告完成/);
  assert.doesNotMatch(account, /"九頁完成"|"九页完成"|"完整／九頁"|"完整／九页"/);
  assert.doesNotMatch(account, /pages\.length === 9/);
});

test("legacy ninePages storage key is read only as compatibility, not product structure", async () => {
  const account = await source("src/routes/account.tsx");
  assert.match(account, /record\.reportSections \?\? record\.sections \?\? record\.ninePages/);
  assert.match(account, /old key is read only as storage compatibility/);
});
