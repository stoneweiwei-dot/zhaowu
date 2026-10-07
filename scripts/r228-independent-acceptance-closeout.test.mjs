import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const root = new URL("../", import.meta.url);
const source = (path) => readFile(new URL(path, root), "utf8");

test("acceptance: fixed offer questions lead with a plain stay-or-go verdict", async () => {
  const reasoning = await source("src/lib/report/complex-reasoning.ts");
  const view = await source("src/components/result-view.tsx");
  assert.match(reasoning, /先留，不急著走/);
  assert.match(reasoning, /先留，不急着走/);
  assert.match(reasoning, /Stay for now; do not move yet/);
  assert.match(view, /lockDeterministicVerdict = Boolean\(complexRule\?\.comparison\)/);
  assert.match(view, /if \(petDecision \|\| lockDeterministicVerdict\) return/);
  assert.match(view, /data-decision-verdict/);
});

test("acceptance: Full Destiny Book exposes the requested four-stage reading order", async () => {
  const report = await source("src/components/unified-birth-report.tsx");
  const order = ["總體概括", "命書圖解", "身體需要注意的地方", "附註"].map((label) => report.indexOf(label));
  order.forEach((index, i) => assert.ok(index >= 0, `missing stage ${i + 1}`));
  assert.deepEqual([...order].sort((a, b) => a - b), order);
  assert.match(report, /formalStages\.map/);
  assert.match(report, /data-formal-stage=\{index \+ 1\}/);
  assert.match(report, /bodyLines\.length \? bodyLines : \[copy\.bodyFallback\]/);
});

test("acceptance: Comic Destiny Book uses six scene compositions rather than one repeated mascot", async () => {
  const report = await source("src/components/unified-birth-report.tsx");
  const css = await source("src/zhaowu-design-system.css");
  assert.doesNotMatch(report, /ComicMascot/);
  assert.match(report, /function ComicSceneArt/);
  for (const scene of [1, 2, 3, 4, 5]) assert.match(report, new RegExp(`scene === ${scene}`));
  assert.match(report, /className: `zhaowu-comic-scene zhaowu-comic-scene--\$\{scene\}`/);
  assert.match(report, /<ComicSceneArt scene=\{index \+ 1\}/);
  assert.match(css, /\.zhaowu-comic-scene/);
  assert.match(css, /data-comic-scene="6"/);
});

test("acceptance: Notes views call the real RPC once per article per tab session", async () => {
  const section = await source("src/components/life-view-home-section.tsx");
  const views = await source("src/lib/life-view-views.ts");
  assert.match(views, /rpc\/increment_life_view_article_view/);
  assert.match(views, /p_article_id: articleId/);
  assert.match(section, /countedThisVisit\.current\.has\(articleId\)/);
  assert.match(section, /window\.sessionStorage\.getItem\(key\)/);
  assert.match(section, /window\.sessionStorage\.setItem\(key, "1"\)/);
  assert.match(section, /if \(isOpen \|\| !shouldCountArticleOpen\(articleId\)\) return/);
  assert.match(section, /data-life-view-count=\{article\.id\}/);
});
