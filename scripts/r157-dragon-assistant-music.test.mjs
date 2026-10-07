import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const root = new URL("../", import.meta.url);
const source = (path) => readFile(new URL(path, root), "utf8");

test("public runtime retires the dragon mascot and keeps one quiet utility dock", async () => {
  const shell = await source("src/components/site-shell.tsx");
  const dock = await source("src/components/site-utility-dock.tsx");
  const music = await source("src/components/background-music.tsx");

  assert.doesNotMatch(shell, /GreenDragonGuide/);
  assert.match(shell, /<SiteUtilityDock \/>/);
  assert.match(dock, /data-site-utility-dock/);
  assert.match(dock, /<BackgroundMusic \/>/);
  assert.match(dock, /data-utility-panel="music"/);
  assert.match(dock, /data-utility-panel="guide"/);
  assert.match(music, /data-background-music-player/);
  assert.doesNotMatch(dock, /dragon-assistant|zhaowu-dragon-guide-trigger/);
});

test("quiet utility dock preserves music transport and site-guide actions", async () => {
  const dock = await source("src/components/site-utility-dock.tsx");
  const music = await source("src/components/background-music.tsx");

  assert.match(dock, /askSiteGuide/);
  assert.match(dock, /defaultSiteGuide/);
  assert.match(dock, /#analysisForm/);
  assert.match(dock, /#home-today-guide/);
  assert.match(dock, /\/fun-tests/);
  assert.match(dock, /\/history/);
  assert.match(music, /上一首/);
  assert.match(music, /下一首/);
  assert.match(music, /循環播放/);
  assert.match(music, /隨機播放/);
  assert.match(music, /window\.addEventListener\("pointerdown", unlock/);
  assert.match(music, /window\.addEventListener\("touchend", unlock/);
  assert.match(music, /zhaowu-music-status/);
  assert.match(music, /zhaowu-music-command/);
});
