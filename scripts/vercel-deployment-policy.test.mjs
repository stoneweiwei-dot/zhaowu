import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { test } from "node:test";

const root = new URL("../", import.meta.url);

test("Vercel git auto-deploy is enabled for main only", async () => {
  const config = JSON.parse(await readFile(new URL("vercel.json", root), "utf8"));
  assert.deepEqual(config.git.deploymentEnabled, { main: true });
  assert.equal(config.framework, "vite");
  assert.equal(config.outputDirectory, "dist");
});
