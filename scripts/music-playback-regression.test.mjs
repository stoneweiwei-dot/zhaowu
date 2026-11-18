import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { Writable } from "node:stream";
import test from "node:test";
import handler from "../api/owner-music.js";

const audio = Buffer.from(Array.from({ length: 16 }, (_, index) => index));
const manifest = {
  version: 1,
  activeId: "track1",
  tracks: [{
    id: "track1",
    name: "第一縷琴音｜First Strings",
    filename: "track1.mp3",
    url: "https://raw.githubusercontent.com/stoneweiwei-dot/zhaowu/owner-music/public/audio/tracks/track1.mp3",
    contentType: "audio/mpeg",
    fileSize: audio.length,
    enabled: true,
  }],
};

class MemoryResponse extends Writable {
  constructor() {
    super();
    this.headers = {};
    this.headersSent = false;
    this.statusCode = 200;
    this.chunks = [];
  }
  setHeader(name, value) { this.headers[name.toLowerCase()] = value; }
  _write(chunk, encoding, callback) {
    this.headersSent = true;
    this.chunks.push(Buffer.from(chunk));
    callback();
  }
  get body() { return Buffer.concat(this.chunks); }
}

async function runAudioRequest(range, upstreamSupportsRange = false, method = "GET") {
  const originalFetch = globalThis.fetch;
  let audioRequests = 0;
  globalThis.fetch = async (url, options = {}) => {
    if (String(url).endsWith("public/audio/owner-manifest.json")) {
      return Response.json(manifest);
    }
    audioRequests += 1;
    const requestedRange = options.headers?.Range;
    if (upstreamSupportsRange && requestedRange === "bytes=2-5") {
      return new Response(audio.subarray(2, 6), {
        status: 206,
        headers: { "Content-Type": "audio/mpeg", "Content-Length": "4", "Content-Range": "bytes 2-5/16" },
      });
    }
    return new Response(method === "HEAD" ? null : audio, {
      status: 200,
      headers: { "Content-Type": "audio/mpeg", "Content-Length": String(audio.length) },
    });
  };
  try {
    const response = new MemoryResponse();
    await handler({ method, query: { track: "track1" }, headers: range ? { range } : {} }, response);
    return { response, audioRequests };
  } finally {
    globalThis.fetch = originalFetch;
  }
}

test("iPhone Range is served as genuine 206 even when GitHub returns full 200", async () => {
  const { response, audioRequests } = await runAudioRequest("bytes=2-5");
  assert.equal(audioRequests, 1);
  assert.equal(response.statusCode, 206);
  assert.equal(response.headers["content-range"], "bytes 2-5/16");
  assert.equal(response.headers["content-length"], "4");
  assert.deepEqual(response.body, audio.subarray(2, 6));
});

test("upstream 206 Content-Range remains intact", async () => {
  const { response } = await runAudioRequest("bytes=2-5", true);
  assert.equal(response.statusCode, 206);
  assert.equal(response.headers["content-range"], "bytes 2-5/16");
  assert.deepEqual(response.body, audio.subarray(2, 6));
});

test("suffix ranges and full-file streaming return the expected bytes", async () => {
  const suffix = (await runAudioRequest("bytes=-3")).response;
  assert.equal(suffix.statusCode, 206);
  assert.equal(suffix.headers["content-range"], "bytes 13-15/16");
  assert.deepEqual(suffix.body, audio.subarray(13));
  const full = (await runAudioRequest(null)).response;
  assert.equal(full.statusCode, 200);
  assert.deepEqual(full.body, audio);
});

test("out-of-bounds Safari range returns 416 without fetching audio", async () => {
  const { response, audioRequests } = await runAudioRequest("bytes=17-");
  assert.equal(response.statusCode, 416);
  assert.equal(response.headers["content-range"], "bytes */16");
  assert.equal(audioRequests, 0);
});

test("HEAD reports content headers without transferring audio", async () => {
  const { response } = await runAudioRequest(null, false, "HEAD");
  assert.equal(response.statusCode, 200);
  assert.equal(response.headers["content-length"], "16");
  assert.equal(response.body.length, 0);
});

test("mobile playlist explicitly allocates the central title column", async () => {
  const css = await readFile(new URL("../src/zhaowu-design-system.css", import.meta.url), "utf8");
  const player = await readFile(new URL("../src/components/background-music.tsx", import.meta.url), "utf8");
  assert.match(css, /\[data-music-playlist-track\]\s*\{[\s\S]*?grid-template-columns:\s*30px minmax\(0, 1fr\) 18px/);
  assert.match(css, /\[data-background-music-player\][\s\S]*?grid-template-columns:\s*minmax\(0, 1fr\)/);
  assert.match(player, /musicDisplayName\(track\.name, locale\)/);
  assert.match(player, /data-public-music-playlist/);
});
