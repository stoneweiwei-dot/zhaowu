import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const login = readFileSync(new URL("../src/routes/login.tsx", import.meta.url), "utf8");
const report = readFileSync(new URL("../src/components/paid-report-pages.tsx", import.meta.url), "utf8");

test("login keeps the independent owner key and email-only member fields", () => {
  assert.match(login, /type="email"|id="login-email"/);
  assert.match(login, /id="login-secret"/);
  assert.match(login, /type="password"/);
  assert.match(login, /ownerSignIn/);
  assert.match(login, /vercel-owner-cookie/);
  assert.match(login, /signInWithPassword\(email, password\)/);
  assert.match(login, /signUpWithPassword\(email, password, displayName\)/);
  assert.doesNotMatch(login, /startOAuth|onOAuth\(|data-provider=|withGoogle|withApple|withX/);
});

test("owner tab remains a passcode form without a verification-code screen", () => {
  assert.doesNotMatch(login, /verification[-_ ]?code/i);
  assert.doesNotMatch(login, /otp/i);
  assert.match(login, /signupTab/);
  assert.match(login, /站主登入/);
});

test("mobile login uses the full-width sheet instead of the decorative mini panel", () => {
  assert.match(login, /className="stone-login-sheet seal-border"/);
  assert.doesNotMatch(login, /className="stone-login-panel seal-border"/);
  assert.match(login, /className="stone-login-primary"/);
  assert.match(login, /className="stone-login-lead"/);
  assert.match(login, /className="stone-login-signature"/);
  assert.match(login, /stone-login-stage-media/);
});

test("one-sheet report removes customer-facing metaphysical jargon", () => {
  assert.match(report, /zhaowu-report-continuous-sheet/);
  assert.match(report, /PERSONAL ANALYSIS/);
  assert.match(report, /CHINESE_JARGON/);
  assert.match(report, /ENGLISH_JARGON/);
  assert.doesNotMatch(report, /AUSPICIOUS MOTIFS/);
  assert.doesNotMatch(report, /DESTINY NARRATIVE/);
});
