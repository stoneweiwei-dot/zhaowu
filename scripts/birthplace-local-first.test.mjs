import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const { searchLocalPlaces } = await import("../src/lib/geo/city-search.ts");

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
