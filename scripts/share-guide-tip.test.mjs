import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

const read = (path) => readFileSync(new URL(`../${path}`, import.meta.url), "utf8");

test("report-share-card includes trilingual mobile & in-app browser share guide tip and styles", () => {
  const component = read("src/components/report-share-card.tsx");
  const styles = read("src/zhaowu-layered-styles.css");

  assert.match(component, /zhaowu-share-guide-tip/);
  assert.match(component, /data-share-guide-tip/);
  assert.match(component, /儲存影像/);
  assert.match(component, /存储图像/);
  assert.match(component, /Save Image/);
  assert.doesNotMatch(component, /zhaowu-share-watermark/);
  assert.match(styles, /\.zhaowu-share-guide-tip\s*\{/);
});

test("southern hemisphere BaZi knowledge topic is wired across route, knowledge hub, sitemap, index.html and route-meta", () => {
  const route = read("src/routes/knowledge.southern-hemisphere-bazi.tsx");
  const hub = read("src/routes/knowledge.tsx");
  const sitemap = read("public/sitemap.xml");
  const indexHtml = read("index.html");
  const routeMeta = JSON.parse(read("src/lib/route-meta.json"));

  assert.match(route, /createFileRoute\("\/knowledge\/southern-hemisphere-bazi"\)/);
  assert.match(route, /不反轉/);
  assert.match(route, /不反转/);
  assert.match(route, /Not inverted/);
  assert.match(hub, /to="\/knowledge\/southern-hemisphere-bazi"/);
  assert.match(sitemap, /https:\/\/zhao-wu\.com\/knowledge\/southern-hemisphere-bazi/);
  assert.match(indexHtml, /href="\/knowledge\/southern-hemisphere-bazi"/);
  assert.ok(routeMeta.routes["/knowledge/southern-hemisphere-bazi"]);
});
