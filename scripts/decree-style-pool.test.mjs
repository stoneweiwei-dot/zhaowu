import assert from "node:assert/strict";
import test from "node:test";
import {
  GUARDIAN_STYLE_POOL,
  GUARDIAN_STYLE_POOL_VERSION,
  chooseGuardianStyle,
} from "../supabase/functions/generate-decree-image/style-pool.ts";

test("guardian style pool keeps concealed sacred icon as an active weighted option", () => {
  const concealed = GUARDIAN_STYLE_POOL.find((style) => style.id === "concealed_sacred_icon_v1");
  assert.ok(concealed);
  assert.equal(concealed.label, "含藏聖相・遮面護法");
  assert.ok(concealed.weight > 0);
  assert.match(concealed.directive, /30–55%/);
});

test("guardian style selection is deterministic for the same report attempt", () => {
  const seed = `report-123:1:${GUARDIAN_STYLE_POOL_VERSION}`;
  assert.equal(chooseGuardianStyle(seed).id, chooseGuardianStyle(seed).id);
});

test("guardian style pool preserves the saturated Song style as the primary weight", () => {
  const primary = GUARDIAN_STYLE_POOL.find((style) => style.id === "song_saturated_sacred_v1");
  assert.ok(primary);
  assert.equal(Math.max(...GUARDIAN_STYLE_POOL.map((style) => style.weight)), primary.weight);
});

test("guardian style pool can produce more than one style across attempts", () => {
  const ids = new Set();
  for (let attempt = 1; attempt <= 100; attempt += 1) {
    ids.add(chooseGuardianStyle(`report-123:${attempt}:${GUARDIAN_STYLE_POOL_VERSION}`).id);
  }
  assert.ok(ids.size >= 2);
  assert.ok(ids.has("concealed_sacred_icon_v1"));
});
