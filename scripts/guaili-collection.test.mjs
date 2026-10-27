import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
const read = path => readFileSync(new URL("../" + path, import.meta.url), "utf8");
const index = read("src/routes/guaili-luanshen.tsx");
const source = read("src/routes/-mythic-atlas-guaili-data.ts");
const essay = read("src/routes/-mythic-atlas-zodiac-essay.ts");
const body = read("src/routes/-mythic-atlas-guaili.tsx");
const home = read("src/components/painted-home.tsx");
const atlas = read("src/routes/mythic-atlas.tsx");
const seo = JSON.parse(read("src/lib/route-meta.json"));
const sitemap = read("public/sitemap.xml");
const css = read("src/routes/guaili-luanshen.css");

test("the separate Guaili group has one real canonical route and visible homepage navigation", () => {
  assert.match(index, /createFileRoute\("\/guaili-luanshen"\)/);
  assert.match(index, /data-guaili-collection/);
  assert.match(home, /data-home-guaili-collection/);
  assert.match(home, /href="\/guaili-luanshen"/);
  assert.match(atlas, /href="\/guaili-luanshen"/);
  assert.match(index, /href="\/mythic-atlas#guaili"/);
});
test("seven-volume, twelve-branch and four-year indexes reuse one source of truth", () => {
  for (const token of ["GUAILI_VOLUMES", "GUAILI_ZODIAC", "GUAILI_YEARS"]) assert.ok(index.includes(token));
  assert.match(index, /GUAILI_VOLUMES\.map/);
  assert.match(index, /GUAILI_ZODIAC\.map/);
  assert.match(index, /GUAILI_YEARS\.map/);
  assert.match(source, /export const GUAILI_VOLUMES/);
  for (const pair of [["guaili-volume", "volume"], ["guaili-year", "year"]]) {
    assert.ok(index.includes('mythic-atlas#' + pair[0]), pair[0]);
    assert.ok(body.includes('id={`' + pair[0] + '-${index+1}`}'), pair[0]);
  }
  assert.match(body, /id=\{`guaili-\$\{ZODIAC_PLATES\[index\]\.branch\}`\}/);
  assert.match(index, /ZODIAC_PLATES\[i\]\.branch/);
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
  assert.match(index, /07-mountain-sea-bestiary\.webp/);
  assert.match(index, /mythic-atlas\/zodiac\/\$\{ZODIAC_PLATES\[i\]\.image\}/);
  assert.match(index, /STONE Original/);
  assert.match(css, /@container \(max-width:389px\)/);
  assert.doesNotMatch(index, /十二鬼月|Twelve Ghost Moons/);
  assert.doesNotMatch(index, /http[s]?:\/\//);
});
