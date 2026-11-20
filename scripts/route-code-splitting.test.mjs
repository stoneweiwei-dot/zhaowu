import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { test } from "node:test";

const viteConfig = readFileSync(new URL("../vite.config.ts", import.meta.url), "utf8");

test("TanStack Router keeps automatic route code splitting enabled", () => {
  assert.match(viteConfig, /autoCodeSplitting:\s*true/);
  assert.doesNotMatch(viteConfig, /autoCodeSplitting:\s*false/);
});
