import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { test } from "node:test";

const root = new URL("../", import.meta.url);
const source = (path) => readFile(new URL(path, root), "utf8");

test("home shows four collapsed blocks in three languages", async () => {
  const tree = await source("src/components/home-tree.tsx");
  for (const name of ["我的命盤", "五行流轉", "五行流转", "Five Elements Flow", "趣味測驗", "文章與知識", "我的命盘", "趣味测验", "文章与知识", "My chart", "Quizzes", "Articles & knowledge"]) assert.ok(tree.includes(name), name);
  for (const child of ["開始免費排盤", "看範例報告", "我的報告", "人生十章對照", "五行", "看看你是誰", "看看你的狀態", "命理小知識", "幽明萬象錄", "三界異聞錄", "最新更新", "關於昭梧"]) assert.ok(tree.includes(child), child);
  assert.match(tree, /data-home-blocks="4"/);
  assert.deepEqual([...tree.matchAll(/^      id: '([^']+)',$/gm)].map(match => match[1]), ["form", "wuxing", "quiz", "notes"]);
  assert.match(tree, /data-home-card=\{node.id\}/);
  assert.match(tree, /useState<HomeSection \| null>\(null\)/);
  assert.match(tree, /aria-expanded=\{isOpen\}/);
  assert.match(tree, /hidden=\{!isOpen\}/);
  assert.doesNotMatch(tree, /data-open="true"/);
  assert.doesNotMatch(tree, /ph-tree-next|openId/);
  assert.doesNotMatch(tree, /從哪裡開始/);
  const hrefs = [...tree.matchAll(/href: '([^']+)'/g)].map(match => match[1]);
  assert.deepEqual(hrefs, [
    "/sample-report",
    "/history",
    "/soul-chapters",
    "/sky-events",
    "/daily-colors",
    "/knowledge/five-elements-tone-qi",
    "/fun-tests?test=element",
    "/quiz/five-element-overdrive",
    "/tea-guardian",
    "/quiz/divine-affinity",
    "/quiz/cultivation-destiny",
    "/fun-tests?test=animal",
    "/fun-tests/earth-online",
    "/quiz/six-realms",
    "/brand-archetypes.html",
    "/knowledge",
    "/mythic-atlas/",
    "/guaili-luanshen",
    "/updates",
    "/about",
  ]);
});

test("Five Elements Flow keeps the original branch destinations and labels in order", async () => {
  const tree = await source("src/components/home-tree.tsx");
  const block = tree.split("      id: 'wuxing',")[1].split("      id: 'quiz',")[0];
  const direct = block.split("kind: 'branch'")[0];
  assert.deepEqual([...direct.matchAll(/(?:section|href): '([^']+)'/g)].map(match => match[1]), ["today", "/sky-events", "/daily-colors"]);
  assert.match(block, /kind: 'action', section: 'quiz', title: t\('五行香氣譜', '五行香气谱', 'Scent map'\)/);
  const children = block.split("children: [")[1].split("] }")[0];
  assert.deepEqual([...children.matchAll(/(?:href|section): '([^']+)', title: t\('([^']+)'/g)].map(match => match.slice(1)), [
    ["/knowledge/five-elements-tone-qi", "五行五色、五音與五氣"],
    ["/fun-tests?test=element", "五行功能測驗"],
    ["/quiz/five-element-overdrive", "五行優勢內耗測驗"],
    ["quiz", "五行香氣譜"],
    ["/tea-guardian", "七題找到適合的茶"],
  ]);
  const quiz = tree.split("      id: 'quiz',")[1].split("      id: 'notes',")[0];
  assert.deepEqual([...quiz.matchAll(/kind: 'branch', id: '([^']+)'/g)].map(match => match[1]), ["who", "state", "brand"]);
  const state = quiz.split("id: 'state'")[1].split("id: 'brand'")[0];
  assert.deepEqual([...state.matchAll(/href: '([^']+)'/g)].map(match => match[1]), ["/fun-tests/earth-online", "/quiz/six-realms"]);
  assert.doesNotMatch(quiz, /section: 'quiz'|five-element-overdrive|test=element|tea-guardian/);
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
  assert.doesNotMatch(home, /ph-scroll-panels|ph-guide-panel|sc-entry-strip/, "duplicate home portals stay inside the homepage tree");
  assert.doesNotMatch(home, /青玉小龍|青玉小龙|jade dragon/i);
  assert.doesNotMatch(home, /reference-comic-dragons|zhaowu-dragon-lake/);
  assert.doesNotMatch(home, /觀世錄|观世录/, "obscure entrance name must not be a top-level label");
});

test("opened blocks show square image tiles, not text rows", async () => {
  const tree = await source("src/components/home-tree.tsx");
  assert.match(tree, /ph-tree-tiles/);
  assert.match(tree, /ph-tree-tile/);
  const thumbs = tree.match(/thumb: '[^']+'/g) || [];
  assert.equal(thumbs.length, 15, `expected 15 tile thumbs, found ${thumbs.length}`);
  for (const path of ["/articles/list-thumbs/five-elements-as-movement.webp", "/home-tiles/quiz-who.webp", "/home-tiles/quiz-state.webp", "/home-tiles/quiz-brand.webp", "/home-tiles/sample-report.webp", "/home-tiles/my-reports.webp", "/home-tiles/daily-colors.webp", "/home-tiles/knowledge-basics.webp", "/home-tiles/mythic-atlas.webp", "/home-tiles/guaili.webp", "/home-tiles/updates.webp", "/home-tiles/about.webp", "/images/soul-chapters/zh/volume-1.webp", "/sky-universe/cosmic-nebula.webp", "/today/almanac-lotus-v1.webp"]) assert.ok(tree.includes(path), path);
  assert.match(tree, /loading="lazy"/);
});
