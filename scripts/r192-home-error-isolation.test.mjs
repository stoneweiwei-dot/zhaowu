import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const root = new URL("../", import.meta.url);
const source = (path) => readFile(new URL(path, root), "utf8");

test("r192 isolates homepage sections behind localized fail-open boundaries", async () => {
  const home = await source("src/routes/index.tsx");
  const boundary = await source("src/components/home-section-boundary.tsx");
  assert.match(home, /<HomeSectionBoundary id="comic" locale=\{locale\}>/);
  assert.match(home, /<HomeSectionBoundary id="analysis" locale=\{locale\}/);
  assert.match(home, /<HomeSectionBoundary id="install" locale=\{locale\}>/);
  assert.match(boundary, /getDerivedStateFromError/);
  assert.match(boundary, /data-home-fail-open/);
  assert.match(boundary, /Reload birth details/);
});

test("r192 saved-birth structure preview cannot crash the home route", async () => {
  const form = await source("src/components/analysis-form.tsx");
  assert.match(form, /try \{ return analyzeStructure\(previewChart\); \} catch \{ return null; \}/);
  assert.match(form, /chartDetailsOpen \? \(/);
});
