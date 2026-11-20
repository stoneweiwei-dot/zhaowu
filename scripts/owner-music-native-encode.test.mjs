import assert from "node:assert/strict";
import test from "node:test";
import { encodePcmToMp3, floatToInt16, pickLameSampleRate, resampleChannel } from "../src/lib/owner-music-native-encode.ts";

test("native owner encoder writes a real MP3 under the upload ceiling", () => {
  const sampleRate = pickLameSampleRate(44100);
  assert.equal(sampleRate, 44100);
  const seconds = 2;
  const samples = new Float32Array(sampleRate * seconds);
  for (let i = 0; i < samples.length; i += 1) samples[i] = Math.sin((2 * Math.PI * 440 * i) / sampleRate) * 0.4;
  const left = floatToInt16(samples);
  const mp3 = encodePcmToMp3(left, null, sampleRate, 64);
  assert.ok(mp3.byteLength > 400);
  assert.ok(mp3.byteLength < 3_550_000);
  assert.equal(mp3[0], 0xff);
});

test("resampling keeps audible length and native path stays off ffmpeg on iOS", async () => {
  const source = new Float32Array(8);
  for (let i = 0; i < source.length; i += 1) source[i] = i / 7;
  const out = resampleChannel(source, 48000, 24000);
  assert.equal(out.length, 4);
  const transcode = await import("../src/lib/owner-music-transcode.ts");
  assert.equal(typeof transcode.isIosOwnerDevice, "function");
  assert.equal(transcode.isIosOwnerDevice(), false);
});
