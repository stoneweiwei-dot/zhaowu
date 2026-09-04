import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const gate = await readFile(new URL("../src/components/intro-gate.tsx", import.meta.url), "utf8");
const css = await readFile(new URL("../src/intro-extra.css", import.meta.url), "utf8");
const writer = await readFile(new URL("./write-intro-media.mjs", import.meta.url), "utf8");

test("intro plays the owner pond video full-bleed instead of vector stages", () => {
  assert.match(gate, /OWNER_LOADING_VIDEO/);
  assert.match(gate, /data-intro-motion="owner-video"/);
  assert.match(gate, /loading-owner-r40\.mp4/);
  assert.match(gate, /<video/);
  assert.match(gate, /playsInline/);
});

test("intro video is full-bleed, text-free and respects reduced motion", () => {
  assert.match(css, /zhaowu-lotus-intro__video/);
  assert.match(css, /object-fit: cover/);
  assert.match(css, /@media \(prefers-reduced-motion: reduce\)/);
  assert.match(writer, /loading-owner-r40\.part\./);
  assert.match(writer, /VIDEO_PART_COUNT = 8/);
  assert.doesNotMatch(gate, /zhaowu-lotus-intro__copy|zhaowu-lotus-intro__status|zhaowu-lotus-intro__bar/);
});
