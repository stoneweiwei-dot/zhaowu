import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const main = await readFile(new URL("../src/main.tsx", import.meta.url), "utf8");
const css = await readFile(new URL("../src/home-art-direction-r47.css", import.meta.url), "utf8");

test("r47 art direction loads after the existing visual locks", () => {
  assert.match(main, /home-art-direction-r47\.css/);
  assert.ok(main.indexOf("zhaowu-layout-v41.css") < main.indexOf("home-art-direction-r47.css"));
});

test("r47 keeps the homepage in one warm parchment and jade visual system", () => {
  assert.match(css, /--r47-jade:\s*#315f50/);
  assert.match(css, /#analysisForm button\[type="submit"\]/);
  assert.match(css, /\.zhaowu-daily-almanac/);
  assert.match(css, /\.zhaowu-home-portals-block/);
  assert.match(css, /@media \(max-width: 560px\)/);
  assert.match(css, /font-size:\s*16px\s*!important/);
});

test("r47 does not style protected application logic", () => {
  assert.doesNotMatch(css, /supabase|payment|checkout|buildChart|runBootstrapReadiness/i);
});