import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

const route = await readFile(new URL("../src/routes/knowledge.five-elements-tone-qi.tsx", import.meta.url), "utf8");
const index = await readFile(new URL("../src/components/bazi-knowledge-notes-section.tsx", import.meta.url), "utf8");

test("knowledge article covers all five colours, tones and climate qi", () => {
  for (const text of ["五行五色", "五音", "五氣", "青／蒼", "赤／紅", "黃", "白", "黑", "角", "徵", "宮", "商", "羽", "風", "熱", "濕", "燥", "寒"]) {
    assert.ok(route.includes(text), `Missing article item: ${text}`);
  }
});

test("article gives a practical function-first training path with safe boundaries", () => {
  assert.match(route, /完整主鏈判斷某項功能是否真的不足/);
  assert.match(route, /一至四週可觀察的指標/);
  assert.match(route, /不代表你的命盤結論/);
  assert.match(route, /改命/);
  assert.match(route, /不能拿來自行診斷或治療/);
});

test("article cites the classical sources and stays mobile-first without a wide table", () => {
  assert.match(route, /ctext\.org\/huangdi-neijing\/yin-yang-ying-xiang-da-lun/);
  assert.match(route, /ctext\.org\/han-shu\/lv-li-zhi/);
  assert.doesNotMatch(route, /<table\b/i);
  assert.doesNotMatch(route, /overflow-x-auto/);
});

test("the existing BaZi knowledge entry links to the article", () => {
  assert.match(index, /\/knowledge\/five-elements-tone-qi/);
  assert.match(index, /五行五色/);
});
