import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

const read = (p) => readFileSync(new URL(`../${p}`, import.meta.url), "utf8");

test("night mode is switched off: theme module forces day and the toggle is not rendered", () => {
  const theme = read("src/lib/brand-theme.ts");
  assert.match(theme, /export const NIGHT_MODE_ENABLED = false/);
  assert.match(theme, /NIGHT_MODE_ENABLED \? requested : "day"/);
  assert.match(read("src/components/site-shell.tsx"), /\{NIGHT_MODE_ENABLED \? <div className="zhaowu-header-mode-toggle"/);
});

test("index.html never applies the night attribute before React loads", () => {
  const html = read("index.html");
  assert.doesNotMatch(html, /setAttribute\("data-zw-theme", "night"\)/);
  assert.doesNotMatch(html, /#0A1311/);
});
