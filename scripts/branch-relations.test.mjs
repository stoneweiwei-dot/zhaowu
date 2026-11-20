import assert from "node:assert/strict";
import { test } from "node:test";
import { analyzeBranchRelations, isTombBranch } from "../src/lib/bazi/branch-relations.ts";

function points(branches) {
  return branches.map((branch, index) => ({ id: `p${index}`, branch, source: "natal", label: `柱${index + 1}` }));
}

function labels(branches) {
  return analyzeBranchRelations(points(branches)).map((relation) => relation.label);
}

test("branch relation library covers all six combinations, clashes and harms", () => {
  for (const [a, b] of [["子","丑"],["寅","亥"],["卯","戌"],["辰","酉"],["巳","申"],["午","未"]]) {
    assert.ok(labels([a, b]).some((label) => label.includes("六合")), `${a}${b} should be 六合`);
  }
  for (const [a, b] of [["子","午"],["丑","未"],["寅","申"],["卯","酉"],["辰","戌"],["巳","亥"]]) {
    assert.ok(labels([a, b]).some((label) => label.includes("六沖")), `${a}${b} should be 六沖`);
  }
  for (const [a, b] of [["子","未"],["丑","午"],["寅","巳"],["卯","辰"],["申","亥"],["酉","戌"]]) {
    assert.ok(labels([a, b]).some((label) => label.includes("六害")), `${a}${b} should be 六害`);
  }
});

test("punishment, self-punishment, breaking, three-combination and three-meeting are explicit", () => {
  assert.ok(labels(["子", "卯"]).some((label) => label.includes("相刑")));
  assert.ok(labels(["寅", "巳", "申"]).filter((label) => label.includes("相刑")).length >= 3);
  assert.ok(labels(["丑", "戌", "未"]).filter((label) => label.includes("相刑")).length >= 3);
  for (const branch of ["辰", "午", "酉", "亥"]) {
    assert.ok(labels([branch, branch]).some((label) => label.includes("自刑")), `${branch}${branch} should self-punish`);
  }
  assert.ok(labels(["子", "酉"]).some((label) => label.includes("相破")));
  assert.ok(labels(["申", "子", "辰"]).some((label) => label.includes("三合水局條件")));
  assert.ok(labels(["寅", "卯", "辰"]).some((label) => label.includes("三會木局條件")));
});

test("Stone-style 辰酉加雙辰 is not flattened into a single relation", () => {
  const relationLabels = labels(["辰", "酉", "辰", "寅"]);
  assert.ok(relationLabels.some((label) => label.includes("辰酉六合")));
  assert.ok(relationLabels.some((label) => label.includes("辰辰自刑")));
  assert.equal(isTombBranch("辰"), true);
  assert.equal(isTombBranch("酉"), false);
});
