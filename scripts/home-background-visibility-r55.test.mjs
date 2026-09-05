import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

const css = readFileSync(new URL("../src/home-background-visibility-r55.css", import.meta.url), "utf8");
const main = readFileSync(new URL("../src/main.tsx", import.meta.url), "utf8");

function indexOfOrFail(haystack, needle) {
  const index = haystack.indexOf(needle);
  assert.notEqual(index, -1, `missing ${needle}`);
  return index;
}

test("r55 homepage transparency layer is imported last", () => {
  const r52 = indexOfOrFail(main, "./daily-spirit-slip-r52.css");
  const r55 = indexOfOrFail(main, "./home-background-visibility-r55.css");
  assert.ok(r55 > r52);
});

test("r55 keeps the existing homepage and exposes the selected artwork through thin paper", () => {
  assert.match(css, /zhaowu-home-app-frame/);
  assert.match(css, /zhaowu-daily-almanac/);
  assert.match(css, /#analysisForm/);
  assert.match(css, /zhaowu-home-portals-block/);
  assert.match(css, /zhaowu-home-fun-section/);
  assert.match(css, /#auspicious-atlas/);
  assert.match(css, /rgba\(246, 236, 216, \.54\)/);
  assert.match(css, /rgba\(250, 244, 232, \.09\)/);
  assert.doesNotMatch(css, /background-attachment\s*:\s*fixed/);
});

test("r55 protects form readability on iPhone-sized screens", () => {
  assert.match(css, /@media \(max-width: 640px\)/);
  assert.match(css, /rgba\(255, 251, 242, \.84\)/);
  assert.match(css, /rgba\(246, 236, 216, \.58\)/);
});
