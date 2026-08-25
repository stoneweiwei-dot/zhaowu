import assert from "node:assert/strict";
import { test } from "node:test";
import { applyCustomerAnswerHotfix } from "../src/lib/report/customer-answer-hotfix.ts";
import { composeFocusedReport } from "../src/lib/report/focused-report.ts";

const chart = {
  pillars: [
    { key: "year", label: "年柱", gan: "戊", zhi: "辰", ganZhi: "戊辰", ready: true },
    { key: "month", label: "月柱", gan: "辛", zhi: "酉", ganZhi: "辛酉", ready: true },
    { key: "day", label: "日柱", gan: "壬", zhi: "辰", ganZhi: "壬辰", ready: true },
    { key: "time", label: "時柱", gan: "壬", zhi: "寅", ganZhi: "壬寅", ready: true },
  ],
  dayMaster: "壬",
  dayMasterElement: "水",
  monthBranch: "酉",
  strength: { tendency: "偏旺", deLing: true, deDi: true, deShi: true, summary: "" },
  currentDayun: { ganZhi: "乙丑", startYear: 2020, endYear: 2029 },
};

const rawReading = {
  kind: "self",
  directAnswer: "通用人格回答",
  rhythm: "重複的通用節奏段落",
  work: "",
  love: "",
  money: "",
  body: "",
  home: "",
  action: "通用行動",
  decree: "",
  lastLine: "",
  guide: { colors: [], avoidColors: [], directions: { favor: [], rest: [] }, hours: { favor: [], drain: [] }, pet: "" },
};

test("a direct 格局 question returns Stone's chart structure instead of generic personality prose", () => {
  const question = "我的八字格局是什麼？";
  const reading = applyCustomerAnswerHotfix(question, chart, rawReading);
  assert.match(reading.directAnswer, /正印格/);
  assert.match(reading.directAnswer, /殺印相生/);
  assert.match(reading.directAnswer, /月令主氣辛正印透干/);
  assert.doesNotMatch(reading.directAnswer, /通用人格回答|出口|邊界|半成品/);
});

test("structure report basis and timing sections are distinct and remain on the asked topic", () => {
  const question = "我的八字格局是什麼？";
  const reading = applyCustomerAnswerHotfix(question, chart, rawReading);
  const sections = composeFocusedReport({ id: "stone", question, chart, reading, createdAt: "2026-08-26T00:00:00Z", locale: "zh-Hant" });
  const basis = sections.find((section) => section.key === "basis");
  const timing = sections.find((section) => section.key === "timing");
  assert.ok(basis && timing);
  assert.notDeepEqual(basis.body, timing.body);
  assert.match(basis.body.join(" "), /月令主氣|正印格|殺印相生/);
  assert.match(timing.body.join(" "), /格局是原局結構/);
  assert.doesNotMatch(basis.body.join(" "), /重複的通用節奏段落/);
});
