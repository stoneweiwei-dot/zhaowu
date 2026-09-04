import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const music = await readFile(new URL("../src/components/background-music.tsx", import.meta.url), "utf8");
const main = await readFile(new URL("../src/main.tsx", import.meta.url), "utf8");

test("background music uses the permanent Zhaowu Supabase asset", () => {
  assert.match(music, /zhaowu-audio\/background\/jingfo-shengyuan\.m4a/);
  assert.match(music, /loop/);
  assert.match(music, /playsInline/);
  assert.match(music, /preload="metadata"/);
});

test("background music is mounted globally and respects mobile autoplay restrictions", () => {
  assert.match(main, /import \{ BackgroundMusic \}/);
  assert.match(main, /<BackgroundMusic \/>/);
  assert.match(music, /zhaowu\.backgroundMusic\.v1/);
  assert.match(music, /pointerdown/);
  assert.match(music, /touchend/);
  assert.match(music, /keydown/);
  assert.match(music, /data-background-music-control/);
});
