import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

const read = (p) => readFile(new URL(`../${p}`, import.meta.url), "utf8");

test("home offers a replay button that re-opens the intro inside the 7-day skip window", async () => {
  const gate = await read("src/components/intro-gate.tsx");
  const home = await read("src/routes/index.tsx");
  assert.match(gate, /export const INTRO_REPLAY_EVENT = "zhaowu:intro-replay"/);
  assert.match(gate, /export function IntroReplayButton\(/);
  assert.match(gate, /<IntroGateScreen key=\{run\} force=\{run > 0\} \/>/);
  // a forced replay must bypass the seen-at skip in both the initial state and the mount effect
  assert.equal((gate.match(/!force && (typeof window !== "undefined" && )?shouldSkipIntroGate/g) ?? []).length, 2);
  assert.match(home, /<IntroReplayButton \/>/);
  assert.match(gate, /重播開場影片/);
  assert.match(gate, /重播开场影片/);
  assert.match(gate, /Replay intro/);
});
