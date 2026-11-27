import assert from "node:assert/strict";
import { readFileSync, readdirSync } from "node:fs";
import test from "node:test";

const read = (path) => readFileSync(new URL("../" + path, import.meta.url), "utf8");
const registry = {
  ...JSON.parse(read("src/lib/route-meta.json")).routes,
  ...JSON.parse(read("src/lib/client-route-meta.json")),
};
const rootRoute = read("src/routes/__root.tsx");

test("every static file route declares a head with distinct localized titles and descriptions", () => {
  const seen = new Set();
  const descriptions = new Set();
  for (const file of readdirSync(new URL("../src/routes/", import.meta.url))) {
    if (!file.endsWith(".tsx") || /^[-_]/.test(file)) continue;
    const source = read("src/routes/" + file);
    const path = source.match(/createFileRoute\(["']([^"']+)["']\)/)?.[1];
    assert.ok(path, file + " route declaration");
    if (path.includes("$")) continue;
    // Account inherits the root head so its protected route file stays intact.
    assert.match(path === "/account" ? rootRoute : source, /head:\s*pageHead\b/, file);
    assert.ok(registry[path]?.["zh-Hant"], path);
    for (const [lang, { title, description }] of Object.entries(registry[path])) {
      assert.ok(title?.trim() && description?.trim(), path + " " + lang);
      const key = lang + "/" + title;
      assert.ok(!seen.has(key), "duplicate title on " + path + " " + lang);
      seen.add(key);
      const summary = lang + "/" + description;
      assert.ok(!descriptions.has(summary), "duplicate description on " + path + " " + lang);
      descriptions.add(summary);
    }
  }
  const head = read("src/lib/route-meta.ts");
  for (const field of ["{ title }", 'name: "description"', 'property: "og:title"',
    'property: "og:description"', 'property: "og:image"', 'rel: "canonical"']) {
    assert.ok(head.includes(field), field);
  }
});
