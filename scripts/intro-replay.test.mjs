import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

const read = (name) => readFile(new URL("../" + name, import.meta.url), "utf8");

test("homepage no longer auto-mounts a full-screen intro or a forced-replay control", async () => {
  const shell = await read("src/components/site-shell.tsx");
  const dock = await read("src/components/site-utility-dock.tsx");
  assert.doesNotMatch(shell, /<IntroGate\s*\/>/);
  assert.doesNotMatch(dock, /<IntroReplayButton\s*\/>/);
});

test("legacy opening assets remain accessible in the owner's video library", async () => {
  const manager = await read("src/components/owner-login-visuals-manager.tsx");
  const shelf = await read("src/components/curated-video-shelf.tsx");
  const gate = await read("src/components/intro-gate.tsx");
  assert.match(manager, /setLoginVisualCurrent/);
  assert.match(gate, /zhaowu-opening-r148\.mp4/);
  assert.match(shelf, /video\/mp4/);
  assert.match(shelf, /data-video-shelf/);
});
