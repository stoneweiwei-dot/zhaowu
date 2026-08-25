import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { test } from "node:test";

const root = new URL("../", import.meta.url);

async function source(path) {
  return readFile(new URL(path, root), "utf8");
}

test("traditional report titles stay traditional and stale basis/timing duplicates are hidden", async () => {
  const renderer = await source("src/components/paid-report-pages.tsx");

  for (const title of ["直接結論", "命理依據", "時間與節奏", "現實行動", "關係條件"]) {
    assert.match(renderer, new RegExp(title));
  }

  assert.match(renderer, /SECTION_TITLES\[locale\]\[section\.key\]/);
  assert.match(renderer, /section\.key === "basis"/);
  assert.match(renderer, /timingLines\.has\(normalizeReportLine\(line\)\)/);
  assert.match(renderer, /visibleBody\.map/);
});
