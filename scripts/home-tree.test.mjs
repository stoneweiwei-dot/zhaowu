import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { test } from "node:test";

const root = new URL("../", import.meta.url);
const source = (path) => readFile(new URL(path, root), "utf8");

test("home shows four plain-language entrances as an expandable tree", async () => {
  const tree = await source("src/components/home-tree.tsx");
  for (const name of ["我的命盤", "今日指引", "趣味測驗", "文章專欄"]) assert.match(tree, new RegExp(name));
  for (const name of ["我的命盘", "今日指引", "趣味测验", "文章专栏"]) assert.match(tree, new RegExp(name));
  for (const name of ["My chart", "Today’s guide", "Quizzes", "Articles"]) assert.match(tree, new RegExp(name));
  assert.match(tree, /aria-expanded=\{open\}/);
  assert.match(tree, /aria-controls=\{bodyId\}/);
  assert.match(tree, /useState<HomeSection \| null>\(null\)/, "starts fully collapsed, one open at a time");
  assert.match(tree, /data-home-tree/);
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
  assert.doesNotMatch(home, /青玉小龍|青玉小龙|jade dragon/i);
  assert.doesNotMatch(home, /reference-comic-dragons|zhaowu-dragon-lake/);
  assert.doesNotMatch(home, /觀世錄|观世录/, "obscure entrance name must not be a top-level label");
});
