import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const root = new URL("../", import.meta.url);
const source = (path) => readFile(new URL(path, root), "utf8");

test("r187 owner console removes instructional helper copy", async () => {
  const account = await source("src/routes/account.tsx");
  const galleryRoute = await source("src/routes/gallery.tsx");
  const gallery = await source("src/components/owner-gallery-manager.tsx");
  const loginVisuals = await source("src/components/owner-login-visuals-manager.tsx");
  assert.doesNotMatch(account, /管理網站內容、音樂與素材。技術診斷預設收起/);
  assert.doesNotMatch(account, /c\.backgroundLead/);
  assert.doesNotMatch(galleryRoute, /登入畫面與內容圖庫分開管理/);
  assert.doesNotMatch(gallery, /copy\.lead/);
  assert.doesNotMatch(loginVisuals, /copy\.lead/);
  for (const file of [account, gallery, loginVisuals]) assert.match(file, /Storage read-only/);
});

test("r187 English has independent Latin typography and mobile rows", async () => {
  const css = await source("src/zhaowu-design-system.css");
  assert.match(css, /r187 — English is a separate typographic\/layout system/);
  assert.match(css, /Iowan Old Style/);
  assert.match(css, /Avenir Next/);
  assert.match(css, /html\[lang="en"\] \.zhaowu-site-header \[data-site-status-strip\][\s\S]*grid-row: 2 !important/);
  assert.match(css, /html\[lang="en"\] \.zhaowu-site-header \.zhaowu-header-nav[\s\S]*grid-row: 3 !important/);
  assert.match(css, /grid-template-columns: repeat\(2, minmax\(0, 1fr\)\) !important/);
});

test("r187 removes stale English Netlify release copy", async () => {
  const updates = await source("src/routes/updates.tsx");
  assert.doesNotMatch(updates, /repairs Netlify owner sign-in/);
  assert.match(updates, /gives English its own typography/);
});
