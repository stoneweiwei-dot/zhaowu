import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { test } from "node:test";

const root = new URL("../", import.meta.url);
const source = (path) => readFile(new URL(path, root), "utf8");

test("home shows four plain-language entrances as an expandable tree", async () => {
  const tree = await source("src/components/home-tree.tsx");
  for (const name of ["認識自己的命盤", "看看今天的天時", "探索另一面的自己", "走進昭梧的藏書世界"]) assert.match(tree, new RegExp(name));
  for (const name of ["认识自己的命盘", "看看今天的天时", "探索另一面的自己", "走进昭梧的藏书世界"]) assert.match(tree, new RegExp(name));
  for (const name of ["Explore my birth chart", "Today’s time and sky", "Explore another side of myself", "Explore the ZHAOWU library"]) assert.match(tree, new RegExp(name));
  assert.match(tree, /aria-expanded=\{open\}/);
  assert.match(tree, /aria-controls=\{bodyId\}/);
  assert.match(tree, /useState<HomeSection \| null>\('form'\)/, "opens step one by default and keeps one step open at a time");
  assert.match(tree, /data-home-tree/);
  assert.match(tree, /data-guide-step=\{index \+ 1\}/);
  assert.match(tree, /ph-tree-next/);
  for (const publicShelf of ["/mythic-atlas", "/guaili-luanshen", "/knowledge", "/sample-report"]) assert.ok(tree.includes(publicShelf));
});

test("tree lists only public pages, never gated professional routes", async () => {
  const tree = await source("src/components/home-tree.tsx");
  for (const gated of ["/ziwei", "/qizheng", "/astrology", "/indian-astrology", "/numerology", "/yizhangjing", "/tianji"]) {
    assert.ok(!tree.includes(`'${gated}`), `${gated} must not be linked from the public tree`);
  }
});

test("painted home mounts the tree and no longer shows the jade dragon", async () => {
  const home = await source("src/components/painted-home.tsx");
  assert.match(home, /<HomeTree t=\{t\} onOpen=\{onOpen\} \/>/);
  assert.doesNotMatch(home, /ph-scroll-panels|ph-guide-panel|sc-entry-strip/, "duplicate home portals stay inside the accordion tree");
  assert.doesNotMatch(home, /青玉小龍|青玉小龙|jade dragon/i);
  assert.doesNotMatch(home, /reference-comic-dragons|zhaowu-dragon-lake/);
  assert.doesNotMatch(home, /觀世錄|观世录/, "obscure entrance name must not be a top-level label");
});
