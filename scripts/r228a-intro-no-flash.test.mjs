import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const root = new URL("../", import.meta.url);
const source = (path) => readFile(new URL(path, root), "utf8");

test("r228a opening video never flashes the old r148 opening before the owner's clip", async () => {
  const gate = await source("src/components/intro-gate.tsx");
  const css = await source("src/zhaowu-design-system.css");
  assert.match(gate, /INTRO_VISUAL_OVERRIDE_TIMEOUT_MS = 1800/, "gate waits as long as the lookup's own timeout");
  assert.match(gate, /INTRO_VISUAL_CACHED_START_MS = 400/);
  assert.match(gate, /zhaowu\.intro\.last-visual\.v1/);
  assert.match(gate, /poster=\{usesBuiltInVisual \? OWNER_LOADING_POSTER : undefined\}/);
  assert.match(gate, /is-neutral/);
  assert.match(css, /\.zhaowu-lotus-intro__fallback\.is-neutral > \* \{ display: none !important; \}/);
  const fetchSource = await source("src/lib/intro-visual-source.ts");
  assert.match(fetchSource, /FETCH_TIMEOUT_MS = 1800/);
});

test("r228a keeps the IntroGate playback contract unchanged", async () => {
  const gate = await source("src/components/intro-gate.tsx");
  const policy = await source("src/lib/intro-gate-policy.ts");
  assert.match(gate, /OWNER_LOADING_VIDEO = "\/intro\/zhaowu-opening-r148\.mp4"/, "built-in r148 stays the fallback target");
  assert.match(policy, /INTRO_GATE_MIN_VISIBLE_MS/);
  assert.match(policy, /INTRO_GATE_HARD_EXIT_MS/);
  assert.match(gate, /startsWith\("https:\/\/"\)/, "cached visual only accepts https or same-origin absolute paths");
});
