import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { test } from "node:test";

const component = readFileSync(new URL("../src/components/home-screen-install-prompt.tsx", import.meta.url), "utf8");
const home = readFileSync(new URL("../src/routes/index.tsx", import.meta.url), "utf8");
const html = readFileSync(new URL("../index.html", import.meta.url), "utf8");
const manifest = JSON.parse(readFileSync(new URL("../public/manifest.webmanifest", import.meta.url), "utf8"));

test("homepage mounts the mobile home-screen guide", () => {
  assert.match(home, /HomeScreenInstallPrompt/);
});

test("guide never opens when already running standalone", () => {
  assert.match(component, /display-mode: standalone/);
  assert.match(component, /navigator as NavigatorWithStandalone/);
  assert.match(component, /if \(typeof window === "undefined" \|\| isStandalone\(\)/);
});

test("iPhone flow teaches Safari share -> Add to Home Screen -> Add", () => {
  assert.match(component, /Safari 底部中間的「分享」按鈕/);
  assert.match(component, /選「加入主畫面」/);
  assert.match(component, /右上角按「加入」/);
  assert.match(component, /beforeinstallprompt/);
});

test("install guide stays non-modal so it cannot block the primary customer flow", () => {
  assert.match(component, /pointer-events-none fixed inset-x-0 bottom-0/);
  assert.match(component, /pointer-events-auto relative w-full max-w-md/);
  assert.doesNotMatch(component, /aria-modal="true"/);
  assert.doesNotMatch(component, /absolute inset-0 cursor-default/);
});

test("dismissal is throttled and users can permanently acknowledge installation", () => {
  assert.match(component, /14 \* 24 \* 60 \* 60 \* 1000/);
  assert.match(component, /INSTALLED_ACK_KEY/);
  assert.match(component, /dismissedAt/);
});

test("manifest and Apple web-app metadata support a clean home-screen launch", () => {
  assert.equal(manifest.display, "standalone");
  assert.equal(manifest.start_url, "/");
  assert.equal(manifest.short_name, "昭梧");
  assert.match(html, /rel="manifest"/);
  assert.match(html, /apple-mobile-web-app-capable/);
  assert.match(html, /apple-mobile-web-app-title/);
  assert.match(html, /viewport-fit=cover/);
});
