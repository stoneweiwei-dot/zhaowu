import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';

const shell = await readFile(new URL('../src/components/site-shell.tsx', import.meta.url), 'utf8');
const bootstrap = await readFile(new URL('../src/lib/bootstrap-readiness.ts', import.meta.url), 'utf8');

test('home opens without a blocking loading gate', () => {
  assert.doesNotMatch(shell, /<IntroGate/);
  assert.doesNotMatch(shell, /loading-v10\.mp4/);
  assert.doesNotMatch(shell, /loading-v11\.mp4/);
});

test('bootstrap still checks nine-page report runtime', () => {
  assert.match(bootstrap, /site_settings\?key=eq\.migration_state/);
  assert.match(bootstrap, /import\("@\/lib\/actions"\)/);
  assert.match(bootstrap, /import\("@\/lib\/report\/nine-page"\)/);
  assert.match(bootstrap, /import\("@\/lib\/report\/paid-report-style"\)/);
  assert.match(bootstrap, /architecture\.length !== 9/);
  assert.match(bootstrap, /正在待命四柱繪意與命誥圖/);
});
