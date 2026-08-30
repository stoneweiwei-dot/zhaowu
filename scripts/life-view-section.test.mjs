import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

const home = readFileSync(new URL("../src/routes/index.tsx", import.meta.url), "utf8");
const section = readFileSync(new URL("../src/components/life-view-section.tsx", import.meta.url), "utf8");
const source = readFileSync(new URL("../src/lib/life-view.ts", import.meta.url), "utf8");

test("home exposes Zhaowu Guan Shi Lu with one stable multilingual article source", () => {
  assert.match(home, /LifeViewSection/);
  assert.match(home, /<LifeViewSection \/>/);
  assert.match(section, /id="life-view"/);
  assert.match(section, /昭梧 · 觀世錄/);
  assert.match(section, /昭梧 · 观世录/);
  assert.match(section, /Zhaowu · Notes on Life/);
  assert.match(section, /世事有跡，人心有因；見其勢，知其時。/);
  assert.match(section, /世事有迹，人心有因；见其势，知其时。/);
  assert.match(section, /LIFE_VIEW_ARTICLES/);
  assert.match(source, /export const LIFE_VIEW_ARTICLES/);
  assert.match(source, /id: "break-the-deadlock"/);
  assert.match(source, /id: "long-term-practice"/);
});
