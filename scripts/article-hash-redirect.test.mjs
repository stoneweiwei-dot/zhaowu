import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { test } from "node:test";
import { articleHashRedirect } from "../src/lib/article-hash-redirect.ts";
import map from "../content/article-redirect-map.json" with { type: "json" };

test("every old article hash has a stable destination and overview mappings stay at overview", () => {
  for (const entry of map.redirects) {
    assert.equal(articleHashRedirect(entry.old_hash, "/knowledge"), entry.group === "overview" ? "/knowledge" : `/knowledge/${entry.new_slug}`);
  }
  assert.equal(map.redirects.filter((entry) => entry.group === "overview").length, 14);
});

test("unknown article hashes return to overview; unrelated hashes are left alone", () => {
  assert.equal(articleHashRedirect("#article-not-in-map", "/knowledge"), "/knowledge");
  assert.equal(articleHashRedirect("#mingli-knowledge", "/knowledge"), null);
});

test("language prefixes are preserved for targets and overview routes", () => {
  const mapped = map.redirects.find((entry) => entry.group !== "overview");
  const overview = map.redirects.find((entry) => entry.group === "overview");
  assert.equal(articleHashRedirect(mapped.old_hash, "/en/knowledge"), `/en/knowledge/${mapped.new_slug}`);
  assert.equal(articleHashRedirect(mapped.old_hash, "/zh-hans/knowledge"), `/zh-hans/knowledge/${mapped.new_slug}`);
  assert.equal(articleHashRedirect(overview.old_hash, "/fil/knowledge"), "/fil/knowledge");
});

test("knowledge effect processes once per page load and does not rewrite vercel.json", () => {
  const route = readFileSync(new URL("../src/routes/knowledge.tsx", import.meta.url), "utf8");
  assert.match(route, /useEffect\(\(\) => \{[\s\S]*?window\.location\.replace\(destination\)[\s\S]*?\}, \[\]\)/);
  const vercel = readFileSync(new URL("../vercel.json", import.meta.url), "utf8");
  assert.doesNotMatch(vercel, /article-|hash/);
});
