import test from "node:test";
import assert from "node:assert/strict";
import { skyV2EventId, skyV2PublicationGate, sydneyDay } from "../src/lib/sky-v2-publication.ts";
const good = { independent: true, longitudeDeltaDeg: 0.01, eventDeltaMinutes: 3 };
const candidate = (kind, utc, overrides = {}) => ({
  kind, utc, bodies: ["Mercury"], meanings: ["communications"], title: "Verified event",
  verification: good, ...overrides
});
test("Sydney event day uses local DST rather than UTC", () => {
  assert.equal(sydneyDay("2026-10-31T13:00:00Z"), "2026-11-01");
  assert.equal(sydneyDay("2026-07-01T14:00:00Z"), "2026-07-02");
});
test("event IDs are canonical UTC and repeatable", () => {
  assert.equal(skyV2EventId(candidate("S1", "2026-11-01T01:00:00Z")), "S1:mercury:2026-11-01T01:00:00.000Z");
});
test("unknown verification blocks, including stale or out-of-tolerance evidence", () => {
  const r = skyV2PublicationGate([
    candidate("S4", "2026-11-01T01:00:00Z", { verification: undefined }),
    candidate("S5", "2026-11-01T02:00:00Z", { verification: { ...good, longitudeDeltaDeg: 0.02001 } }),
    candidate("A1", "2026-11-01T03:00:00Z", { verification: { ...good, eventDeltaMinutes: 10.01 } })
  ], "2026-11-01");
  assert.equal(r.published.length, 0);
  assert.equal(r.blocked.length, 3);
});
test("duplicate IDs, shared station milestone, B-grade and over-cap are not published", () => {
  const items = [
    candidate("A1", "2026-11-01T04:00:00Z"),
    candidate("A2", "2026-11-01T05:00:00Z"),
    candidate("A3", "2026-11-01T06:00:00Z"),
    candidate("S3", "2026-11-01T07:00:00Z"),
    candidate("S4", "2026-11-01T08:00:00Z"),
    candidate("S1", "2026-11-01T09:00:00Z", { stationKey: "mercury-2026-11-01" }),
    candidate("S2", "2026-11-01T09:00:00Z", { stationKey: "mercury-2026-11-01" }),
    candidate("B", "2026-11-01T10:00:00Z"),
    candidate("S1", "2026-11-01T09:00:00Z", { stationKey: "mercury-2026-11-01" })
  ];
  const r = skyV2PublicationGate(items, "2026-11-01");
  assert.deepEqual(r.published.map((e) => e.kind), ["S1", "S4", "S3", "A1"]);
  assert.equal(r.archived.length, 3);
  assert.equal(r.blocked.length, 0);
});
test("more than three symbolic domains are archive-only", () => {
  const r = skyV2PublicationGate([candidate("S3", "2026-11-01T01:00:00Z", {meanings:["a","b","c","d"]})], "2026-11-01");
  assert.equal(r.published.length, 0);
  assert.equal(r.archived.length, 1);
});
