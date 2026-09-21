import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const root = new URL("../", import.meta.url);
const source = (path) => readFile(new URL(path, root), "utf8");
const specialistRoutes = ["ziwei", "qizheng", "astrology", "indian-astrology", "yizhangjing", "numerology", "tianji-dual", "tianji-xinggong"];

test("every specialist route fails closed behind the owner cookie", async () => {
  const guard = await source("src/lib/auth/owner-route.ts");
  assert.match(guard, /readOwnerSession/);
  assert.match(guard, /throw redirect/);
  for (const route of specialistRoutes) {
    const routeSource = await source(`src/routes/${route}.tsx`);
    assert.match(routeSource, /import \{ requireOwnerRoute \}/);
    assert.match(routeSource, /beforeLoad: requireOwnerRoute/);
  }
});

test("public navigation exposes the unified report and fun test, not specialist routes", async () => {
  const history = await source("src/routes/history.tsx");
  const dragon = await source("src/components/green-dragon-guide.tsx");
  const knowledge = await source("src/routes/knowledge.tsx");
  const ziweiFeature = await source("src/components/ziwei-home-feature.tsx");
  for (const publicSource of [history, knowledge, ziweiFeature]) {
    assert.doesNotMatch(publicSource, /to="\/(?:ziwei|qizheng|astrology|indian-astrology|yizhangjing|numerology|tianji-dual|tianji-xinggong)"/);
  }
  assert.match(history, /entry\.kind === "fun-five-element"/);
  assert.match(history, /href="\/#analysisForm"/);
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
  assert.match(account, /@\/lib\/bridge\/background-assets/);
  assert.match(gallery, /@\/lib\/bridge\/gallery-assets/);
  assert.match(loginVisuals, /@\/lib\/bridge\/gallery-assets/);
  assert.match(netlify, /api\/owner-data\.js/);
  assert.match(netlify, /path: "\/api\/owner-data"/);
});

test("r162 database hardening remains present under the current release", async () => {
  const stats = await source("src/lib/site-stats.ts");
  const verification = await source("lib/zhaowu-verification.js");
  const migration = await source("supabase/migrations/20260919075644_restrict_customer_classic_passage_rpc.sql");
  assert.match(stats, /ZW-WEB-2026\.09\.22-r172/);
  assert.match(stats, /updateNumber: 172/);
  assert.match(verification, /ZW-WEB-2026\.09\.22-r172/);
  assert.match(migration, /revoke all on function public\.get_customer_classic_passage\(jsonb\) from public, anon, authenticated/i);
  assert.match(migration, /grant execute .* service_role/i);
});
