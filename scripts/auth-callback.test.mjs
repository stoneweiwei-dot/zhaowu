import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

const login = await readFile(new URL('../src/routes/login.tsx', import.meta.url), 'utf8');
const provider = await readFile(new URL('../src/lib/auth/provider.tsx', import.meta.url), 'utf8');
const rest = await readFile(new URL('../src/lib/supabase-rest.ts', import.meta.url), 'utf8');

test('OAuth buttons use the canonical absolute callback builder', () => {
  assert.match(login, /startOAuth\(provider\)/);
  assert.doesNotMatch(login, /startOAuth\(provider,\s*["']\/login["']\)/);
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
