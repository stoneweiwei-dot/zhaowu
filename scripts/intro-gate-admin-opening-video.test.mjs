import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

// Owner report: the /gallery admin panel labeled "login videos" was in fact
// controlling /login's own sign-in screen — a screen only the owner ever
// sees — while the owner's intent for that panel was always to control what
// first-time website VISITORS see before the homepage loads (the IntroGate
// splash). /login never actually consumed the panel's Supabase uploads live
// (it only reads the static built-in LOGIN_VISUAL_CATALOG), so repointing
// the panel at IntroGate costs zero risk to the owner's own sign-in flow.
const root = new URL("../", import.meta.url);
const source = (path) => readFile(new URL(path, root), "utf8");

test("homepage IntroGate resolves an owner-selected opening video via a public, fail-open fetch", async () => {
  const gate = await source("src/components/intro-gate.tsx");
  const src = await source("src/lib/intro-visual-source.ts");

  assert.match(gate, /import \{ fetchIntroVisualOverride \} from "@\/lib\/intro-visual-source";/);
  assert.match(gate, /resolvedVideoSrc/);
  // The built-in default stays the fallback for every failure mode.
  assert.match(gate, /OWNER_LOADING_VIDEO/);
  assert.match(gate, /zhaowu-opening-r148\.mp4/);
  assert.match(gate, /zhaowu-opening-r148\.jpg/);
  assert.doesNotMatch(gate, /<svg/);

  // Public (anon-key) read only — every first-time visitor calls this
  // unauthenticated, so it must never require an owner session.
  assert.doesNotMatch(src, /access_token/);
  assert.match(src, /category=eq\.loading/);
  assert.match(src, /is_primary=eq\.true/);
  assert.match(src, /login-background/);
  assert.match(src, /AbortController/);
  assert.match(src, /catch \{\s*return null;/);
});

test("IntroGate never swaps the src of an already-resolved/playing video", async () => {
  const gate = await source("src/components/intro-gate.tsx");
  // Both the timeout branch and the fetch-resolution branch must guard on
  // "still undefined" so a late-arriving fetch can never restart playback.
  const guarded = gate.match(/setResolvedVideoSrc\(\(current\) => \(current === undefined/g) ?? [];
  assert.ok(guarded.length >= 2, "expected the undefined-guard on both the timeout and fetch outcomes");
});

test("the /gallery admin panel is relabeled as the homepage opening-video manager, not a login animation manager", async () => {
  const manager = await source("src/components/owner-login-visuals-manager.tsx");
  const route = await source("src/routes/gallery.tsx");

  assert.match(manager, /首頁開場影片管理/);
  assert.match(manager, /Homepage opening video/);
  assert.doesNotMatch(manager, /登入動畫管理/);
  assert.doesNotMatch(manager, /"Login visuals"/);
  assert.match(route, /開場影片/);
  assert.doesNotMatch(route, /登入影片/);

  // Internal identifiers (data attributes, section id, component/file name)
  // are left unchanged on purpose — only owner-facing copy moved.
  assert.match(manager, /id="login-visuals"/);
  assert.doesNotMatch(manager, /data-owner-bulk-toolbar="login-visuals"/);
  assert.match(manager, /setLoginVisualCurrent/);
});

test("/login's own sign-in screen is untouched by the relabel", async () => {
  const login = await source("src/routes/login.tsx");
  const loginAnimation = await source("src/lib/login-animation.ts");
  assert.match(login, /站主登入/);
  assert.match(login, /data-owner-only-login="true"/);
  // /login still only reads the static built-in catalog; this change did
  // not wire it to Supabase, so its behavior is byte-for-byte unchanged.
  assert.match(loginAnimation, /LOGIN_VISUAL_CATALOG/);
  assert.doesNotMatch(loginAnimation, /intro-visual-source/);
});
