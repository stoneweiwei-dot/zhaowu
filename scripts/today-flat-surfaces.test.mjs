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


test("Today Guide uses restrained mineral palette on warm paper in day and night", () => {
  const start = css.indexOf("/* r229");
  const block = css.slice(start);
  for (const color of ["#a9bdc6", "#c4b7c9", "#d4c094", "#294b42", "#b1c5cc"]) {
    assert.ok(block.includes(color), `Missing Today Guide palette accent: ${color}`);
  }
  assert.match(block, /html\[data-zw-theme="night"\].*\.zhaowu-today-guide__spirit h3/);
  assert.match(block, /#daily-almanac \.zhaowu-today-guide__tabs button\[aria-pressed="true"\]/);
  assert.match(block, /body #daily-almanac \.zhaowu-today-guide__tabs button\[aria-pressed="true"\] \{[\s\S]*background: rgba\(157, 184, 194, \.16\)/);
  assert.match(block, /html\[data-zw-theme="night"\] body #daily-almanac \.zhaowu-today-card\.is-guidance > small \{ color: #dfbcc2/);
  assert.match(block, /body #daily-almanac \.zhaowu-today-guide__chips article:nth-child\(2\) \{ border-left: 2px solid #d4c094/);
});
