import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const login = readFileSync(new URL("../src/routes/login.tsx", import.meta.url), "utf8");
const report = readFileSync(new URL("../src/components/paid-report-pages.tsx", import.meta.url), "utf8");

test("owner login exposes email credentials without third-party OAuth or signup controls", () => {
  assert.match(login, /type="email"/);
  assert.match(login, /type="password"/);
  assert.match(login, /ZHAOWU · OWNER/);
  assert.match(login, /站主登入/);
  assert.match(login, /profile\?\.is_owner/);
  assert.doesNotMatch(login, /onOAuth\(/);
  assert.doesNotMatch(login, /startOAuth/);
  assert.doesNotMatch(login, /data-provider=/);
  assert.doesNotMatch(login, /oauthCopy/);
  assert.doesNotMatch(login, /verification[-_ ]?code|otp|signUp|signup|register/i);
});

test("owner-only login has no separate verification or registration screen", () => {
  assert.doesNotMatch(login, /verification[-_ ]?code/i);
  assert.doesNotMatch(login, /otp/i);
  assert.match(login, /Owner sign-in only/);
  assert.match(login, /signInWithPassword/);
});

test("mobile owner login uses the full-width sheet instead of the decorative mini panel", () => {
  assert.match(login, /className="stone-login-sheet seal-border"/);
  assert.doesNotMatch(login, /className="stone-login-panel seal-border"/);
  assert.match(login, /className="stone-login-primary"/);
  assert.match(login, /className="stone-login-lead"/);
  assert.match(login, /className="stone-login-signature"/);
});

test("one-sheet report removes customer-facing metaphysical jargon", () => {
  assert.match(report, /zhaowu-report-continuous-sheet/);
  assert.match(report, /PERSONAL ANALYSIS/);
  assert.match(report, /CHINESE_JARGON/);
  assert.match(report, /ENGLISH_JARGON/);
  assert.doesNotMatch(report, /AUSPICIOUS MOTIFS/);
  assert.doesNotMatch(report, /DESTINY NARRATIVE/);
});
