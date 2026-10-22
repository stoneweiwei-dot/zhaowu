import assert from "node:assert/strict";
import test from "node:test";
import {
  TEN_PLANETS, HOUSE_GROUPS, analyzeWesternChart, westernGroupNarrative,
} from "../src/lib/astrology/deep-engine.ts";

function profile(houses, overrides = {}) {
  return analyzeWesternChart({
    placements: TEN_PLANETS.map((key, i) => ({
      key, longitude: (i * 30 + 12) % 360, retrograde: false,
      house: houses[i], signReliable: true,
    })),
    houseSystem: "placidus", timeReliability: "high",
    provenance: "confirmed-minute", ...overrides,
  });
}

test("all twelve houses and unequal A/B/C groups are explicit", () => {
  assert.deepEqual(HOUSE_GROUPS.A, [1,8,9,12]);
  assert.deepEqual(HOUSE_GROUPS.B, [2,6,10]);
  assert.deepEqual(HOUSE_GROUPS.C, [3,4,5,7,11]);
  const p = profile([1,8,9,12,1,8,9,2,3,4]);
  assert.equal(p.houseCount, 10);
  assert.equal(p.leadingGroup, "A");
  assert.deepEqual(p.densities.map(g => g.count), [7,1,2]);
  assert.equal(p.densities[0].classicalCount, 7);
  assert.deepEqual(p.topHouses, [1,8,9]);
});

test("no forced singular theme when totals tie or contradict density", () => {
  const p = profile([2,6,10,2,6,3,4,5,7,11]);
  assert.equal(p.leadingGroup, null);
  assert.deepEqual(p.densities.map(g => g.count), [0,5,5]);
});

test("time uncertainty and partially unassigned planets suppress theme leadership", () => {
  const fullHouses = [1,8,9,12,1,8,9,2,3,4];
  assert.equal(profile(fullHouses, { timeReliability: "low" }).leadingGroup, null);
  const p = profile([...fullHouses.slice(0,9), null]);
  assert.equal(p.houseCount, 9);
  assert.equal(p.leadingGroup, null);
});

test("sign uncertainty reduces element census instead of inventing an assignment", () => {
  const p = analyzeWesternChart({
    placements: TEN_PLANETS.map((key, i) => ({
      key, longitude: i * 30 + 15, retrograde: false,
      house: null, signReliable: i > 0,
    })),
    houseSystem: "whole", timeReliability: "low", provenance: "unknown",
  });
  assert.deepEqual(p.signUncertain, ["Sun"]);
  assert.equal(Object.values(p.elements).reduce((a,b) => a + b,0), 9);
  assert.equal(p.classicalDistribution.total,0);
});

test("missing planets cannot masquerade as a full ten-planet chart", () => {
  assert.throws(() => analyzeWesternChart({
    placements: TEN_PLANETS.slice(0,9).map((key,i) => ({
      key, longitude: i*30+15, retrograde: false, house:1, signReliable:true,
    })),
    houseSystem:"placidus",timeReliability:"high",provenance:"confirmed-minute",
  }));
});
test("separate cultural interpretation never equates zodiac houses to BaZi", () => {
  for (const group of ["A","B","C"]) {
    for (const locale of ["zh-Hant","zh-Hans","en"]) {
      const n = westernGroupNarrative(group,locale);
      assert.ok(n.foundation && n.strengths && n.risks && n.action);
    }
  }
});
