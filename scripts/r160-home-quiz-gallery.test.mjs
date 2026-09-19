import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { test } from "node:test";

const root = new URL("../", import.meta.url);
const source = (path) => readFile(new URL(path, root), "utf8");

test("homepage keeps the renamed self-discovery area collapsed by default", async () => {
  const home = await source("src/routes/index.tsx");
  assert.match(home, /昭梧 · 心境小測/);
  assert.match(home, /ZHAOWU · SELF DISCOVERY/);
  assert.match(home, /const \[openPanel, setOpenPanel\].*useState.*\(null\)/);
  assert.match(home, /openPanel === "quiz"/);
  assert.match(home, /aria-expanded=\{open\}/);
  assert.doesNotMatch(home, /title: "輕測驗"|title: "轻测验"/);
});

test("customer-facing public gallery no longer displays portrait-heavy legacy art", async () => {
  const atlas = await source("src/lib/public-atlas.ts");
  assert.doesNotMatch(atlas, /report-visuals|reportVisual/);
  assert.match(atlas, /ornament\("ornament-lotus", "lotus"\)/);
});
