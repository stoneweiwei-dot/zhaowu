import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { test } from "node:test";

const root = new URL("../", import.meta.url);
const source = (path) => readFile(new URL(path, root), "utf8");

test("home shows four collapsed blocks in three languages", async () => {
  const tree = await source("src/components/home-tree.tsx");
  for (const name of ["我的命盤", "五行流轉", "五行流转", "Five Elements Flow", "趣味測驗", "文章與知識", "我的命盘", "趣味测验", "文章与知识", "My chart", "Quizzes", "Articles & knowledge"]) assert.ok(tree.includes(name), name);
  for (const child of ["開始免費排盤", "看範例報告", "我的報告", "人生十章對照", "五行", "尋仙緣", "找原型", "看近況", "看畫集", "命理小知識", "幽明萬象錄", "三界異聞錄", "最新更新", "關於昭梧"]) assert.ok(tree.includes(child), child);
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
  assert.deepEqual(hrefs.sort(), [
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
    "/bajinggong",
  ].sort());
});

test("each section groups its exact links and actions under localized task labels", async () => {
  const tree = await source("src/components/home-tree.tsx");
  const expected = [
    ["form","start",["開始排盤","开始排盘","Start a chart"],["form","/sample-report"]],
    ["form","reports",["閱讀命書","阅读命书","Read reports"],["/history","/soul-chapters"]],
    ["wuxing","today-guide",["查今日","查今日","Check today"],["today","/sky-events","/daily-colors"]],
    ["wuxing","element-lore",["識五行","识五行","Explore the elements"],["/knowledge/five-elements-tone-qi","quiz","/tea-guardian"]],
    ["quiz","myth",["尋仙緣","寻仙缘","Explore divine ties"],["/quiz/divine-affinity","/quiz/cultivation-destiny"]],
    ["quiz","archetypes",["找原型","找原型","Find an archetype"],["/fun-tests?test=animal","/brand-archetypes.html"]],
    ["quiz","habits",["看近況","看近况","Check in"],["/fun-tests/earth-online","/quiz/six-realms","/fun-tests?test=element","/quiz/five-element-overdrive"]],
    ["notes","reading",["讀文章","读文章","Browse readings"],["/knowledge","/guaili-luanshen"]],
    ["notes","galleries",["看畫集","看画集","View galleries"],["/mythic-atlas/","/bajinggong"]],
    ["notes","site",["認識昭梧","认识昭梧","Explore ZHAOWU"],["/about","/updates"]],
  ];
  const actual = [];
  for (const section of tree.matchAll(/^      id: '([^']+)',\r?\n([\s\S]*?)^    \},/gm)) {
    for (const group of section[2].matchAll(/id: '([^']+)', title: t\('([^']+)', '([^']+)', '([^']+)'\),\r?\n\s+hint: t\('[^']+', '[^']+', '[^']+'\),[\s\S]*?children: \[([\s\S]*?)\r?\n          \]/g)) {
      const targets = [...group[5].matchAll(/(?:href|section): '([^']+)'/g)].map(match => match[1]);
      actual.push([section[1], group[1], group.slice(2, 5), targets]);
    }
  }
  assert.deepEqual(actual, expected);
  assert.match(tree, /section: 'quiz', title: t\('五行香氣譜', '五行香气谱', 'Scent map'\)/);
  for (const title of ["五行五色、五音與五氣", "五行功能測驗", "五行優勢內耗測驗", "七題找到適合的茶"]) assert.ok(tree.includes(title), title);
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
  assert.doesNotMatch(home, /zw-bajinggong-feature|\/bajinggong/);
  assert.doesNotMatch(home, /青玉小龍|青玉小龙|jade dragon/i);
  assert.doesNotMatch(home, /reference-comic-dragons|zhaowu-dragon-lake/);
  assert.doesNotMatch(home, /觀世錄|观世录/, "obscure entrance name must not be a top-level label");
});

test("grouped destinations retain every existing thumbnail and the Bajinggong painting", async () => {
  const tree = await source("src/components/home-tree.tsx");
  assert.match(tree, /ph-tree-tiles/);
  assert.match(tree, /ph-tree-tile/);
  const thumbs = tree.match(/thumb: '[^']+'/g) || [];
  assert.equal(thumbs.length, 16, `expected 16 tile thumbs, found ${thumbs.length}`);
  for (const path of ["/bajinggong/01-hanhai-cangming.webp", "/articles/list-thumbs/five-elements-as-movement.webp", "/home-tiles/quiz-who.webp", "/home-tiles/quiz-state.webp", "/home-tiles/quiz-brand.webp", "/home-tiles/sample-report.webp", "/home-tiles/my-reports.webp", "/home-tiles/daily-colors.webp", "/home-tiles/knowledge-basics.webp", "/home-tiles/mythic-atlas.webp", "/home-tiles/guaili.webp", "/home-tiles/updates.webp", "/home-tiles/about.webp", "/images/soul-chapters/zh/volume-1.webp", "/sky-universe/cosmic-nebula.webp", "/today/almanac-lotus-v1.webp"]) assert.ok(tree.includes(path), path);
  assert.match(tree, /loading="lazy"/);
});
