import test from "node:test";
import assert from "node:assert/strict";
import { skyV2EventId, skyV2PublicationGate, sydneyDay } from "../src/lib/sky-v2-publication.ts";
const proof = (utc, overrides = {}) => ({
  primary: { engine: "astronomy-engine", sourceUrl: "https://github.com/cosinekitty/astronomy", frame: "geocentric-tropical-ecliptic-of-date", eventUtc: utc, longitudeDeg: 100 },
  jpl: { engine: "JPL Horizons", sourceUrl: "https://ssd.jpl.nasa.gov/horizons/", frame: "geocentric-tropical-ecliptic-of-date", eventUtc: utc, longitudeDeg: 100.01 },
  ...overrides
});
const candidate = (kind, utc, overrides = {}) => ({
  kind, utc, bodies: ["Mercury"], meanings: ["communications"], title: "Test event",
  verification: proof(utc), ...overrides
});
test("Sydney date handles DST and winter boundaries", () => {
  assert.equal(sydneyDay("2026-10-31T13:00:00Z"), "2026-11-01");
  assert.equal(sydneyDay("2026-07-01T14:00:00Z"), "2026-07-02");
});
test("canonical UTC ids reorder body lists without duplicate identities", () => {
  assert.equal(skyV2EventId(candidate("S1", "2026-11-01T01:00:00Z")),
    "S1:mercury:2026-11-01T01:00:00.000Z");
  const a = candidate("A1", "2026-11-01T01:00:00Z", { bodies: ["Venus", "Mars"] });
  const b = candidate("A1", "2026-11-01T01:00:00Z", { bodies: ["Mars", "Venus"] });
  assert.equal(skyV2EventId(a), skyV2EventId(b));
});
test("boolean-only claims, missing provenance and non-JPL URLs fail closed", () => {
  const utc = "2026-11-01T01:00:00Z";
  const r = skyV2PublicationGate([
    candidate("S1", utc, { verification: { independent: true, longitudeDeltaDeg: 0, eventDeltaMinutes: 0 } }),
    candidate("S4", "2026-11-01T02:00:00Z", { verification: undefined }),
    candidate("S5", "2026-11-01T03:00:00Z", { verification: proof("2026-11-01T03:00:00Z", { jpl: { ...proof(utc).jpl, sourceUrl: "https://example.com/claim" } }) })
  ], "2026-11-01");
  assert.equal(r.published.length, 0);
  assert.equal(r.blocked.length, 3);
});
test("longitude and event-time tolerance are calculated from independent samples", () => {
  const t = "2026-11-01T01:00:00Z";
  const r = skyV2PublicationGate([
    candidate("A1", t, { verification: proof(t, { jpl: { ...proof(t).jpl, longitudeDeg: 100.02001 } }) }),
    candidate("A2", "2026-11-01T02:00:00Z", { verification: proof("2026-11-01T02:00:00Z", { jpl: { ...proof(t).jpl, eventUtc: "2026-11-01T02:10:01Z" } }) }),
    candidate("A3", "2026-11-01T03:00:00Z", { verification: proof("2026-11-01T03:00:00Z", { primary: { ...proof(t).primary, frame: "topocentric" } }) })
  ], "2026-11-01");
  assert.equal(r.published.length, 0);
  assert.equal(r.blocked.length, 3);
});
test("B grade archives, S2 stays unpublished, verified S1 merges same station; cap max 4", () => {
  const day = "2026-11-01";
  const items = [
    candidate("A1", "2026-11-01T04:00:00Z"),
    candidate("A2", "2026-11-01T05:00:00Z"),
    candidate("A3", "2026-11-01T06:00:00Z"),
    candidate("S3", "2026-11-01T07:00:00Z"),
    candidate("S4", "2026-11-01T08:00:00Z"),
    candidate("S1", "2026-11-01T09:00:00Z", { stationKey: "mercury-2026-11-01" }),
    candidate("S2", "2026-11-01T09:00:00Z", { stationKey: "mercury-2026-11-01" }),
    candidate("B", "2026-11-01T10:00:00Z")
  ];
  const r = skyV2PublicationGate(items, day, 100);
  assert.deepEqual(r.published.map((e) => e.kind), ["S1", "S4", "S3", "A1"]);
  assert.equal(r.archived.length, 3);
  assert.equal(r.blocked.length, 0);
});
test("invalid duplicate does not block verified copy, and S2 without S1 is archive only", () => {
  const utc = "2026-11-01T01:00:00Z";
  const r = skyV2PublicationGate([
    candidate("S4", utc, { verification: undefined }),
    candidate("S4", utc),
    candidate("S2", "2026-11-01T02:00:00Z", { stationKey: "unconfirmed" })
  ], "2026-11-01");
  assert.deepEqual(r.published.map((e) => e.kind), ["S4"]);
  assert.deepEqual(r.archived.map((e) => e.kind), ["S2"]);
  assert.equal(r.blocked.length, 1);
});
