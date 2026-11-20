import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const gate = await readFile(new URL("../src/components/intro-gate.tsx", import.meta.url), "utf8");
const css = await readFile(new URL("../src/intro-extra.css", import.meta.url), "utf8");

test("intro plays the committed r148 five-second opening full-bleed instead of obsolete payload paths", () => {
  assert.match(gate, /OWNER_LOADING_VIDEO/);
  assert.match(gate, /data-intro-motion="zhaowu-opening-r148"/);
  assert.match(gate, /zhaowu-opening-r148\.mp4/);
  assert.match(gate, /zhaowu-opening-r148\.jpg/);
  assert.match(gate, /<video/);
  assert.match(gate, /playsInline/);
  assert.doesNotMatch(gate, /owner-immortal-ascent-r123|loading-owner-r40|twin-lotus-restored-r26/);
});

test("intro video is full-bleed, text-free and respects reduced motion", () => {
  assert.match(css, /zhaowu-lotus-intro__video/);
  assert.match(css, /object-fit: cover/);
  assert.match(css, /@media \(prefers-reduced-motion: reduce\)/);
  assert.doesNotMatch(gate, /zhaowu-lotus-intro__copy|zhaowu-lotus-intro__status|zhaowu-lotus-intro__bar/);
});