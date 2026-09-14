import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";
import { classifyMingshuSource, sanitizeChartInput, sanitizeLocationQuery } from "../lib/mingshu-client.js";
import {
  COMPARISON_STATUS,
  SOURCE_KINDS,
  compareZhaowuWithMingshu,
  createChartFingerprint,
  projectZhaowuChart,
} from "../lib/zhaowu-verification.js";

const root = new URL("../", import.meta.url);
const source = (path) => readFile(new URL(path, root), "utf8");

const localChart = {
  pillars: [
    { key: "year", ganZhi: "戊辰", ready: true },
    { key: "month", ganZhi: "辛酉", ready: true },
    { key: "day", ganZhi: "壬辰", ready: true },
    { key: "time", ganZhi: "壬寅", ready: true },
  ],
  dayMaster: "壬",
  monthBranch: "酉",
  strength: { tendency: "偏旺", deLing: true, deDi: true, deShi: true },
  useful: ["水", "金"],
  dayun: [{ ganZhi: "甲子", startYear: 2026, endYear: 2035 }],
};

const mingshuMatch = {
  facts: {
    pillars: [
      { ganZhi: "戊辰" },
      { ganZhi: "辛酉" },
      { ganZhi: "壬辰" },
      { ganZhi: "壬寅" },
    ],
    dayMaster: "壬",
  },
  judgments: {
    strength: { label: "偏旺" },
    useful: ["金", "水"],
  },
  chartDigest: "external-digest",
};

test("chart input follows Mingshu v1 GeoNames and time contracts", () => {
  const bad = sanitizeChartInput({ birthDate: "1988-10-04" });
  assert.equal(bad.ok, false);

  const clock = sanitizeChartInput({
    birthDate: "1988-10-04",
    birthTime: "04:40",
    birthCalendar: "solar",
    gender: "male",
    timeMode: "clock",
    locale: "zh-TW",
    extra: "drop-me",
  });
  assert.equal(clock.ok, true);
  assert.deepEqual(clock.input, {
    birthDate: "1988-10-04",
    birthTime: "04:40",
    birthCalendar: "solar",
    gender: "male",
    timeMode: "clock",
    locale: "zh-TW",
  });

  const solar = sanitizeChartInput({
    birthDate: "1988-10-04",
    birthTime: "04:40",
    birthCalendar: "solar",
    gender: "male",
    timeMode: "true_solar",
    placeId: "geonames:1796236",
    locale: "zh-TW",
  });
  assert.equal(solar.ok, true);
  assert.equal(solar.input.placeId, "geonames:1796236");

  const numericPlace = sanitizeChartInput({
    birthDate: "1988-10-04",
    birthTime: "04:40",
    birthCalendar: "solar",
    gender: "male",
    timeMode: "true_solar",
    placeId: 1796236,
    locale: "zh-TW",
  });
  assert.equal(numericPlace.ok, false);

  const lunarServiceValidated = sanitizeChartInput({
    birthDate: "2023-02-30",
    birthTime: "04:40",
    birthCalendar: "lunar",
    birthLeapMonth: false,
    gender: "male",
    timeMode: "clock",
    locale: "zh-TW",
  });
  assert.equal(lunarServiceValidated.ok, true);
});

test("location discovery query is bounded and locale-aware", () => {
  assert.deepEqual(sanitizeLocationQuery("Sydney", "zh-TW"), {
    ok: true,
    query: "Sydney",
    locale: "zh-TW",
  });
  assert.equal(sanitizeLocationQuery("", "zh-TW").ok, false);
  assert.equal(sanitizeLocationQuery("Sydney", "xx").ok, false);
});

test("mingshu source is labeled as a side channel, not calc truth", () => {
  const sourceMeta = classifyMingshuSource({ chartDigest: "abc" });
  assert.equal(sourceMeta.calcTruth, false);
  assert.equal(sourceMeta.layer, SOURCE_KINDS.SIDE_CHANNEL);
  assert.match(sourceMeta.note, /不得覆蓋/);
});

test("ZW chart fingerprint is stable across presentation/key order and changes with chart facts", () => {
  const a = createChartFingerprint({ chart: localChart, locale: "zh-Hant", reading: { directAnswer: "A" } });
  const reordered = {
    reading: { directAnswer: "completely different prose" },
    chart: {
      dayun: [{ endYear: 2035, startYear: 2026, ganZhi: "甲子" }],
      useful: ["金", "水"],
      strength: { deShi: true, deDi: true, deLing: true, tendency: "偏旺" },
      monthBranch: "酉",
      dayMaster: "壬",
      pillars: localChart.pillars.map((item) => ({ ready: item.ready, ganZhi: item.ganZhi, key: item.key })),
    },
    locale: "en",
  };
  const b = createChartFingerprint(reordered);
  assert.equal(a, b);
  assert.match(a, /^ZW-R6\.2\.1-[A-F0-9]{16}$/);

  const changed = structuredClone(localChart);
  changed.pillars[3].ganZhi = "癸卯";
  assert.notEqual(a, createChartFingerprint(changed));
});

test("cross-engine comparison exposes conflicts without overriding Zhaowu", () => {
  const match = compareZhaowuWithMingshu(localChart, mingshuMatch);
  assert.equal(match.status, COMPARISON_STATUS.MATCH);
  assert.equal(match.overridesBaziCalcTruth, false);
  assert.equal(match.resolution, "ZHAOWU_REMAINS_AUTHORITATIVE");
  assert.equal(match.sources.zhaowu.layer, SOURCE_KINDS.CALC_TRUTH);
  assert.equal(match.sources.mingshu.layer, SOURCE_KINDS.SIDE_CHANNEL);

  const conflictPayload = structuredClone(mingshuMatch);
  conflictPayload.facts.pillars[3].ganZhi = "癸卯";
  conflictPayload.judgments.useful = ["火"];
  const conflict = compareZhaowuWithMingshu(localChart, conflictPayload);
  assert.equal(conflict.status, COMPARISON_STATUS.CONFLICT);
  assert.ok(conflict.checks.some((item) => item.status === COMPARISON_STATUS.CONFLICT));

  const missing = compareZhaowuWithMingshu(localChart, { facts: {} });
  assert.equal(missing.coverage.compared, 0);
  assert.equal(missing.status, COMPARISON_STATUS.UNAVAILABLE);
});

test("fingerprint projection excludes labels, raw birth input, city and prose", () => {
  const projection = projectZhaowuChart({
    chart: {
      ...localChart,
      cityLabel: "Sydney, Australia",
      civilStamp: "1988-10-04 04:40",
      trueSolarStamp: "1988-10-04 04:20",
    },
    question: "private question",
    reading: { directAnswer: "private prose" },
  });
  const serialized = JSON.stringify(projection);
  assert.doesNotMatch(serialized, /Sydney|1988-10-04|private/);
});

test("API handlers are discoverable, owner-gated where needed, and stay off calc truth", async () => {
  const doctor = await source("api/mingshu-doctor.js");
  const chart = await source("api/mingshu-chart.js");
  const locations = await source("api/mingshu-locations.js");
  const compare = await source("api/mingshu-compare.js");
  const capabilities = await source("api/zhaowu-capabilities.js");
  const zhaowuDoctor = await source("api/zhaowu-doctor.js");
  const client = await source("lib/mingshu-client.js");
  const verification = await source("lib/zhaowu-verification.js");
  const vercel = JSON.parse(await source("vercel.json"));
  const chartTs = await source("src/lib/bazi/chart.ts");
  const calendar = await source("src/lib/bazi/calendar.ts");
  const interpret = await source("src/lib/bazi/interpret.ts");
  const actions = await source("src/lib/actions.ts");

  assert.doesNotMatch(doctor, /from ["']\.\.\/src\//);
  assert.doesNotMatch(chart, /from ["']\.\.\/src\//);
  assert.match(doctor, /\/api\/v1\/capabilities/);
  assert.doesNotMatch(doctor, /birthDate/);
  assert.match(chart, /OWNER_REQUIRED/);
  assert.match(locations, /OWNER_REQUIRED/);
  assert.match(compare, /OWNER_REQUIRED/);
  assert.match(compare, /sideChannelMayOverride: false/);
  assert.match(compare, /writesCustomerReport: false/);
  assert.match(chart, /wiredIntoFinalizeReading: false/);
  assert.match(client, /geonames:/);
  assert.match(capabilities, /sideChannelOverridesCalculationTruth: false/);
  assert.match(zhaowuDoctor, /birthDataSentByDoctor: false/);
  assert.match(verification, /ZHAOWU_REMAINS_AUTHORITATIVE/);
  assert.equal(vercel.functions["api/mingshu-doctor.js"].maxDuration, 10);
  assert.equal(vercel.functions["api/mingshu-chart.js"].maxDuration, 15);
  assert.equal(vercel.functions["api/mingshu-locations.js"].maxDuration, 10);
  assert.equal(vercel.functions["api/mingshu-compare.js"].maxDuration, 15);
  assert.equal(vercel.functions["api/zhaowu-capabilities.js"].maxDuration, 10);
  assert.equal(vercel.functions["api/zhaowu-doctor.js"].maxDuration, 10);
  assert.equal(vercel.rewrites.at(-1).source, "/((?!api/).*)");

  for (const locked of [chartTs, calendar, interpret, actions]) {
    assert.doesNotMatch(locked, /mingshu-compare|zhaowu-verification/);
  }
});

test("r138 verification artifacts remain after later releases", async () => {
  const runtime = await source("src/lib/bazi/runtime-contract.ts");
  const report = await source("docs/change-reports/ZW-WEB-2026.09.15-r138.md");
  const docs = await source("docs/MINGSHU-CALL-LAYER.md");
  const note = await source("docs/INSTRUCTION-REGISTRY-NOTE-r138.md");

  assert.match(runtime, /BAZI_RUNTIME_CONTRACT_VERSION = 'R6\.2\.1'/);
  assert.match(report, /Chart Fingerprint/);
  assert.match(report, /雙引擎/);
  assert.match(docs, /SIDE_CHANNEL/);
  assert.match(docs, /\/api\/mingshu-compare/);
  assert.match(docs, /CALC_TRUTH/);
  assert.match(docs, /ZHAOWU_DERIVED/);
  assert.match(docs, /AI_INTERPRETATION/);
  assert.match(note, /MINGSHU-CALL-LAYER/);
  assert.match(note, /SIDE_CHANNEL/);
});
