import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { test } from "node:test";

const root = new URL("../", import.meta.url);
const source = (path) => readFile(new URL(path, root), "utf8");

test("Japanese and Korean display languages are wired into the global selector", async () => {
  const layer = await source("src/lib/display-language.ts");
  const shell = await source("src/components/site-shell.tsx");
  assert.match(layer, /export type DisplayLanguage = Locale \| "ja" \| "ko"/);
  assert.match(layer, /const JA:/);
  assert.match(layer, /const KO:/);
  assert.match(shell, /label: "日本語"/);
  assert.match(shell, /label: "한국어"/);
  assert.match(shell, /BrandIcon name="language"/);
  assert.match(shell, /setLanguage\(value\)/);
});

test("Japanese and Korean never alter the calculation locale", async () => {
  const layer = await source("src/lib/display-language.ts");
  assert.match(layer, /language === "zh-Hant" \|\| language === "zh-Hans" \? language : "en"/);
  assert.match(layer, /document\.documentElement\.lang = language/);
});
