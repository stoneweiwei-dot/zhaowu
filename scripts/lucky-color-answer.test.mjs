import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const root = new URL("../", import.meta.url);
const source = (path) => readFile(new URL(path, root), "utf8");

test("lucky-colour questions bypass generic structure copy and answer from chart colour data", async () => {
  const hotfix = await source("src/lib/report/customer-answer-hotfix.ts");
  const finalReading = await source("src/lib/report/final-reading.ts");

  assert.match(hotfix, /LUCKY_COLOR_RE/);
  assert.match(hotfix, /幸運色\|幸运色/);
  assert.match(hotfix, /reading\.guide\.colors/);
  assert.match(hotfix, /COLOR_OF_ELEMENT\[primaryElement\]/);
  assert.match(hotfix, /先给颜色/);
  assert.match(hotfix, /五行缺什么补什么/);
  assert.match(hotfix, /if \(LUCKY_COLOR_RE\.test\(question\)\) return luckyColorReading/);
  assert.match(finalReading, /applyCustomerAnswerHotfix\(question, chart, contracted, locale\)/);
});
