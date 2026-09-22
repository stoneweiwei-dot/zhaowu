import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const config = JSON.parse(await readFile(new URL("../vercel.json", import.meta.url), "utf8"));

test("Vercel production installs the exact tracked dependency tree", () => {
  assert.equal(config.installCommand, "npm ci");
});

test("Vercel blocks non-main branch deploys and ignores docs-only production builds", () => {
  assert.deepEqual(config.git?.deploymentEnabled, { "**": false, main: true });
  assert.equal(typeof config.ignoreCommand, "string");
  assert.match(config.ignoreCommand, /VERCEL_GIT_COMMIT_REF/);
  assert.match(config.ignoreCommand, /git diff --quiet/);
});
