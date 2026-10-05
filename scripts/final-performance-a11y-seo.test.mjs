import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const root = new URL("../", import.meta.url);
const source = (path) => readFile(new URL(path, root), "utf8");

test("final polish mounts only the active and next hero paintings", async () => {
  const home = await source("src/routes/index.tsx");
  assert.match(home, /visibleHeroIndexes = \[heroIdx, \(heroIdx \+ 1\) % HERO_PAINTINGS\.length\]/);
  assert.match(home, /visibleHeroIndexes\.map/);
  assert.doesNotMatch(home, /HERO_PAINTINGS\.map\(\(p, i\) => \(/);
  assert.match(home, /fetchPriority=\{i === heroIdx \? "high" : "low"\}/);
});

test("secondary homepage modules are deferred until their panels open", async () => {
  const home = await source("src/routes/index.tsx");
  for (const moduleName of [
    "daily-almanac-widget",
    "sky-events-home-section",
    "life-view-home-section",
    "scent-five-element-test",
  ]) {
    assert.match(home, new RegExp(`import\\("@/components/${moduleName}"\\)`));
  }
  assert.doesNotMatch(home, /import \{ DailyAlmanacWidget \} from/);
  assert.doesNotMatch(home, /import \{ LifeViewHomeSection \} from/);
  assert.match(home, /<Suspense fallback=\{null\}>/);
});

test("site shell exposes keyboard skip navigation and localized metadata", async () => {
  const shell = await source("src/components/site-shell.tsx");
  const css = await source("src/zhaowu-design-system.css");
  assert.match(shell, /className="zhaowu-skip-link"/);
  assert.match(shell, /id="zhaowu-main-content"/);
  assert.match(shell, /document\.title = title/);
  assert.match(shell, /meta\[name="description"\]/);
  assert.match(shell, /meta\[property="og:title"\]/);
  assert.match(shell, /meta\[name="twitter:title"\]/);
  assert.match(css, /\.zhaowu-skip-link/);
});

test("index provides conservative JSON-LD without invented ratings or testimonials", async () => {
  const html = await source("index.html");
  assert.match(html, /application\/ld\+json/);
  assert.match(html, /"@type": "WebSite"/);
  assert.match(html, /"@type": "WebApplication"/);
  assert.doesNotMatch(html, /aggregateRating|review|offers/);
});
