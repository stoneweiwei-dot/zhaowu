import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

const home = readFileSync(new URL("../src/routes/index.tsx", import.meta.url), "utf8");
const section = readFileSync(new URL("../src/components/life-view-section.tsx", import.meta.url), "utf8");
const source = readFileSync(new URL("../src/lib/life-view.ts", import.meta.url), "utf8");
const fileSource = readFileSync(new URL("../src/lib/life-view-from-files.ts", import.meta.url), "utf8");

test("home exposes Zhaowu Guan Shi Lu with stable multilingual article sources", () => {
  assert.match(home, /LifeViewSection/);
  assert.match(home, /<LifeViewSection \/>/);
  assert.match(section, /id="life-view"/);
  assert.match(section, /昭梧 · 觀世錄/);
  assert.match(section, /昭梧 · 观世录/);
  assert.match(section, /Zhaowu · Notes on Life/);
  assert.match(section, /世事有跡，人心有因；見其勢，知其時。/);
  assert.match(section, /世事有迹，人心有因；见其势，知其时。/);
  assert.match(section, /LIFE_VIEW_ARTICLES/);
  assert.match(section, /LIFE_VIEW_FILE_ARTICLES/);
  assert.match(section, /const ARTICLES = \[\.\.\.LIFE_VIEW_FILE_ARTICLES, \.\.\.LIFE_VIEW_ARTICLES\]/);
  assert.match(source, /export const LIFE_VIEW_ARTICLES/);
  assert.match(source, /id: "break-the-deadlock"/);
  assert.match(source, /id: "long-term-practice"/);
  assert.match(fileSource, /export const LIFE_VIEW_FILE_ARTICLES/);
  assert.match(fileSource, /id: "frequency-is-not-the-entrance"/);
  assert.match(fileSource, /id: "sensitivity-needs-boundaries"/);
  assert.match(fileSource, /id: "love-reveals-the-unfinished-self"/);
  assert.match(fileSource, /id: "capacity-is-real-energy"/);
  assert.match(fileSource, /id: "fate-has-bounds-choice-has-space"/);
  assert.match(fileSource, /id: "follow-the-flow-not-surrender"/);
});
