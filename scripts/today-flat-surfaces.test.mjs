import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

const css = readFileSync(new URL("../src/zhaowu-design-system.css", import.meta.url), "utf8");
const block = css.slice(css.indexOf("/* r229"));

test("Today spirit slip, chips and pillars are flat in day and night (no pasted boxes)", () => {
  assert.ok(css.includes("/* r229"));
  assert.match(block, /#daily-almanac \.zhaowu-today-guide__spirit \{[^}]*background: transparent !important/);
  assert.match(block, /#daily-almanac \.zhaowu-today-guide__chips article \{[^}]*background: transparent !important/);
  assert.match(block, /#daily-almanac \.zhaowu-today-pillars > span \{[^}]*background: transparent !important/);
  assert.match(block, /html\[data-zw-theme="night"\] body #daily-almanac \.zhaowu-today-guide__spirit h3 \{ color: #f4ead9/);
  assert.match(block, /html\[data-zw-theme="night"\] body #daily-almanac \.zhaowu-today-pillars > span b \{ color: #f4ead9/);
  assert.match(block, /:is\(\.zhaowu-today-pillars, \.zhaowu-daily-pillars\) \{[^}]*background: transparent !important/);
});


test("Today Guide uses three independent mineral sections on warm paper", () => {
  const start = css.indexOf("/* r229");
  const block = css.slice(start);
  for (const color of ["#a9bdc6", "#c4b7c9", "#d4c094", "#294b42", "#b1c5cc"]) {
    assert.ok(block.includes(color), `Missing Today Guide palette accent: ${color}`);
  }
  assert.match(block, /r230 — Today Guide is three independent reading sections/);
  assert.match(block, /#daily-almanac \.zhaowu-today-section\.is-almanac \{ border-top: 3px solid #a9bdc6/);
  assert.match(block, /#daily-almanac \.zhaowu-today-section\.is-wardrobe \{ border-top: 3px solid #d4c094/);
  assert.match(block, /#daily-almanac \.zhaowu-today-section\.is-spirit[\s\S]*background: #294b42/);
  assert.match(block, /html\[data-zw-theme="night"\] body #daily-almanac \.zhaowu-today-card\.is-guidance > small \{ color: #dfbcc2/);
  assert.match(block, /#daily-almanac \.zhaowu-today-guide__spirit-paper h3[\s\S]*color: #fff8ea/);
});
