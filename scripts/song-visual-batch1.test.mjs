import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const css = await readFile(new URL("../src/zhaowu-design-system.css", import.meta.url), "utf8");
const marker = "2026-10-09 · Song visual unification · Batch 1";
const section = css.slice(css.indexOf(marker));

test("Batch 1 remains in the canonical final visual authority", () => {
  assert.ok(css.includes(marker));
  assert.match(section, /--zw-card-radius:\s*10px/);
  assert.match(section, /--zw-control-radius:\s*8px/);
});

test("shared utility chrome is paper, low-radius and blur-free", () => {
  assert.match(section, /\.zhaowu-site-utility-buttons[\s\S]*border-radius:\s*10px\s*!important/);
  assert.match(section, /\.zhaowu-site-utility-buttons[\s\S]*backdrop-filter:\s*none\s*!important/);
  assert.match(section, /\.zhaowu-site-utility-panel[\s\S]*border-radius:\s*10px\s*!important/);
  assert.match(section, /\.zhaowu-site-utility-panel[\s\S]*background:\s*#fbf6eb\s*!important/);
});

test("home and login keep Song book geometry instead of glass cards", () => {
  assert.match(section, /\.zw-hero-nav-item\.zw-hero-card[\s\S]*border-radius:\s*10px\s*!important/);
  assert.match(section, /\.stone-login-sheet[\s\S]*border-radius:\s*10px\s*!important/);
  assert.match(section, /\.stone-login-sheet[\s\S]*backdrop-filter:\s*none\s*!important/);
});
