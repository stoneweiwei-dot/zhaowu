import assert from "node:assert/strict";
import { existsSync } from "node:fs";
import { readFile } from "node:fs/promises";
import test from "node:test";

// Guards the CI / release plumbing so later small edits cannot silently undo it:
// ledger stays release-only, the post-deploy smoke stays, CI jobs stay parallel, one production host.
// Changing any of these on purpose means editing this test in the same PR.

const root = new URL("..", import.meta.url);
const read = (rel) => readFile(new URL(rel, root), "utf8");

test("release ledger stays release-only (never part of routine CI)", async () => {
  const build = await read(".github/workflows/build.yml");
  assert.doesNotMatch(build, /release-ledger/);
  const pkg = JSON.parse(await read("package.json"));
  assert.match(pkg.scripts["test:engine"], /scripts\/\*\.test\.mjs/);
  assert.doesNotMatch(pkg.scripts["test:engine"], /release/);
  assert.ok(existsSync(new URL("scripts/release-ledger.release.mjs", root)));
  assert.ok(!existsSync(new URL("scripts/release-ledger.test.mjs", root)), "ledger test must not match the *.test.mjs glob");
  const ledger = await read(".github/workflows/release-ledger.yml");
  assert.match(ledger, /tags:/);
  assert.doesNotMatch(ledger, /pull_request/);
});

test("post-deploy production smoke exists and waits for the exact pushed SHA", async () => {
  const wf = await read(".github/workflows/production-smoke.yml");
  assert.match(wf, /branches: \[main\]/);
  assert.match(wf, /release\.json/);
  assert.match(wf, /GITHUB_SHA/);
  assert.match(wf, /playwright\.production\.config\.ts/);
  const spec = await read("e2e-production/smoke.spec.ts");
  assert.match(spec, /EXPECT_SHA/);
  assert.match(spec, /\/api\/owner-music/);
});

test("CI jobs stay parallel and iPhone Safari is skipped", async () => {
  const build = await read(".github/workflows/build.yml");
  assert.doesNotMatch(build, /needs:\s*deploy-gate/);
  for (const name of ["Deploy gate", "Engine suite", "Visual regression"]) assert.match(build, new RegExp("name: " + name));
  assert.match(build, /name: iPhone Safari[\s\S]*?if: false/);
  assert.doesNotMatch(build, /npm run test:iphone-safari|playwright install .*webkit/);
});

test("single production host: Vercel deploys main only", async () => {
  const vercel = JSON.parse(await read("vercel.json"));
  assert.equal(vercel.git.deploymentEnabled["**"], false);
  assert.equal(vercel.git.deploymentEnabled.main, true);
});
