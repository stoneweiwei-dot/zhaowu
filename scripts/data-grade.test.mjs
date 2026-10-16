import test from "node:test";
import assert from "node:assert/strict";
import { buildChart } from "../src/lib/bazi/chart.ts";
import { jieqiAround } from "../src/lib/bazi/calendar.ts";
import { assessDataGrade } from "../src/lib/bazi/data-grade.ts";

const SHANGHAI = {
  name: "Shanghai",
  country: "CN",
  display: "Shanghai",
  latitude: 31.23,
  longitude: 120,
  timezone: "Asia/Shanghai",
};

// Asia/Shanghai has no DST, so civil = UTC + 8h and the test needs no engine internals.
function civilParts(utcMs) {
  const d = new Date(utcMs + 8 * 3_600_000);
  return { year: d.getUTCFullYear(), month: d.getUTCMonth() + 1, day: d.getUTCDate(), hour: d.getUTCHours(), minute: d.getUTCMinutes() };
}

function inputAt(utcMs, extra = {}) {
  return {
    question: "t",
    year: 0, month: 1, day: 1, hour: 0, minute: 0,
    timeUnknown: false,
    gender: "male",
    relation: "unset",
    city: SHANGHAI,
    ziPolicy: "midnight",
    useTrueSolar: false,
    ...civilParts(utcMs),
    ...extra,
  };
}

// A mid-year month-opening term (not 立春) to avoid year-pillar side effects.
const { next: JIE } = jieqiAround(new Date(Date.UTC(2001, 4, 20)));
const JIE_MS = JIE.at.getTime();

function grade(input, source) {
  return assessDataGrade(input, source, buildChart(input));
}

test("certificate time far from a jie is grade A with every part full", () => {
  const r = grade(inputAt(JIE_MS - 10 * 24 * 3_600_000), "certificate");
  assert.equal(r.grade, "A");
  assert.deepEqual(Object.values(r.parts), Array(6).fill("full"));
});

test("certificate time 2 minutes before a jie keeps grade A but flags month pillar", () => {
  const r = grade(inputAt(JIE_MS - 2 * 60_000), "certificate");
  assert.equal(r.grade, "A");
  assert.equal(r.parts.monthPillar, "caveat");
  assert.ok(r.reasons.includes("jie-near-birth-instant"));
});

test("the same 30-minute gap is safe for a certificate but risky for family memory", () => {
  const at = JIE_MS - 30 * 60_000;
  assert.equal(grade(inputAt(at), "certificate").parts.monthPillar, "full");
  const b = grade(inputAt(at), "family-memory");
  assert.equal(b.grade, "B");
  assert.equal(b.parts.monthPillar, "caveat");
});

test("family memory is grade B and never gives full time-pillar confidence", () => {
  const r = grade(inputAt(JIE_MS - 10 * 24 * 3_600_000), "family-memory");
  assert.equal(r.grade, "B");
  assert.equal(r.parts.timePillar, "caveat");
  assert.equal(r.parts.minggongShengong, "caveat");
});

test("unknown hour is grade C and withholds time pillar, minggong and dayun", () => {
  const r = grade(inputAt(JIE_MS - 10 * 24 * 3_600_000, { timeUnknown: true }), "unknown");
  assert.equal(r.grade, "C");
  assert.equal(r.parts.timePillar, "withheld");
  assert.equal(r.parts.dayun, "withheld");
  assert.equal(r.parts.minggongShengong, "withheld");
  assert.equal(r.parts.dayPillar, "full");
  assert.equal(r.parts.monthPillar, "full");
});

test("unknown hour on the day a jie occurs withholds the month pillar", () => {
  const r = grade(inputAt(JIE_MS, { timeUnknown: true }), "unknown");
  assert.equal(r.grade, "C");
  assert.equal(r.parts.monthPillar, "withheld");
  assert.ok(r.reasons.includes("jie-within-birth-day"));
});

test("an approximate time is treated like an unknown time", () => {
  assert.equal(grade(inputAt(JIE_MS - 10 * 24 * 3_600_000), "estimate").grade, "C");
});

test("unverified birthplace caps a certificate at grade B", () => {
  const input = inputAt(JIE_MS - 10 * 24 * 3_600_000, { city: { ...SHANGHAI, standardTimeFallback: true } });
  const r = grade(input, "certificate");
  assert.equal(r.grade, "B");
  assert.ok(r.reasons.includes("place-unverified"));
});

test("notice never claims precision it withholds", () => {
  const r = grade(inputAt(JIE_MS - 10 * 24 * 3_600_000, { timeUnknown: true }), "unknown");
  assert.match(r.notice, /不作論斷/);
  assert.match(r.notice, /C 級/);
});
