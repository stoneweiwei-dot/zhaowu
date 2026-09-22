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
  INTRO_GATE_MIN_VISIBLE_MS,
  INTRO_GATE_NATIVE_MS,
  INTRO_GATE_TARGET_MS,
  INTRO_GATE_HARD_EXIT_MS,
  INTRO_GATE_ERROR_EXIT_MS,
  INTRO_SEEN_KEY,
  INTRO_FORCE_KEY,
  INTRO_BROKEN_KEY,
  scheduleIntroGateHardExit,
  shouldSkipIntroGate,
  markIntroSeen,
} = await import('../src/lib/intro-gate-policy.ts');

test('home opens with the root intro layered above an independently mounted shell', () => {
  assert.doesNotMatch(shell, /<IntroGate/);
  const gatePosition = root.indexOf('<IntroGate />');
  const shellPosition = root.indexOf('<SiteShell>');
  assert.ok(gatePosition >= 0);
  assert.ok(shellPosition > gatePosition);
  assert.doesNotMatch(root, /runtimeReady\s*\?\s*<SiteShell/);
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

test('opening contract is a full five seconds with only a later emergency hard exit', () => {
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

  assert.equal(INTRO_GATE_MIN_VISIBLE_MS, 5000);
  assert.equal(INTRO_GATE_NATIVE_MS, 5000);
  assert.equal(INTRO_GATE_TARGET_MS, 5000);
  assert.equal(INTRO_GATE_HARD_EXIT_MS, 8000);
  assert.equal(INTRO_GATE_ERROR_EXIT_MS, 1600);
  assert.ok(INTRO_GATE_HARD_EXIT_MS > INTRO_GATE_MIN_VISIBLE_MS);
  assert.equal(scheduledDelay, 8000);
  scheduledCallback();
  assert.equal(exited, true);
  cancel();
  assert.equal(cancelledTimer, 17);
});

test('intro cannot be skipped before five seconds and exits after the visual has completed', () => {
  assert.match(gate, /onEnded=\{\(\) => setVisualDone\(true\)\}/);
  assert.match(gate, /minimumDone && visualDone/);
  assert.match(gate, /INTRO_GATE_MIN_VISIBLE_MS/);
  assert.match(gate, /hasPlayedRef/);
  assert.match(gate, /INTRO_GATE_ERROR_EXIT_MS/);
  assert.match(gate, /INTRO_BROKEN_KEY/);
  assert.match(gate, /missing-force-fail\.mp4/);
  assert.match(gate, /isForcedBrokenIntro/);
  assert.doesNotMatch(gate, /data-intro-skip/);
  assert.doesNotMatch(gate, /zhaowu-lotus-intro__skip/);
  assert.doesNotMatch(gate, /skipLabel/);
  assert.doesNotMatch(gate, /runtimeReady/);
});

test('real visitors receive the opening once per browser storage while force=1 still overrides seen state', () => {
  const storage = new Map();
  const fake = {
    getItem: (key) => storage.get(key) ?? null,
    setItem: (key, value) => { storage.set(key, value); },
  };
  assert.equal(shouldSkipIntroGate(fake, false), false);
  assert.equal(shouldSkipIntroGate(fake, true), true);
  markIntroSeen(fake);
  assert.equal(fake.getItem(INTRO_SEEN_KEY), '1');
  assert.equal(shouldSkipIntroGate(fake, false), true);
  assert.equal(shouldSkipIntroGate(fake, true), true);
  fake.setItem(INTRO_FORCE_KEY, '1');
  assert.equal(shouldSkipIntroGate(fake, false), false);
  assert.equal(shouldSkipIntroGate(fake, true), false);
  assert.equal(INTRO_SEEN_KEY, 'zhaowu.intro.seen.r148');
  assert.equal(INTRO_BROKEN_KEY, 'zhaowu.intro.broken');
});

test('intro uses the committed r148 opening video and matching poster fallback', () => {
  assert.match(gate, /zhaowu-opening-r148\.mp4/);
  assert.match(gate, /zhaowu-opening-r148\.jpg/);
  assert.match(gate, /data-intro-motion="zhaowu-opening-r148"/);
  assert.match(gate, /data-intro-fallback-mode="r148-poster"/);
  assert.match(gate, /playsInline/);
  assert.match(css, /zhaowu-lotus-intro__video/);
  assert.match(css, /object-fit: cover/);
  assert.match(css, /prefers-reduced-motion/);
  assert.match(css, /zhaowu-opening-r148\.jpg/);
  assert.doesNotMatch(gate, /owner-immortal-ascent-r123/);
  assert.doesNotMatch(css, /owner-immortal-ascent-r123\.jpg/);
  assert.doesNotMatch(gate, /STONE 原創/);
  assert.doesNotMatch(art, /zhaowu-four-hua|天界四華|天界四华/);
});

test('intro video remains visible before playing and owner login stays independent from Supabase Auth', async () => {
  const design = await readFile(new URL('../src/zhaowu-design-system.css', import.meta.url), 'utf8');
  const rest = await readFile(new URL('../src/lib/supabase-rest.ts', import.meta.url), 'utf8');
  const login = await readFile(new URL('../src/routes/login.tsx', import.meta.url), 'utf8');
  assert.match(design, /\.zhaowu-lotus-intro__video \{\s*opacity: 1 !important;/);
  assert.doesNotMatch(design, /\.zhaowu-lotus-intro__video \{\s*opacity: 0 !important;/);
  assert.match(css, /opacity: 1;/);
  assert.doesNotMatch(css, /\.zhaowu-lotus-intro__video \{\s*display: none;/);
  assert.match(rest, /res\.status === 402/);
  assert.match(login, /vercel-owner-cookie/);
  assert.match(login, /ownerSignIn/);
  assert.doesNotMatch(login, /data-login-backend="supabase"/);
});

test('bootstrap readiness warms underneath the intro and cannot shorten or extend the five-second visual', () => {
  assert.match(gate, /runBootstrapReadiness\(\(\) => \{\}\)/);
  assert.match(gate, /never shorten or extend the five-second visual contract/);
  assert.doesNotMatch(gate, /setRuntimeReady/);
  assert.doesNotMatch(gate, /minimumDone && runtimeReady/);
  assert.match(gate, /pointer-events-none opacity-0/);
});

test('home-screen icons are valid PNGs at iOS root and manifest sizes', async () => {
  const written = writeHomeIcons();
  assert.equal(written.length, 17);
  const rootIcon = await readFile(new URL('../public/apple-touch-icon.png', import.meta.url));
  const precomposed = await readFile(new URL('../public/apple-touch-icon-precomposed.png', import.meta.url));
  const icon192 = await readFile(new URL('../public/icons/icon-192.png', import.meta.url));
  const icon512 = await readFile(new URL('../public/icons/icon-512.png', import.meta.url));
  const source180 = await readFile(new URL('./home-icons/zhaowu-gourd-wordmark-r113-180.png', import.meta.url));
  const source192 = await readFile(new URL('./home-icons/zhaowu-gourd-wordmark-r113-192.png', import.meta.url));
  const source512 = await readFile(new URL('./home-icons/zhaowu-gourd-wordmark-r113-512.png', import.meta.url));
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
  assert.match(html, /rel="apple-touch-icon" href="\/apple-touch-icon-r113\.png"/);
  assert.match(html, /apple-touch-icon-r113-precomposed\.png/);
  assert.doesNotMatch(html, /apple-touch-icon-r53\.png/);
  assert.match(manifest, /"src": "\/apple-touch-icon-r113\.png"/);
  assert.match(manifest, /"src": "\/icons\/zhaowu-gourd-wordmark-r113-192\.png/);
  assert.match(manifest, /"src": "\/icons\/zhaowu-gourd-wordmark-r113-512\.png/);
});

test('r148 opening is a committed high-resolution H.264 asset with matching JPEG poster', async () => {
  const video = await readFile(new URL('../public/intro/zhaowu-opening-r148.mp4', import.meta.url));
  const poster = await readFile(new URL('../public/intro/zhaowu-opening-r148.jpg', import.meta.url));
  assert.equal(video.subarray(4, 8).toString('ascii'), 'ftyp');
  assert.ok(video.length > 5_000_000, '1080x1920 five-second master must not be replaced by a low-bitrate/downscaled clip');
  assert.ok(video.length < 12_000_000, 'opening remains inside the repository media budget');
  assert.equal(poster[0], 0xff);
  assert.equal(poster[1], 0xd8);
});
