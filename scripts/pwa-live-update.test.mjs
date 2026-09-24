import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const manifest = JSON.parse(readFileSync("public/manifest.webmanifest", "utf8"));
const main = readFileSync("src/main.tsx", "utf8");
const vite = readFileSync("vite.config.ts", "utf8");
const swTemplate = readFileSync("scripts/sw-template.js.txt", "utf8");
const vercel = JSON.parse(readFileSync("vercel.json", "utf8"));
const packageJson = JSON.parse(readFileSync("package.json", "utf8"));

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
  assert.match(packageJson.scripts.prebuild, /write-release-assets\.mjs/);
});

test("installed app checks release metadata and performs one fresh navigation", () => {
  assert.match(main, /\/release\.json\?t=/);
  assert.match(main, /cache:\s*'no-store'/);
  assert.match(main, /__ZHAOWU_RELEASE_ID__/);
  assert.match(main, /window\.location\.replace/);
  assert.match(main, /visibilitychange/);
  assert.match(main, /pageshow/);
  assert.match(main, /focus/);
  assert.match(main, /online/);
  assert.match(main, /ZHAOWU_RELEASE_READY/);
  assert.match(main, /sessionStorage/);
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
