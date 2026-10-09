import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const root = new URL("../", import.meta.url);
const source = (path) => readFile(new URL(path, root), "utf8");
const publicSpecialistRoutes = ["ziwei", "qizheng", "astrology", "indian-astrology", "yizhangjing", "numerology"];
const ownerSpecialistRoutes = ["tianji-dual", "tianji-xinggong"];

test("six customer basic-chart routes are public while internal Tianji tools stay owner-only", async () => {
  const guard = await source("src/lib/auth/owner-route.ts");
  assert.match(guard, /readOwnerSession/);
  assert.match(guard, /throw redirect/);
  for (const route of publicSpecialistRoutes) {
    const routeSource = await source(`src/routes/${route}.tsx`);
    assert.doesNotMatch(routeSource, /requireOwnerRoute/);
    assert.doesNotMatch(routeSource, /beforeLoad:/);
  }
  for (const route of ownerSpecialistRoutes) {
    const routeSource = await source(`src/routes/${route}.tsx`);
    assert.match(routeSource, /import \{ requireOwnerRoute \}/);
    assert.match(routeSource, /beforeLoad: requireOwnerRoute/);
  }
});

test("public navigation keeps specialist charts inside the unified report flow", async () => {
  const history = await source("src/routes/history.tsx");
  const dragon = await source("src/components/green-dragon-guide.tsx");
  const knowledge = await source("src/routes/knowledge.tsx");
  const ziweiFeature = await source("src/components/ziwei-home-feature.tsx");
  const unified = await source("src/components/unified-birth-report.tsx");
  const specialistPage = await source("src/components/specialist-system-page.tsx");
  const numerology = await source("src/routes/numerology.tsx");
  const palm = await source("src/components/palm-standalone.tsx");
  for (const publicSource of [history, knowledge, ziweiFeature]) {
    assert.doesNotMatch(publicSource, /to="\/(?:ziwei|qizheng|astrology|indian-astrology|yizhangjing|numerology|tianji-dual|tianji-xinggong)"/);
  }
  assert.match(unified, /zhaowu-specialist-free-link/);
  assert.match(unified, /systemsMode/);
  assert.match(specialistPage, /<ReportAccessGate/);
  assert.match(numerology, /<ReportAccessGate/);
  assert.match(palm, /<ReportAccessGate/);
  assert.match(history, /entry\.kind === "fun-five-element"/);
  assert.match(history, /href="\/#birth-form"/);
  assert.doesNotMatch(dragon, /seven reading paths|七種分析|七种分析/);
});

test("owner console data is routed through the same-origin bridge", async () => {
  const state = await source("src/lib/auth/use-current-user.ts");
  const account = await source("src/routes/account.tsx");
  const gallery = await source("src/components/owner-gallery-manager.tsx");
  const loginVisuals = await source("src/components/owner-login-visuals-manager.tsx");
  const netlify = await source("netlify/functions/owner-data.ts");
  assert.match(state, /OWNER_DATA_ROUTES/);
  assert.match(state, /createOwnerCookieSession/);
  assert.match(account, /@\/lib\/bridge\/supabase-rest/);
  assert.match(gallery, /@\/lib\/bridge\/background-assets/);
  assert.match(gallery, /@\/lib\/bridge\/gallery-assets/);
  assert.match(loginVisuals, /@\/lib\/bridge\/gallery-assets/);
  assert.match(netlify, /api\/owner-data\.js/);
  assert.match(netlify, /path: "\/api\/owner-data"/);
});

test("r162 database hardening remains present under the current release", async () => {
  const stats = await source("src/lib/site-stats.ts");
  const verification = await source("lib/zhaowu-verification.js");
  const migration = await source("supabase/migrations/20260919075644_restrict_customer_classic_passage_rpc.sql");
  // Release number is derived from site-stats.ts (single source); never hardcode it here.
  const version = stats.match(/version:\s*"(ZW-WEB-\d{4}\.\d{2}\.\d{2}-r\d+)"/)?.[1];
  assert.ok(version, "site-stats.ts must declare SITE_RELEASE_FALLBACK.version");
  assert.ok(verification.includes(`"${version}"`), `lib/zhaowu-verification.js must match ${version}`);
  assert.match(migration, /revoke all on function public\.get_customer_classic_passage\(jsonb\) from public, anon, authenticated/i);
  assert.match(migration, /grant execute .* service_role/i);
});
