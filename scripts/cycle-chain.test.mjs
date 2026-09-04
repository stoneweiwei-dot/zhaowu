import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { test } from "node:test";
import { analyzeCycleChain, cycleChainEvidence } from "../src/lib/bazi/cycle-chain.ts";

const chart = {
  timeUnknown: false,
  pillars: [
    { key: "year", label: "年支", gan: "戊", zhi: "辰", ganZhi: "戊辰", ready: true },
    { key: "month", label: "月支", gan: "辛", zhi: "酉", ganZhi: "辛酉", ready: true },
    { key: "day", label: "日支", gan: "壬", zhi: "辰", ganZhi: "壬辰", ready: true },
    { key: "time", label: "時支", gan: "壬", zhi: "寅", ganZhi: "壬寅", ready: true },
  ],
  dayun: [{ ganZhi: "乙丑", startYear: 2020, endYear: 2029, startAge: 33, endAge: 42, current: true }],
};

test("cycle chain resolves natal → dayun → year → month instead of scoring each layer in isolation", () => {
  const chain = analyzeCycleChain(chart, 2026, "丙午", "戊子", "career");
  assert.equal(chain.dayunGanZhi, "乙丑");
  assert.ok(chain.yearRelations.some((relation) => relation.label.includes("丑午六害")));
  assert.ok(chain.monthRelations.some((relation) => relation.label.includes("子丑六合")));
  assert.ok(chain.monthRelations.some((relation) => relation.label.includes("子午六沖")));
  assert.ok(chain.crossLayerAdjustment < 0);
  assert.match(cycleChainEvidence(chain), /大運乙丑 → 流年丙午 → 流月戊子/);
});

test("customer timing layer actually consumes the cycle chain", async () => {
  const source = await readFile(new URL("../src/lib/bazi/forecast-safe.ts", import.meta.url), "utf8");
  assert.match(source, /analyzeCycleChain/);
  assert.match(source, /crossLayerAdjustment/);
  assert.match(source, /cycleChainEvidence/);
  assert.match(source, /原局、大運、流年、流月/);
});
