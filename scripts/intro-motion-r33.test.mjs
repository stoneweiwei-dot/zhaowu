import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const gate = await readFile(new URL("../src/components/intro-gate.tsx", import.meta.url), "utf8");
const css = await readFile(new URL("../src/intro-extra.css", import.meta.url), "utf8");
const writer = await readFile(new URL("./write-intro-media.mjs", import.meta.url), "utf8");

test("intro plays the owner-original r41 twin-lotus video full-bleed", () => {
  assert.match(gate, /OWNER_LOADING_VIDEO/);
  assert.match(gate, /data-intro-motion="owner-video"/);
  assert.match(gate, /loading-owner-r41\.mp4/);
  assert.match(gate, /loading-owner-r41\.jpg/);
  assert.match(gate, /<video/);
  assert.match(gate, /playsInline/);
  assert.doesNotMatch(gate, /loading-owner-r40/);
});

test("intro media writer matches the owner-original r41 payload contract", () => {
  assert.match(css, /zhaowu-lotus-intro__video/);
  assert.match(css, /object-fit: cover/);
  assert.match(css, /@media \(prefers-reduced-motion: reduce\)/);
  assert.match(writer, /loading-owner-r41\.mp4\.b64\./);
  assert.match(writer, /loading-owner-r41\.jpg\.b64\./);
  assert.match(writer, /VIDEO_PART_COUNT = 37/);
  assert.match(writer, /STILL_PART_COUNT = 4/);
  assert.doesNotMatch(gate, /zhaowu-lotus-intro__copy|zhaowu-lotus-intro__status|zhaowu-lotus-intro__bar/);
});
