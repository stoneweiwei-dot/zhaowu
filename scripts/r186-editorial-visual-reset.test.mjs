import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const root = new URL("../", import.meta.url);
const source = (path) => readFile(new URL(path, root), "utf8");

test("r186 removes pill-heavy header chrome", async () => {
  const css = await source("src/zhaowu-design-system.css");
  assert.match(css, /r186 — editorial reset/);
  assert.match(css, /\.zhaowu-site-header \.zhaowu-brand-seal \{\s*display: none !important/);
  assert.match(css, /\.zhaowu-site-header \.zhaowu-header-utility[\s\S]*border-radius: 0 !important/);
  assert.match(css, /\.zhaowu-site-header \.site-lang-group[\s\S]*border: 0 !important/);
});

test("r186 homepage uses editorial rows and low-radius paper reading surfaces", async () => {
  const css = await source("src/zhaowu-design-system.css");
  assert.match(css, /\.zhaowu-home-disclosure,[\s\S]*border-radius: 0 !important/);
  assert.match(css, /\.zhaowu-home-lead h1[\s\S]*font-family: "Songti TC"/);
  assert.match(css, /\.zhaowu-customer-record,[\s\S]*border-radius: 9px !important/);
  assert.match(css, /background: rgba\(247, 243, 234, \.98\) !important/);
});

test("r186 night mode is ink backdrop plus warm paper, preserving r185 surface-aware contrast", async () => {
  const css = await source("src/zhaowu-design-system.css");
  const current = await source("docs/CURRENT-STATE.md");
  assert.match(css, /html\[data-zw-theme="night"\] \.zhaowu-home-sheet-shell,[\s\S]*background: var\(--zw-r186-night\) !important/);
  assert.match(css, /background: rgba\(235, 229, 217, \.975\) !important/);
  assert.match(current, /r185 起夜間模式必須按「表面」配色/);
});

test("r186 keeps Jade Dragon as one small entry and a compact viewport drawer", async () => {
  const css = await source("src/zhaowu-design-system.css");
  const guide = await source("src/components/green-dragon-guide.tsx");
  assert.match(css, /\.zhaowu-dragon-bubble \{\s*display: none !important/);
  assert.match(css, /\.zhaowu-dragon-guide,[\s\S]*width: 46px !important/);
  assert.match(css, /\.zhaowu-dragon-guide-panel \{[\s\S]*position: fixed !important[\s\S]*max-height: min\(58dvh, 520px\) !important/);
  assert.equal((guide.match(/data-dragon-assistant/g) ?? []).length, 1);
});
