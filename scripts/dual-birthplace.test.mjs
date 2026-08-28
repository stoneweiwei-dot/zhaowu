import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";
import { timezoneOffsetHours } from "../src/lib/bazi/cities.ts";
import { toTrueSolar } from "../src/lib/bazi/solar-time.ts";

test("双轨出生资料要求地点与分钟，并由系统自动校正时间", () => {
  const route = readFileSync(new URL("../src/routes/tianji-dual.tsx", import.meta.url), "utf8");
  const form = readFileSync(new URL("../src/components/analysis-form.tsx", import.meta.url), "utf8");
  const actions = readFileSync(new URL("../src/lib/actions.ts", import.meta.url), "utf8");

  assert.match(route, /birthCity/);
  assert.match(route, /MINUTES/);
  assert.match(route, /timezoneOffsetHours/);
  assert.match(route, /toTrueSolar/);
  assert.match(route, /时间会按出生地自动校正/);
  assert.match(form, /ziPolicy: "midnight"/);
  assert.match(form, /useTrueSolar: true/);
  assert.match(actions, /ziPolicy: "midnight"/);
  assert.match(actions, /useTrueSolar: true/);
  assert.doesNotMatch(form, /setZiPolicy|setUseTrueSolar/);
  assert.doesNotMatch(route, /lead: "天机星宫读你如何/);
});

test("悉尼夏令时会进入真太阳时校正，不把海外出生当中国时区", () => {
  const instant = new Date("1990-01-01T01:00:00.000Z");
  const offset = timezoneOffsetHours("Australia/Sydney", instant);
  assert.equal(offset, 11);

  const corrected = toTrueSolar({
    year: 1990,
    month: 1,
    day: 1,
    hour: 12,
    minute: 0,
    longitude: 151.2093,
    tzOffsetHours: offset,
  });
  assert.ok(corrected.shiftMinutes <= -50);
  assert.equal(corrected.hour, 11);
});
