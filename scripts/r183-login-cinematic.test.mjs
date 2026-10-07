import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const root = new URL("../", import.meta.url);
const source = (path) => readFile(new URL(path, root), "utf8");

test("owner-only auth remains intact while login becomes a static Song landscape", async () => {
  const login = await source("src/routes/login.tsx");
  const css = await source("src/zhaowu-design-system.css");

  assert.match(login, /data-owner-only-login="true"/);
  assert.match(login, /data-login-backend="vercel-owner-cookie"/);
  assert.match(login, /data-login-surface="song-landing-r224"/);
  assert.match(login, /\/hero-gallery\/dragon-scholar\.webp/);
  assert.match(login, /data-login-stage-static="true"/);
  assert.doesNotMatch(login, /<video|LoginStageBackdrop|stone-login-sound|data-login-animation/);
  assert.doesNotMatch(login, /signInWithPassword|signUpWithPassword|Google|Apple/);

  assert.match(css, /final Song login, explicit language\/login row, and quiet utility dock/);
  assert.match(css, /data-login-surface="song-landing-r224"/);
  assert.match(css, /place-items:\s*end center !important/);
  assert.match(css, /background:\s*rgba\(255, 250, 239, \.84\) !important/);
  assert.match(css, /\.stone-login-form input \{[\s\S]*min-height:\s*50px !important/);
});

test("current runtime documents static owner login and a mascot-free utility dock", async () => {
  const current = await source("docs/CURRENT-STATE.md");
  const rootRoute = await source("src/routes/__root.tsx");
  const shell = await source("src/components/site-shell.tsx");

  assert.match(current, /owner-only login/);
  assert.match(current, /dragon-scholar\.webp/);
  assert.match(current, /青玉小龍已退出公開 runtime/);
  assert.match(current, /SiteUtilityDock/);
  assert.match(shell, /isHome \? <IntroGate \/> : null/);
  assert.match(shell, /<SiteUtilityDock \/>/);
  assert.doesNotMatch(shell, /<GreenDragonGuide \/>/);
  assert.doesNotMatch(rootRoute, /IntroGate/);
});
