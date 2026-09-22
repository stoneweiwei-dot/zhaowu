import assert from "node:assert/strict";
import test from "node:test";
import { solarTermUtc } from "../src/lib/bazi/calendar.ts";
import { timezoneOffsetHours } from "../src/lib/bazi/cities.ts";

function assertWithin(actual, expectedIso, toleranceMs = 90_000) {
  const expected = new Date(expectedIso);
  const diff = Math.abs(actual.getTime() - expected.getTime());
  assert.ok(
    diff <= toleranceMs,
    `expected ${actual.toISOString()} within ${toleranceMs / 1000}s of ${expected.toISOString()}, diff=${Math.round(diff / 1000)}s`,
  );
}

test("2026 solar-term instants stay aligned with Hong Kong Observatory minute tables", () => {
  // HKO Almanac 2026 publishes these in HKT (UTC+8), based on HM Nautical
  // Almanac Office / US Naval Observatory astronomical data.
  assertWithin(solarTermUtc(2026, 300), "2026-01-20T01:45:00.000Z"); // 大寒 09:45 HKT
  assertWithin(solarTermUtc(2026, 330), "2026-02-18T15:52:00.000Z"); // 雨水 23:52 HKT
  assertWithin(solarTermUtc(2026, 0), "2026-03-20T14:46:00.000Z");   // 春分 22:46 HKT
  assertWithin(solarTermUtc(2026, 30), "2026-04-20T01:39:00.000Z");  // 穀雨 09:39 HKT
});

test("timezone offsets continue to follow DST at the birth instant", () => {
  assert.equal(timezoneOffsetHours("Australia/Sydney", new Date("2026-01-15T00:00:00.000Z")), 11);
  assert.equal(timezoneOffsetHours("Australia/Sydney", new Date("2026-07-15T00:00:00.000Z")), 10);
  assert.equal(timezoneOffsetHours("America/New_York", new Date("2026-01-15T00:00:00.000Z")), -5);
  assert.equal(timezoneOffsetHours("America/New_York", new Date("2026-07-15T00:00:00.000Z")), -4);
});
