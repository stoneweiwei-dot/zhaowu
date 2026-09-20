import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { test } from "node:test";

const root = new URL("../", import.meta.url);

test("Vercel automatic Git deployments are completely disabled", async () => {
  const config = JSON.parse(await readFile(new URL("vercel.json", root), "utf8"));
  assert.equal(config.git.deploymentEnabled, false);
  assert.equal(Object.prototype.hasOwnProperty.call(config, "ignoreCommand"), false);
  assert.equal(config.framework, "vite");
  assert.equal(config.outputDirectory, "dist");
});
