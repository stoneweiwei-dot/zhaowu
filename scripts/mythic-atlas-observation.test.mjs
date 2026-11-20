import assert from "node:assert/strict";
import { test } from "node:test";
import { readFile } from "node:fs/promises";

const dataSource = await readFile(new URL("../src/routes/-mythic-atlas-data.ts", import.meta.url), "utf8");
const routeSource = await readFile(new URL("../src/routes/mythic-atlas.tsx", import.meta.url), "utf8");

test("mythic atlas umbrella is renamed to Hidden and Manifest Worlds", () => {
  assert.match(dataSource, /幽明萬象錄/);
  assert.match(dataSource, /幽明万象录/);
  assert.match(dataSource, /Chronicle of Hidden and Manifest Worlds/);
  assert.doesNotMatch(routeSource, /黃泉紀 · 左道旁門設定集/);
});

test("Inner Seeing is a separate modern layer with explicit epistemic boundaries", () => {
  assert.match(dataSource, /OBSERVATION_CHAPTERS/);
  assert.match(dataSource, /五分鐘可以提醒你慢下來，不能證明你已經看透一個人/);
  assert.match(dataSource, /三維、四維、五維在這裡只作認知隱喻/);
  assert.match(routeSource, /不是古籍、宗教教義或可測量的「能量學」/);
  assert.match(routeSource, /id="observation"/);
});

test("Yellow Springs remains a realm rather than being erased by the rename", () => {
  assert.match(dataSource, /title: l\("黃泉", "黄泉", "Yellow Springs"\)/);
});
