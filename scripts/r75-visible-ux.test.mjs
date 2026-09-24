import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const root = new URL("../", import.meta.url);
const source = (path) => readFile(new URL(path, root), "utf8");

test("the canonical design system loads after the consolidated r75 compatibility lock", async () => {
  const main = await source("src/main.tsx");
  const legacy = await source("src/legacy-visual-compat.css");
  const daily = legacy.indexOf("./daily-almanac-r69.css");
  const r75 = legacy.indexOf("./site-ux-r75-final.css");
  const legacyImport = main.indexOf("./legacy-visual-compat.css");
  const canonical = main.indexOf("./zhaowu-design-system.css");
  assert.ok(daily >= 0 && r75 > daily);
  assert.ok(legacyImport >= 0 && canonical > legacyImport);
});

test("client details, the real BaZi chart and the question are independent ordered sections", async () => {
  const form = await source("src/components/analysis-form.tsx");
  const css = await source("src/zhaowu-design-system.css");
  const flow = await source("src/device-question-flow-r144.css");
  assert.match(form, /id="customer-record" className="zhaowu-customer-record"/);
  assert.match(form, /id="bazi" className="zhaowu-bazi-stage"/);
  assert.match(form, /className="zhaowu-question-sheet zhaowu-question-stage"/);
  assert.match(form, /<BaziChart chart=\{previewChart\}/);
  assert.ok(form.indexOf('id="customer-record"') < form.indexOf('id="bazi"'));
  assert.ok(form.indexOf('id="bazi"') < form.indexOf('id="question-stage"'));
  assert.match(css, /#analysisForm\.zhaowu-analysis-flow[\s\S]*background:\s*transparent !important/);
  assert.match(css, /\.zhaowu-customer-record[\s\S]*border-radius:\s*12px !important/);
  assert.match(flow, /\.zhaowu-bazi-stage/);
  assert.match(flow, /\.zhaowu-bazi-foundation/);
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
  const sw = await source("scripts/sw-template.js.txt");
  const vercel = await source("vercel.json");
  assert.match(main, /updateViaCache:\s*'none'/);
  assert.match(main, /registration\.update\(\)/);
  assert.match(main, /controllerchange/);
  assert.match(main, /hadControllerAtBoot = Boolean\(navigator\.serviceWorker\.controller\)/);
  assert.match(main, /if \(!hadControllerAtBoot \|\| reloadedForControllerChange\) return/);
  assert.match(main, /pageshow/);
  assert.match(main, /visibilitychange/);
  assert.match(main, /focus/);
  assert.match(main, /online/);
  assert.match(main, /\/release\.json\?t=/);
  assert.match(main, /checkForFreshShell/);
  assert.match(main, /current !== fresh/);
  assert.match(sw, /zhaowu-shell-\$\{RELEASE\.slice\(0, 16\)\}/);
  assert.match(sw, /ZHAOWU_RELEASE_READY/);
  assert.doesNotMatch(sw, /zhaowu-shell-r\d+/);
  assert.match(sw, /skipWaiting\(\)/);
  assert.match(sw, /clients\.claim\(\)/);
  assert.match(sw, /cache:\s*"no-store"/);
  assert.match(vercel, /"source": "\/sw\.js"[\s\S]*"Cache-Control"[\s\S]*"no-store, no-cache, must-revalidate, max-age=0"/);
  assert.match(vercel, /"source": "\/"[\s\S]*"Cache-Control"[\s\S]*"no-store, max-age=0"/);
});
