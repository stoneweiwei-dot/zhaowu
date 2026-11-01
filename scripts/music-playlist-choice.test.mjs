import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const source = (path) => readFileSync(new URL(`../${path}`, import.meta.url), "utf8");

test("visitor sees numbered song list and can select any track", () => {
  const music = source("src/components/background-music.tsx");
  const dock = source("src/components/site-utility-dock.tsx");
  assert.match(dock, /<BackgroundMusic visible=\{panel === "music"\} \/>/);
  assert.match(music, /data-public-music-playlist/);
  assert.match(music, /<ol className=/);
  assert.match(music, /tracks\.map\(\(track, index\) =>/);
  assert.match(music, /data-music-playlist-track=\{track\.id\}/);
  assert.match(music, /aria-current=\{selected \? "true" : undefined\}/);
  assert.match(music, /selectTrack\(track, true\)/);
  assert.match(music, /musicDisplayName\(track\.name, locale\)/);
  assert.match(music, /min-h-12/);
});

test("playlist is fetched for viewing without autoplay, respecting user audio intent", () => {
  const music = source("src/components/background-music.tsx");
  assert.match(music, /if \(!visible && !requested\) return;/);
  assert.match(music, /void refreshAsset\(\);/);
  assert.match(music, /readBooleanPreference\(LOOP_STORAGE_KEY, true\)/);
  assert.match(music, /onEnded=\{\(\) => void moveTrack\(1, true\)\}/);
  assert.match(music, /if \(loopEnabled\) nextIndex = nextIndex < 0 \? order\.length - 1 : 0/);
  assert.match(music, /data-music-loop=\{loopEnabled \? "playlist" : "off"\}/);
  assert.match(music, /setItem\(LOOP_STORAGE_KEY, loopEnabled \? "on" : "off"\)/);
});

test("owner playlist shows existing titles, numbered rows and current default without deleting music", () => {
  const sourceText = source("src/components/owner-background-music-manager.tsx");
  assert.match(sourceText, /data-owner-music-playlist/);
  assert.match(sourceText, /role="list"/);
  assert.match(sourceText, /role="listitem"/);
  assert.match(sourceText, /網站預設曲/);
  assert.match(sourceText, /訪客可自由選曲/);
  assert.match(sourceText, /renameOwnerMusic\(/);
  assert.match(sourceText, /activateOwnerMusic\(/);
  assert.match(sourceText, /data-owner-bulk-toolbar="music"/);
});

test("Simplified Chinese mapping covers curated labels", () => {
  const names = source("src/lib/music-display-name.ts");
  for (const token of ["聲:", "遠:", "箋:", "聞:", "鶴:", "鳴:", "徑:"]) {
    assert.ok(names.includes(token), `missing zh-Hans mapping for ${token}`);
  }
});
