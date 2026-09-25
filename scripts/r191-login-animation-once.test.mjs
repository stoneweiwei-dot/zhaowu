import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";
import {
  LOGIN_ANIMATION_SEEN_DAY_KEY,
  markLoginAnimationSeen,
  shouldPlayLoginAnimation,
} from "../src/lib/login-animation.ts";

const root = new URL("../", import.meta.url);
const source = (path) => readFile(new URL(path, root), "utf8");

test("login animation plays at most once per local calendar day", () => {
  const values = new Map();
  const storage = {
    getItem: (key) => values.get(key) ?? null,
    setItem: (key, value) => values.set(key, value),
  };
  const dayOne = new Date(2026, 8, 25, 9, 0, 0);
  const sameDay = new Date(2026, 8, 25, 23, 30, 0);
  const nextDay = new Date(2026, 8, 26, 0, 5, 0);

  assert.equal(LOGIN_ANIMATION_SEEN_DAY_KEY, "zhaowu.login-animation.seen.day.v1");
  assert.equal(shouldPlayLoginAnimation(storage, dayOne), true);
  markLoginAnimationSeen(storage, dayOne);
  assert.equal(shouldPlayLoginAnimation(storage, sameDay), false);
  assert.equal(shouldPlayLoginAnimation(storage, nextDay), true);
});

test("only /login can mount the non-looping daily animation and it has an explicit skip", async () => {
  const [login, shell, authClient] = await Promise.all([
    source("src/routes/login.tsx"),
    source("src/components/site-shell.tsx"),
    source("src/lib/auth/client.ts"),
  ]);
  assert.match(login, /data-login-animation="first-login-visit"/);
  assert.match(login, /window\.localStorage/);
  assert.match(login, /data-login-animation-skip="true"/);
  assert.match(login, /onEnded=\{\(\) => setShouldPlay\(false\)\}/);
  assert.doesNotMatch(login, /\bloop\b/);
  assert.doesNotMatch(shell, /IntroGate/);
  assert.doesNotMatch(authClient, /resetLoginAnimationSeen/);
  assert.doesNotMatch(authClient, /sessionStorage/);
});

test("owner login manager excludes images from loading, cards, and upload validation", async () => {
  const [manager, direct, bridge] = await Promise.all([
    source("src/components/owner-login-visuals-manager.tsx"),
    source("src/lib/gallery-assets.ts"),
    source("src/lib/bridge/gallery-assets.ts"),
  ]);
  assert.match(manager, /login-background[^\n]+&& isVideo\(asset\)/);
  assert.match(manager, /accept="video\/mp4,video\/webm"/);
  assert.doesNotMatch(manager, /POSTER/);
  assert.doesNotMatch(manager, /<img /);
  assert.match(direct, /if \(!isVideo\) throw new Error\("登入動畫庫只接受 MP4／WebM 影片。"\)/);
  assert.match(bridge, /if \(!isVideo\) throw new Error\("登入動畫庫只接受 MP4／WebM 影片。"\)/);
});
