import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

const login = await readFile(new URL('../src/routes/login.tsx', import.meta.url), 'utf8');
const callback = await readFile(new URL('../src/routes/auth.callback.tsx', import.meta.url), 'utf8');
const provider = await readFile(new URL('../src/lib/auth/provider.tsx', import.meta.url), 'utf8');
const rest = await readFile(new URL('../src/lib/supabase-rest.ts', import.meta.url), 'utf8');
const signup = await readFile(new URL('../src/lib/auth/signup.ts', import.meta.url), 'utf8');

test('login exposes email-only member auth while keeping the owner tab', () => {
  assert.match(login, /signInWithPassword\(email, password\)/);
  assert.match(login, /signUpWithPassword\(email, password, displayName\)/);
  assert.match(login, /signupTab/);
  assert.match(login, /createFileRoute\("\/login"\)/);
  assert.doesNotMatch(login, /startOAuth|onOAuth\(|data-provider=|withGoogle|withApple|withX/);
  // Legacy OAuth/callback helpers remain available for old links and for the
  // email-confirmation redirect parser, but they are no longer customer UI.
  assert.match(rest, /export function startOAuth/);
  assert.match(rest, /window\.location\.origin/);
  assert.match(rest, /\/auth\/callback/);
});

test('owner session restore stays independent and member restore captures legacy callback hashes', () => {
  assert.match(provider, /readOwnerSession/);
  assert.match(provider, /OWNER_USER/);
  assert.match(provider, /captureOAuthRedirect/);
  assert.match(provider, /restoreSession/);
  assert.match(provider, /isOwner: false/);
});

test('legacy OAuth callback cleanup still removes sensitive tokens from the address bar', () => {
  assert.match(rest, /window\.history\.replaceState/);
  assert.match(rest, /window\.location\.pathname/);
});

test('email confirmation lands on /auth/callback instead of a blank homepage', () => {
  assert.match(callback, /createFileRoute\("\/auth\/callback"\)/);
  assert.match(callback, /captureOAuthRedirect/);
  assert.match(callback, /data-auth-callback="true"/);
  assert.match(signup, /\/auth\/callback/);
  assert.match(login, /@\/lib\/auth\/signup/);
  assert.match(login, /signUpWithPassword/);
  assert.match(login, /signupTab/);
});
