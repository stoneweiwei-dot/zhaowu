import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

const home = readFileSync(new URL("../src/routes/index.tsx", import.meta.url), "utf8");
const portals = readFileSync(new URL("../src/home-portals.css", import.meta.url), "utf8");
const articles = readFileSync(new URL("../src/components/life-view-home-section.tsx", import.meta.url), "utf8");

test("homepage method directory stays compact and does not render long method explanations", () => {
  assert.match(home, /zhaowu-home-portal-hint/);
  assert.doesNotMatch(home, /portalCopy\.learn/);
  assert.doesNotMatch(home, /portalCopy\.best/);
  assert.match(portals, /min-height:\s*74px/);
});

test("homepage shows only the latest article until the archive is opened", () => {
  assert.match(articles, /const latest = ARTICLES\[0\]/);
  assert.match(articles, /const visibleArticles = showAll \? ARTICLES : \[latest\]/);
  assert.match(articles, /aria-expanded=\{showAll\}/);
});
