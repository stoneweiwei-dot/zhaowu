import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const practical = readFileSync("src/lib/report/practical-cultivation-advice.ts", "utf8");
const mindAdvice = readFileSync("src/lib/report/mind-advice.ts", "utf8");
const intake = readFileSync(
  "docs/research/2026-09-04-deepseek-cultivation-practical-guidance.md",
  "utf8",
);
const { buildPracticalCultivationAdviceLines } = await import(
  "../src/lib/report/practical-cultivation-advice.ts"
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

test("all six practical themes can be hit by explicit real-world questions", () => {
  const cases = [
    ["我一直替家人承担后果，善良是不是也要有边界？", /善良缺少边界/],
    ["我知道自己拖延但总是改不了，怎么做具体计划？", /知道问题不等于已经改变/],
    ["我做了很多仪式和念经，为什么修行还是容易怨恨？", /真正要修的不是形式/],
    ["最近一直受阻又被拒绝，这种逆境我该怎么看？", /把逆境当成照见反应模式的镜子/],
    ["我很怕失去这段关系，控制欲和占有越来越强怎么办？", /先分清珍惜、需要与控制/],
    ["我什么都怪自己，但明明也有制度问题和外在条件。", /只向内反省/],
  ];

  for (const [question, expected] of cases) {
    const lines = buildPracticalCultivationAdviceLines({
      question,
      locale: "zh-Hans",
      reading: { kind: "self" },
    });
    assert.ok(lines?.length);
    assert.ok(lines.length <= 2);
    assert.match(lines.join("\n"), expected);
  }
});

test("generic questions do not get practical guidance unless a trigger is present", () => {
  const generic = buildPracticalCultivationAdviceLines({
    question: "这段感情还要不要继续？",
    locale: "zh-Hans",
    reading: { kind: "love" },
  });
  assert.equal(generic, null);
});
