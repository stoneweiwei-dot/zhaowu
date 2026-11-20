import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const css = await readFile(new URL("../src/zhaowu-design-system.css", import.meta.url), "utf8");

test("r193 night contrast overrides load after the r192 compact shell", () => {
  const r192Tail = css.lastIndexOf("/* r191 — Lite-converged mobile editorial shell.");
  const r193Fix = css.lastIndexOf("/* r193 — restore night-mode contrast after the r192 compact shell. */");

  assert.ok(r192Tail >= 0);
  assert.ok(r193Fix > r192Tail);
});

test("r193 keeps header controls on the dark night surface", () => {
  assert.match(
    css,
    /html\[data-zw-theme="night"\] body:has\(\.zhaowu-home-layout\) \.zhaowu-site-header \[role="group"\][\s\S]*?background: transparent !important;/,
  );
});

test("r193 restores English disclosure and paper-section contrast", () => {
  assert.match(
    css,
    /html\[lang="en"\]\[data-zw-theme="night"\] \.zhaowu-home-disclosure-trigger strong[\s\S]*?color: #E8DFCF !important;/,
  );
  assert.match(
    css,
    /html\[lang="en"\]\[data-zw-theme="night"\] \.zhaowu-home-disclosure-trigger small[\s\S]*?color: #C8BEAD !important;/,
  );
  assert.match(
    css,
    /html\[data-zw-theme="night"\] \.zhaowu-home-sheet-shell \.zhaowu-bazi-stage-head :is\(\.zhaowu-section-kicker, \.zhaowu-section-lead\)[\s\S]*?color: #50675F !important;/,
  );
});
