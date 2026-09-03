import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { test } from "node:test";

const component = readFileSync(new URL("../src/components/home-screen-install-prompt.tsx", import.meta.url), "utf8");
const home = readFileSync(new URL("../src/routes/index.tsx", import.meta.url), "utf8");
const html = readFileSync(new URL("../index.html", import.meta.url), "utf8");
const main = readFileSync(new URL("../src/main.tsx", import.meta.url), "utf8");
const worker = readFileSync(new URL("../public/sw.js", import.meta.url), "utf8");
const manifest = JSON.parse(readFileSync(new URL("../public/manifest.webmanifest", import.meta.url), "utf8"));

const ICON_180 = "/icons/zhaowu-green-lotus-r39-180.png";
const ICON_192 = "/icons/zhaowu-green-lotus-r39-192.png";
const ICON_512 = "/icons/zhaowu-green-lotus-r39-512.png";

test("homepage mounts the mobile home-screen guide", () => assert.match(home, /HomeScreenInstallPrompt/));
test("installation is only treated as complete from standalone mode or appinstalled", () => { assert.match(component, /display-mode: standalone/); assert.match(component, /appinstalled/); assert.doesNotMatch(component, /INSTALLED_ACK_KEY|markInstalled|已加入，不再提示/); });
test("iPhone flow handles Safari, iPad desktop UA and in-app browsers", () => { assert.match(component, /Macintosh/); assert.match(component, /maxTouchPoints > 1/); assert.match(component, /Line\|FBAN\|FBAV\|Instagram\|MicroMessenger/); assert.match(component, /編輯動作/); });
test("retry launcher stays available", () => { assert.match(component, /24 \* 60 \* 60 \* 1000/); assert.match(component, /copy\.retry/); });
test("Android Chromium gets service worker and system install events", () => { assert.match(component, /beforeinstallprompt/); assert.match(main, /serviceWorker\.register\('\/sw\.js'/); assert.match(worker, /addEventListener\("fetch"/); assert.match(worker, /request\.mode === "navigate"/); });
test("green-gold lotus is the same icon in install guide, Apple metadata and PWA manifest", () => {
  assert.equal(manifest.id, "/");
  assert.equal(manifest.display, "standalone");
  assert.equal(manifest.start_url, "/");
  assert.equal(manifest.short_name, "昭梧");
  assert.ok(manifest.icons.some((icon) => icon.src === ICON_180 && icon.sizes === "180x180"));
  assert.ok(manifest.icons.some((icon) => icon.src === ICON_192 && icon.sizes === "192x192"));
  assert.ok(manifest.icons.some((icon) => icon.src === ICON_512 && icon.sizes === "512x512"));
  assert.match(html, /rel="manifest" href="\/manifest\.webmanifest"/);
  assert.match(html, /apple-mobile-web-app-capable/);
  assert.match(html, /rel="apple-touch-icon" href="\/icons\/zhaowu-green-lotus-r39-180\.png"/);
  assert.match(component, /HOME_ICON = "\/icons\/zhaowu-green-lotus-r39-192\.png"/);
  assert.doesNotMatch(component, /\/emblems\/lotus-emblem\.svg/);
});
