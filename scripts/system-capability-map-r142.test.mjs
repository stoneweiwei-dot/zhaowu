import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const mapSource = readFileSync(new URL("../src/lib/system-capability-map.ts", import.meta.url), "utf8");
const routeSource = readFileSync(new URL("../src/routes/knowledge.system-map.tsx", import.meta.url), "utf8");
const docSource = readFileSync(new URL("../docs/SYSTEM-CAPABILITY-MAP-2026-09-15.md", import.meta.url), "utf8");

const capabilityIds = [
  "evidence-governance",
  "core-variable-lock",
  "vedic-jyotish",
  "dharma-one-palm",
  "cross-system-synthesis",
  "birth-time-rectification",
  "bazi-relation-resolver-v2",
  "daily-almanac-sacred-calendar",
  "report-share-cards",
  "metaphysics-source-library",
  "fengshui-form",
  "genealogy-name-culture",
  "sixty-jiazi-encyclopedia",
  "five-element-music",
  "fun-symbolic-tools",
];

const boundaryIds = ["symbolic-only", "experimental-only", "d60-gate", "calculation-truth"];

test("r142 synchronizes all 15 reviewed capabilities exactly once", () => {
  for (const id of capabilityIds) {
    const matches = mapSource.match(new RegExp(`id: \\\"${id}\\\"`, "g")) ?? [];
    assert.equal(matches.length, 1, `${id} must appear exactly once in runtime map`);
    assert.match(docSource, new RegExp(id.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")));
  }
  assert.match(mapSource, /capabilityCount: SYSTEM_CAPABILITIES\.length/);
  assert.match(routeSource, /data-capability-count/);
});

test("r142 keeps the four governance boundaries explicit", () => {
  for (const id of boundaryIds) {
    assert.match(mapSource, new RegExp(`id: \\\"${id}\\\"`));
  }
  assert.match(routeSource, /data-boundary-count/);
  assert.match(mapSource, /Starseed/);
  assert.match(mapSource, /D60.*never circularly rectify birth time/s);
  assert.match(mapSource, /deterministic engine/);
});

test("r142 does not misreport incomplete Vedic and synthesis work as active", () => {
  const vedicBlock = mapSource.slice(mapSource.indexOf('id: "vedic-jyotish"'), mapSource.indexOf('id: "dharma-one-palm"'));
  assert.match(vedicBlock, /status: "partial"/);
  assert.match(vedicBlock, /deterministic D1\/D9\/Dasha calculations are never fabricated/);

  const synthesisBlock = mapSource.slice(mapSource.indexOf('id: "cross-system-synthesis"'), mapSource.indexOf('id: "birth-time-rectification"'));
  assert.match(synthesisBlock, /status: "planned"/);

  const shareBlock = mapSource.slice(mapSource.indexOf('id: "report-share-cards"'), mapSource.indexOf('id: "metaphysics-source-library"'));
  assert.match(shareBlock, /status: "active"/);
});

test("r142 exposes a production-verifiable knowledge route", () => {
  assert.match(routeSource, /createFileRoute\("\/knowledge\/system-map"\)/);
  assert.match(routeSource, /data-system-capability-map="r142"/);
  assert.match(routeSource, /SYSTEM_CAPABILITIES\.map/);
  assert.match(routeSource, /SYSTEM_BOUNDARIES\.map/);
});
