import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const root = new URL("../", import.meta.url);
const source = (path) => readFile(new URL(path, root), "utf8");

test("r183 keeps owner-only auth while the login surface becomes cinematic", async () => {
  const login = await source("src/routes/login.tsx");
  const css = await source("src/zhaowu-design-system.css");
  assert.match(login, /data-owner-only-login="true"/);
  assert.match(login, /data-login-surface="cinematic-r183"/);
  assert.match(login, /LoginStageBackdrop/);
  assert.match(login, /stone-login-sound/);
  assert.match(login, /stone-login-footer/);
  assert.doesNotMatch(login, /signInWithPassword|signUpWithPassword|Google|Apple/);
  assert.match(css, /r183 — cinematic owner login/);
  assert.match(css, /place-items:\s*end center !important/);
  assert.match(css, /backdrop-filter:\s*blur\(24px\) saturate\(\.86\) !important/);
  assert.match(css, /\.stone-login-form input \{[\s\S]*min-height:\s*50px !important/);
  assert.match(css, /@media \(max-width:\s*430px\)[\s\S]*border-radius:\s*28px 28px 20px 20px !important/);
});

test("r184 keeps the r183 owner-login cinematic while home regains a separate one-time intro", async () => {
  const current = await source("docs/CURRENT-STATE.md");
  const storage = await source("src/lib/storage-write-policy.ts");
  const rootRoute = await source("src/routes/__root.tsx");
  const shell = await source("src/components/site-shell.tsx");
  assert.match(current, /首頁恢復 \*\*一次性 Loading／IntroGate\*\*/);
  assert.match(current, /`\/login` 仍保留 r183 的全屏動態站主登入舞台/);
  assert.match(storage, /SUPABASE_STORAGE_WRITES_PAUSED\s*=\s*true/);
  assert.doesNotMatch(rootRoute, /IntroGate/);
  assert.match(shell, /\{isHome \? <IntroGate \/> : null\}/);
});
