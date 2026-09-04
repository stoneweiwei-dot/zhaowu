import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { test } from "node:test";
const component = readFileSync(new URL("../src/components/home-screen-install-prompt.tsx", import.meta.url), "utf8");
const home = readFileSync(new URL("../src/routes/index.tsx", import.meta.url), "utf8");
const html = readFileSync(new URL("../index.html", import.meta.url), "utf8");
const main = readFileSync(new URL("../src/main.tsx", import.meta.url), "utf8");
const worker = readFileSync(new URL("../public/sw.js", import.meta.url), "utf8");
const manifest = JSON.parse(readFileSync(new URL("../public/manifest.webmanifest", import.meta.url), "utf8"));
const vercel = JSON.parse(readFileSync(new URL("../vercel.json", import.meta.url), "utf8"));
test("homepage mounts the mobile home-screen guide", () => assert.match(home, /HomeScreenInstallPrompt/));
test("installation is only treated as complete from standalone mode or appinstalled", () => { assert.match(component, /display-mode: standalone/); assert.match(component, /appinstalled/); assert.doesNotMatch(component, /INSTALLED_ACK_KEY|markInstalled|已加入，不再提示/); });
test("iPhone flow handles Safari, iPad desktop UA and in-app browsers", () => { assert.match(component, /Macintosh/); assert.match(component, /maxTouchPoints > 1/); assert.match(component, /Line\|FBAN\|FBAV\|Instagram\|MicroMessenger/); assert.match(component, /編輯動作/); });
test("retry launcher stays available", () => { assert.match(component, /24 \* 60 \* 60 \* 1000/); assert.match(component, /copy\.retry/); });
test("Android Chromium gets service worker and system install events", () => { assert.match(component, /beforeinstallprompt/); assert.match(main, /serviceWorker\.register\('\/sw\.js'/); assert.match(worker, /addEventListener\("fetch"/); assert.match(worker, /request\.mode === "navigate"/); });
test("manifest and Apple metadata support home-screen launch with stable icon URLs", () => {
  assert.equal(manifest.id, "/");
  assert.equal(manifest.display, "standalone");
  assert.equal(manifest.start_url, "/");
  assert.equal(manifest.short_name, "昭梧");
  assert.ok(manifest.icons.some((icon) => icon.src === "/apple-touch-icon.png" && icon.sizes === "180x180"));
  assert.ok(manifest.icons.some((icon) => icon.sizes === "192x192"));
  assert.ok(manifest.icons.some((icon) => icon.sizes === "512x512"));
  assert.match(html, /rel="manifest" href="\/manifest\.webmanifest"/);
  assert.match(html, /apple-mobile-web-app-capable/);
  assert.match(html, /rel="apple-touch-icon" href="\/apple-touch-icon\.png"/);
  assert.match(html, /rel="apple-touch-icon-precomposed" href="\/apple-touch-icon-precomposed\.png"/);
  assert.doesNotMatch(html, /apple-touch-icon-r\d+/);
  assert.ok(manifest.icons.every((icon) => !/-r\d+/.test(icon.src)));
});
test("Vercel revalidates install metadata instead of pinning stale branding", () => {
  for (const source of ["/manifest.webmanifest", "/apple-touch-icon.png", "/apple-touch-icon-precomposed.png"]) {
    const rule = vercel.headers?.find((entry) => entry.source === source);
    assert.ok(rule, `missing revalidation header for ${source}`);
    assert.ok(rule.headers?.some((header) => header.key.toLowerCase() === "cache-control" && /max-age=0/.test(header.value) && /must-revalidate/.test(header.value)));
  }
});
