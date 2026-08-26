import assert from "node:assert/strict";
import { existsSync, statSync } from "node:fs";
import test from "node:test";
import { fileURLToPath } from "node:url";
import {
  TEA_CATALOG,
  recommendGuardianFromChart,
  recommendTea,
  teaQuizComplete,
} from "../src/lib/tea-guardian.ts";

const chart = {
  pillars: [], dayMaster: "壬", dayMasterElement: "水", monthBranch: "子", lunarDate: "", civilStamp: "", trueSolarStamp: "", timezone: "Australia/Sydney", cityLabel: "Sydney", liveCityLabel: "Sydney", longitude: 151.2, hemisphere: "S", ziPolicy: "midnight", usedTrueSolar: true, timeUnknown: false, gender: "male",
  elements: { 木: 1, 火: 1, 土: 1, 金: 1, 水: 1 }, elementPercents: { 木: 20, 火: 20, 土: 20, 金: 20, 水: 20 },
  strength: { tendency: "偏強", summary: "", deLing: true, deDi: false, deShi: true }, useful: ["火", "土"], drain: ["水"], usefulProvisional: true, dayun: [], currentDayun: null, currentYear: "", taiyuan: "", minggong: "", provenance: "test",
};

const completeAnswers = {
  aroma: "roast", body: "full", bite: "strong", warmth: "warm", caffeine: "robust", moment: "afterMeal", intention: "comfort",
};

test("tea guardian catalog contains only real, deployable artwork entries", () => {
  assert.equal(TEA_CATALOG.length, 16);
  assert.equal(new Set(TEA_CATALOG.map((tea) => tea.id)).size, TEA_CATALOG.length);
  assert.equal(new Set(TEA_CATALOG.map((tea) => tea.image)).size, TEA_CATALOG.length);
  for (const tea of TEA_CATALOG) {
    assert.match(tea.image, /^\/tea-guardians\/[a-z0-9-]+\.webp$/);
    const path = fileURLToPath(new URL(`../public${tea.image}`, import.meta.url));
    assert.equal(existsSync(path), true, `${tea.id} artwork is missing`);
    assert.ok(statSync(path).size > 50_000, `${tea.id} artwork is unexpectedly small`);
  }
});

test("all seven quiz answers are required", () => {
  assert.equal(teaQuizComplete({ ...completeAnswers }), true);
  const incomplete = { ...completeAnswers };
  delete incomplete.intention;
  assert.equal(teaQuizComplete(incomplete), false);
});

test("quiz returns taste, current-state and optional chart matches deterministically", () => {
  const first = recommendTea(completeAnswers, chart);
  const second = recommendTea(completeAnswers, chart);
  assert.equal(first.taste.id, second.taste.id);
  assert.equal(first.current.id, second.current.id);
  assert.equal(first.guardian?.id, second.guardian?.id);
  assert.ok(first.guardian);
  assert.ok(first.chartEvidence.length >= 2);
});

test("standalone quiz works without a chart and never fabricates a chart guardian", () => {
  const result = recommendTea(completeAnswers, null);
  assert.ok(result.taste);
  assert.ok(result.current);
  assert.equal(result.guardian, null);
  assert.deepEqual(result.chartEvidence, []);
});

test("report-only chart recommendation is available without quiz answers", () => {
  const result = recommendGuardianFromChart(chart);
  assert.ok(result.guardian);
  assert.ok(result.chartEvidence.some((line) => line["zh-Hant"].includes("月令")));
});
