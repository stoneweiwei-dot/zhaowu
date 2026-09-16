import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const sw = await readFile(new URL("../public/sw.js", import.meta.url), "utf8");
const main = await readFile(new URL("../src/main.tsx", import.meta.url), "utf8");

test("installed PWA actively replaces the old service worker and clears stale shell caches", () => {
  assert.match(sw, /self\.skipWaiting\(\)/);
  assert.match(sw, /self\.clients\.claim\(\)/);
  assert.match(sw, /keys\.filter\(\(key\) => key\.startsWith\("zhaowu-shell-"\) && key !== CACHE\)/);
  assert.match(sw, /caches\.delete\(key\)/);
  assert.match(sw, /includeUncontrolled:\s*true/);
  assert.match(sw, /ZHAOWU_SW_READY/);
});

test("navigation and shell requests prefer the network so an installed PWA can discover a new deployment", () => {
  assert.match(sw, /request\.mode === "navigate"/);
  assert.match(sw, /fetch\(request, \{ cache: "no-store" \}\)/);
  assert.match(sw, /cache\.put\("\/", response\.clone\(\)\)/);
  assert.match(sw, /caches\.match\(request\)/);
  assert.match(sw, /caches\.match\("\/"\)/);
});

test("the client explicitly checks for a fresh worker and reloads controlled pages when control changes", () => {
  assert.match(main, /navigator\.serviceWorker\.register\('\/sw\.js', \{ scope: '\/', updateViaCache: 'none' \}\)/);
  assert.match(main, /registration\.update\(\)/);
  assert.match(main, /navigator\.serviceWorker\.addEventListener\('controllerchange'/);
  assert.match(main, /hadControllerAtBoot/);
  assert.match(main, /window\.location\.reload\(\)/);
  assert.match(main, /window\.addEventListener\('pageshow', refreshServiceWorker\)/);
  assert.match(main, /visibilitychange/);
  assert.match(main, /checkForFreshShell/);
  assert.match(main, /fetch\('\/', \{ cache: 'no-store'/);
  assert.match(main, /current !== fresh/);
});
