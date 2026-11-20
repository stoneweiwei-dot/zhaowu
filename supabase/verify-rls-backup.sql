-- ZHAOWU Supabase RLS + backup verification (READ-ONLY).
-- Paste into the Supabase Dashboard SQL Editor for project zhaowu-core
-- (gyisxbkjzvdretbqzeuw) and run. Nothing here writes, grants, or changes
-- any table, policy, or setting. Compare the output with
-- docs: supabase/migrations/*.sql in this repo (in-repo design) and with
-- ~/workspace/zhaowu/backup-rls-verification-2026-11-19.md (findings).
--
-- Expected in-repo design (2026-11-19, main 97c4578a):
--   32 public tables, ALL with RLS enabled;
--   17 tables with policies, 15 tables RLS-enabled with zero policies
--   (service_role-only by design: classic_passage_matches, classic_passages,
--   classic_sources, promo_codes, promo_redemptions, gallery_ingest_queue,
--   owner_devices, report_purchase_entitlements, report_section_edits,
--   social_autopublish_settings, social_meta_accounts, social_post_queue,
--   social_queue_gateway, social_threads_accounts, visitor_signup_attempts);
--   storage.objects: 14 policies.
-- Any difference between this output and the in-repo design is live drift
-- and must be recorded before scaling to real users.

-- 1. Which migrations has the LIVE project actually applied?
--    This is the single most important check: the repo cannot prove it.
--    Expect every 2026-08..2026-11 migration plus the 2026-01-01 baseline.
--    NOTE: PRs #940 / #938 are migration-only and NOT applied; they must
--    NOT appear here unless Shi explicitly approves and lands them.
select version, name
from supabase_migrations.schema_migrations
order by version;

-- 2. RLS enabled per public table (expect rowsecurity = true for all 32).
select schemaname, tablename, rowsecurity as rls_enabled
from pg_tables
where schemaname = 'public'
order by tablename;

-- 3. Policies per table (expect: 17 tables with >= 1 policy, 15 with none).
select schemaname, tablename, policyname, cmd, roles
from pg_policies
where schemaname in ('public', 'storage')
order by schemaname, tablename, policyname;

-- 4. Tables with RLS enabled but ZERO policies (expect exactly the 15
--    service_role-only tables listed above; anything else is a gap).
select t.tablename
from pg_tables t
where t.schemaname = 'public'
  and t.rowsecurity = true
  and not exists (
    select 1 from pg_policies p
    where p.schemaname = 'public' and p.tablename = t.tablename
  )
order by t.tablename;

-- 5. User-data row counts (sanity: what would actually be lost).
select 'report_purchase_entitlements' as tbl, count(*) as rows from public.report_purchase_entitlements
union all select 'visitor_charts', count(*) from public.visitor_charts
union all select 'report_requests', count(*) from public.report_requests
union all select 'profiles', count(*) from public.profiles
union all select 'owner_devices', count(*) from public.owner_devices
union all select 'auth.users', count(*) from auth.users;

-- 6. Storage buckets (expect the buckets the storage.objects policies
--    reference: backgrounds, media, zhaowu-gallery, zhaowu-audio,
--    zhaowu-backgrounds; bucket creation itself is not in repo migrations).
select id, public, file_size_limit
from storage.buckets
order by id;

-- 7. Functions that bypass RLS (SECURITY DEFINER) — expect
--    private.zhaowu_is_owner() plus the RPCs in the harden migration.
select n.nspname as schema, p.proname as function,
  case when p.prosecdef then 'SECURITY DEFINER' else 'invoker' end as kind
from pg_proc p join pg_namespace n on n.oid = p.pronamespace
where n.nspname in ('public', 'private')
order by n.nspname, p.proname;

-- 8. Backup / PITR status CANNOT be checked from SQL. Check in the
--    dashboard instead and record the answers here:
--      Settings > Database > Backups: are daily backups on? retention?
--      Settings > Database > Point-in-time recovery: enabled? (paid add-on)
--      Settings > Auth > Attack Protection: Leaked password protection on?
--      Auth > Users: how many users (compare with query 5)?
--    Until those four answers exist, backup is NOT landed, whatever the
--    repo docs say.
