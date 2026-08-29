import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';

const shell = await readFile(new URL('../src/components/site-shell.tsx', import.meta.url), 'utf8');
const bootstrap = await readFile(new URL('../src/lib/bootstrap-readiness.ts', import.meta.url), 'utf8');
const root = await readFile(new URL('../src/routes/__root.tsx', import.meta.url), 'utf8');
const gate = await readFile(new URL('../src/components/intro-gate.tsx', import.meta.url), 'utf8');
const introCss = await readFile(new URL('../src/intro-extra.css', import.meta.url), 'utf8');
const {
  INTRO_GATE_HARD_EXIT_MS,
  scheduleIntroGateHardExit,
} = await import('../src/lib/intro-gate-policy.ts');

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

test('bootstrap does not preload customer report copy that belongs to result rendering', () => {
  assert.doesNotMatch(bootstrap, /import\("@\/lib\/report\/customer-copy"\)/);
  assert.doesNotMatch(bootstrap, /from ["']@\/lib\/report\/customer-copy["']/);
});

test('loading keeps the existing artwork and stages the lotus sequence', () => {
  assert.match(gate, /lotus-bloom-v12\\.webp/);
  assert.match(gate, /zhaowu-lotus-intro__petals/);
  assert.match(gate, /zhaowu-lotus-intro__twin-bloom/);
  assert.match(introCss, /lotus-petal-fall/);
  assert.match(introCss, /twin-lotus-bloom/);
});

test('loading gate hard-exits before the three-second mobile budget', () => {
  let scheduledDelay = null;
  let scheduledCallback = null;
  let cancelledTimer = null;
  let exited = false;

  const cancel = scheduleIntroGateHardExit(
    (callback, delayMs) => {
      scheduledCallback = callback;
      scheduledDelay = delayMs;
      return 17;
    },
    (timerId) => { cancelledTimer = timerId; },
    () => { exited = true; },
  );

  assert.equal(INTRO_GATE_HARD_EXIT_MS, 4200);
  assert.ok(INTRO_GATE_HARD_EXIT_MS <= 5000);
  assert.equal(scheduledDelay, 4200);
  scheduledCallback();
  assert.equal(exited, true);
  cancel();
  assert.equal(cancelledTimer, 17);
});

test('iPhone Safari routes stay mounted and usable when bootstrap fails', () => {
  const gatePosition = root.indexOf('<IntroGate />');
  const shellPosition = root.indexOf('<SiteShell>');

  assert.ok(gatePosition >= 0, 'the optional intro may still render');
  assert.ok(shellPosition > gatePosition, 'home, login and account content mount independently beneath the intro');
  assert.match(gate, /\.catch\(\(\) => \{[\s\S]*forceOff\(\)/);
  assert.match(gate, /Do not fade here:[\s\S]*forceOff\(\)/);
  assert.match(gate, /pointer-events-none opacity-0/);
  assert.doesNotMatch(root, /runtimeReady\s*\?\s*<SiteShell/);
});
