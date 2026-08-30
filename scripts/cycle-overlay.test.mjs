import test from "node:test";
import assert from "node:assert/strict";
import { buildCycleOverlayLines } from "../src/lib/report/cycle-overlay.ts";

function result(overrides = {}) {
  return {
    id: "cycle-test",
    locale: "zh-Hant",
    question: "今年應該注意什麼？",
    createdAt: "2026-08-30T03:00:00.000Z",
    reading: {},
    chart: {
      pillars: [
        { key: "year", zhi: "寅", ready: true },
        { key: "month", zhi: "辰", ready: true },
        { key: "day", zhi: "戌", ready: true },
        { key: "time", zhi: "寅", ready: true },
      ],
      dayMaster: "戊",
      dayMasterElement: "土",
      monthBranch: "辰",
      timeUnknown: false,
      currentDayun: { ganZhi: "戊子", startYear: 2022, endYear: 2031, startAge: 36, endAge: 45, current: true },
      dayun: [],
      useful: ["木"],
      drain: ["火"],
      usefulProvisional: true,
      ...overrides,
    },
  };
}

test("cycle overlay reads natal -> dayun -> annual and catches 子午 clash", () => {
  const lines = buildCycleOverlayLines(result());
  const text = lines.join("\n");
  assert.match(text, /原局 → 戊子大運/);
  assert.match(text, /2026年丙午/);
  assert.match(text, /大運子與流年午形成沖/);
  assert.match(text, /不得只看流年五行/);
});

test("verified useful element may become a functional emphasis", () => {
  const lines = buildCycleOverlayLines(result({ usefulProvisional: false }));
  assert.match(lines.join("\n"), /當前功能重點：木/);
});

test("unknown birth time does not pretend luck-cycle timing is exact", () => {
  assert.deepEqual(buildCycleOverlayLines(result({ timeUnknown: true })), []);
});
