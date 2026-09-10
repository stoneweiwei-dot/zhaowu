import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { test } from "node:test";

const root = new URL("../", import.meta.url);
const source = (path) => readFile(new URL(path, root), "utf8");

test("global language selector exposes the approved order including Hindi", async () => {
  const layer = await source("src/lib/display-language.ts");
  const shell = await source("src/components/site-shell.tsx");
  assert.match(layer, /export type DisplayLanguage = Locale \| "ja" \| "ko" \| "hi"/);
  assert.match(layer, /const JA:/);
  assert.match(layer, /const KO:/);
  assert.match(layer, /const HI:/);
  assert.match(shell, /value: "en"[\s\S]*value: "zh-Hans"[\s\S]*value: "zh-Hant"[\s\S]*value: "ja"[\s\S]*value: "ko"[\s\S]*value: "hi"/);
  assert.match(shell, /label: "English"/);
  assert.match(shell, /label: "简体"/);
  assert.match(shell, /label: "繁體"/);
  assert.match(shell, /label: "日本語"/);
  assert.match(shell, /label: "한국어"/);
  assert.match(shell, /label: "हिन्दी"/);
  assert.match(shell, /BrandIcon name="language"/);
  assert.match(shell, /setLanguage\(value\)/);
});

test("fresh sessions default to Simplified Chinese while saved preferences persist", async () => {
  const layer = await source("src/lib/display-language.ts");
  assert.match(layer, /if \(typeof window === "undefined"\) return "zh-Hans"/);
  assert.match(layer, /zhaowu\.display-language/);
  assert.match(layer, /return "zh-Hans";\n}/);
});

test("Japanese Korean and Hindi never alter the calculation locale", async () => {
  const layer = await source("src/lib/display-language.ts");
  assert.match(layer, /language === "zh-Hant" \|\| language === "zh-Hans" \? language : "en"/);
  assert.match(layer, /language === "hi"/);
  assert.match(layer, /return "hi-IN"/);
  assert.match(layer, /document\.documentElement\.lang = language/);
});
