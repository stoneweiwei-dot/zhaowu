import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { createHash } from "node:crypto";

const articlePath = "src/lib/life-view-long-form/zhaojian-benxin-awareness-compassion.ts";
const registryPath = "src/lib/life-view-long-form.ts";
const assetPath = "public/articles/zhaojian-benxin-stone-original.webp";
const imagePath = "/articles/zhaojian-benxin-stone-original.webp";

test("STONE awareness and compassion essay is trilingual and listed in the existing article registry", () => {
  const source = readFileSync(articlePath, "utf8");
  const registry = readFileSync(registryPath, "utf8");
  assert.match(source, /zhaojian-benxin-awareness-compassion-everyday-practice/);
  assert.match(source, /"zh-Hant":/);
  assert.match(source, /"zh-Hans":/);
  assert.match(source, /"en":/);
  assert.match(source, /慈與悲/);
  assert.match(source, /因果與善念/);
  assert.ok(source.includes(imagePath));
  assert.match(registry, /ZHAOJIAN_BENXIN_ARTICLE/);
});

test("STONE original 9:16 painting is a committed real WebP binary", () => {
  const bytes = readFileSync(assetPath);
  assert.ok(bytes.length > 150000 && bytes.length < 500000);
  assert.equal(bytes.toString("ascii", 0, 4), "RIFF");
  assert.equal(bytes.toString("ascii", 8, 12), "WEBP");
  assert.equal(createHash("sha256").update(bytes).digest("hex"), "b3f27544fc9c6626d91a4736d97cd3679eb2da8bee94ead76b33c52a57d4a935");
});

test("STONE painting provenance is registered for the production article build", () => {
  const manifest = JSON.parse(readFileSync("docs/article-image-manifest.json", "utf8"));
  const entry = manifest.entries.find((row) => row.src === imagePath);
  assert.ok(entry, "Original painting must be listed in article-image-manifest.json");
  assert.equal(entry.article, "zhaojian-benxin-awareness-compassion");
  assert.equal(entry.kind, "painting");
  assert.equal(entry.source, "stone-original");
  assert.equal(entry.status, "approved");
});
