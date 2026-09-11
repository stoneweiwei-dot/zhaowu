import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";
import {
  ELEMENT_STATE_RULES,
  buildFunctionalTraining,
  mayActivelyTrainElement,
} from "../src/lib/report/five-element-functional-training.ts";
import { buildAuraBlueprint } from "../src/lib/report/aura-chakra-blueprint.ts";
import {
  buildPaidVisualBlueprint,
  canGeneratePaidVisuals,
  preparePaidVisualJobs,
} from "../src/lib/report/paid-visual-blueprint.ts";

function pillar(key, gan, zhi) {
  return { key, label: key, gan, zhi, ganZhi: `${gan}${zhi}`, ready: true, hide: [] };
}

function baseChart(overrides = {}) {
  return {
    dayMaster: "壬",
    dayMasterElement: "水",
    monthBranch: "戌",
    strength: { tendency: "偏弱" },
    pillars: [
      pillar("year", "戊", "辰"),
      pillar("month", "戊", "戌"),
      pillar("day", "壬", "子"),
      pillar("time", "辛", "酉"),
    ],
    usefulProvisional: true,
    timeUnknown: false,
    currentDayun: { ganZhi: "甲子", startYear: 2024, endYear: 2033 },
    ...overrides,
  };
}

test("all six functional states have an explicit action gate", () => {
  assert.deepEqual(Object.keys(ELEMENT_STATE_RULES).sort(), [
    "already_sufficient",
    "apparently_missing_but_not_to_add",
    "beneficial_but_blocked",
    "beneficial_but_insufficient",
    "needs_mother_qi_or_bridging",
    "overactive",
  ].sort());
  assert.equal(mayActivelyTrainElement("beneficial_but_insufficient"), true);
  assert.equal(mayActivelyTrainElement("beneficial_but_blocked"), true);
  assert.equal(mayActivelyTrainElement("already_sufficient"), false);
  assert.equal(mayActivelyTrainElement("overactive"), false);
  assert.equal(mayActivelyTrainElement("apparently_missing_but_not_to_add"), false);
  assert.equal(mayActivelyTrainElement("needs_mother_qi_or_bridging"), false);
});

test("provisional upstream useful-element data stays provisional and never becomes 缺什么补什么", () => {
  const result = buildFunctionalTraining(baseChart(), "zh-Hans");
  assert.equal(result.analysisStatus, "provisional");
  assert.equal(result.selectedElement, "earth");
  assert.equal(result.selectedState, "beneficial_but_blocked");
  const text = JSON.stringify(result);
  assert.doesNotMatch(text, /缺什么补什么|缺什麼補什麼|木\s*\d+%|火\s*\d+%|土\s*\d+%|金\s*\d+%|水\s*\d+%/);
  assert.match(text, /不等同确定喜用神|不以五行百分比/);
});

test("a blocked structural path says support first instead of strengthening the element", () => {
  const chart = baseChart({
    monthBranch: "酉",
    strength: { tendency: "偏旺" },
    pillars: [
      pillar("year", "庚", "申"),
      pillar("month", "辛", "酉"),
      pillar("day", "壬", "亥"),
      pillar("time", "壬", "子"),
    ],
  });
  const result = buildFunctionalTraining(chart, "zh-Hant");
  assert.equal(result.selectedElement, "wood");
  assert.equal(result.selectedState, "needs_mother_qi_or_bridging");
  assert.equal(mayActivelyTrainElement(result.selectedState), false);
  assert.match(result.howToUse[0], /不要加碼|支持|負荷|阻塞/);
});

test("insufficient structure fails closed without assigning a lucky element", () => {
  const chart = baseChart({
    monthBranch: "子",
    strength: { tendency: "中和" },
    pillars: [
      pillar("year", "甲", "寅"),
      pillar("month", "壬", "子"),
      pillar("day", "壬", "辰"),
      pillar("time", "乙", "卯"),
    ],
  });
  const result = buildFunctionalTraining(chart, "en");
  if (result.analysisStatus === "insufficient_data") {
    assert.equal(result.selectedElement, null);
    assert.equal(result.selectedState, null);
    assert.equal(result.howToUse.length, 0);
  } else {
    assert.notEqual(result.freeTextSummary.length, 0);
    assert.doesNotMatch(result.freeTextSummary, /missing element|add more element|lucky element/i);
  }
});

test("aura is symbolic, contains no pseudo-precision and returns no medical claim", () => {
  const training = buildFunctionalTraining(baseChart(), "en");
  const aura = buildAuraBlueprint(training);
  assert.ok(aura);
  assert.equal(aura.symbolicOnly, true);
  const text = JSON.stringify(aura);
  assert.doesNotMatch(text, /\d+%|diagnos|disease|energy measurement/i);
  assert.match(aura.disclaimer, /not a medical test/i);
});

test("free or not-required reports can never prepare image-generation jobs", () => {
  const training = buildFunctionalTraining(baseChart(), "zh-Hant");
  const aura = buildAuraBlueprint(training);
  const freePayment = { tier: "free", paymentStatus: "not_required" };
  assert.equal(canGeneratePaidVisuals(freePayment), false);
  const freeBlueprint = buildPaidVisualBlueprint(training, aura, freePayment);
  assert.equal(freeBlueprint.enabled, false);
  assert.equal(freeBlueprint.elementImage.prompt, null);
  assert.equal(freeBlueprint.auraImage.prompt, null);
  assert.deepEqual(preparePaidVisualJobs(freePayment, freeBlueprint), { generated: false, reason: "PAYMENT_REQUIRED", jobs: [] });
});

test("only an explicit paid tier can prepare the two 9:16 visual jobs", () => {
  const training = buildFunctionalTraining(baseChart(), "zh-Hans");
  const aura = buildAuraBlueprint(training);
  const payment = { tier: "paid_basic", paymentStatus: "paid" };
  const blueprint = buildPaidVisualBlueprint(training, aura, payment);
  assert.equal(blueprint.enabled, true);
  const prepared = preparePaidVisualJobs(payment, blueprint);
  assert.equal(prepared.generated, true);
  assert.equal(prepared.jobs.length, 2);
  assert.ok(prepared.jobs.every((job) => job.aspectRatio === "9:16"));
});

test("customer report renders text-only functional training and imports no image generator", async () => {
  const component = await readFile(new URL("../src/components/five-element-training-block.tsx", import.meta.url), "utf8");
  const report = await readFile(new URL("../src/components/paid-report-pages.tsx", import.meta.url), "utf8");
  assert.match(component, /data-five-element-training/);
  assert.match(component, /data-aura-symbolic/);
  assert.doesNotMatch(component, /generateDecreeImage|images\/edits|OPENAI_API_KEY|image_gen/i);
  assert.match(report, /<FiveElementTrainingBlock result=\{result\} \/>/);
});
