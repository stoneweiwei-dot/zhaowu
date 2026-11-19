import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const { findLocalExactPlace, searchLocalPlaces } = await import("../src/lib/geo/city-search.ts");

test("offline gazetteer answers without any network access", () => {
  const realFetch = globalThis.fetch;
  globalThis.fetch = () => { throw new Error("network must not be touched by the local search"); };
  try {
    for (const q of ["洛陽", "洛阳", "上海", "台北", "香港"]) {
      const rows = searchLocalPlaces(q);
      assert.ok(rows.length > 0, `${q}: expected offline hits`);
      assert.ok(rows.every((r) => r.timezone), `${q}: offline hits must carry a timezone`);
    }
  } finally {
    globalThis.fetch = realFetch;
  }
});

test("the picker shows local hits before the remote merge resolves", () => {
  const src = readFileSync(new URL("../src/components/city-picker.tsx", import.meta.url), "utf8");
  const local = src.indexOf("searchLocalPlaces(q)");
  const remote = src.indexOf("searchCities({ data: q })");
  assert.ok(local > 0 && remote > 0, "both calls must exist");
  assert.ok(local < remote, "local results must be set before awaiting searchCities");
  assert.match(src, /if \(instant\.length\) setHits\(/);
});

test("pasting Sydney shows Sydney, Australia from the offline list", () => {
  const rows = searchLocalPlaces("Sydney");
  assert.ok(rows.length > 0, "Sydney: expected offline hits");
  assert.equal(rows[0].display, "雪梨，澳洲");
  assert.equal(rows[0].timezone, "Australia/Sydney");
});

test("a typed name resolves only to the unambiguous offline place", () => {
  const sydney = findLocalExactPlace("Sydney");
  assert.ok(sydney, "Sydney must resolve offline");
  assert.equal(sydney.display, "雪梨，澳洲");
  assert.equal(sydney.timezone, "Australia/Sydney");
  assert.equal(findLocalExactPlace("NSW")?.display, "雪梨，澳洲");
  // Shared aliases must never silently pick one city.
  assert.equal(findLocalExactPlace("Taiwan"), null);
  assert.equal(findLocalExactPlace("Australia"), null);
  assert.equal(findLocalExactPlace(""), null);
  assert.equal(findLocalExactPlace("Sydney, Canada"), null);
});

test("the picker never silently confirms a remote row", () => {
  const src = readFileSync(new URL("../src/components/city-picker.tsx", import.meta.url), "utf8");
  assert.ok(src.includes("findLocalExactPlace(q)"), "silent confirmation must use the offline lookup");
  assert.ok(!src.includes("exactMatch("), "no remote exact-match confirmation may remain");
});
