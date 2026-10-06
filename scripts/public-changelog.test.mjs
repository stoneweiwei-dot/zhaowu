import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const changelog = await readFile(new URL("../src/lib/public-changelog.ts", import.meta.url), "utf8");
const updates = await readFile(new URL("../src/routes/updates.tsx", import.meta.url), "utf8");
const workflow = await readFile(new URL("../.github/workflows/build.yml", import.meta.url), "utf8");

test("updates page exposes the source-controlled public change history", () => {
  assert.match(changelog, /PUBLIC_CHANGELOG/);
  assert.match(changelog, /2026-10-06-public-change-log/);
  assert.match(updates, /PUBLIC_CHANGELOG/);
  assert.match(updates, /publicChangeText/);
  assert.match(updates, /data-public-changelog/);
});

test("production CI rejects product changes that omit the public changelog", () => {
  assert.match(workflow, /fetch-depth:\s*2/);
  assert.match(workflow, /node scripts\/public-changelog-gate\.mjs/);
});
