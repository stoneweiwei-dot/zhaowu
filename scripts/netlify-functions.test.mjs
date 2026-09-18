import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const root = new URL("../", import.meta.url);
const netlify = await readFile(new URL("netlify.toml", root), "utf8");
const ownerMusicGit = await readFile(new URL("lib/owner-music-git.js", root), "utf8");
const endpoints = [
  "mingshu-chart",
  "mingshu-compare",
  "mingshu-doctor",
  "mingshu-locations",
  "owner-login",
  "owner-logout",
  "owner-music",
  "owner-session",
  "zhaowu-capabilities",
  "zhaowu-doctor",
];

test("Netlify builds the same Vite output and keeps SPA routing", () => {
  assert.match(netlify, /command = "npm run build"/);
  assert.match(netlify, /publish = "dist"/);
  assert.match(netlify, /functions = "netlify\/functions"/);
  assert.doesNotMatch(netlify, /ignore = "exit 0"/);
  assert.match(netlify, /from = "\/\*"[\s\S]*to = "\/index\.html"/);
});

test("owner music bundles its sealed key instead of reading beside the serverless bundle", () => {
  assert.match(ownerMusicGit, /import sealedKey from "\.\/owner-music-ssh\.json" with \{ type: "json" \}/);
  assert.doesNotMatch(ownerMusicGit, /readFileSync\(new URL\("\.\/owner-music-ssh\.json"/);
});

for (const endpoint of endpoints) {
  test(`Netlify exposes /api/${endpoint} through the canonical handler`, async () => {
    const source = await readFile(new URL(`netlify/functions/${endpoint}.ts`, root), "utf8");
    assert.match(source, new RegExp(`api/${endpoint}\\.js`));
    assert.match(source, new RegExp(`path: "\\/api\\/${endpoint}"`));
    assert.match(source, /runVercelCompat/);
  });
}
