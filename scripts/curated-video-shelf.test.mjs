import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

const read = (name) => readFile(new URL("../" + name, import.meta.url), "utf8");

test("a visitor reaches the home artwork directly; opening videos are optional", async () => {
  const shell = await read("src/components/site-shell.tsx");
  const dock = await read("src/components/site-utility-dock.tsx");
  assert.doesNotMatch(shell, /<IntroGate\s*\/>/);
  assert.doesNotMatch(shell, /import \{ IntroGate \}/);
  assert.doesNotMatch(dock, /<IntroReplayButton\s*\/>/);
});

test("existing enabled owner videos have four contextual, click-to-play placements", async () => {
  const home = await read("src/components/painted-home.tsx");
  const knowledge = await read("src/routes/knowledge.tsx");
  const mythic = await read("src/routes/mythic-atlas.tsx");
  const atlas = await read("src/routes/auspicious-atlas.tsx");
  const shelf = await read("src/components/curated-video-shelf.tsx");
  for (const [source, place] of [[home, "home"], [knowledge, "knowledge"], [mythic, "mythic"], [atlas, "atlas"]]) {
    assert.ok(source.includes('<CuratedVideoShelf placement="' + place + '"'));
  }
  assert.match(shelf, /enabled=eq\.true/);
  assert.match(shelf, /login-background/);
  assert.match(shelf, /preload="none"/);
  assert.doesNotMatch(shelf, /autoPlay|autoPlay=/);
  assert.match(shelf, /onClick=\{play\}/);
  assert.match(shelf, /video\/quicktime/);
  assert.match(shelf, /placement !== "atlas"/);
});

test("the old uploads, owner controls, and public intro assets are retained", async () => {
  const manager = await read("src/components/owner-login-visuals-manager.tsx");
  const gate = await read("src/components/intro-gate.tsx");
  assert.match(manager, /setLoginVisualCurrent/);
  assert.match(manager, /id="login-visuals"/);
  assert.match(gate, /zhaowu-opening-r148\.mp4/);
});
