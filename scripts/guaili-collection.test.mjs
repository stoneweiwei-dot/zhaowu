import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
const read = path => readFileSync(new URL("../" + path, import.meta.url), "utf8");
const index = read("src/routes/guaili-luanshen.tsx");
const source = read("src/routes/-mythic-atlas-guaili-data.ts");
const essay = read("src/routes/-mythic-atlas-zodiac-essay.ts");
const body = read("src/routes/-mythic-atlas-guaili.tsx");
const home = read("src/components/home-tree.tsx");
const atlas = read("src/routes/mythic-atlas.tsx");
const seo = JSON.parse(read("src/lib/route-meta.json"));
const sitemap = read("public/sitemap.xml");
const css = read("src/routes/guaili-luanshen.css");

test("the separate Guaili group has one real canonical route and visible homepage navigation", () => {
  assert.match(index, /createFileRoute\("\/guaili-luanshen"\)/);
  assert.match(index, /data-guaili-collection/);
  assert.match(home, /data-home-guaili-collection/);
  assert.match(home, /href: '\/guaili-luanshen'/);
  assert.match(atlas, /to="\/guaili-luanshen"/);
  assert.match(index, /to="\/mythic-atlas" hash="guaili"/);
});
test("seven-volume, twelve-branch and four-year indexes reuse one source of truth", () => {
  // 2026-11-25: the guaili page is now a continuous reader (volumes 1-27 +
  // afterword). The zodiac and chronicle indexes live on the Mythic Archive
  // guaili section (body), rendered from the same shared data.
  assert.ok(index.includes("GUAILI_VOLUMES"));
  assert.ok(body.includes("GUAILI_VOLUMES"));
  assert.ok(body.includes("GUAILI_ZODIAC"));
  assert.ok(body.includes("GUAILI_YEARS"));
  assert.match(index, /GUAILI_VOLUMES\.map/);
  assert.match(body, /GUAILI_ZODIAC\.map/);
  assert.match(body, /GUAILI_YEARS\.map/);
  assert.match(source, /export const GUAILI_VOLUMES/);
  assert.ok(index.includes("`guaili-volume-${index + 1}`"), "reader chapter anchors");
  assert.ok(body.includes('id={`guaili-volume-${index+1}`}'), "volume");
  assert.ok(body.includes('id={`guaili-year-${index+1}`}'), "year");
  assert.match(body, /id=\{`guaili-\$\{ZODIAC_PLATES\[index\]\.branch\}`\}/);
  assert.match(essay, /image:"01-zi-rat\.png"/);
  assert.ok(index.includes('not a second copy'));
  assert.doesNotMatch(index, /<GuailiBook/);
});
test("new group has three language SEO entries and a public sitemap URL", () => {
  const m = seo.routes["/guaili-luanshen"];
  assert.ok(m);
  for (const lang of ["zh-Hant","zh-Hans","en"]) {
    assert.ok(m[lang]?.title?.length > 18);
    assert.ok(m[lang]?.description?.length > 45);
  }
  assert.match(sitemap, /https:\/\/zhao-wu\.com\/guaili-luanshen<\/loc>/);
  assert.ok(seo.routes["/mythic-atlas"], "existing mythic route preserved");
});
test("new group remains text-oriented, mobile-friendly and retains original artwork", () => {
  // 2026-11-25: reader keeps original chapter artwork as web derivatives;
  // the zodiac plates render on the Mythic Archive guaili section.
  assert.match(index, /07-shanhaijing-atlas\.png/);
  assert.match(index, /mythicWebPlate\("originals", artwork\.file\)/);
  // 2026-10-30: renders the web WebP derivative of the same original zodiac plate.
  assert.match(body, /mythicWebPlate\("zodiac", ZODIAC_PLATES\[index\]\.image\)/);
  assert.match(index, /STONE Original/);
  assert.match(css, /@container \(max-width:389px\)/);
  assert.doesNotMatch(index, /十二鬼月|Twelve Ghost Moons/);
  assert.doesNotMatch(index, /http[s]?:\/\//);
});
