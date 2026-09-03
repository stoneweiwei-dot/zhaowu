import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const practical = readFileSync("src/lib/report/practical-cultivation-advice.ts", "utf8");
const mindAdvice = readFileSync("src/lib/report/mind-advice.ts", "utf8");
const intake = readFileSync(
  "docs/research/2026-09-04-deepseek-cultivation-practical-guidance.md",
  "utf8",
);

test("practical cultivation guidance is report-only and capped", () => {
  assert.match(practical, /ZW-PRACTICAL-CULTIVATION-GUIDANCE-1\.0/);
  assert.match(practical, /sourceLayer: "OWNER_MATERIAL"/);
  assert.match(practical, /\.slice\(0, 2\)/);
  assert.match(practical, /不得把疾病、災禍、貧困/);
  assert.match(practical, /不新增 report session/);
});

test("quarantined supernatural claims do not appear in customer advice copy", () => {
  const adviceOnly = practical.split("guards:")[0];
  for (const forbidden of ["松果體", "天眼", "接靈", "地魂", "乩身", "冤親債主"]) {
    assert.equal(adviceOnly.includes(forbidden), false, `${forbidden} leaked into runtime advice copy`);
  }
});

test("mind advice preserves existing environment priority then practical layer", () => {
  const environmentIndex = mindAdvice.indexOf("buildCultivationEnvironmentAdviceLines(result)");
  const practicalIndex = mindAdvice.indexOf("buildPracticalCultivationAdviceLines(result)");
  const fallbackIndex = mindAdvice.indexOf("advicePack(result)[locale]");

  assert.ok(environmentIndex >= 0);
  assert.ok(practicalIndex > environmentIndex);
  assert.ok(fallbackIndex > practicalIndex);
});

test("source intake explicitly quarantines unsupported metaphysical claims", () => {
  assert.match(intake, /QUARANTINE/);
  assert.match(intake, /PDF 本身不是佛教、道教或民間宗教的一手經典/);
  assert.match(intake, /不修改八字、紫微或任何 deterministic calculation truth/);
});
