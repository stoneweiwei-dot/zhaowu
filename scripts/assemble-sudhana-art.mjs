import { createHash } from "node:crypto";
import { readFileSync, writeFileSync } from "node:fs";
import path from "node:path";
import assert from "node:assert/strict";

/** Assemble original artwork from Git-tracked binary transport chunks; reject corruption or substitution. */
const root = path.resolve(import.meta.dirname, "..");
const basename = "sudhana-fifty-three-visits-stone-original.webp";
const expected = {
  length: 1995574,
  sha256: "4d649549298fee5448e542ad60b75f8cea5ad86bc7c4e61ad8fe88415545b4a4",
};
const bytes = Buffer.concat([0, 1].map(i => readFileSync(path.join(root, "art-source", basename + ".part" + i))));
assert.equal(bytes.length, expected.length, "Sudhana image byte length differs from original");
assert.equal(createHash("sha256").update(bytes).digest("hex"), expected.sha256, "Sudhana image checksum differs from original");
assert.equal(bytes.toString("ascii", 0, 4), "RIFF");
assert.equal(bytes.toString("ascii", 8, 12), "WEBP");
writeFileSync(path.join(root, "public", "articles", basename), bytes);
console.log("[article-art] Sudhana original restored with SHA-256 " + expected.sha256);
