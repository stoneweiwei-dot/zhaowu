import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { buildShareCardModel } from "../src/lib/report/share-card.ts";

const source = async (path) => readFile(new URL(`../${path}`, import.meta.url), "utf8");

const result = {
  id: "share-test",
  locale: "zh-Hant",
  question: "test",
  createdAt: "2026-09-04T00:00:00Z",
  chart: {
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
    dayun: [],
    currentDayun: null,
    currentYear: "丙午",
    taiyuan: "",
    minggong: "",
    provenance: "test",
  },
  reading: {
    kind: "self",
    directAnswer: "這是一段已經由正式報告產生的客戶文字，用來驗證分享卡只排版現有內容。",
    rhythm: "",
    work: "",
    love: "",
    money: "",
    body: "",
    home: "",
    action: "",
    decree: "",
    lastLine: "",
    guide: { colors: [], avoidColors: [], directions: { favor: [], rest: [] }, hours: { favor: [], drain: [] }, pet: "" },
  },
};

test("share card model reuses calculated visual fields and existing customer answer", () => {
  const model = buildShareCardModel(result, "zh-Hant");
  assert.equal(model.title, "日主·壬");
  assert.equal(model.artworkPath, "/report-visuals/day-master/ren-water.webp");
  assert.match(model.summary, /正式報告/);
  assert.equal(model.keywords.length, 4);
  assert.equal(model.watermark, "STONE 原創");
});

test("English share card uses the English watermark fallback and plain visual title", () => {
  const model = buildShareCardModel(result, "en");
  assert.equal(model.title, "Core pattern · Water");
  assert.equal(model.watermark, "© STONE");
});

test("Phase 3 composes an actual 9:16 PNG client-side and uses native file sharing when available", async () => {
  const utility = await source("src/lib/report/share-card.ts");
  const component = await source("src/components/report-share-card.tsx");
  const report = await source("src/components/paid-report-pages.tsx");
  const css = await source("src/report-share-card.css");

  assert.match(utility, /canvas\.width = 1080/);
  assert.match(utility, /canvas\.height = 1920/);
  assert.match(utility, /canvas\.toBlob/);
  assert.match(utility, /image\/png/);
  assert.match(component, /navigator\.share/);
  assert.match(component, /navigator\.canShare/);
  assert.match(component, /anchor\.download/);
  assert.match(component, /URL\.revokeObjectURL/);
  assert.match(report, /<ReportShareCard result=\{result\}/);
  assert.match(css, /aspect-ratio: 9 \/ 16/);
  assert.match(css, /max-width: 430px/);
});
