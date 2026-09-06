import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";
const main = await readFile(new URL("../src/main.tsx", import.meta.url), "utf8");
const css = await readFile(new URL("../src/report-overview-art-r62.css", import.meta.url), "utf8");
test("report overview uses the dedicated r62 Supabase art background", () => {
  assert.match(main, /report-overview-art-r62\.css/);
  assert.match(css, /zhaowu-visual-overview-art/);
  assert.match(css, /zhaowu-gallery\/report-visuals\/r62\/overview-bg\.webp/);
  assert.doesNotMatch(css, /wallpaper-song\.jpg/);
});
