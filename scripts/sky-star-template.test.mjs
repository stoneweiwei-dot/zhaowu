import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";
import { getTodaySkyCards, getTodaySkyUpdatedDate } from "../src/lib/sky-events.ts";
import { getSkyCardTone, getSkyWeekRange, getSkyWeekTheme } from "../src/lib/sky-week-presentation.ts";

const component = await readFile(new URL("../src/components/today-sky-cards.tsx", import.meta.url), "utf8");
const css = await readFile(new URL("../src/sky-events.css", import.meta.url), "utf8");
const presentation = await readFile(new URL("../src/lib/sky-week-presentation.ts", import.meta.url), "utf8");

test("every weekly card resolves to one of the three intensity tones", () => {
  for (const card of getTodaySkyCards()) {
    assert.ok(["high", "mid", "shift"].includes(getSkyCardTone(card)), `${card.id} has no valid tone`);
  }
});

test("a card without a curated tone falls back to its grade instead of throwing", () => {
  assert.equal(getSkyCardTone({ id: "unknown-future-card", grade: "A" }), "high");
  assert.equal(getSkyCardTone({ id: "unknown-future-card", grade: "B" }), "mid");
});

test("Saturn's opposition and Mars–Pluto opposition are the strong cards; the Mercury ingress is a shift", () => {
  assert.equal(getSkyCardTone({ id: "saturn-opposition-2026-10-04", grade: "A" }), "high");
  assert.equal(getSkyCardTone({ id: "mars-opposite-pluto-2026-10-03", grade: "B" }), "high");
  assert.equal(getSkyCardTone({ id: "mercury-into-scorpio-2026-10-01", grade: "B" }), "shift");
});

test("week range spans the first to the last card date and the theme exists in all three languages", () => {
  const cards = getTodaySkyCards();
  const range = getSkyWeekRange(cards);
  assert.equal(range.start, "2026-09-28");
  assert.equal(range.end, getTodaySkyUpdatedDate());
  const theme = getSkyWeekTheme(cards);
  assert.ok(theme, "the current week must carry a theme");
  for (const lang of ["zh-Hant", "zh-Hans", "en"]) assert.ok(theme[lang].length > 40, `${lang} theme too short`);
});

test("a week with no authored theme renders no theme block instead of inventing one", () => {
  assert.equal(getSkyWeekTheme([{ date: "2030-01-01" }, { date: "2030-01-07" }]), null);
  assert.equal(getSkyWeekRange([]), null);
});

test("the theme only restates dates and events that exist in the card data", () => {
  const theme = getSkyWeekTheme(getTodaySkyCards());
  const ids = getTodaySkyCards().map((card) => card.id).join(" ");
  for (const key of ["sun-trine-uranus", "mercury-into-scorpio", "mars-square-mercury", "mars-trine-neptune", "mars-opposite-pluto", "saturn-opposition"]) {
    assert.match(ids, new RegExp(key), `theme refers to ${key} but no such card exists`);
  }
  assert.match(theme["zh-Hant"], /不是命運因果/);
});

test("component keeps the template structure and the astronomy-before-symbolism order", () => {
  for (const hook of ["sky-today-week-badge", "sky-today-theme-block", "sky-today-date-col", "sky-today-legend", "tone-${tone}"]) {
    assert.ok(component.includes(hook), `component lost ${hook}`);
  }
  assert.ok(component.indexOf("sky-today-science") < component.indexOf("sky-today-influence"), "astronomy line must precede the symbolic reading");
  assert.match(component, /<header className="sky-today-header">[\s\S]*<h2>/, "dark-mode override targets .sky-today-header h2");
});

test("the digest does not claim an automatic weekly refresh the data layer does not perform", () => {
  assert.doesNotMatch(component, /自動播報|自动播报|每週一更新|每周一更新|Auto-published|auto-updated/i);
});

test("styles use the site palette and local fonts only (mainland-China reachable, no external font fetch)", () => {
  for (const token of ["#f5f0e8", "#1a3a5c", "#3d6b5a", "#c0392b"]) assert.ok(css.includes(token), `palette token ${token} missing`);
  assert.doesNotMatch(css, /fonts\.googleapis|fonts\.gstatic|@import\s+url/);
  assert.doesNotMatch(component + presentation, /fonts\.googleapis|fonts\.gstatic/);
});

test("old dashboard-style card selectors are gone so they cannot fight the new layout", () => {
  for (const stale of [".sky-today-card-mark", ".sky-today-impact", ".sky-today-grade", ".sky-today-updated"]) {
    assert.ok(!css.includes(stale), `stale selector ${stale} still in sky-events.css`);
  }
});
