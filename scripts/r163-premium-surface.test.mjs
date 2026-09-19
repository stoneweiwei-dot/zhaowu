import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const root = new URL("../", import.meta.url);
const source = (path) => readFile(new URL(path, root), "utf8");

test("r163 premium surface stays inside the canonical final stylesheet", async () => {
  const main = await source("src/main.tsx");
  const design = await source("src/zhaowu-design-system.css");
  assert.equal(main.lastIndexOf("import './zhaowu-design-system.css';"), main.lastIndexOf("import './"));
  assert.match(design, /r163 — canonical premium Song-paper surface/);
  assert.match(design, /linear-gradient\(180deg, rgba\(250, 248, 241, \.94\), rgba\(255, 250, 241, \.90\)\)/);
  assert.match(design, /body:has\(\.zhaowu-home-sheet-shell\)[\s\S]*background-image:/);
  assert.match(design, /\.zhaowu-home-sheet-shell \.zhaowu-customer-record[\s\S]*background: #fffaf1 !important;/);
  assert.match(design, /\.zhaowu-home-disclosure,[\s\S]*box-shadow: none;/);
});

test("mobile fields remain readable and Jade Dragon becomes quieter", async () => {
  const design = await source("src/zhaowu-design-system.css");
  const guide = await source("src/components/green-dragon-guide.tsx");
  assert.match(design, /\.zhaowu-home-sheet-shell input,[\s\S]*font-size: 16px !important;/);
  assert.match(design, /@media \(max-width: 780px\)[\s\S]*padding: 0 16px 44px !important;/);
  assert.match(design, /@media \(max-width: 430px\)[\s\S]*font-size: 28px !important;/);
  assert.match(guide, /const DOCK_SIZE = 52/);
  assert.match(guide, /const BUBBLE_INITIAL_DELAY_MS = 18_000/);
  assert.match(guide, /const BUBBLE_REPEAT_MIN_MS = 48_000/);
  assert.match(guide, /BUBBLE_REPEAT_JITTER_MS = 24_000/);
});
