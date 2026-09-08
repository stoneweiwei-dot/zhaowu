import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

const home = readFileSync(new URL("../src/routes/index.tsx", import.meta.url), "utf8");
const portals = readFileSync(new URL("../src/home-portals.css", import.meta.url), "utf8");
const articles = readFileSync(new URL("../src/components/life-view-home-section.tsx", import.meta.url), "utf8");

test("homepage method directory stays concise but uses readable tappable report cards", () => {
  assert.match(home, /zhaowu-home-portal-hint/);
  assert.match(home, /六種命理專卷/);
  assert.match(home, /data-specialist-link/);
  assert.doesNotMatch(home, /portalCopy\.learn/);
  assert.doesNotMatch(home, /portalCopy\.best/);
  assert.match(portals, /min-height:\s*164px/);
  assert.match(portals, /font-size:\s*22px/);
  assert.match(portals, /pointer-events:\s*auto\s*!important/);
  assert.match(portals, /touch-action:\s*manipulation/);
  assert.match(portals, /@media \(max-width: 640px\)/);
  assert.match(portals, /grid-template-columns:\s*1fr/);
});

test("homepage shows only the latest article until the archive is opened", () => {
  assert.match(articles, /const latest = ARTICLES\[0\]/);
  assert.match(articles, /const visibleArticles = showAll \? ARTICLES : \[latest\]/);
  assert.match(articles, /aria-expanded=\{showAll\}/);
});
