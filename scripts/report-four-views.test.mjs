import test from "node:test";
import assert from "node:assert/strict";
import { HIDDEN, STEMS, tenGod } from "../src/lib/bazi/calendar.ts";
import {
  buildFamilyFacets,
  buildSeasonalFacet,
  buildShengKeYinYang,
  buildTenGodsPage,
  buildYearlyTable,
} from "../src/lib/report/four-views-model.ts";

// Verified fixture: 1990-06-15 10:30 Sydney male.
// Correct pillars 庚午／壬午／辛亥／癸巳, day master 辛金 (true solar 10:34).
// Ten gods and hidden stems are derived here with the engine's own tenGod(),
// never hand-typed, so the fixture cannot drift from the calendar rules.

const STEM_ELEMENT = "木木火火土土金金水水";

function elementOfStem(stem) {
  return STEM_ELEMENT[STEMS.indexOf(stem)];
}

function makePillar(key, label, gan, zhi, ganZhi, nayin, diShi, xunKong) {
  return {
    key,
    label,
    gan,
    zhi,
    ganZhi,
    nayin,
    shiShenGan: key === "day" ? "日主" : tenGod("辛", gan),
    hide: (HIDDEN[zhi] ?? []).map((stem) => ({
      gan: stem,
      shiShen: tenGod("辛", stem),
      element: elementOfStem(stem),
    })),
    diShi,
    xunKong,
    ganElement: elementOfStem(gan),
    zhiElement: elementOfStem(zhi),
    ready: true,
  };
}

const dayun = [
  { ganZhi: "癸未", startYear: 1997, endYear: 2006, startAge: 8, endAge: 17, current: false },
  { ganZhi: "壬午", startYear: 2007, endYear: 2016, startAge: 18, endAge: 27, current: false },
  { ganZhi: "辛巳", startYear: 2017, endYear: 2026, startAge: 28, endAge: 37, current: true },
  { ganZhi: "庚辰", startYear: 2027, endYear: 2036, startAge: 38, endAge: 47, current: false },
];

const chart = {
  pillars: [
    makePillar("year", "年柱", "庚", "午", "庚午", "路旁土", "病", "戌亥"),
    makePillar("month", "月柱", "壬", "午", "壬午", "楊柳木", "病", "申酉"),
    makePillar("day", "日柱", "辛", "亥", "辛亥", "釵釧金", "沐浴", "寅卯"),
    makePillar("time", "時柱", "癸", "巳", "癸巳", "長流水", "死", "午未"),
  ],
  dayMaster: "辛",
  dayMasterElement: "金",
  monthBranch: "午",
  lunarDate: "庚午年五月廿三",
  civilStamp: "1990-06-15 10:30",
  trueSolarStamp: "1990-06-15 10:34",
  timezone: "Australia/Sydney",
  cityLabel: "雪梨，澳洲",
  liveCityLabel: null,
  longitude: 151.21,
  hemisphere: "S",
  ziPolicy: "late",
  usedTrueSolar: true,
  timeUnknown: false,
  birthTimeReview: {
    status: "not-needed",
    required: false,
    crossesShichenBoundary: false,
    crossesDayBoundary: false,
    reason: null,
    civil: null,
    trueSolar: null,
  },
  gender: "male",
  elements: { 木: 0, 火: 3, 土: 0, 金: 2, 水: 3 },
  elementPercents: { 木: 0, 火: 37, 土: 0, 金: 25, 水: 38 },
  strength: { tendency: "身弱", summary: "fixture", deLing: false, deDi: true, deShi: false },
  useful: ["水"],
  drain: ["火"],
  usefulProvisional: true,
  dayun,
  currentDayun: dayun[2],
  currentYear: "丙午",
  taiyuan: "癸酉",
  minggong: "己丑",
  provenance: "test-fixture",
};

test("family facets: five families in fixed order, evidence only from the chart", () => {
  const facets = buildFamilyFacets(chart);
  assert.equal(facets.length, 5);
  assert.deepEqual(facets.map((item) => item.family), ["比劫", "食傷", "財星", "官殺", "印星"]);
  const officer = facets.find((item) => item.family === "官殺");
  assert.ok(officer.occurrences.some((item) => item.god === "七殺"));
  const wealth = facets.find((item) => item.family === "財星");
  assert.ok(wealth.occurrences.some((item) => item.god === "正財"));
  for (const facet of facets) {
    for (const item of facet.occurrences) {
      assert.ok(["year", "month", "day", "time"].includes(item.pillar));
      assert.ok(["stem", "hidden"].includes(item.placement));
    }
  }
});

test("seasonal facet: summer month, month-command god, provisional", () => {
  const seasonal = buildSeasonalFacet(chart);
  assert.equal(seasonal.season, "夏");
  assert.equal(seasonal.monthBranch, "午");
  assert.equal(seasonal.monthGod, "七殺");
  assert.equal(seasonal.provisional, true);
  assert.deepEqual(seasonal.useful, ["水"]);
});

test("yearly table: current cycle plus next, Lichun year pillars, ten gods, triggers", () => {
  const rows = buildYearlyTable(chart, 2026);
  assert.equal(rows.length, 20);
  assert.equal(rows[0].year, 2017);
  assert.equal(rows[19].year, 2036);
  const row2026 = rows.find((row) => row.year === 2026);
  assert.equal(row2026.ganZhi, "丙午");
  assert.equal(row2026.stemGod, "正官");
  assert.equal(row2026.branchGod, "七殺");
  assert.equal(row2026.dayun, "辛巳");
  assert.equal(row2026.isCurrentYear, true);
  assert.equal(row2026.isCurrentDayun, true);
  assert.ok(row2026.relations.some((item) => item.label.includes("自刑")));
  assert.equal(rows.find((row) => row.year === 2025).ganZhi, "乙巳");
  assert.equal(rows.find((row) => row.year === 2017).ganZhi, "丁酉");
  const row2027 = rows.find((row) => row.year === 2027);
  assert.equal(row2027.ganZhi, "丁未");
  assert.equal(row2027.dayun, "庚辰");
  assert.equal(row2027.isCurrentDayun, false);
});

test("yearly table: no luck cycles, no rows", () => {
  assert.deepEqual(buildYearlyTable({ ...chart, dayun: [], currentDayun: null }, 2026), []);
});

test("ten gods page: four pillars, day master, remedy status, provisional", () => {
  const page = buildTenGodsPage(chart);
  assert.equal(page.pillars.length, 4);
  assert.equal(page.pillars.find((item) => item.key === "day").stemGod, "日主");
  assert.ok(["clear", "provisional", "insufficient"].includes(page.remedy.status));
  assert.equal(typeof page.remedy.disease, "string");
  assert.equal(typeof page.remedy.medicine, "string");
  assert.equal(page.provisional, true);
  assert.deepEqual(page.useful, ["水"]);
});

test("sheng-ke and yin-yang: five nodes, carriers, stem/branch polarity", () => {
  const { nodes, stems, branches } = buildShengKeYinYang(chart);
  assert.equal(nodes.length, 5);
  const metal = nodes.find((item) => item.element === "金");
  assert.equal(metal.generates, "水");
  assert.equal(metal.controls, "木");
  assert.ok(metal.carriers.some((item) => item.pillar === "year" && item.placement === "stem"));
  assert.deepEqual(
    stems.map((item) => `${item.text}${item.yinYang}`),
    ["庚陽", "壬陽", "辛陰", "癸陰"],
  );
  assert.deepEqual(
    branches.map((item) => `${item.text}${item.yinYang}`),
    ["午陽", "午陽", "亥陰", "巳陰"],
  );
});

test("no scores anywhere in the four views output", () => {
  const outputs = [
    buildFamilyFacets(chart),
    buildSeasonalFacet(chart),
    buildYearlyTable(chart, 2026),
    buildTenGodsPage(chart),
    buildShengKeYinYang(chart),
  ];
  const banned = /score|Score|評分|分數|Level|Grade|Index|索引|顯著度/;
  for (const output of outputs) {
    assert.doesNotMatch(JSON.stringify(output), banned);
  }
});
