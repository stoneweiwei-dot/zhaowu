import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const root = new URL("../", import.meta.url);
const source = (path) => readFile(new URL(path, root), "utf8");

test("dragon assistant embeds a five-control iPhone-safe playlist transport", async () => {
  const music = await source("src/components/background-music.tsx");
  assert.match(music, /data-background-music-player/);
  assert.match(music, /data-dragon-music-controls/);
  assert.match(music, /zhaowu-dragon-music-controls/);
  assert.match(music, /min-h-11 min-w-11/);
  assert.match(music, /上一首/);
  assert.match(music, /下一首/);
  assert.match(music, /循環播放/);
  assert.match(music, /隨機播放/);
  assert.match(music, /aria-pressed=\{loopEnabled\}/);
  assert.match(music, /aria-pressed=\{shuffleEnabled\}/);
  assert.match(music, /data-active=\{loopEnabled \? "true" : "false"\}/);
  assert.match(music, /data-active=\{shuffleEnabled \? "true" : "false"\}/);
  assert.match(music, /data-music-mode-status/);
  assert.match(music, /data-background-music-control/);
  assert.match(music, /onEnded=\{\(\) => void moveTrack\(1, true\)\}/);
});

test("player consumes the full owner playlist and preserves Safari gesture unlock", async () => {
  const music = await source("src/components/background-music.tsx");
  const client = await source("src/lib/owner-music-client.ts");
  assert.match(client, /tracks:\s*OwnerMusicTrack\[\]/);
  assert.match(music, /const list = next\?\.tracks \?\? \[\]/);
  assert.match(music, /buildPlaybackOrder/);
  assert.match(music, /track\?\.url \|\| MUSIC_STREAM_URL/);
  assert.match(music, /window\.addEventListener\("pointerdown", unlock/);
  assert.match(music, /window\.addEventListener\("touchend", unlock/);
  assert.match(music, /audio\.play\(\)\.catch/);
  assert.doesNotMatch(music, /<audio[\s\S]{0,180}\sloop\s/);
});

test("loop and shuffle preferences persist independently from play pause", async () => {
  const music = await source("src/components/background-music.tsx");
  assert.match(music, /LOOP_STORAGE_KEY/);
  assert.match(music, /SHUFFLE_STORAGE_KEY/);
  assert.match(music, /setItem\(LOOP_STORAGE_KEY, loopEnabled \? "on" : "off"\)/);
  assert.match(music, /setItem\(SHUFFLE_STORAGE_KEY, shuffleEnabled \? "on" : "off"\)/);
  assert.match(music, /if \(fromEnded && !loopEnabled\)/);
  assert.match(music, /shuffleRef\.current = next/);
});
