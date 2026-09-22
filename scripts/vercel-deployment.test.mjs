import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const config = JSON.parse(await readFile(new URL("../vercel.json", import.meta.url), "utf8"));

test("Vercel production installs the exact tracked dependency tree", () => {
  assert.equal(config.installCommand, "npm ci");
});

test("Vercel automatic Git deployments are locked again after r174", () => {
  assert.equal(config.git?.deploymentEnabled, false);
  assert.equal(Object.prototype.hasOwnProperty.call(config, "ignoreCommand"), false);
});
