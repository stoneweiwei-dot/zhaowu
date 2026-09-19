import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const root = new URL("../", import.meta.url);
const source = (path) => readFile(new URL(path, root), "utf8");

test("intro sound control stays a horizontal compact pill on iPhone", async () => {
  const intro = await source("src/components/intro-gate.tsx");
  const css = await source("src/zhaowu-design-system.css");

  assert.match(intro, /data-intro-sound-control/);
  assert.doesNotMatch(intro, /data-background-music-control/);
  assert.match(css, /\.zhaowu-intro-sound,[\s\S]*width:\s*auto !important/);
  assert.match(css, /white-space:\s*nowrap/);
  assert.match(css, /writing-mode:\s*horizontal-tb !important/);
  assert.match(css, /\.zhaowu-intro-sound \{[\s\S]*bottom:/);
});
