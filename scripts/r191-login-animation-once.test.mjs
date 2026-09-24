import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";
import {
  LOGIN_ANIMATION_SEEN_SESSION_KEY,
  markLoginAnimationSeen,
  resetLoginAnimationSeen,
  shouldPlayLoginAnimation,
} from "../src/lib/login-animation.ts";

const root = new URL("../", import.meta.url);
const source = (path) => readFile(new URL(path, root), "utf8");

test("login animation state is one-time within a sign-in flow and resets on owner logout", () => {
  const values = new Map();
  const storage = {
    getItem: (key) => values.get(key) ?? null,
    setItem: (key, value) => values.set(key, value),
    removeItem: (key) => values.delete(key),
  };
  assert.equal(LOGIN_ANIMATION_SEEN_SESSION_KEY, "zhaowu.login-animation.seen.session.v1");
  assert.equal(shouldPlayLoginAnimation(storage), true);
  markLoginAnimationSeen(storage);
  assert.equal(shouldPlayLoginAnimation(storage), false);
  resetLoginAnimationSeen(storage);
  assert.equal(shouldPlayLoginAnimation(storage), true);
});

test("only /login can mount a non-looping animation and the rest of the shell has no IntroGate", async () => {
  const [login, shell, authClient] = await Promise.all([
    source("src/routes/login.tsx"),
    source("src/components/site-shell.tsx"),
    source("src/lib/auth/client.ts"),
  ]);
  assert.match(login, /data-login-animation="first-login-visit"/);
  assert.match(login, /onEnded=\{\(\) => setShouldPlay\(false\)\}/);
  assert.doesNotMatch(login, /\bloop\b/);
  assert.doesNotMatch(shell, /IntroGate/);
  assert.match(authClient, /resetLoginAnimationSeen\(window\.sessionStorage\)/);
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
