import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const [pkg, vercel, queueFunction, migration] = await Promise.all([
  readFile(new URL("../package.json", import.meta.url), "utf8").then(JSON.parse),
  readFile(new URL("../vercel.json", import.meta.url), "utf8").then(JSON.parse),
  readFile(new URL("../supabase/functions/zhaowu-social-queue/index.ts", import.meta.url), "utf8"),
  readFile(new URL("../supabase/migrations/20261023101932_harden_owner_and_promo_table_grants.sql", import.meta.url), "utf8"),
]);

test("production runtime stays on supported Node 22 instead of the noisy Node 24 url.parse runtime", () => {
  assert.equal(pkg.engines?.node, "22.x");
});

test("the single Vercel cron continues to use the owner-session auto-publish gateway", () => {
  assert.deepEqual(vercel.crons, [{
    path: "/api/owner-session?action=cron.autopublish",
    schedule: "0 12 * * *",
  }]);
});

test("social queue pins the Supabase client dependency", () => {
  assert.match(queueFunction, /npm:\@supabase\/supabase-js\@2\.95\.0/);
  assert.doesNotMatch(queueFunction, /esm\.sh\/\@supabase\/supabase-js\@2(?:["'])/);
});

test("owner devices and promo data remain service-role only", () => {
  for (const table of ["owner_devices", "promo_codes", "promo_redemptions"]) {
    assert.match(migration, new RegExp(`public\\.${table}`));
  }
  assert.match(migration, /revoke all privileges[\s\S]*from anon, authenticated;/);
  assert.match(migration, /grant all privileges[\s\S]*to service_role;/);
});
