import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const root = new URL("../", import.meta.url);
const source = (path) => readFile(new URL(path, root), "utf8");

test("r190 homepage keeps optional full birth report lazy", async () => {
  const form = await source("src/components/analysis-form.tsx");
  assert.match(form, /const \[chartDetailsOpen, setChartDetailsOpen\] = useState\(false\)/);
  assert.match(form, /open=\{chartDetailsOpen\}/);
  assert.match(form, /onToggle=\{\(event\) => setChartDetailsOpen\(event\.currentTarget\.open\)\}/);
  assert.match(form, /chartDetailsOpen \? \([\s\S]*<UnifiedBirthReport/);
});

test("r190 preserves formal chart before optional full detail mount", async () => {
  const form = await source("src/components/analysis-form.tsx");
  const baziIndex = form.indexOf("<BaziChart chart={previewChart}");
  const lazyIndex = form.indexOf("chartDetailsOpen ? (");
  assert.ok(baziIndex >= 0);
  assert.ok(lazyIndex > baziIndex);
});
