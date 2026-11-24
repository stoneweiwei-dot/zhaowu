import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { catalogIds, diff, seededIds } from "./life-view-article-ids.mjs";

test("life_view_article_ids seed matches ARTICLE_CATALOG", async () => {
  const d = await diff();
  assert.deepEqual(d, { invalid: [], missing: [], extra: [] },
    "run: node --import tsx scripts/life-view-article-ids.mjs --sql and add the block to a new migration");
  assert.equal(seededIds().length, (await catalogIds()).length);
});

test("increment RPC checks the allowlist before any rate-limit bucket", () => {
  const sql = readFileSync(new URL("../supabase/migrations/20261030120100_life_view_views_lockdown.sql", import.meta.url), "utf8");
  const fn = sql.slice(sql.indexOf("create or replace function public.increment_life_view_article_view"));
  const allow = fn.indexOf("from public.life_view_article_ids");
  assert.ok(allow > 0 && allow < fn.indexOf("_engagement_allow("), "allowlist lookup precedes the limiter");
  assert.doesNotMatch(fn, /view:new-article/, "global new-id quota removed");
});
