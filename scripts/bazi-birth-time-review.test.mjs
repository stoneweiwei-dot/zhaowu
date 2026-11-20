import assert from "node:assert/strict";
import { test } from "node:test";

const { buildChart } = await import("../src/lib/bazi/chart.ts");

const AUCKLAND = {
  name: "Auckland",
  country: "New Zealand",
  display: "Auckland, New Zealand",
  latitude: -36.8509,
  longitude: 174.75,
  timezone: "Pacific/Auckland",
};

function input(over = {}) {
  return {
    question: "校验出生时柱",
    year: 1996,
    month: 10,
    day: 14,
    hour: 11,
    minute: 55,
    timeUnknown: false,
    gender: "male",
    relation: "unset",
    city: AUCKLAND,
    liveCity: null,
    ziPolicy: "midnight",
    useTrueSolar: true,
    ...over,
  };
}

test("Auckland 1996-10-14 11:55: true-solar correction keeps both 巳/午 candidates for verification", () => {
  const chart = buildChart(input());
  const time = chart.pillars.find((pillar) => pillar.key === "time");

  assert.equal(chart.civilStamp, "1996-10-14 11:55");
  assert.equal(chart.trueSolarStamp, "1996-10-14 10:48");
  assert.equal(time?.ganZhi, "己巳");
  assert.equal(chart.birthTimeReview.status, "needs-verification");
  assert.equal(chart.birthTimeReview.required, true);
  assert.equal(chart.birthTimeReview.crossesShichenBoundary, true);
  assert.equal(chart.birthTimeReview.crossesDayBoundary, false);
  assert.equal(chart.birthTimeReview.reason, "true-solar-crosses-shichen");
  assert.equal(chart.birthTimeReview.civil?.dayGanZhi, "甲申");
  assert.equal(chart.birthTimeReview.civil?.timeGanZhi, "庚午");
  assert.equal(chart.birthTimeReview.trueSolar?.dayGanZhi, "甲申");
  assert.equal(chart.birthTimeReview.trueSolar?.timeGanZhi, "己巳");
  assert.match(chart.provenance, /候選.*庚午.*己巳|候选.*庚午.*己巳/);
});

test("no boundary crossing: verification stays off and does not invent a second chart", () => {
  const chart = buildChart(input({ hour: 10, minute: 30 }));
  assert.equal(chart.birthTimeReview.required, false);
  assert.equal(chart.birthTimeReview.status, "not-needed");
});

test("unknown birth time: verification stays off", () => {
  const chart = buildChart(input({ timeUnknown: true, hour: 12, minute: 0 }));
  assert.equal(chart.birthTimeReview.required, false);
  assert.equal(chart.birthTimeReview.civil, null);
  assert.equal(chart.birthTimeReview.trueSolar, null);
});
