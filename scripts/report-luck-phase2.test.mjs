import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { buildReportLuckModel } from "../src/lib/report/report-luck-model.ts";

const source = async (path) => readFile(new URL(`../${path}`, import.meta.url), "utf8");

const baseChart = {
  pillars: [],
  dayMaster: "壬",
  dayMasterElement: "水",
  monthBranch: "酉",
  lunarDate: "",
  civilStamp: "",
  trueSolarStamp: "",
  timezone: "Australia/Sydney",
  cityLabel: "Sydney",
  liveCityLabel: null,
  longitude: 151.2,
  hemisphere: "S",
  ziPolicy: "midnight",
  usedTrueSolar: true,
  timeUnknown: false,
  gender: "male",
  elements: { 木: 10, 火: 20, 土: 19, 金: 37, 水: 14 },
  elementPercents: { 木: 10, 火: 20, 土: 19, 金: 37, 水: 14 },
  strength: { tendency: "身強", summary: "", deLing: true, deDi: true, deShi: false },
  useful: ["土"],
  drain: ["金"],
  usefulProvisional: false,
  dayun: [
    { ganZhi: "甲子", startYear: 2000, endYear: 2009, startAge: 12, endAge: 21, current: false },
    { ganZhi: "乙丑", startYear: 2010, endYear: 2019, startAge: 22, endAge: 31, current: true },
    { ganZhi: "丙寅", startYear: 2020, endYear: 2029, startAge: 32, endAge: 41, current: false },
  ],
  currentDayun: { ganZhi: "乙丑", startYear: 2010, endYear: 2019, startAge: 22, endAge: 31, current: true },
  currentYear: "丙午",
  taiyuan: "",
  minggong: "",
  provenance: "test",
};

test("timing map uses exact calculated period boundaries and current year", () => {
  const model = buildReportLuckModel(baseChart, "zh-Hant");
  assert.equal(model.periods.length, 3);
  assert.deepEqual(model.current, { ganZhi: "乙丑", startYear: 2010, endYear: 2019, startAge: 22, endAge: 31, current: true });
  assert.equal(model.annualStemBranch, "丙午");
  assert.equal(model.timingAvailable, true);
});

test("unknown birth time keeps long-period timing unconfirmed instead of guessing", () => {
  const chart = { ...baseChart, timeUnknown: true, dayun: [], currentDayun: null };
  const model = buildReportLuckModel(chart, "zh-Hant");
  assert.equal(model.timingAvailable, false);
  assert.equal(model.current, null);
  assert.match(model.unknownTimeNote ?? "", /時辰未知/);
});

test("English timing map stays plain language", () => {
  const model = buildReportLuckModel(baseChart, "en");
  assert.equal(model.title, "Timing map");
  assert.equal(model.currentLabel, "Current period");
  assert.doesNotMatch(`${model.title} ${model.subtitle}`, /luck cycle|day master|bazi/i);
});

test("Phase 2 renders actual calculated periods and never substitutes generic life-stage labels", async () => {
  const component = await source("src/components/report-luck-book.tsx");
  const report = await source("src/components/paid-report-pages.tsx");
  const css = await source("src/report-luck-book.css");

  assert.match(component, /model\.periods\.map/);
  assert.match(component, /period\.startYear/);
  assert.match(component, /period\.endYear/);
  assert.match(component, /model\.unknownTimeNote/);
  assert.doesNotMatch(component, /少年|青年|立業|立业|轉折|转折|成熟/);
  assert.match(report, /<ReportLuckBook result=\{result\}/);
  assert.match(css, /overflow-x: auto/);
  assert.match(css, /max-width: 430px/);
});
