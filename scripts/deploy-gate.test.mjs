import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const pkg = JSON.parse(await readFile(new URL("../package.json", import.meta.url), "utf8"));
const vercel = JSON.parse(await readFile(new URL("../vercel.json", import.meta.url), "utf8"));
const workflow = await readFile(new URL("../.github/workflows/build.yml", import.meta.url), "utf8");

test("production build uses deploy-gate not the full engine glob", () => {
  assert.match(pkg.scripts.build, /test:deploy/);
  assert.doesNotMatch(pkg.scripts.build, /test:engine/);
  assert.match(pkg.scripts.build, /prebuild|write-og-preview/);
  assert.match(pkg.scripts["test:deploy"], /og-preview\.test\.mjs/);
  assert.match(pkg.scripts["test:deploy"], /deploy-gate\.test\.mjs/);
  assert.match(pkg.scripts["test:engine"], /scripts\/\*\.test\.mjs/);
});

test("Vercel build stays on npm run build and git auto-deploy remains off", () => {
  assert.equal(vercel.buildCommand, "npm run build");
  assert.equal(vercel.git.deploymentEnabled, false);
});

test("GitHub Production CI keeps a blocking deploy-gate job", () => {
  assert.match(workflow, /deploy-gate:/);
  assert.match(workflow, /npm run build/);
  assert.match(workflow, /engine-observe:/);
});
