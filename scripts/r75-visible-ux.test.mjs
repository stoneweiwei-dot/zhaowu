import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const root = new URL("../", import.meta.url);
const source = (path) => readFile(new URL(path, root), "utf8");

test("r75 visual lock is imported last so legacy card layers cannot win", async () => {
  const main = await source("src/main.tsx");
  const daily = main.indexOf("./daily-almanac-r69.css");
  const finalLock = main.indexOf("./site-ux-r75-final.css");
  assert.ok(daily >= 0 && finalLock > daily);
});

test("direct question and Four Pillars are visibly independent paper sections", async () => {
  const form = await source("src/components/analysis-form.tsx");
  const css = await source("src/site-ux-r75-final.css");
  assert.match(form, /className="zhaowu-question-sheet"/);
  assert.match(form, /id="bazi" className="zhaowu-bazi-hub"/);
  assert.match(css, /#analysisForm\.zhaowu-analysis-flow[\s\S]*background:\s*transparent !important/);
  assert.match(css, /\.zhaowu-question-sheet[\s\S]*border-radius:\s*0 !important/);
  assert.match(css, /\.zhaowu-bazi-hub[\s\S]*box-shadow:\s*inset 4px 0 0/);
});

test("report mother art has no photo-card frame", async () => {
  const base = await source("src/report-visual-assets.css");
  const lock = await source("src/site-ux-r75-final.css");
  assert.match(base, /\.zhaowu-sprite-artwork[\s\S]*border:\s*0;[\s\S]*border-radius:\s*0;[\s\S]*box-shadow:\s*none;/);
  assert.match(lock, /\.zhaowu-visual-artwork[\s\S]*border:\s*0 !important;[\s\S]*border-radius:\s*0 !important/);
  assert.match(lock, /mix-blend-mode:\s*multiply/);
});

test("installed iPhone app actively refreshes the r75 shell", async () => {
  const main = await source("src/main.tsx");
  const sw = await source("public/sw.js");
  assert.match(main, /updateViaCache:\s*'none'/);
  assert.match(main, /registration\.update\(\)/);
  assert.match(sw, /zhaowu-shell-r75/);
  assert.match(sw, /cache:\s*"no-store"/);
});
