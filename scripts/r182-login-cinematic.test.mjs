import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const root = new URL("../", import.meta.url);
const source = (path) => readFile(new URL(path, root), "utf8");

test("r182 keeps owner-only auth while the login surface becomes cinematic", async () => {
  const login = await source("src/routes/login.tsx");
  const css = await source("src/zhaowu-design-system.css");
  assert.match(login, /data-owner-only-login="true"/);
  assert.match(login, /data-login-surface="cinematic-r182"/);
  assert.match(login, /LoginStageBackdrop/);
  assert.match(login, /stone-login-sound/);
  assert.match(login, /stone-login-footer/);
  assert.doesNotMatch(login, /signInWithPassword|signUpWithPassword|Google|Apple/);
  assert.match(css, /r182 — cinematic owner login/);
  assert.match(css, /place-items:\s*end center !important/);
  assert.match(css, /backdrop-filter:\s*blur\(24px\) saturate\(\.86\) !important/);
  assert.match(css, /\.stone-login-form input \{[\s\S]*min-height:\s*50px !important/);
  assert.match(css, /@media \(max-width:\s*430px\)[\s\S]*border-radius:\s*28px 28px 20px 20px !important/);
});

test("r182 does not undo the login-only animation or storage write freeze", async () => {
  const current = await source("docs/CURRENT-STATE.md");
  const storage = await source("src/lib/storage-write-policy.ts");
  const rootRoute = await source("src/routes/__root.tsx");
  assert.match(current, /動畫只屬於 `\/login`/);
  assert.match(storage, /SUPABASE_STORAGE_WRITES_PAUSED\s*=\s*true/);
  assert.doesNotMatch(rootRoute, /IntroGate/);
});
