import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { test } from "node:test";

const root = new URL("../", import.meta.url);

async function source(path) {
  return readFile(new URL(path, root), "utf8");
}

test("random site scatter uses visible real emblem assets", async () => {
  const marks = await source("src/components/marks.tsx");
  const pool = marks.slice(marks.indexOf("const SCATTER_POOL"), marks.indexOf("type ScatterItem"));

  for (const name of [
    "lotus-emblem",
    "dharma-wheel-emblem",
    "modern-endless-knot-emblem",
    "modern-golden-fish-emblem",
    "crane-feather-emblem",
    "ruyi-emblem",
  ]) {
    assert.match(pool, new RegExp(`${name}\\.svg`));
  }

  assert.doesNotMatch(pool, /line-ornament-/);
  assert.match(marks, /Date\.now\(\)/);
  assert.match(marks, /Math\.random\(\)/);
  assert.match(marks, /const count = 5 \+ \(visitJitter % 3\)/);
});

test("line ornament assets stay transparent outline SVGs when present", async () => {
  for (let i = 1; i <= 6; i += 1) {
    const n = String(i).padStart(2, "0");
    const svg = await source(`public/emblems/line-ornament-${n}.svg`);
    assert.match(svg, /fill="none"/);
    assert.match(svg, /stroke="#B58A4A"/);
    assert.doesNotMatch(svg, /linearGradient|radialGradient/);
  }
});
