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

test('loading gate uses native owner duration, skip, and a hard exit above ten seconds', () => {
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

  assert.equal(INTRO_GATE_NATIVE_MS, 10040);
  assert.equal(INTRO_GATE_TARGET_MS, 10040);
  assert.equal(INTRO_GATE_HARD_EXIT_MS, 12000);
  assert.equal(INTRO_GATE_ERROR_EXIT_MS, 1600);
  assert.ok(INTRO_GATE_NATIVE_MS < INTRO_GATE_HARD_EXIT_MS);
  assert.ok(INTRO_GATE_HARD_EXIT_MS > 10000);
  assert.equal(scheduledDelay, 12000);
  scheduledCallback();
  assert.equal(exited, true);
  cancel();
  assert.equal(cancelledTimer, 17);
});

test('intro finishes on native video end or skip, never on a 3s target timer', () => {
  assert.match(gate, /onEnded=\{\(\) => setVisualDone\(true\)\}/);
  assert.match(gate, /data-intro-skip/);
  assert.match(gate, /zhaowu-lotus-intro__skip/);
  assert.match(gate, /minimumDone && runtimeReady && visualDone/);
  assert.match(gate, /hasPlayedRef/);
  assert.match(gate, /INTRO_GATE_ERROR_EXIT_MS/);
  assert.match(gate, /INTRO_BROKEN_KEY/);
  assert.match(gate, /missing-force-fail\.mp4/);
  assert.match(gate, /isForcedBrokenIntro/);
  assert.match(gate, /if \(!isForcedBrokenIntro\(\)\) return/);
  assert.doesNotMatch(gate, /onStalled=\{\(\) => setVideoPlaying\(false\)\}/);
  assert.match(gate, /className="zhaowu-lotus-intro__video is-playing"/);
  assert.doesNotMatch(gate, /setTargetDone\(true\)/);
  assert.doesNotMatch(gate, /must never block access for three seconds/);
});

test('Playwright webdriver skips the 10s intro unless force=1, and seen marks persist per release', () => {
  const storage = new Map();
  const fake = {
    getItem: (key) => storage.get(key) ?? null,
    setItem: (key, value) => { storage.set(key, value); },
  };
  assert.equal(shouldSkipIntroGate(fake, true), true);
  fake.setItem(INTRO_FORCE_KEY, "1");
  assert.equal(shouldSkipIntroGate(fake, true), false);
  fake.setItem(INTRO_FORCE_KEY, "0");
  markIntroSeen(fake);
  assert.equal(fake.getItem(INTRO_SEEN_KEY), "1");
  assert.equal(shouldSkipIntroGate(fake, false), true);
  assert.equal(INTRO_SEEN_KEY, "zhaowu.intro.seen.r126");
  assert.equal(INTRO_BROKEN_KEY, "zhaowu.intro.broken");
});

test('intro plays the committed owner immortal ascent and keeps the owner poster fallback', () => {
  assert.match(gate, /OWNER_LOADING_VIDEO/);
  assert.match(gate, /data-intro-motion="owner-video"/);
  assert.match(gate, /owner-immortal-ascent-r123\.mp4/);
  assert.match(gate, /owner-immortal-ascent-r123\.jpg/);
  assert.match(css, /zhaowu-lotus-intro__video/);
  assert.match(css, /object-fit: cover/);
  assert.match(css, /prefers-reduced-motion/);
  assert.match(css, /owner-immortal-ascent-r123\.jpg/);
  assert.match(css, /zhaowu-lotus-intro__skip/);
  assert.match(css, /min-height: 44px/);
  assert.match(css, /bottom: max\(20px/);
  assert.match(css, /right: max\(16px/);
  assert.match(gate, /playsInline/);
  assert.match(gate, /data-intro-fallback-mode="owner-poster"/);
  assert.doesNotMatch(gate, /<svg/);
  assert.match(gate, /zhaowu-lotus-intro__fallback-copy/);
  assert.match(gate, /data-intro-fallback/);
  assert.doesNotMatch(gate, /wutong-owner-r29|lotus-bloom-v12\.webp|loading-owner-r40|twin-lotus-restored-r26|owner-lotus-bloom-r53/);
  assert.doesNotMatch(css, /loading-owner-r40|twin-lotus-restored-r26|owner-lotus-bloom-r53/);
  assert.doesNotMatch(gate, /STONE 原創/);
  assert.doesNotMatch(gate, /zhaowu-lotus-intro__copy|zhaowu-lotus-intro__status|zhaowu-lotus-intro__bar/);
  assert.doesNotMatch(art, /zhaowu-four-hua|天界四華|天界四华/);
});

test('intro video stays visible even before the playing event, and owner login stays independent from a Supabase spend-cap freeze', async () => {
  const design = await readFile(new URL('../src/zhaowu-design-system.css', import.meta.url), 'utf8');
  const rest = await readFile(new URL('../src/lib/supabase-rest.ts', import.meta.url), 'utf8');
  const login = await readFile(new URL('../src/routes/login.tsx', import.meta.url), 'utf8');
  assert.match(design, /\.zhaowu-lotus-intro__video \{\s*opacity: 1 !important;/);
  assert.doesNotMatch(design, /\.zhaowu-lotus-intro__video \{\s*opacity: 0 !important;/);
  assert.match(css, /opacity: 1;/);
  assert.doesNotMatch(css, /\.zhaowu-lotus-intro__video \{\s*display: none;/);
  assert.match(rest, /res\.status === 402/);
  assert.match(rest, /Supabase 因流量額度（spend cap）已暫停/);
  assert.match(login, /data-login-backend="vercel-owner-cookie"/);
  assert.match(login, /不經 Supabase Auth/);
  assert.doesNotMatch(login, /data-login-backend="supabase"/);
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

test('owner loading video is the native 720x1280 H.264 clip, not a downscaled rewrite', async () => {
  const video = await readFile(new URL('../public/intro/owner-immortal-ascent-r123.mp4', import.meta.url));
  const poster = await readFile(new URL('../public/intro/owner-immortal-ascent-r123.jpg', import.meta.url));
  assert.equal(video.subarray(4, 8).toString('ascii'), 'ftyp');
  assert.ok(video.length > 8_000_000, 'native 720x1280 clip must not be downscaled');
  assert.ok(video.length < 12_000_000, 'clip stays within GitHub file budget');
  assert.equal(poster[0], 0xff);
  assert.equal(poster[1], 0xd8);
});
