import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

const home = readFileSync(new URL("../src/routes/index.tsx", import.meta.url), "utf8");
const section = readFileSync(new URL("../src/components/life-view-section.tsx", import.meta.url), "utf8");
const source = readFileSync(new URL("../src/lib/life-view.ts", import.meta.url), "utf8");

test("home exposes Stone's life-view section with one stable article source", () => {
  assert.match(home, /LifeViewSection/);
  assert.match(home, /<LifeViewSection \/>/);
  assert.match(section, /id="life-view"/);
  assert.match(section, /我的人生觀和理解/);
  assert.match(section, /我的人生观和理解/);
  assert.match(section, /My View of Life/);
  assert.match(section, /LIFE_VIEW_ARTICLES/);
  assert.match(source, /export const LIFE_VIEW_ARTICLES/);
});
