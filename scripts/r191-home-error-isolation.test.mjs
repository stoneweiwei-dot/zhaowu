import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const root = new URL("../", import.meta.url);
const source = (path) => readFile(new URL(path, root), "utf8");

test("r191 isolates homepage sections behind fail-open boundaries", async () => {
  const home = await source("src/routes/index.tsx");
  const boundary = await source("src/components/home-section-boundary.tsx");
  assert.match(home, /<HomeSectionBoundary id="comic">/);
  assert.match(home, /<HomeSectionBoundary id="analysis"/);
  assert.match(home, /<HomeSectionBoundary id="install">/);
  assert.match(boundary, /getDerivedStateFromError/);
  assert.match(boundary, /data-home-fail-open/);
});

test("r191 saved-birth structure preview cannot crash the home route", async () => {
  const form = await source("src/components/analysis-form.tsx");
  assert.match(form, /try \{ return analyzeStructure\(previewChart\); \} catch \{ return null; \}/);
  assert.match(form, /chartDetailsOpen \? \(/);
});
