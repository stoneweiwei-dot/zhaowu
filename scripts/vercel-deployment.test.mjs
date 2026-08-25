import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const config = JSON.parse(await readFile(new URL("../vercel.json", import.meta.url), "utf8"));

test("Vercel production installs the exact tracked dependency tree", () => {
  assert.equal(config.installCommand, "npm ci");
});

test("Vercel builds only main and skips documentation-only production rebuilds", () => {
  assert.equal(config.git?.deploymentEnabled?.main, true);
  assert.equal(config.git?.deploymentEnabled?.["*"], false);
  assert.match(config.ignoreCommand ?? "", /VERCEL_GIT_PREVIOUS_SHA/);
  assert.match(config.ignoreCommand ?? "", /\.github\/\*\*/);
  assert.match(config.ignoreCommand ?? "", /docs\/\*\*/);
  assert.match(config.ignoreCommand ?? "", /git diff --quiet/);
});
