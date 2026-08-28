import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const login = readFileSync(new URL("../src/routes/login.tsx", import.meta.url), "utf8");
const report = readFileSync(new URL("../src/components/paid-report-pages.tsx", import.meta.url), "utf8");

test("login exposes Google, Apple and email without an X option", () => {
  assert.match(login, /onOAuth\("google"\)/);
  assert.match(login, /onOAuth\("apple"\)/);
  assert.match(login, /type="email"/);
  assert.doesNotMatch(login, /onOAuth\("twitter"\)/);
  assert.doesNotMatch(login, />\s*X\s*</);
});

test("email signup has no separate verification-code screen", () => {
  assert.doesNotMatch(login, /verification[-_ ]?code/i);
  assert.doesNotMatch(login, /otp/i);
  assert.match(login, /backend decides whether confirmation is required/);
});

test("mobile login uses the full-width sheet instead of the decorative mini panel", () => {
  assert.match(login, /className="stone-login-sheet seal-border"/);
  assert.doesNotMatch(login, /className="stone-login-panel seal-border"/);
  assert.match(login, /className="stone-login-primary"/);
  assert.match(login, /className="stone-login-message"/);
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
