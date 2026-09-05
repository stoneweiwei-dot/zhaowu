import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

const root = new URL("../", import.meta.url);
const read = (path) => readFile(new URL(path, root), "utf8");

test("r50 homepage keeps one birth hub and seven explanation-only methods", async () => {
  const page = await read("src/routes/index.tsx");
  for (const label of ["四柱八字","印度古法占星","西洋星座","紫微斗數","七政四餘","前世今生","達摩一掌經"]) assert.match(page, new RegExp(label));
  assert.match(page, /D60[^\n]+分鐘/);
  assert.doesNotMatch(page, /to:\s*"\/(qizheng|astrology|yizhangjing|ziwei)"/);
  assert.ok(page.indexOf("<AnalysisForm />") < page.indexOf("<DailyAlmanacWidget />"));
});

test("daily almanac themes by day element and gates the personal slip behind login", async () => {
  const widget = await read("src/components/daily-almanac-widget.tsx");
  const css = await read("src/home-layout-r50.css");
  assert.match(widget, /STEM_ELEMENT/);
  assert.match(widget, /if\(!user\).*navigate\(\{to:"\/login"\}\)/s);
  assert.match(widget, /buildChart/);
  for (const element of ["木","火","土","金","水"]) assert.match(css, new RegExp(`data-element=\\"${element}\\"`));
});
