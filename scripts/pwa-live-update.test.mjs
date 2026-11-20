import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const manifest = JSON.parse(readFileSync("public/manifest.webmanifest", "utf8"));
const main = readFileSync("src/main.tsx", "utf8");
const vite = readFileSync("vite.config.ts", "utf8");
const swTemplate = readFileSync("scripts/sw-template.js.txt", "utf8");
const publicSw = readFileSync("public/sw.js", "utf8");
const vercel = JSON.parse(readFileSync("vercel.json", "utf8"));
const packageJson = JSON.parse(readFileSync("package.json", "utf8"));
const html = readFileSync("index.html", "utf8");

test("installed app identity stays stable across releases", () => {
  assert.equal(manifest.id, "/");
  assert.equal(manifest.start_url, "/");
  assert.equal(manifest.scope, "/");
  assert.equal(manifest.display, "standalone");
});

test("every production build emits a unique release id into app and service worker", () => {
  assert.match(vite, /VERCEL_GIT_COMMIT_SHA/);
  assert.match(vite, /__ZHAOWU_RELEASE_ID__/);
  assert.match(vite, /write-release-assets\.mjs/);
  assert.match(swTemplate, /__ZHAOWU_RELEASE__/);
  assert.match(swTemplate, /zhaowu-shell-\$\{RELEASE\.slice\(0, 16\)\}/);
  assert.doesNotMatch(swTemplate, /zhaowu-shell-r\d+/);
  assert.match(swTemplate, /latestClient\.navigate\(/);
  assert.match(swTemplate, /searchParams\.set\("zw_release", RELEASE\)/);
  assert.match(swTemplate, /target\.origin !== self\.location\.origin/);
  assert.doesNotMatch(swTemplate, /target\.pathname !== "\/"/);
  assert.match(swTemplate, /MessageChannel/);
  assert.match(swTemplate, /ZHAOWU_RELEASE_PROBE/);
  assert.match(swTemplate, /ZHAOWU_CLIENT_RELEASE/);
  assert.match(swTemplate, /observedUrl/);
  assert.match(swTemplate, /self\.clients\.get\(client\.id\)/);
  assert.match(swTemplate, /navigateClientToRelease/);
  assert.match(swTemplate, /zw_sw_reset/);
  assert.match(swTemplate, /await sleep\(1_500\)/);
  assert.match(swTemplate, /clientAlreadyRunsRelease\(latestAfterNavigate\)/);
  assert.match(swTemplate, /stale snapshot cannot win/);
  assert.match(packageJson.scripts.prebuild, /write-release-assets\.mjs/);
  for (const source of [swTemplate.replaceAll("__ZHAOWU_RELEASE__", "dev"), publicSw]) {
    assert.match(source, /skipWaiting\(\)/);
    assert.match(source, /clients\.claim\(\)/);
    assert.match(source, /ZHAOWU_RELEASE_READY/);
    assert.match(source, /ZHAOWU_RELEASE_PROBE/);
    assert.match(source, /navigateClientToRelease/);
    assert.match(source, /zw_sw_reset/);
    assert.match(source, /cache:\s*"no-store"/);
  }
});

test("installed app retries a stale release and escalates to a scoped hard self-heal", () => {
  assert.match(main, /\/release\.json\?t=/);
  assert.match(main, /cache:\s*'no-store'/);
  assert.match(main, /__ZHAOWU_RELEASE_ID__/);
  assert.match(main, /window\.location\.replace/);
  assert.match(main, /visibilitychange/);
  assert.match(main, /pageshow/);
  assert.match(main, /focus/);
  assert.match(main, /online/);
  assert.match(main, /ZHAOWU_RELEASE_READY/);
  assert.match(main, /ZHAOWU_RELEASE_PROBE/);
  assert.match(main, /ZHAOWU_CLIENT_RELEASE/);
  assert.match(main, /event\.ports/);
  assert.match(main, /sessionStorage/);
  assert.match(main, /SHELL_RELOAD_KEY/);
  assert.match(main, /RECOVERY_STATE_KEY/);
  assert.match(main, /MAX_RELEASE_RETRIES = 3/);
  assert.match(main, /RELEASE_RETRY_COOLDOWN_MS/);
  assert.match(main, /hardResetForRelease/);
  assert.match(main, /registration\?\.unregister\(\)/);
  assert.match(main, /key\.startsWith\('zhaowu-shell-'\)/);
  assert.match(main, /zw_retry/);
  assert.match(main, /zw_reset/);
  assert.match(main, /fingerprint/);
  assert.match(main, /display-mode: standalone/);
  assert.match(main, /legacyStandalone/);
  assert.match(main, /isStandaloneWebApp/);
  assert.match(main, /promoteFreshServiceWorker/);
  assert.match(main, /registration\.update\(\)/);
  assert.match(main, /controllerchange/);
  assert.match(
    main,
    /if \(isStandaloneWebApp\)[\s\S]*promoteFreshServiceWorker\(\)[\s\S]*hardResetForRelease\(freshRelease\)/,
  );
  assert.match(main, /return await hardResetForRelease\(freshRelease\)/);
});

test("release metadata, service worker and app shell are never edge-cached", () => {
  const headers = new Map(vercel.headers.map((entry) => [entry.source, entry.headers]));
  for (const source of ["/sw.js", "/release.json", "/", "/index.html", "/manifest.webmanifest"]) {
    const values = headers.get(source) ?? [];
    const cacheControl = values.find((item) => item.key.toLowerCase() === "cache-control")?.value ?? "";
    assert.match(cacheControl, /no-store/);
  }
  const assets = headers.get("/assets/(.*)") ?? [];
  const assetCache = assets.find((item) => item.key.toLowerCase() === "cache-control")?.value ?? "";
  assert.match(assetCache, /immutable/);
});


test("stale installed HTML detects a newer release before React and service-worker boot", () => {
  assert.match(vite, /transformIndexHtml/);
  assert.match(vite, /__ZHAOWU_RELEASE__/);
  assert.match(html, /fetch\("\/release\.json\?bootstrap=" \+ Date\.now\(\)/);
  assert.match(html, /embeddedRelease/);
  assert.match(html, /zw_bootstrap/);
  assert.match(html, /window\.location\.replace/);
  assert.match(html, /cache:\s*"no-store"/);
});
