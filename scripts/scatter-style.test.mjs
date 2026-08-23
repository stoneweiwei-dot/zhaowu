import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { test } from "node:test";

const root = new URL("../", import.meta.url);

async function source(path) {
  return readFile(new URL(path, root), "utf8");
}

test("random site scatter uses only hollow line ornament assets", async () => {
  const marks = await source("src/components/marks.tsx");
  const pool = marks.slice(marks.indexOf("const SCATTER_POOL"), marks.indexOf("type ScatterItem"));

  for (let i = 1; i <= 6; i += 1) {
    const n = String(i).padStart(2, "0");
    assert.match(pool, new RegExp(`line-ornament-${n}\\.svg`));
  }

  assert.doesNotMatch(pool, /lotus-emblem|dharma-wheel-emblem|modern-|treasure-vase-emblem|ruyi-emblem/);
  assert.match(marks, /Date\.now\(\)/);
  assert.match(marks, /Math\.random\(\)/);
  assert.match(marks, /const count = 4 \+ \(visitJitter % 2\)/);
});

test("line ornament assets stay transparent outline SVGs", async () => {
  for (let i = 1; i <= 6; i += 1) {
    const n = String(i).padStart(2, "0");
    const svg = await source(`public/emblems/line-ornament-${n}.svg`);
    assert.match(svg, /fill="none"/);
    assert.match(svg, /stroke="#B58A4A"/);
    assert.doesNotMatch(svg, /linearGradient|radialGradient/);
  }
});
