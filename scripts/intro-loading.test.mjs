import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';

const intro = await readFile(new URL('../src/components/intro-gate.tsx', import.meta.url), 'utf8');
const bootstrap = await readFile(new URL('../src/lib/bootstrap-readiness.ts', import.meta.url), 'utf8');

test('loading gate uses the approved animated opening and copy', () => {
  assert.match(intro, /\/intro\/loading-v11\.mp4/);
  assert.doesNotMatch(intro, /loading-v10\.mp4/);
  assert.match(intro, /\/intro\/loading-poster\.jpg/);
  assert.match(intro, /昭於未見，梧於有歸。/);
  assert.match(intro, /命理不是宿命/);
  assert.match(intro, /運勢不是答案/);
  assert.match(intro, /選擇才是開始/);
  assert.match(intro, /See the unseen\. Find your ground\./);
});

test('loading gate waits for auth and critical bootstrap readiness', () => {
  assert.match(intro, /bootReady/);
  assert.match(intro, /isPending/);
  assert.match(intro, /videoReady/);
  assert.match(bootstrap, /site_settings\?key=eq\.migration_state/);
  assert.match(bootstrap, /import\("@\/lib\/actions"\)/);
  assert.match(bootstrap, /import\("@\/lib\/report\/nine-page"\)/);
  assert.match(bootstrap, /import\("@\/lib\/report\/paid-report-style"\)/);
  assert.match(bootstrap, /architecture\.length !== 9/);
  assert.match(bootstrap, /正在待命四柱繪意與命誥圖/);
});
