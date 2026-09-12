import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const shell = await readFile(new URL("../src/components/site-shell.tsx", import.meta.url), "utf8");
const guestCss = await readFile(new URL("../src/guest-first-r116.css", import.meta.url), "utf8");
const main = await readFile(new URL("../src/main.tsx", import.meta.url), "utf8");
const login = await readFile(new URL("../src/routes/login.tsx", import.meta.url), "utf8");
const account = await readFile(new URL("../src/routes/account.tsx", import.meta.url), "utf8");
const sharedBirth = await readFile(new URL("../src/lib/shared-birth.ts", import.meta.url), "utf8");
const analysisForm = await readFile(new URL("../src/components/analysis-form.tsx", import.meta.url), "utf8");

test("public shell hides customer login while preserving authenticated owner/account controls", () => {
  assert.match(shell, /className="zhaowu-header-login"/);
  assert.match(guestCss, /\.zhaowu-site-header \.zhaowu-header-login[\s\S]*display:\s*none\s*!important/);
  assert.match(main, /import ['"]\.\/guest-first-r116\.css['"]/);
  assert.match(shell, /user\?\.isOwner/);
  assert.match(shell, /to="\/account"/);
  assert.match(shell, /signOut/);
});

test("owner login route remains directly available and account remains auth protected", () => {
  assert.match(login, /createFileRoute\("\/login"\)/);
  assert.match(login, /signInWithPassword/);
  assert.match(login, /login-email/);
  assert.match(login, /login-password/);
  assert.match(account, /if \(!user \|\| !session\)/);
  assert.match(account, /<Link to="\/login"/);
});

test("guest birth data stays local and account-scoped data remains isolated", () => {
  assert.match(sharedBirth, /GUEST_BIRTH_OWNER_ID/);
  assert.match(sharedBirth, /localStorage\.setItem\(SHARED_BIRTH_STORAGE_KEY/);
  assert.match(sharedBirth, /storedOwner !== activeSharedBirthUserId/);
  assert.match(sharedBirth, /signed-in user never inherits an unowned browser record/i);
});

test("free analysis can run before account persistence", () => {
  const analyzeAt = analysisForm.indexOf("analyzeLife(");
  const persistenceAt = analysisForm.indexOf("persistAnalysisHistory");
  assert.ok(analyzeAt >= 0, "analysis must remain available");
  assert.ok(persistenceAt >= 0, "authenticated history persistence must remain available");
  assert.match(analysisForm, /if \(session\)/);
  assert.match(analysisForm, /writeSharedBirthRecord/);
});
