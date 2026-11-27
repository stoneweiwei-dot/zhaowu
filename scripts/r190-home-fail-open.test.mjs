import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const root = new URL("../", import.meta.url);
const source = (path) => readFile(new URL(path, root), "utf8");

test("the full report mounts only inside the unlocked branch", async () => {
  const form = await source("src/components/analysis-form.tsx");
  assert.match(form, /\{readingUnlocked \? <>\s*\{foundationValues \? <UnifiedBirthReport[\s\S]*?<ChartTrustPanel[\s\S]*?<\/> : <BaziReadingUnlock/);
  assert.ok(form.indexOf('className="zw-result-pillars"') < form.indexOf('<UnifiedBirthReport'));
});
