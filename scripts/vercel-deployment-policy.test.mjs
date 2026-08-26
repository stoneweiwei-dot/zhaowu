import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { test } from "node:test";

const root = new URL("../", import.meta.url);

test("Vercel Git auto-deployments stay disabled so only explicit production releases spend quota", async () => {
  const config = JSON.parse(await readFile(new URL("vercel.json", root), "utf8"));
  assert.equal(config.git.deploymentEnabled, false);
  assert.equal(config.framework, "vite");
  assert.equal(config.outputDirectory, "dist");
  assert.match(config.ignoreCommand ?? "", /VERCEL_GIT_PREVIOUS_SHA/);
});
