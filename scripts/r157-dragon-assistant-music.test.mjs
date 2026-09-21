import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const root = new URL("../", import.meta.url);
const source = (path) => readFile(new URL(path, root), "utf8");

test("only the dragon assistant owns the floating music entry", async () => {
  const main = await source("src/main.tsx");
  const shell = await source("src/components/site-shell.tsx");
  const guide = await source("src/components/green-dragon-guide.tsx");
  const music = await source("src/components/background-music.tsx");

  assert.doesNotMatch(main, /<BackgroundMusic \/>/);
  assert.match(shell, /<GreenDragonGuide \/>/);
  assert.match(guide, /<BackgroundMusic \/>/);
  assert.match(guide, /data-dragon-assistant/);
  assert.match(music, /data-dragon-music-controls/);
  assert.doesNotMatch(music, /fixed z-\[/);
  assert.doesNotMatch(music, /data-mobile-floating-control="music"/);
});

test("dragon assistant is draggable, snaps to an edge and persists its position", async () => {
  const guide = await source("src/components/green-dragon-guide.tsx");
  const compatibilityCss = await source("src/content-layout-fixes.css");
  assert.doesNotMatch(compatibilityCss, /\.zhaowu-dragon-guide\s*\{\s*position:\s*relative/);
  assert.match(guide, /POSITION_STORAGE_KEY/);
  assert.match(guide, /onPointerDown=\{beginDrag\}/);
  assert.match(guide, /onPointerMove=\{continueDrag\}/);
  assert.match(guide, /onPointerUp=\{endDrag\}/);
  assert.match(guide, /savePosition\(snapped\)/);
  assert.match(guide, /window\.localStorage\.setItem\(POSITION_STORAGE_KEY/);
  assert.match(guide, /current\.x \+ DOCK_SIZE \/ 2 < window\.innerWidth \/ 2/);
});

test("dragon bubbles rotate between guidance and compact music controls", async () => {
  const guide = await source("src/components/green-dragon-guide.tsx");
  assert.match(guide, /guideBubbles/);
  assert.match(guide, /Math\.random\(\) < 0\.26/);
  assert.match(guide, /BUBBLE_INITIAL_DELAY_MS = 18_000/);
  assert.match(guide, /BUBBLE_REPEAT_MIN_MS = 48_000/);
  assert.match(guide, /data-dragon-bubble/);
  assert.match(guide, /bubble\.kind === "music"/);
  assert.match(guide, /zhaowu-music-command/);
  assert.match(guide, /sendMusicCommand\("toggle"\)/);
  assert.match(guide, /sendMusicCommand\("next"\)/);
});

test("embedded music keeps the full transport and Safari gesture unlock", async () => {
  const music = await source("src/components/background-music.tsx");
  assert.match(music, /上一首/);
  assert.match(music, /下一首/);
  assert.match(music, /循環播放/);
  assert.match(music, /隨機播放/);
  assert.match(music, /window\.addEventListener\("pointerdown", unlock/);
  assert.match(music, /window\.addEventListener\("touchend", unlock/);
  assert.match(music, /zhaowu-music-status/);
  assert.match(music, /zhaowu-music-command/);
  assert.match(music, /min-h-11 min-w-11/);
});


test("dragon follows a newly generated result with evidence, risk and action", async () => {
  const guide = await source("src/components/green-dragon-guide.tsx");
  assert.match(guide, /useAppStore/);
  assert.match(guide, /buildDecisionReportModel\(current\)/);
  assert.match(guide, /promptedResultRef/);
  assert.match(guide, /data-dragon-result-followup/);
  assert.match(guide, /decisionModel\.risks\[0\]/);
  assert.match(guide, /decisionModel\.actions\[0\]/);
  assert.match(guide, /900/);
});
