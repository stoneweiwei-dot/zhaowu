import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const root = new URL("../", import.meta.url);
const source = (path) => readFile(new URL(path, root), "utf8");

test("r191 adopts Lite mobile discipline without creating a second product core", async () => {
  const design = await source("src/zhaowu-design-system.css");
  const home = await source("src/routes/index.tsx");
  const registry = await source("docs/INSTRUCTION-REGISTRY.md");
  assert.match(design, /r191 — Lite-converged mobile editorial shell/);
  assert.match(design, /560px/);
  assert.match(design, /--zw-paper:\s*#F7F1E3/);
  assert.match(design, /--zw-jade:\s*#1D6B54/);
  assert.match(design, /--zw-cinnabar:\s*#B23B24/);
  assert.match(home, /<AnalysisForm \/>/);
  assert.match(home, /<ResultView result=\{current\} \/>/);
  assert.match(registry, /r191 正式站 × 昭梧 Lite/);
  assert.match(registry, /zhaowu-guide\.ston1004\.chatgpt\.site/);
});

test("r191 restores Storage writes only through the central gate", async () => {
  const policy = await source("src/lib/storage-write-policy.ts");
  const ownerApi = await source("api/owner-data.js");
  assert.match(policy, /SUPABASE_STORAGE_WRITES_PAUSED = false/);
  assert.doesNotMatch(ownerApi, /STORAGE_GROWING_ACTIONS/);
});
