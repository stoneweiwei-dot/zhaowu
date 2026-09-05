import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const music = await readFile(new URL("../src/components/background-music.tsx", import.meta.url), "utf8");
const main = await readFile(new URL("../src/main.tsx", import.meta.url), "utf8");

test("background music uses the verified Safari-safe Zhaowu AAC asset", () => {
  assert.match(music, /zhaowu-audio\/background\/jingfo-shengyuan-aac\.m4a/);
  assert.doesNotMatch(music, /background\/jingfo-shengyuan\.m4a/);
  assert.match(music, /DEFAULT_VOLUME = 0\.24/);
  assert.match(music, /loop/);
  assert.match(music, /playsInline/);
  assert.match(music, /preload="metadata"/);
});

test("background music is mounted globally and unlocks on an iPhone Safari user gesture", () => {
  assert.match(main, /import \{ BackgroundMusic \}/);
  assert.match(main, /<BackgroundMusic \/>/);
  assert.match(music, /zhaowu\.backgroundMusic\.v1/);
  assert.match(music, /touchstart/);
  assert.match(music, /pointerdown/);
  assert.match(music, /touchend/);
  assert.match(music, /keydown/);
  assert.match(music, /data-background-music-control/);
});

test("mobile keeps an explicit music control visible when autoplay is blocked", () => {
  assert.match(music, /\{playing \? "音樂播放中" : "播放音樂"\}/);
  assert.doesNotMatch(music, /hidden min-\[430px\]:inline/);
  assert.match(music, /onError=\{\(\) => setPlaying\(false\)\}/);
});
