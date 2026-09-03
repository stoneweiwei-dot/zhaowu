import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { buildReportVisualModel } from "../src/lib/report/report-visual-model.ts";

const source = async (path) => readFile(new URL(`../${path}`, import.meta.url), "utf8");

const chart = {
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
  drain: ["金", "水"],
  usefulProvisional: false,
  dayun: [],
  currentDayun: null,
  currentYear: "丙午",
  taiyuan: "",
  minggong: "",
  provenance: "test",
};

test("report visual model maps verified chart fields to deterministic mother-image keys", () => {
  const model = buildReportVisualModel(chart, "zh-Hant");
  assert.equal(model.dayMaster.visualKey, "ren-water");
  assert.equal(model.dayMaster.imagePath, "/report-visuals/day-master/ren-water.webp");
  assert.equal(model.season.visualKey, "you-autumn");
  assert.equal(model.season.startTerm, "白露");
  assert.equal(model.season.endTerm, "寒露");
  assert.equal(model.elements.rows.length, 5);
  assert.equal(model.elements.rows.find((row) => row.element === "金")?.percent, 37);
  assert.equal(model.elements.useful, "土");
});

test("English visual layer stays plain-language while keeping the same data", () => {
  const model = buildReportVisualModel(chart, "en");
  assert.equal(model.dayMaster.title, "Core pattern · Water");
  assert.doesNotMatch(model.dayMaster.title, /Day Master/i);
  assert.equal(model.season.seasonLabel, "mid autumn");
  assert.equal(model.elements.rows.reduce((sum, row) => sum + row.percent, 0), 100);
});

test("provisional useful-element output is visibly marked as provisional", () => {
  const model = buildReportVisualModel({ ...chart, usefulProvisional: true }, "zh-Hant");
  assert.equal(model.elements.provisional, true);
  assert.match(model.elements.note, /暫定/);
});

test("Phase 1 UI is programmatic and does not revive numbered multi-session report pages", async () => {
  const component = await source("src/components/report-visual-book.tsx");
  const model = await source("src/lib/report/report-visual-model.ts");
  const report = await source("src/components/paid-report-pages.tsx");
  const css = await source("src/report-visual-book.css");

  assert.match(component, /<svg className="zhaowu-five-wheel"/);
  assert.match(model, /\/report-visuals\/day-master\//);
  assert.match(model, /\/report-visuals\/month\//);
  assert.match(component, /wallpaper-song\.jpg/);
  assert.match(component, /structurePending/);
  assert.doesNotMatch(component, /01|02|03|ninePages/);
  assert.match(report, /<ReportVisualBook result=\{result\}/);
  assert.match(css, /max-width: 430px/);
  assert.match(css, /overflow-x: auto/);
});
