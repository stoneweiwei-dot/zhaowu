import assert from "node:assert/strict";
import { test } from "node:test";
import { readFileSync } from "node:fs";

const { buildChart } = await import("../src/lib/bazi/chart.ts");
const { FEATURED_CITIES } = await import("../src/lib/bazi/cities.ts");
const { ALL_ARTS, PANEL_ATTRS, buildCharacterPanel } = await import("../src/lib/report/character-panel.ts");
const {
  CHARACTER_PANEL_ASPECT_RATIO,
  CHARACTER_PANEL_DEEP_IMAGE_PROMPT,
  CHARACTER_PANEL_IMAGE_HEIGHT,
  CHARACTER_PANEL_IMAGE_WIDTH,
  CHARACTER_PANEL_VISUAL_CONTRACT_ID,
  isCharacterPanelVisualEligible,
} = await import("../src/lib/report/character-panel-visual-contract.ts");

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
  assert.equal(PANEL_ATTRS[1], "炁");
  for (const key of PANEL_ATTRS) {
    assert.ok(panel.scores[key] >= 1 && panel.scores[key] <= 10, key);
  }
  for (const key of ALL_ARTS) {
    assert.ok(panel.artScores[key] >= 1 && panel.artScores[key] <= 10, key);
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

const { buildPortraitPanelSvg } = await import("../src/lib/report/character-panel-card.ts");

test("character panel report image is locked to exact 9:16 portrait output", () => {
  assert.equal(CHARACTER_PANEL_ASPECT_RATIO, "9:16");
  assert.equal(CHARACTER_PANEL_IMAGE_WIDTH, 1080);
  assert.equal(CHARACTER_PANEL_IMAGE_HEIGHT, 1920);
  assert.equal(CHARACTER_PANEL_IMAGE_WIDTH / CHARACTER_PANEL_IMAGE_HEIGHT, 9 / 16);

  const svg = buildPortraitPanelSvg(buildCharacterPanel(chartFor()), "zh-Hans");
  assert.match(svg, /width="1080" height="1920"/);
  assert.match(svg, new RegExp(CHARACTER_PANEL_VISUAL_CONTRACT_ID));
  assert.match(svg, /精/);
  assert.match(svg, /炁/);
  assert.match(svg, /仙/);
  assert.match(svg, /禅/);
  assert.match(svg, /巫/);
  assert.match(svg, /STONE · 昭梧/);
  assert.match(svg, /每项十分，总分一百分/);
  assert.match(svg, /<polygon /);
});

test("generic character panel visual contract stores Song Huizong art direction and excludes tea imagery", () => {
  assert.match(CHARACTER_PANEL_DEEP_IMAGE_PROMPT, /SONG HUIZONG \/ NORTHERN SONG COURT AESTHETIC/);
  assert.match(CHARACTER_PANEL_DEEP_IMAGE_PROMPT, /Exact output aspect ratio 9:16 portrait \(1080×1920\)/);
  assert.match(CHARACTER_PANEL_DEEP_IMAGE_PROMPT, /No tea guardian/);
  assert.match(CHARACTER_PANEL_DEEP_IMAGE_PROMPT, /dedicated tea quiz result/);

  assert.equal(isCharacterPanelVisualEligible({ category: "tea-guardian" }), false);
  assert.equal(isCharacterPanelVisualEligible({ storage_path: "tea-guardians/longjing.webp" }), false);
  assert.equal(isCharacterPanelVisualEligible({ title: "茶神 · 龙井" }), false);
  assert.equal(isCharacterPanelVisualEligible({ subject_labels: ["宋画", "茶仙"] }), false);
  assert.equal(isCharacterPanelVisualEligible({ category: "guardian", storage_path: "gallery/song-scholar.webp", title: "宋系山水人物" }), true);
});

test("generic character panel applies a second tea-art gate before gallery ranking", () => {
  const component = readFileSync(new URL("../src/components/character-panel.tsx", import.meta.url), "utf8");
  assert.match(component, /isCharacterPanelVisualEligible/);
  assert.match(component, /rows\.filter/);
  assert.match(component, /storage_path: asset\.storage_path/);
  assert.match(component, /9:16/);
});
