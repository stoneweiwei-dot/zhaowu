import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const config = JSON.parse(await readFile(new URL("../vercel.json", import.meta.url), "utf8"));

test("explicit Vercel deployment policy stays locked", () => {
  assert.equal(config.git?.deploymentEnabled, false);
});
