import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const config = JSON.parse(await readFile(new URL("../vercel.json", import.meta.url), "utf8"));

test("Vercel production installs the exact tracked dependency tree", () => {
  assert.equal(config.installCommand, "npm ci");
});

test("Vercel Git deployment policy is main-only", () => {
  assert.deepEqual(config.git?.deploymentEnabled, { "*": false, main: true });
  assert.equal(Object.prototype.hasOwnProperty.call(config, "ignoreCommand"), false);
});
