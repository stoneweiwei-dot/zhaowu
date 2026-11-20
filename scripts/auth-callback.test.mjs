import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

const login = await readFile(new URL('../src/routes/login.tsx', import.meta.url), 'utf8');
const callback = await readFile(new URL('../src/routes/auth.callback.tsx', import.meta.url), 'utf8');
const provider = await readFile(new URL('../src/lib/auth/provider.tsx', import.meta.url), 'utf8');
const rest = await readFile(new URL('../src/lib/supabase-rest.ts', import.meta.url), 'utf8');

test('r144 active login route is owner-only and ordinary visitors remain device-local', () => {
  assert.match(login, /createFileRoute\("\/login"\)/);
  assert.match(login, /data-owner-only-login="true"/);
  assert.match(login, /ownerSignIn/);
  assert.match(login, /id="login-secret"/);
  assert.doesNotMatch(login, /signInWithPassword|signUpWithPassword|signupTab|login-email|startOAuth/);
  assert.match(provider, /readOwnerSession/);
  assert.match(provider, /setSharedBirthAccessUser\(null\)/);
  assert.doesNotMatch(provider, /captureOAuthRedirect|restoreSession|getProfile|memberFrom/);
});

test('legacy callback helpers remain compatible but are not part of the active customer login', () => {
  assert.match(rest, /export function startOAuth/);
  assert.match(rest, /window\.history\.replaceState/);
  assert.match(rest, /window\.location\.pathname/);
  assert.match(callback, /createFileRoute\("\/auth\/callback"\)/);
  assert.match(callback, /captureOAuthRedirect/);
  assert.match(callback, /data-auth-callback="true"/);
  assert.doesNotMatch(login, /@\/lib\/auth\/signup|captureOAuthRedirect/);
});
