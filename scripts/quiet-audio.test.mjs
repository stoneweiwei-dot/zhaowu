import assert from "node:assert/strict";
import test from "node:test";
import { prepareQuietAudio, releaseQuietAudio } from "../src/lib/quiet-audio.ts";

test("quiet playback attenuates through gain on iOS and reuses one media source", () => {
  const previousWindow = globalThis.window;
  let sourceCount = 0;
  let resumeCount = 0;
  const gains = [];
  class FakeAudioContext {
    state = "suspended";
    destination = {};
    createGain() {
      const node = { gain: { value: 1 }, connect() {}, disconnect() {} };
      gains.push(node);
      return node;
    }
    createMediaElementSource() {
      sourceCount += 1;
      return { connect() {}, disconnect() {} };
    }
    resume() { resumeCount += 1; this.state = "running"; return Promise.resolve(); }
  }
  globalThis.window = { AudioContext: FakeAudioContext };
  try {
    // Model iOS ignoring HTMLMediaElement.volume assignments.
    const iosMedia = { get volume() { return 1; }, set volume(_value) {} };
    assert.equal(prepareQuietAudio(iosMedia), true);
    assert.equal(gains[0].gain.value, 0.24);
    assert.equal(resumeCount, 1);
    assert.equal(prepareQuietAudio(iosMedia), true);
    assert.equal(sourceCount, 1);
    assert.equal(gains[0].gain.value, 0.24);
    releaseQuietAudio(iosMedia);
    assert.equal(prepareQuietAudio(iosMedia, 0.12), true);
    assert.equal(sourceCount, 1, "reconnect the existing source after lifecycle cleanup");
    assert.equal(gains[0].gain.value, 0.12);
    const desktopMedia = { volume: 0 };
    assert.equal(prepareQuietAudio(desktopMedia), true);
    assert.equal(desktopMedia.volume, 1, "do not multiply element volume and gain attenuation");
    assert.equal(gains[1].gain.value, 0.24);
  } finally { globalThis.window = previousWindow; }
});

test("unsupported Web Audio safely falls back to element volume", () => {
  const previousWindow = globalThis.window;
  globalThis.window = {};
  try {
    const media = { volume: 1 };
    assert.equal(prepareQuietAudio(media), false);
    assert.equal(media.volume, 0.24);
  } finally { globalThis.window = previousWindow; }
});
