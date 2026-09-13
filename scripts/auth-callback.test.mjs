import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

const login = await readFile(new URL('../src/routes/login.tsx', import.meta.url), 'utf8');
const provider = await readFile(new URL('../src/lib/auth/provider.tsx', import.meta.url), 'utf8');
const rest = await readFile(new URL('../src/lib/supabase-rest.ts', import.meta.url), 'utf8');

test('legacy OAuth callback builder stays canonical while login exposes no OAuth entry', () => {
  assert.doesNotMatch(login, /startOAuth/);
  assert.doesNotMatch(login, /onOAuth\(/);
  assert.match(rest, /export function startOAuth/);
  assert.match(rest, /window\.location\.origin/);
  assert.match(rest, /\/login/);
});

test('owner session restore is independent from Supabase OAuth callbacks', () => {
  assert.match(provider, /readOwnerSession/);
  assert.match(provider, /OWNER_USER/);
  assert.doesNotMatch(provider, /captureOAuthRedirect|restoreSession/);
});

test('legacy OAuth callback cleanup still removes sensitive tokens from the address bar', () => {
  assert.match(rest, /window\.history\.replaceState/);
  assert.match(rest, /window\.location\.pathname/);
});

test('login is reserved for the owner and does not expose signup confirmation', () => {
  assert.doesNotMatch(login, /@\/lib\/auth\/signup/);
  assert.doesNotMatch(login, /signUp|sign up|註冊|注册/i);
  assert.match(login, /站主登入/);
  assert.match(login, /data-login-backend="vercel-owner-cookie"/);
});
