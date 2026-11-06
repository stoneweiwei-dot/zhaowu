import assert from "node:assert/strict";
import test from "node:test";
import { splitLocale, withLocale, normalizePath, hasLocalizedPath } from "../src/lib/hreflang.js";

test("locale prefixes round-trip while Traditional Chinese keeps the original canonical paths", () => {
  assert.deepEqual(splitLocale("/about?source=share"), { locale: "zh-Hant", path: "/about" });
  assert.deepEqual(splitLocale("/en/about?x=1#top"), { locale: "en", path: "/about" });
  assert.deepEqual(splitLocale("/zh-Hans/knowledge/true-solar-time"), { locale: "zh-Hans", path: "/knowledge/true-solar-time" });
  assert.equal(withLocale("/about", "zh-Hant"), "/about");
  assert.equal(withLocale("/about", "zh-Hans"), "/zh-Hans/about");
  assert.equal(withLocale("/about", "en"), "/en/about");
  assert.equal(withLocale("/", "en"), "/en");
  assert.equal(hasLocalizedPath("/"), true);
  assert.equal(hasLocalizedPath("/knowledge/true-solar-time"), true);
  assert.equal(hasLocalizedPath("/sample-report"), false);
  assert.equal(normalizePath("knowledge//true-solar-time/"), "/knowledge/true-solar-time");
});

test("URL locale takes priority before stored display language and router basepath is configured", async () => {
  const fs = await import("node:fs/promises");
  const display = await fs.readFile(new URL("../src/lib/display-language.ts", import.meta.url), "utf8");
  const main = await fs.readFile(new URL("../src/main.tsx", import.meta.url), "utf8");
  const html = await fs.readFile(new URL("../index.html", import.meta.url), "utf8");
  assert.match(display, /hasLocalizedPath\(routePath\)/);
  assert.match(main, /basepath: LOCALE_PREFIX\[initialRouteLocale\]/);
  assert.match(html, /var routeLanguage = path === "\/en"[\s\S]*?localStorage\.setItem\("zhaowu\.display-language", routeLanguage\)/);
});
