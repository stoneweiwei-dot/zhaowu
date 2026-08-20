import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { test } from "node:test";

const root = new URL("../", import.meta.url);

async function source(path) {
  return readFile(new URL(path, root), "utf8");
}

test("homepage is a customer-facing brand entry, not an incident notice", async () => {
  const home = await source("src/routes/index.tsx");
  assert.match(home, /heroSlogan/);
  assert.match(home, /methodTitle/);
  assert.match(home, /<AnalysisForm \/>/);
  assert.doesNotMatch(home, /ZHAOWU · SAFE|白屏|視覺先暫停|视觉先暂停/);
});

test("language control exposes Traditional, Simplified and English directly", async () => {
  const shell = await source("src/components/site-shell.tsx");
  assert.match(shell, /<select[\s\S]*id="site-language"/);
  assert.match(shell, /value="zh-Hant">繁體/);
  assert.match(shell, /value="zh-Hans">简体/);
  assert.match(shell, /value="en">EN/);
});

test("every customer-facing translation key has an English value", async () => {
  const i18n = await source("src/lib/i18n.ts");
  const table = i18n.slice(i18n.indexOf("const TABLE = {"), i18n.indexOf("} as const satisfies"));
  const english = i18n.slice(i18n.indexOf("const EN:"), i18n.indexOf("\n};", i18n.indexOf("const EN:")));
  const keys = (text) => [...text.matchAll(/^  ([A-Za-z0-9]+):/gm)].map((match) => match[1]);
  const tableKeys = keys(table);
  const englishKeys = new Set(keys(english));
  assert.deepEqual(tableKeys.filter((key) => !englishKeys.has(key)), []);
});

test("public form uses associated labels and translated relationship copy", async () => {
  const form = await source("src/components/analysis-form.tsx");
  assert.match(form, /htmlFor="analysis-question"/);
  assert.match(form, /id="birth-city"/);
  assert.match(form, /\{t\("relation"\)\}/);
  assert.doesNotMatch(form, />感情需求類型</);
});

test("featured city search accepts common English and Simplified aliases", async () => {
  const { filterFeatured, localizeCityHit } = await import("../src/lib/bazi/cities.ts");
  assert.equal(filterFeatured("Sydney")[0]?.timezone, "Australia/Sydney");
  assert.equal(filterFeatured("悉尼")[0]?.timezone, "Australia/Sydney");
  assert.equal(filterFeatured("Melbourne")[0]?.timezone, "Australia/Melbourne");
  assert.equal(filterFeatured("纽约")[0]?.timezone, "America/New_York");
  assert.equal(localizeCityHit(filterFeatured("Sydney")[0], "en").display, "Sydney, Australia");
  assert.equal(localizeCityHit(filterFeatured("悉尼")[0], "zh-Hans").display, "悉尼，澳大利亚");
});
