import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { writeHomeIcons } from './write-home-icons.mjs';
import test from 'node:test';
import { createHash } from 'node:crypto';

const shell = await readFile(new URL('../src/components/site-shell.tsx', import.meta.url), 'utf8');
const bootstrap = await readFile(new URL('../src/lib/bootstrap-readiness.ts', import.meta.url), 'utf8');
const root = await readFile(new URL('../src/routes/__root.tsx', import.meta.url), 'utf8');
const gate = await readFile(new URL('../src/components/intro-gate.tsx', import.meta.url), 'utf8');
const css = await readFile(new URL('../src/intro-extra.css', import.meta.url), 'utf8');
const mediaWriter = await readFile(new URL('./write-intro-media.mjs', import.meta.url), 'utf8');
const {
  INTRO_GATE_HARD_EXIT_MS,
  scheduleIntroGateHardExit,
} = await import('../src/lib/intro-gate-policy.ts');

test('home opens without a blocking loading gate', () => {
  assert.doesNotMatch(shell, /<IntroGate/);
  assert.doesNotMatch(shell, /loading-v10\.mp4/);
  assert.doesNotMatch(shell, /loading-v11\.mp4/);
  assert.doesNotMatch(shell, /loading-v13\.mp4/);
});

test('bootstrap still checks nine-page report runtime', () => {
  assert.match(bootstrap, /site_settings\?key=eq\.migration_state/);
  assert.match(bootstrap, /import\("@\/lib\/actions"\)/);
  assert.match(bootstrap, /import\("@\/lib\/report\/nine-page"\)/);
  assert.match(bootstrap, /import\("@\/lib\/report\/paid-report-style"\)/);
  assert.match(bootstrap, /reportStyle\.status !== "production"/);
  assert.match(bootstrap, /正在待命四柱繪意/);
});

test('bootstrap does not preload customer report copy that belongs to result rendering', () => {
  assert.doesNotMatch(bootstrap, /import\("@\/lib\/report\/customer-copy"\)/);
  assert.doesNotMatch(bootstrap, /from ["']@\/lib\/report\/customer-copy["']/);
});

test('loading gate hard-exits inside the three-second bloom budget', () => {
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

  assert.equal(INTRO_GATE_HARD_EXIT_MS, 3000);
  assert.ok(INTRO_GATE_HARD_EXIT_MS >= 2734);
  assert.ok(INTRO_GATE_HARD_EXIT_MS <= 3000);
  assert.equal(scheduledDelay, 3000);
  scheduledCallback();
  assert.equal(exited, true);
  cancel();
  assert.equal(cancelledTimer, 17);
});

test('intro restores the original Song-paper twin-lotus opening and falling flowers', async () => {
  assert.match(gate, /wutong-owner-r29\.mp4/);
  assert.match(gate, /wutong-owner-r29\.jpeg/);
  assert.match(gate, /onError=\{\(\) => setVideoFailed\(true\)\}/);
  assert.match(gate, /LOTUS_BLOOM_MS = 2734/);
  assert.equal(createHash('sha256').update(await readFile(new URL('../public/intro/wutong-owner-r29.mp4', import.meta.url))).digest('hex'), 'e59f2957b31835b7be8cf440cdbc1fbe33977b7c921c74efb7ff6815f7ac2197');
  assert.equal(createHash('sha256').update(await readFile(new URL('../public/intro/wutong-owner-r29.jpeg', import.meta.url))).digest('hex'), 'd5c73ff32c1fc3cab80eb2f53bba714bd247846643eaf788a475bb1c0c9df2ec');
  assert.match(gate, /playbackRate/);
  assert.match(gate, /正在準備昭梧/);
  assert.match(gate, /STONE 原創/);
  assert.doesNotMatch(gate, /zhaowu-lotus-intro__heaven/);
  assert.doesNotMatch(gate, /zhaowu-lotus-intro__hua/);
  assert.doesNotMatch(css, /zhaowu-four-hua/);
  assert.match(css, /uploaded twin-lotus loading animation/);
  assert.doesNotMatch(css, /#131b15 79%/);
  assert.doesNotMatch(gate, /loading-v13\.mp4|loading-poster\.jpg/);
  assert.match(mediaWriter, /loading-v13\.part\./);
  assert.match(mediaWriter, /VIDEO_PART_COUNT = 2/);
  assert.match(mediaWriter, /VIDEO_SHA256/);
  assert.doesNotMatch(mediaWriter, /loading-user-20260831\.part\./);
  assert.match(mediaWriter, /loading-v13\.mp4/);
  assert.doesNotMatch(gate, /loading-v10\.mp4/);
  assert.doesNotMatch(gate, /loading-v11\.mp4/);
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

test('home-screen icons are valid PNGs at iOS root and manifest sizes', async () => {
  const written = writeHomeIcons();
  assert.equal(written.length, 9);
  const rootIcon = await readFile(new URL('../public/apple-touch-icon.png', import.meta.url));
  const precomposed = await readFile(new URL('../public/apple-touch-icon-precomposed.png', import.meta.url));
  const icon192 = await readFile(new URL('../public/icons/icon-192.png', import.meta.url));
  const icon512 = await readFile(new URL('../public/icons/icon-512.png', import.meta.url));
  const source180 = await readFile(new URL('./home-icons/zhaowu-lotus-180.png', import.meta.url));
  const source192 = await readFile(new URL('./home-icons/zhaowu-lotus-192.png', import.meta.url));
  const source512 = await readFile(new URL('./home-icons/zhaowu-lotus-512.png', import.meta.url));
  const html = await readFile(new URL('../index.html', import.meta.url), 'utf8');
  const manifest = await readFile(new URL('../public/manifest.webmanifest', import.meta.url), 'utf8');
  const iconWriter = await readFile(new URL('./write-home-icons.mjs', import.meta.url), 'utf8');
  assert.equal(rootIcon.subarray(0, 8).toString('hex'), '89504e470d0a1a0a');
  assert.equal(precomposed.subarray(0, 8).toString('hex'), '89504e470d0a1a0a');
  assert.equal(icon192.subarray(0, 8).toString('hex'), '89504e470d0a1a0a');
  assert.equal(icon512.subarray(0, 8).toString('hex'), '89504e470d0a1a0a');
  assert.deepEqual(rootIcon, source180);
  assert.deepEqual(precomposed, source180);
  assert.deepEqual(icon192, source192);
  assert.deepEqual(icon512, source512);
  assert.equal(rootIcon.readUInt32BE(16), 180);
  assert.equal(rootIcon.readUInt32BE(20), 180);
  assert.equal(icon192.readUInt32BE(16), 192);
  assert.equal(icon192.readUInt32BE(20), 192);
  assert.equal(icon512.readUInt32BE(16), 512);
  assert.equal(icon512.readUInt32BE(20), 512);
  assert.doesNotMatch(iconWriter, /paintSeal|barW|barH/);
  assert.match(html, /rel="apple-touch-icon" href="\/apple-touch-icon-r20\.png"/);
  assert.match(html, /apple-touch-icon-r20-precomposed\.png/);
  assert.doesNotMatch(html, /apple-touch-icon-r20\.png\?v=/);
  assert.match(manifest, /"src": "\/apple-touch-icon-r20\.png"/);
  assert.match(manifest, /"src": "\/icons\/zhaowu-lotus-192\.png/);
  assert.match(manifest, /"src": "\/icons\/zhaowu-lotus-512\.png/);
});
