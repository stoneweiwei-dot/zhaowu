import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const home = await readFile(new URL("../src/routes/index.tsx", import.meta.url), "utf8");
const funTests = await readFile(new URL("../src/routes/fun-tests.tsx", import.meta.url), "utf8");

test("homepage first two fun-test cards open different tests directly", () => {
  assert.match(home, /href:\s*"\/fun-tests\?test=animal"/);
  assert.match(home, /href:\s*"\/fun-tests\?test=element"/);
  assert.doesNotMatch(home, /\{\s*to:\s*"\/fun-tests"\s+as const,\s*title:\s*"(?:內在動物|内在动物|Inner Animal|五行功能|Five-Element Function)/);
});

test("fun-tests route honours the requested direct test without showing the shared menu first", () => {
  assert.match(funTests, /new URLSearchParams\(window\.location\.search\)\.get\("test"\)/);
  assert.match(funTests, /requested === "animal" \|\| requested === "element" \? requested : "menu"/);
});

test("fun-tests parent route delegates subroutes like /fun-tests/earth-online to Outlet", () => {
  assert.match(funTests, /import\s*\{[^}]*Outlet[^}]*\}\s*from\s*["']@tanstack\/react-router["']/);
  assert.match(funTests, /import\s*\{[^}]*useRouterState[^}]*\}\s*from\s*["']@tanstack\/react-router["']/);
  assert.match(funTests, /pathname\.startsWith\(\s*["']\/fun-tests\/["']\s*\)/);
  assert.match(funTests, /return\s*<Outlet\s*\/>/);
});
