import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const pkg = JSON.parse(await readFile(new URL("../package.json", import.meta.url), "utf8"));
const vercel = JSON.parse(await readFile(new URL("../vercel.json", import.meta.url), "utf8"));
const workflow = await readFile(new URL("../.github/workflows/build.yml", import.meta.url), "utf8");
const releaseWorkflow = await readFile(new URL("../.github/workflows/release-ledger.yml", import.meta.url), "utf8");

test("production build uses deploy-gate not the full engine glob", () => {
  assert.match(pkg.scripts.build, /test:deploy/);
  assert.doesNotMatch(pkg.scripts.build, /test:engine/);
  assert.match(pkg.scripts.prebuild, /write-og-preview/);
  assert.doesNotMatch(pkg.scripts.build, /prebuild|write-og-preview/);
  assert.match(pkg.scripts["test:deploy"], /og-preview\.test\.mjs/);
  assert.match(pkg.scripts["test:deploy"], /deploy-gate\.test\.mjs/);
  assert.match(pkg.scripts["test:engine"], /scripts\/\*\.test\.mjs/);
});

test("Vercel build stays exact and only vetted main can trigger Production", () => {
  assert.equal(vercel.buildCommand, "npm run build");
  assert.deepEqual(vercel.git.deploymentEnabled, { "**": false, main: true });
  assert.match(vercel.ignoreCommand, /VERCEL_GIT_COMMIT_REF/);
  assert.match(vercel.ignoreCommand, /!= "main"/);
  assert.match(vercel.ignoreCommand, /exit 0/);
  assert.match(vercel.ignoreCommand, /git diff --quiet/);
});

test("GitHub Production CI keeps deploy-gate, engine, and visual regression jobs without iPhone Safari", () => {
  assert.match(workflow, /deploy-gate:/);
  assert.match(workflow, /npm run build/);
  assert.match(workflow, / {2}engine:/);
  assert.match(workflow, /name: Engine suite/);
  assert.match(workflow, /name: Visual regression/);
  assert.doesNotMatch(workflow, /name: iPhone Safari/);
  assert.doesNotMatch(workflow, /engine-observe:/);
  assert.doesNotMatch(workflow, /continue-on-error:\s*true/);
});

test("strict release ledger stays outside routine deploy CI", () => {
  assert.doesNotMatch(pkg.scripts["test:deploy"], /release-ledger/);
  assert.doesNotMatch(workflow, /release-ledger\.release\.mjs/);
  assert.match(releaseWorkflow, /push:\s*\n\s*tags:/);
  assert.match(releaseWorkflow, /- "v\*"/);
  assert.match(releaseWorkflow, /- "release-\*"/);
  assert.match(releaseWorkflow, /workflow_dispatch:/);
  assert.match(releaseWorkflow, /node --test scripts\/release-ledger\.release\.mjs/);
});
