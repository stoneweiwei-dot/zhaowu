import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const gate = await readFile(new URL("../src/components/intro-gate.tsx", import.meta.url), "utf8");
const art = await readFile(new URL("../src/components/intro-lotus-art.tsx", import.meta.url), "utf8");
const css = await readFile(new URL("../src/intro-extra.css", import.meta.url), "utf8");

test("intro uses resolution-independent vector art instead of low-frame-rate video playback", () => {
  assert.match(gate, /IntroLotusArt/);
  assert.match(gate, /data-intro-motion="vector"/);
  assert.match(art, /viewBox="0 0 1080 1920"/);
  assert.match(art, /preserveAspectRatio="xMidYMid slice"/);
  assert.doesNotMatch(gate, /<video|playbackRate|VIDEO_MOTION_CHECK_MS|VIDEO_MIN_PROGRESS_SECONDS/);
});

test("intro cross-fades four bloom stages at display refresh rate with reduced-motion support", () => {
  assert.match(art, /intro-lotus-stage--1/);
  assert.match(art, /intro-lotus-stage--2/);
  assert.match(art, /intro-lotus-stage--3/);
  assert.match(art, /intro-lotus-stage--4/);
  assert.match(css, /animation-duration: 2734ms/);
  assert.match(css, /@keyframes intro-lotus-stage-1/);
  assert.match(css, /@keyframes intro-lotus-stage-4/);
  assert.match(css, /@keyframes intro-vector-ripple/);
  assert.match(css, /@media \(prefers-reduced-motion: reduce\)/);
  assert.doesNotMatch(gate, /zhaowu-lotus-intro__copy|zhaowu-lotus-intro__status|zhaowu-lotus-intro__bar/);
});
