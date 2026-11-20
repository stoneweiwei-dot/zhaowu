import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const login = readFileSync(new URL("../src/routes/login.tsx", import.meta.url), "utf8");
const report = readFileSync(new URL("../src/components/paid-report-pages.tsx", import.meta.url), "utf8");

test("r144 login keeps only the independent owner key", () => {
  assert.match(login, /id="login-secret"/);
  assert.match(login, /type="password"/);
  assert.match(login, /ownerSignIn/);
  assert.match(login, /vercel-owner-cookie/);
  assert.match(login, /data-owner-only-login="true"/);
  assert.doesNotMatch(login, /type="email"|id="login-email"|signInWithPassword|signUpWithPassword|signupTab|startOAuth/);
});

test("owner entry remains a passcode form without a verification-code screen", () => {
  assert.doesNotMatch(login, /verification[-_ ]?code/i);
  assert.doesNotMatch(login, /otp/i);
  assert.match(login, /站主登入/);
  assert.doesNotMatch(login, /一般使用者不需要登入/);
});

test("mobile owner login keeps the approved full-width sheet", () => {
  assert.match(login, /className="stone-login-sheet seal-border"/);
  assert.doesNotMatch(login, /className="stone-login-panel seal-border"/);
  assert.match(login, /className="stone-login-primary"/);
  assert.doesNotMatch(login, /className="stone-login-lead"/);
  assert.match(login, /stone-login-stage-media/);
});

test("one-sheet report removes customer-facing metaphysical jargon", () => {
  assert.match(report, /zhaowu-report-continuous-sheet/);
  assert.doesNotMatch(report, /PERSONAL ANALYSIS|YOUR QUESTION|Reasoning notes|Chart basics/);
  assert.match(report, /questionTitle:\s*"問題"/);
  assert.match(report, /answerTitle:\s*"答案"/);
  assert.match(report, /CHINESE_JARGON/);
  assert.match(report, /ENGLISH_JARGON/);
  assert.doesNotMatch(report, /AUSPICIOUS MOTIFS/);
  assert.doesNotMatch(report, /DESTINY NARRATIVE/);
});
