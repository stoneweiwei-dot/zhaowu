import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { test } from "node:test";

const root = new URL("../", import.meta.url);

test("Vercel deploys only vetted main merges and suppresses branch previews", async () => {
  const config = JSON.parse(await readFile(new URL("vercel.json", root), "utf8"));
  assert.deepEqual(config.git.deploymentEnabled, { "*": false, main: true });
  assert.equal(Object.prototype.hasOwnProperty.call(config, "ignoreCommand"), false);
  assert.equal(config.framework, "vite");
  assert.equal(config.outputDirectory, "dist");
});
