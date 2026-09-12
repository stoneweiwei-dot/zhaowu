import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

const login = await readFile(new URL('../src/routes/login.tsx', import.meta.url), 'utf8');
const provider = await readFile(new URL('../src/lib/auth/provider.tsx', import.meta.url), 'utf8');
const rest = await readFile(new URL('../src/lib/supabase-rest.ts', import.meta.url), 'utf8');
const signup = await readFile(new URL('../src/lib/auth/signup.ts', import.meta.url), 'utf8');

test('legacy OAuth callback builder stays canonical while owner login exposes no OAuth entry', () => {
  assert.doesNotMatch(login, /startOAuth/);
  assert.doesNotMatch(login, /onOAuth\(/);
  assert.match(rest, /export function startOAuth/);
  assert.match(rest, /window\.location\.origin/);
  assert.match(rest, /\/login/);
});

test('auth callback tokens are captured globally before session restore', () => {
  assert.match(provider, /captureOAuthRedirect/);
  const captureIndex = provider.indexOf('captureOAuthRedirect');
  const restoreIndex = provider.indexOf('restoreSession', captureIndex);
  assert.ok(captureIndex >= 0 && restoreIndex > captureIndex);
});

test('OAuth callback cleanup removes sensitive tokens from the address bar', () => {
  assert.match(rest, /window\.history\.replaceState/);
  assert.match(rest, /window\.location\.pathname/);
});

test('retired signup helper remains production-bound while the active login exposes owner sign-in only', () => {
  assert.doesNotMatch(login, /@\/lib\/auth\/signup/);
  assert.doesNotMatch(login, /signUp|signup|register/i);
  assert.match(login, /ZHAOWU · OWNER/);
  assert.match(login, /profile\?\.is_owner/);
  assert.match(signup, /https:\/\/stone-zhaowu-official\.vercel\.app\//);
  assert.match(signup, /searchParams\.set\("redirect_to", PRODUCTION_AUTH_REDIRECT\)/);
});
