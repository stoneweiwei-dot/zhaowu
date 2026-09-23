import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const root = new URL("../", import.meta.url);
const source = (path) => readFile(new URL(path, root), "utf8");

test("r185 removes pill-heavy header chrome", async () => {
  const css = await source("src/zhaowu-design-system.css");
  assert.match(css, /r185 — editorial reset/);
  assert.match(css, /\.zhaowu-site-header \.zhaowu-brand-seal \{\s*display: none !important/);
  assert.match(css, /\.zhaowu-site-header \.zhaowu-header-utility[\s\S]*border-radius: 0 !important/);
  assert.match(css, /\.zhaowu-site-header \.site-lang-group[\s\S]*border: 0 !important/);
  assert.match(css, /\.zhaowu-site-header \.zhaowu-header-mode-toggle[\s\S]*border-radius: 0 !important/);
});

test("r185 homepage uses editorial rows and low-radius paper reading surfaces", async () => {
  const css = await source("src/zhaowu-design-system.css");
  assert.match(css, /\.zhaowu-home-disclosure,[\s\S]*border-radius: 0 !important/);
  assert.match(css, /\.zhaowu-home-lead h1[\s\S]*font-family: "Songti TC"/);
  assert.match(css, /\.zhaowu-customer-record,[\s\S]*border-radius: 9px !important/);
  assert.match(css, /background: rgba\(247, 243, 234, \.98\) !important/);
});

test("r185 night mode is ink backdrop plus warm paper, not green-on-green content", async () => {
  const css = await source("src/zhaowu-design-system.css");
  assert.match(css, /html\[data-zw-theme="night"\] \.zhaowu-home-sheet-shell,[\s\S]*background: var\(--zw-r185-night\) !important/);
  assert.match(css, /html\[data-zw-theme="night"\] \.zhaowu-home-sheet-shell :is\([\s\S]*background: rgba\(235, 229, 217, \.975\) !important/);
  assert.match(css, /color: #2b2924 !important;[\s\S]*opacity: 1 !important/);
});

test("r185 keeps Jade Dragon as one small entry and a compact viewport drawer", async () => {
  const css = await source("src/zhaowu-design-system.css");
  const guide = await source("src/components/green-dragon-guide.tsx");
  assert.match(css, /\.zhaowu-dragon-bubble \{\s*display: none !important/);
  assert.match(css, /\.zhaowu-dragon-guide,[\s\S]*width: 46px !important/);
  assert.match(css, /\.zhaowu-dragon-guide-panel \{[\s\S]*position: fixed !important[\s\S]*max-height: min\(58dvh, 520px\) !important/);
  assert.match(guide, /<BackgroundMusic \/>/);
  assert.equal((guide.match(/data-dragon-assistant/g) ?? []).length, 1);
});
