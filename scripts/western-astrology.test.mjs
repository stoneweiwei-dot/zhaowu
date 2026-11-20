import assert from "node:assert/strict";
import test from "node:test";
import {
  computeAngles,
  computeHouses,
  decoratePosition,
  houseOf,
  traditionalDignity,
} from "../src/lib/western-astrology/engine.ts";

function julianDay(date) {
  return date.getTime() / 86_400_000 + 2_440_587.5;
}

function gmstDegrees(date) {
  const jd = julianDay(date);
  const t = (jd - 2_451_545.0) / 36_525;
  return ((280.46061837 + 360.98564736629 * (jd - 2_451_545.0) + 0.000387933 * t * t - (t ** 3) / 38_710_000) % 360 + 360) % 360;
}

test("Western tropical angle regression keeps the known Virgo Ascendant reference", () => {
  const utc = new Date("1988-10-03T20:40:00.000Z");
  const angles = computeAngles({
    date: utc,
    gmstDegrees: gmstDegrees(utc),
    latitude: 26.2639,
    longitude: 117.6389,
  });
  assert.ok(Math.abs(angles.ascendant - 171.37) < 0.12, `ASC=${angles.ascendant}`);
});

test("Placidus cusps preserve opposing-house geometry and assign every longitude", () => {
  const utc = new Date("1988-10-03T20:40:00.000Z");
  const angles = computeAngles({ date: utc, gmstDegrees: gmstDegrees(utc), latitude: 26.2639, longitude: 117.6389 });
  const houses = computeHouses(angles, 26.2639, "placidus");
  assert.equal(houses.system, "placidus");
  for (let i = 0; i < 6; i += 1) {
    const opposite = ((houses.cusps[i + 6] - houses.cusps[i]) % 360 + 360) % 360;
    assert.ok(Math.abs(opposite - 180) < 1e-6, `H${i + 1}/H${i + 7}=${opposite}`);
  }
  for (let longitude = 0; longitude < 360; longitude += 3) {
    const house = houseOf(longitude, houses);
    assert.ok(house >= 1 && house <= 12);
  }
});

test("Traditional lens keeps dignity rules separate from modern interpretation", () => {
  assert.equal(traditionalDignity("Sun", 4), "domicile");
  assert.equal(traditionalDignity("Saturn", 6), "exaltation");
  assert.equal(traditionalDignity("Mars", 6), "detriment");
  assert.equal(decoratePosition("Sun", 190.85).sign, "Libra");
});
