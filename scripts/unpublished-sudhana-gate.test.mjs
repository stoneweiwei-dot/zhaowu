import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const read = (path) => readFileSync(new URL("../" + path, import.meta.url), "utf8");

test("unfinished Sudhana article is preserved as an unpublished, traceable draft", () => {
  const archive = read("docs/unpublished/sudhana-fifty-three-visits.md");
  const registry = read("src/lib/life-view-long-form.ts");
  const manifest = JSON.parse(read("docs/article-image-manifest.json"));
  const packageJson = JSON.parse(read("package.json"));
  assert.match(archive, /sudhana-fifty-three-visits-vasumitra-king/);
  assert.match(archive, /67b9dc2f5883dae28819151ab33de66d55f14dfdcb61bbec5b8f07894042490c/);
  assert.doesNotMatch(registry, /SUDHANA_FIFTY_THREE_VISITS_ARTICLE/);
  assert.equal(manifest.entries.some((item) => item.src.includes("sudhana-fifty-three-visits")), false);
  assert.doesNotMatch(packageJson.scripts.prebuild, /node scripts\/assemble-sudhana-art\.mjs/);
  // Future publishing must restore the original SHA-256 gate, not substitute a new/generated image.
  assert.match(read("scripts/assemble-sudhana-art.mjs"), /67b9dc2f5883dae28819151ab33de66d55f14dfdcb61bbec5b8f07894042490c/);
});
