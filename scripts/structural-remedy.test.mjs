import assert from "node:assert/strict";
import { test } from "node:test";
import { analyzeStructuralRemedy } from "../src/lib/bazi/structural-remedy.ts";

function pillar(key, gan, zhi) {
  return { key, label: key, gan, zhi, ganZhi: `${gan}${zhi}`, ready: true };
}

test("weak chart with officer pressure and seal gets an explicit 官殺→印→身 bridge", () => {
  const chart = {
    dayMaster: "壬",
    strength: { tendency: "偏弱" },
    pillars: [
      pillar("year", "戊", "辰"),
      pillar("month", "戊", "戌"),
      pillar("day", "壬", "子"),
      pillar("time", "辛", "酉"),
    ],
  };
  const result = analyzeStructuralRemedy(chart);
  assert.equal(result.status, "clear");
  assert.match(result.disease, /官殺壓身/);
  assert.equal(result.bridge, "官殺 → 印 → 日主");
  assert.match(result.medicine, /印星承接官殺/);
});

test("strong resource-peer concentration is treated as a structural blockage, not element supplementation", () => {
  const chart = {
    dayMaster: "壬",
    strength: { tendency: "偏旺" },
    pillars: [
      pillar("year", "庚", "申"),
      pillar("month", "辛", "酉"),
      pillar("day", "壬", "亥"),
      pillar("time", "壬", "子"),
    ],
  };
  const result = analyzeStructuralRemedy(chart);
  assert.match(result.disease, /印比偏聚/);
  assert.doesNotMatch(result.medicine, /補金|补金|補水|补水|缺什麼補什麼|缺什么补什么/);
  assert.match(result.evidence.join(" "), /不作百分比喜忌/);
});
