import { test } from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

const data = await readFile(new URL("../src/routes/-mythic-atlas-guaili-data.ts", import.meta.url), "utf8");
const component = await readFile(new URL("../src/routes/-mythic-atlas-guaili.tsx", import.meta.url), "utf8");
const route = await readFile(new URL("../src/routes/mythic-atlas.tsx", import.meta.url), "utf8");
const css = await readFile(new URL("../src/routes/-mythic-atlas-guaili.css", import.meta.url), "utf8");
const oldAtlasData = await readFile(new URL("../src/routes/-mythic-atlas-data.ts", import.meta.url), "utf8");
const routeMeta = JSON.parse(await readFile(new URL("../src/lib/route-meta.json", import.meta.url), "utf8"));
const sitemap = await readFile(new URL("../public/sitemap.xml", import.meta.url), "utf8");

test("the existing mythic atlas carries the special without deleting its current chapters", () => {
  assert.match(route, /<GuailiBook locale=\{locale\} \/>/);
  assert.match(route, /id="chronicle"/);
  assert.match(route, /id="paintings"/);
  assert.match(route, /<BorrowStarInterlude locale=\{locale\} \/>/);
  assert.match(route, /id="observation"/);
  for (const anchor of ["guaili", "guaili-zodiac", "guaili-ending"]) {
    assert.ok(route.includes('href="#' + anchor + '"'), anchor);
    assert.ok(component.includes('id="' + anchor + '"'), anchor);
  }
});

test("seven volumes, twelve four-aspect branches and four chronological years exist", () => {
  assert.equal((data.match(/\{no:l\("[壹貳參肆伍陸柒]"/g) || []).length, 7);
  assert.match(data, /no:l\("貳","贰","II"\)/);
  assert.match(data, /no:l\("參","叁","III"\)/);
  assert.match(data, /no:l\("陸","陆","VI"\)/);
  assert.equal((data.match(/\{earthly:l\(/g) || []).length, 12);
  assert.equal((data.match(/\{year:l\(/g) || []).length, 4);
  for (const year of ["元年","三年","五年","十年"]) assert.ok(data.includes('year:l("' + year + '"'));
  assert.ok(data.includes('"同爐"') && data.includes('"是誰"'));
  assert.ok(data.includes('"貓鬼"') && data.includes('"梵杖"'));
});

test("do not revive prohibited terminology or misattribute original lore to classical sources", () => {
  for (const text of [data, component]) {
    assert.doesNotMatch(text, /十二鬼月/);
  }
  for (const name of ["祇陀太子","朗達瑪王","八幡大菩薩","金花聖母","楊玉環"]) assert.ok(data.includes(name), name);
  assert.match(data, /不得一概視為古代通行神譜/);
  assert.match(data, /原母本中蓐收/);
  assert.match(data, /輪迴尚未修復/);
});

test("three languages, reusable illustration and mobile responsive styling exist", () => {
  assert.match(data, /import \{ l, type Localized \}/);
  assert.match(component, /tr\(GUAILI_COPY\.sourceNotice, locale\)/);
  assert.match(component, /mythicWebPlate\("originals", "07-shanhaijing-atlas\.png"\)/);
  assert.match(css, /@container \(max-width:390px\)/);
  assert.doesNotMatch(component, /https?:\/\//);
});


test("legacy character index uses only the published 十二流煞 name", () => {
  assert.doesNotMatch(oldAtlasData, /十二鬼月|Twelve Ghost Moons/);
  assert.match(oldAtlasData, /十二流煞/);
  assert.match(oldAtlasData, /Twelve Currents of Calamity/);
});

test("seven-volume mythic archive is indexed by canonical sitemap and localized meta", () => {
  assert.ok(routeMeta.routes["/mythic-atlas"]);
  for (const language of ["zh-Hant","zh-Hans","en"]) {
    const item=routeMeta.routes["/mythic-atlas"][language];
    assert.ok(item.title.length > 15 && item.description.length > 50, language);
  }
  assert.match(sitemap, /https:\/\/zhao-wu\.com\/mythic-atlas<\/loc>/);
});
