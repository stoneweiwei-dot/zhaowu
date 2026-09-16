import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

const home = readFileSync(new URL("../src/routes/index.tsx", import.meta.url), "utf8");
const portals = readFileSync(new URL("../src/home-portals.css", import.meta.url), "utf8");
const articles = readFileSync(new URL("../src/components/life-view-home-section.tsx", import.meta.url), "utf8");

test("homepage method directory stays concise but uses readable tappable report cards", () => {
  assert.match(home, /zhaowu-home-portal-hint/);
  assert.match(home, /七種個人分析/);
  assert.match(home, /to: "\/numerology"/);
  assert.match(home, /生命靈數/);
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

test("homepage shows only the latest editorial item until the archive is opened", () => {
  assert.match(articles, /const latest = CONTENTS\[0\] \?\? null/);
  assert.match(articles, /const visibleArticles = archiveMode \|\| showAll \? CONTENTS : \[latest\]/);
  assert.match(articles, /aria-expanded=\{showAll\}/);
  assert.match(articles, /archiveMode/);
});
