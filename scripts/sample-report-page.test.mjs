import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import { test } from "node:test";

const read = (path) => readFileSync(new URL(`../${path}`, import.meta.url), "utf8");

test("public sample report is fictional, complete in three languages and discoverable", () => {
  const route = read("src/routes/sample-report.tsx");
  const tree = read("src/components/home-tree.tsx");
  const meta = JSON.parse(read("src/lib/route-meta.json"));
  const sitemap = read("public/sitemap.xml");
  const llms = read("public/llms.txt");

  assert.match(route, /createFileRoute\("\/sample-report"\)/);
  assert.match(route, /data-sample-report-page/);
  assert.match(route, /人物、生辰與情境均為虛構/);
  assert.match(route, /人物、生辰与情境均为虚构/);
  assert.match(route, /entirely fictional/);
  assert.match(route, /直接答案/);
  assert.match(route, /Direct answer/);
  assert.match(route, /身體需要注意的地方/);
  assert.match(route, /What to watch in the body/);
  assert.match(route, /盤面可確認/);
  assert.match(route, /Chart-confirmed/);
  assert.match(route, /不是醫療診斷/);
  assert.match(route, /not a medical diagnosis/);
  assert.match(tree, /href: '\/sample-report'/);
  assert.match(sitemap, /https:\/\/zhao-wu\.com\/sample-report<\/loc>/);
  assert.match(llms, /zhao-wu\.com\/sample-report/);
  for (const language of ["zh-Hant", "zh-Hans", "en"]) assert.ok(meta.routes["/sample-report"]?.[language]);
  assert.ok(existsSync(new URL("../src/routes/sample-report.tsx", import.meta.url)));
});
