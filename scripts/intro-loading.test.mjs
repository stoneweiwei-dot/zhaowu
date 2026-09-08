import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { writeHomeIcons } from './write-home-icons.mjs';
import test from 'node:test';

const shell = await readFile(new URL('../src/components/site-shell.tsx', import.meta.url), 'utf8');
const bootstrap = await readFile(new URL('../src/lib/bootstrap-readiness.ts', import.meta.url), 'utf8');
const root = await readFile(new URL('../src/routes/__root.tsx', import.meta.url), 'utf8');
const gate = await readFile(new URL('../src/components/intro-gate.tsx', import.meta.url), 'utf8');
const art = await readFile(new URL('../src/components/intro-lotus-art.tsx', import.meta.url), 'utf8');
const css = await readFile(new URL('../src/intro-extra.css', import.meta.url), 'utf8');
const {
  INTRO_GATE_TARGET_MS,
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

test('loading gate has a target and hard exit below three seconds', () => {
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

  assert.equal(INTRO_GATE_TARGET_MS, 2400);
  assert.equal(INTRO_GATE_HARD_EXIT_MS, 2800);
  assert.ok(INTRO_GATE_TARGET_MS < INTRO_GATE_HARD_EXIT_MS);
  assert.ok(INTRO_GATE_HARD_EXIT_MS < 3000);
  assert.equal(scheduledDelay, 2800);
  scheduledCallback();
  assert.equal(exited, true);
  cancel();
  assert.equal(cancelledTimer, 17);
});

test('intro exits when runtime is ready at the target or when the visual finishes, whichever is appropriate', () => {
  assert.match(gate, /INTRO_GATE_TARGET_MS/);
  assert.match(gate, /setTargetDone\(true\)/);
  assert.match(gate, /minimumDone && runtimeReady && \(targetDone \|\| visualDone\)/);
  assert.match(gate, /must never block access for three seconds/);
});

test('intro plays the committed owner lotus bloom and keeps an animated vector fallback', () => {
  assert.match(gate, /OWNER_LOADING_VIDEO/);
  assert.match(gate, /data-intro-motion="owner-video"/);
  assert.match(gate, /owner-lotus-bloom-r53\.mp4/);
  assert.match(gate, /owner-lotus-bloom-r53\.jpg/);
  assert.match(css, /zhaowu-lotus-intro__video/);
  assert.match(css, /object-fit: cover/);
  assert.match(css, /prefers-reduced-motion/);
  assert.match(css, /owner-lotus-bloom-r53\.jpg/);
  assert.match(gate, /playsInline/);
  assert.match(gate, /data-intro-fallback-mode="animated-vector"/);
  assert.match(gate, /zhaowu-lotus-intro__fallback-copy/);
  assert.match(gate, /data-intro-fallback/);
  assert.doesNotMatch(gate, /wutong-owner-r29|lotus-bloom-v12\.webp|loading-owner-r40|twin-lotus-restored-r26/);
  assert.doesNotMatch(css, /loading-owner-r40|twin-lotus-restored-r26/);
  assert.doesNotMatch(gate, /STONE 原創/);
  assert.doesNotMatch(gate, /zhaowu-lotus-intro__copy|zhaowu-lotus-intro__status|zhaowu-lotus-intro__bar/);
  assert.doesNotMatch(art, /zhaowu-four-hua|天界四華|天界四华/);
});

test('iPhone Safari routes stay mounted and Loading remains perceptible when bootstrap fails', () => {
  const gatePosition = root.indexOf('<IntroGate />');
  const shellPosition = root.indexOf('<SiteShell>');

  assert.ok(gatePosition >= 0, 'the optional intro may still render');
  assert.ok(shellPosition > gatePosition, 'home, login and account content mount independently beneath the intro');
  assert.match(gate, /\.catch\(\(\) => \{[\s\S]*setRuntimeReady\(true\)/);
  assert.match(gate, /backend trouble[\s\S]*setRuntimeReady\(true\)/);
  assert.doesNotMatch(gate, /\.catch\(\(\) => \{[\s\S]*forceOff\(\)/);
  assert.match(gate, /pointer-events-none opacity-0/);
  assert.doesNotMatch(root, /runtimeReady\s*\?\s*<SiteShell/);
});

test('home-screen icons are valid PNGs at iOS root and manifest sizes', async () => {
  const written = writeHomeIcons();
  assert.equal(written.length, 17);
  const rootIcon = await readFile(new URL('../public/apple-touch-icon.png', import.meta.url));
  const versionedRootIcon = await readFile(new URL('../public/apple-touch-icon-r86.png', import.meta.url));
  const precomposed = await readFile(new URL('../public/apple-touch-icon-precomposed.png', import.meta.url));
  const icon192 = await readFile(new URL('../public/icons/icon-192.png', import.meta.url));
  const icon512 = await readFile(new URL('../public/icons/icon-512.png', import.meta.url));
  const versionedIcon192 = await readFile(new URL('../public/icons/zhaowu-gourd-wordmark-r86-192.png', import.meta.url));
  const versionedIcon512 = await readFile(new URL('../public/icons/zhaowu-gourd-wordmark-r86-512.png', import.meta.url));
  const source180 = await readFile(new URL('./home-icons/zhaowu-gourd-wordmark-r86-180.png', import.meta.url));
  const source192 = await readFile(new URL('./home-icons/zhaowu-gourd-wordmark-r86-192.png', import.meta.url));
  const source512 = await readFile(new URL('./home-icons/zhaowu-gourd-wordmark-r86-512.png', import.meta.url));
  const source1024 = await readFile(new URL('./home-icons/zhaowu-gourd-wordmark-r86-1024.png', import.meta.url));
  const icon1024 = await readFile(new URL('../public/icons/zhaowu-gourd-wordmark-r86-1024.png', import.meta.url));
  const html = await readFile(new URL('../index.html', import.meta.url), 'utf8');
  const manifest = await readFile(new URL('../public/manifest.webmanifest', import.meta.url), 'utf8');
  const iconWriter = await readFile(new URL('./write-home-icons.mjs', import.meta.url), 'utf8');
  assert.equal(rootIcon.subarray(0, 8).toString('hex'), '89504e470d0a1a0a');
  assert.equal(precomposed.subarray(0, 8).toString('hex'), '89504e470d0a1a0a');
  assert.equal(icon192.subarray(0, 8).toString('hex'), '89504e470d0a1a0a');
  assert.equal(icon512.subarray(0, 8).toString('hex'), '89504e470d0a1a0a');
  assert.deepEqual(rootIcon, source180);
  assert.deepEqual(versionedRootIcon, source180);
  assert.deepEqual(precomposed, source180);
  assert.deepEqual(icon192, source192);
  assert.deepEqual(icon512, source512);
  assert.deepEqual(versionedIcon192, source192);
  assert.deepEqual(versionedIcon512, source512);
  assert.deepEqual(icon1024, source1024);
  assert.equal(rootIcon.readUInt32BE(16), 180);
  assert.equal(rootIcon.readUInt32BE(20), 180);
  assert.equal(icon192.readUInt32BE(16), 192);
  assert.equal(icon192.readUInt32BE(20), 192);
  assert.equal(icon512.readUInt32BE(16), 512);
  assert.equal(icon512.readUInt32BE(20), 512);
  assert.equal(icon1024.readUInt32BE(16), 1024);
  assert.equal(icon1024.readUInt32BE(20), 1024);
  assert.doesNotMatch(iconWriter, /paintSeal|barW|barH/);
  assert.match(html, /rel="apple-touch-icon" href="\/apple-touch-icon-r86\.png"/);
  assert.match(html, /apple-touch-icon-r86-precomposed\.png/);
  assert.doesNotMatch(html, /apple-touch-icon-r53\.png/);
  assert.match(manifest, /"src": "\/apple-touch-icon-r86\.png"/);
  assert.match(manifest, /"src": "\/icons\/zhaowu-gourd-wordmark-r86-192\.png/);
  assert.match(manifest, /"src": "\/icons\/zhaowu-gourd-wordmark-r86-512\.png/);
  assert.match(manifest, /"src": "\/icons\/zhaowu-gourd-wordmark-r86-1024\.png/);
});

test('owner loading video is a committed H.264 file, not a rewrite 404', async () => {
  const video = await readFile(new URL('../public/intro/owner-lotus-bloom-r53.mp4', import.meta.url));
  const poster = await readFile(new URL('../public/intro/owner-lotus-bloom-r53.jpg', import.meta.url));
  assert.equal(video.subarray(4, 8).toString('ascii'), 'ftyp');
  assert.ok(video.length > 400_000, 'owner bloom must be a real encoded clip');
  assert.ok(video.length < 1_500_000, 'owner bloom must stay small enough for iPhone first paint');
  assert.equal(poster[0], 0xff);
  assert.equal(poster[1], 0xd8);
});
