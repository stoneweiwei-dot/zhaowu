import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { test } from "node:test";

const root = new URL("../", import.meta.url);
const source = (path) => readFile(new URL(path, root), "utf8");

test("home shows four always-visible entrances in three languages", async () => {
  const tree = await source("src/components/home-tree.tsx");
  for (const name of ["我的命盤", "今日指引", "趣味測驗", "文章與知識", "我的命盘", "趣味测验", "文章与知识", "My chart", "Today’s guide", "Quizzes", "Articles & knowledge"]) assert.ok(tree.includes(name), name);
  assert.match(tree, /data-home-card=\{node.id\}/);
  assert.match(tree, /onClick=\{\(\) => onOpen\(node.id\)\}/);
  assert.doesNotMatch(tree, /ph-tree-next|openId/);
  for (const path of ["/mythic-atlas", "/guaili-luanshen", "/knowledge", "/sample-report"]) assert.ok(tree.includes(path));
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
