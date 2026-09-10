import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const source = await readFile(new URL("../src/lib/daily-colors.ts", import.meta.url), "utf8");
const moduleSource = await readFile(new URL("../src/components/daily-colors-module.tsx", import.meta.url), "utf8");
const route = await readFile(new URL("../src/routes/daily-colors.tsx", import.meta.url), "utf8");
const home = await readFile(new URL("../src/routes/index.tsx", import.meta.url), "utf8");

test("five dressing states stay centralized with trilingual names", () => {
  for (const id of ["qingyun", "jianghua", "kunning", "liujin", "hanxu"]) {
    assert.match(source, new RegExp(`id: "${id}"`));
  }
  assert.match(source, /Qingyun/);
  assert.match(source, /Jianghua/);
  assert.match(source, /Kunning/);
  assert.match(source, /Liujin/);
  assert.match(source, /Hanxu/);
  assert.match(source, /Energy \/ Growth \/ Momentum/);
  assert.match(source, /Radiance \/ Expression \/ Passion/);
  assert.match(source, /Rest \/ Stability \/ Recovery/);
  assert.match(source, /Clarity \/ Focus \/ Decision/);
  assert.match(source, /Stillness \/ Reflection \/ Reset/);
});

test("quotes stay cultural prompts rather than luck guarantees", () => {
  assert.match(source, /Qingyun/);
  assert.match(source, /Jianghua/);
  assert.match(source, /not a promise to change luck/);
  assert.match(source, /不是改運、招財或古籍穿著律令/);
  assert.doesNotMatch(source, /一定招財/);
  assert.doesNotMatch(source, /必然改運/);
});

test("home keeps a compact entry and the full guide lives on its own route", () => {
  assert.match(route, /createFileRoute\("\/daily-colors"\)/);
  assert.match(route, /DailyColorsModule variant="page"/);
  assert.match(home, /DailyColorsModule variant="home"/);
  assert.match(moduleSource, /setSelectedId/);
  assert.match(moduleSource, /to="\/daily-colors"/);
  assert.match(source, /dailyColorAlmanacRef/);
  assert.match(source, /dayGanzhi/);
});
