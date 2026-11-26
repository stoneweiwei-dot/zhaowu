import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import { readFileSync, writeFileSync } from "node:fs";
import test from "node:test";

// /api/zhaowu-capabilities must report the same release value as /release.json, because both
// come from scripts/write-release-assets.mjs at build time.
const files = ["../public/release.json", "../public/sw.js", "../lib/release-id.js"].map((f) => new URL(f, import.meta.url));

test("capabilities release equals release.json after a build-time write", async () => {
  const backup = files.map((f) => readFileSync(f, "utf8"));
  try {
    execFileSync("node", ["scripts/write-release-assets.mjs"], {
      cwd: new URL("..", import.meta.url),
      env: { ...process.env, ZHAOWU_RELEASE_ID: "test-sha-1234567" },
      stdio: "pipe",
    });
    const released = JSON.parse(readFileSync(files[0], "utf8")).release;
    assert.equal(released, "test-sha-1234567");
    const { default: handler } = await import(`../api/zhaowu-capabilities.js?t=${Date.now()}`);
    const { ZHAOWU_BUILD_RELEASE } = await import(`../lib/release-id.js?t=${Date.now()}`);
    assert.equal(ZHAOWU_BUILD_RELEASE, released);
    const response = await handler(new Request("https://example.test/api/zhaowu-capabilities"));
    const body = await response.json();
    assert.equal(body.release, released);
    assert.match(body.ledgerRelease, /^ZW-WEB-\d{4}\.\d{2}\.\d{2}-r\d+$/);
  } finally {
    files.forEach((f, i) => writeFileSync(f, backup[i], "utf8"));
  }
});
