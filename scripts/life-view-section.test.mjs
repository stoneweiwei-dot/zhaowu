import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

const home = readFileSync(new URL("../src/routes/index.tsx", import.meta.url), "utf8");
const section = readFileSync(new URL("../src/components/life-view-home-section.tsx", import.meta.url), "utf8");
const fullSection = readFileSync(new URL("../src/components/life-view-section.tsx", import.meta.url), "utf8");
const curatedSource = readFileSync(new URL("../src/lib/life-view-curated.ts", import.meta.url), "utf8");
const source = readFileSync(new URL("../src/lib/life-view.ts", import.meta.url), "utf8");
const fileSource = readFileSync(new URL("../src/lib/life-view-from-files.ts", import.meta.url), "utf8");
const practiceSource = readFileSync(new URL("../src/lib/life-view-practice-manual.ts", import.meta.url), "utf8");
const intakeSource = readFileSync(new URL("../src/lib/life-view-20260831.ts", import.meta.url), "utf8");
const layout = readFileSync(new URL("../src/content-layout-fixes.css", import.meta.url), "utf8");

test("home exposes Zhaowu Guan Shi Lu as a latest-first curated archive", () => {
  assert.match(home, /LifeViewHomeSection/);
  assert.match(home, /<LifeViewHomeSection \/>/);
  assert.match(section, /id="life-view"/);
  assert.match(section, /昭梧 · 觀世錄/);
  assert.match(section, /昭梧 · 观世录/);
  assert.match(section, /Zhaowu · Notes on Life/);
  assert.match(section, /首頁只看最新一篇/);
  assert.match(section, /首页只看最新一篇/);
  assert.match(section, /Latest note first/);
  assert.match(section, /LIFE_VIEW_CURATED_ARTICLES/);
  assert.match(section, /const ARTICLES = LIFE_VIEW_CURATED_ARTICLES/);
  assert.doesNotMatch(section, /LIFE_VIEW_FILE_ARTICLES|LIFE_VIEW_PRACTICE_ARTICLES|LIFE_VIEW_20260831_ARTICLES|LIFE_VIEW_20260903_ARTICLES|LIFE_VIEW_20260903_LATE_ARTICLES/);
  assert.match(section, /const latest = ARTICLES\[0\]/);
  assert.match(section, /const visibleArticles = showAll \? ARTICLES : \[latest\]/);
  assert.match(section, /aria-expanded=\{showAll\}/);

  assert.match(curatedSource, /export const LIFE_VIEW_CURATED_ARTICLES/);
  assert.match(curatedSource, /id: "practice-lives-in-daily-choices"/);
  assert.match(curatedSource, /id: "kindness-needs-boundaries"/);
  assert.match(curatedSource, /id: "letting-go-and-cutting-losses"/);
  assert.match(curatedSource, /id: "having-versus-possessing"/);

  // Legacy article packs remain as source archives even though they no longer stack on the homepage.
  assert.match(source, /export const LIFE_VIEW_ARTICLES/);
  assert.match(source, /id: "break-the-deadlock"/);
  assert.match(source, /id: "long-term-practice"/);
  assert.match(fileSource, /export const LIFE_VIEW_FILE_ARTICLES/);
  assert.match(fileSource, /id: "frequency-is-not-the-entrance"/);
  assert.match(fileSource, /id: "sensitivity-needs-boundaries"/);
  assert.match(fileSource, /id: "love-reveals-the-unfinished-self"/);
  assert.match(fileSource, /id: "capacity-is-real-energy"/);
  assert.match(fileSource, /id: "fate-has-bounds-choice-has-space"/);
  assert.match(fileSource, /id: "follow-the-flow-not-surrender"/);
  assert.match(practiceSource, /export const LIFE_VIEW_PRACTICE_ARTICLES/);
  assert.match(practiceSource, /id: "five-pillars-of-practice"/);
  assert.match(intakeSource, /export const LIFE_VIEW_20260831_ARTICLES/);
  assert.match(intakeSource, /id: "world-as-mirror-not-physics"/);
  assert.match(intakeSource, /id: "karma-is-not-blame"/);

  // Keep the richer art reader available as a retained component.
  assert.match(fullSection, /data-life-view-art-fragment/);
  assert.match(fullSection, /stableCrop/);
  assert.match(fullSection, /objectPosition/);
  assert.doesNotMatch(fullSection, /Math\.random/);
  assert.match(layout, /life-view-art-fragment/);
  assert.match(layout, /object-fit: cover/);
});
