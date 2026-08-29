import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { calculateQizheng, localBirthToUtc } from "../src/lib/qizheng/engine.ts";
import { buildQizhengPlainSummary } from "../src/lib/qizheng/plain-summary.ts";

test("qizheng timezone conversion preserves the civil instant", () => {
  const utc = localBirthToUtc({ year: 2000, month: 1, day: 1, hour: 20, minute: 0, timezone: "Asia/Shanghai" });
  assert.equal(utc.toISOString(), "2000-01-01T12:00:00.000Z");
});

test("qizheng J2000 regression stays within low-precision ephemeris tolerance", () => {
  const chart = calculateQizheng({ year: 2000, month: 1, day: 1, hour: 12, minute: 0, timezone: "UTC" });
  assert.ok(chart);
  const byKey = Object.fromEntries(chart.bodies.map((body) => [body.key, body]));
  const expected = {
    sun: 280.381,
    moon: 223.348,
    mercury: 271.907,
    venus: 241.579,
    mars: 327.976,
    jupiter: 25.273,
    saturn: 40.376,
    ji: 123.925,
    bei: 263.353,
  };
  for (const [key, longitude] of Object.entries(expected)) {
    assert.ok(Math.abs(byKey[key].longitude - longitude) < 0.08, `${key} longitude drifted`);
  }
  assert.ok(Math.abs((((byKey.luo.longitude - byKey.ji.longitude) + 360) % 360) - 180) < 0.001);
});

test("qizheng does not invent a chart when birth time is unknown", () => {
  assert.equal(calculateQizheng({ year: 2000, month: 1, day: 1, hour: 12, minute: 0, timezone: "UTC", timeUnknown: true }), null);
});

test("qizheng lives behind its own homepage gateway instead of inside the main result flow", async () => {
  const home = await readFile(new URL("../src/routes/index.tsx", import.meta.url), "utf8");
  const route = await readFile(new URL("../src/routes/qizheng.tsx", import.meta.url), "utf8");
  assert.match(home, /to: "\/qizheng"/);
  assert.doesNotMatch(home, /<QizhengHomePanel/);
  assert.match(route, /createFileRoute\("\/qizheng"\)/);
  assert.match(route, /buildQizhengPlainSummary/);
  assert.match(route, /qz-report-sections/);
  assert.doesNotMatch(route, /<AnalysisForm|<QizhengHomePanel|qz-wheel/);
});

test("qizheng customer report uses the seven luminaries' own strengths without exposing a chart", () => {
  const chart = calculateQizheng({ year: 2000, month: 1, day: 1, hour: 12, minute: 0, timezone: "UTC" });
  assert.ok(chart);
  const report = buildQizhengPlainSummary(chart, "zh-Hant");
  assert.equal(report.version, "zhaowu_qizheng_plain_summary_v1");
  assert.deepEqual(report.sections.map((section) => section.key), ["temperament", "mind", "relationship", "action", "growth", "habit"]);
  assert.match(report.sections.at(-1).body, /習性會被加強/);
  assert.ok(report.internalEvidence.length >= 7);
  assert.doesNotMatch(report.sections.map((section) => section.body).join(""), /黃經|宮度|回歸黃道|計北羅南/);
});
