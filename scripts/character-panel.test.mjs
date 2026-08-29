import assert from "node:assert/strict";
import { test } from "node:test";
import { readFileSync } from "node:fs";

const { buildChart } = await import("../src/lib/bazi/chart.ts");
const { FEATURED_CITIES } = await import("../src/lib/bazi/cities.ts");
const { PANEL_ATTRS, buildCharacterPanel } = await import("../src/lib/report/character-panel.ts");

const CITY = FEATURED_CITIES[0];

function chartFor(over = {}) {
  return buildChart({
    question: "我现在该不该动？",
    year: 1988,
    month: 10,
    day: 4,
    hour: 3,
    minute: 30,
    timeUnknown: false,
    gender: "male",
    relation: "unset",
    city: CITY,
    liveCity: null,
    ziPolicy: "midnight",
    useTrueSolar: false,
    ...over,
  });
}

test("character panel scores stay within 1-10 and total stays within 10-100", () => {
  const panel = buildCharacterPanel(chartFor());
  assert.equal(PANEL_ATTRS.length, 10);
  for (const key of PANEL_ATTRS) {
    assert.ok(panel.scores[key] >= 1 && panel.scores[key] <= 10, key);
  }
  assert.ok(panel.total >= 10 && panel.total <= 100);
  assert.match(panel.school, /^(dao|fo|wu)$/);
  assert.ok(panel.title.length > 0);
});

test("same birth data produces the same character panel", () => {
  const a = buildCharacterPanel(chartFor());
  const b = buildCharacterPanel(chartFor());
  assert.deepEqual(a, b);
});

test("result view mounts the character panel beside decree delivery", () => {
  const resultView = readFileSync(new URL("../src/components/result-view.tsx", import.meta.url), "utf8");
  assert.match(resultView, /import \{ CharacterPanel \}/);
  assert.match(resultView, /<CharacterPanel chart=\{chart\} portraitUrl=\{imageUrl\} \/>/);
});

const { buildLandscapePanelSvg } = await import("../src/lib/report/character-panel-card.ts");

test("character panel report image keeps the reference sheet contract", () => {
  const svg = buildLandscapePanelSvg(buildCharacterPanel(chartFor()), "zh-Hans");
  assert.match(svg, /精/);
  assert.match(svg, /炅/);
  assert.match(svg, /仙/);
  assert.match(svg, /禅/);
  assert.match(svg, /巫/);
  assert.match(svg, /STONE · 昭梧/);
  assert.match(svg, /每项十分，总分一百分/);
  assert.match(svg, /<polygon /);
});
