import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const root = new URL("../", import.meta.url);
const source = (path) => readFile(new URL(path, root), "utf8");

test("the canonical design system loads after the r75 visual lock", async () => {
  const main = await source("src/main.tsx");
  const daily = main.indexOf("./daily-almanac-r69.css");
  const r75 = main.indexOf("./site-ux-r75-final.css");
  const canonical = main.indexOf("./zhaowu-design-system.css");
  assert.ok(daily >= 0 && r75 > daily && canonical > r75);
});

test("question, client details, and Four Pillars are visibly independent sections", async () => {
  const form = await source("src/components/analysis-form.tsx");
  const css = await source("src/zhaowu-design-system.css");
  assert.match(form, /className="zhaowu-question-sheet"/);
  assert.match(form, /id="customer-record" className="zhaowu-customer-record"/);
  assert.match(form, /id="bazi" className="zhaowu-bazi-hub"/);
  assert.match(css, /#analysisForm\.zhaowu-analysis-flow[\s\S]*background:\s*transparent !important/);
  assert.match(css, /\.zhaowu-question-sheet[\s\S]*border-radius:\s*0 !important/);
  assert.match(css, /\.zhaowu-customer-record[\s\S]*border-radius:\s*12px !important/);
  assert.match(css, /\.zhaowu-bazi-hub[\s\S]*border-top:\s*1px solid/);
});

test("report mother art has no photo-card frame", async () => {
  const base = await source("src/report-visual-assets.css");
  const lock = await source("src/site-ux-r75-final.css");
  assert.match(base, /\.zhaowu-sprite-artwork[\s\S]*border:\s*0;[\s\S]*border-radius:\s*0;[\s\S]*box-shadow:\s*none;/);
  assert.match(lock, /\.zhaowu-visual-artwork[\s\S]*border:\s*0 !important;[\s\S]*border-radius:\s*0 !important/);
  assert.match(lock, /mix-blend-mode:\s*multiply/);
});

test("installed iPhone app actively refreshes the current production shell without reloading first-time visitors", async () => {
  const main = await source("src/main.tsx");
  const sw = await source("public/sw.js");
  const vercel = await source("vercel.json");
  assert.match(main, /updateViaCache:\s*'none'/);
  assert.match(main, /registration\.update\(\)/);
  assert.match(main, /controllerchange/);
  assert.match(main, /hadControllerAtBoot = Boolean\(navigator\.serviceWorker\.controller\)/);
  assert.match(main, /if \(!hadControllerAtBoot \|\| reloadedForControllerChange\) return/);
  assert.match(main, /pageshow/);
  assert.match(main, /visibilitychange/);
  assert.match(main, /checkForFreshShell/);
  assert.match(main, /current !== fresh/);
  assert.match(sw, /zhaowu-shell-r\d+/);
  assert.match(sw, /skipWaiting\(\)/);
  assert.match(sw, /clients\.claim\(\)/);
  assert.match(sw, /cache:\s*"no-store"/);
  assert.match(vercel, /"source": "\/sw\.js"[\s\S]*"Cache-Control"[\s\S]*"no-store, no-cache, must-revalidate, max-age=0"/);
  assert.match(vercel, /"source": "\/"[\s\S]*"Cache-Control"[\s\S]*"no-store, max-age=0"/);
});
