import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const gate = await readFile(new URL("../src/components/intro-gate.tsx", import.meta.url), "utf8");
const css = await readFile(new URL("../src/intro-extra.css", import.meta.url), "utf8");

test("intro detects a video that claims to play but does not advance", () => {
  assert.match(gate, /VIDEO_MOTION_CHECK_MS = 480/);
  assert.match(gate, /VIDEO_MIN_PROGRESS_SECONDS = 0\.06/);
  assert.match(gate, /const baseline = media\.currentTime/);
  assert.match(gate, /media\.currentTime >= baseline \+ VIDEO_MIN_PROGRESS_SECONDS/);
  assert.match(gate, /media\.paused \|\| media\.ended \|\| !advanced/);
  assert.match(gate, /setVideoFailed\(true\)/);
  assert.match(gate, /data-intro-motion=\{videoFailed \? "fallback" : "video"\}/);
});

test("intro has an obvious visual bloom even when video is stalled", () => {
  assert.match(gate, /zhaowu-lotus-intro__motion-proof/);
  assert.match(css, /54% \{ transform: scale\(1\.075\) translate3d\(0, -1\.25%, 0\); \}/);
  assert.match(css, /@keyframes zhaowu-lotus-light-bloom/);
  assert.match(css, /48% \{ opacity: \.38; transform: scale\(1\.04\); \}/);
  assert.match(css, /@keyframes zhaowu-lotus-light-bloom-reduced/);
  assert.match(css, /animation: zhaowu-lotus-light-bloom-reduced 2734ms/);
});
