-- 2026-10-30 · ⛰️ 土曜 · 觀世錄 view counter lockdown (depends on 20261030120000_rate_limit_buckets.sql)
--
-- NOT APPLIED. Migration-only PR; apply only after 金曜 review + 衡明 batching + owner approval.
--
-- Production state read-only on 2026-10-30 (plgpxusmemnmzckbwtiv):
--   public.life_view_article_views(article_id text pk, view_count bigint default 0, updated_at timestamptz default now())
--   RLS enabled; policies:
--     life_view_counts_read   SELECT  anon,authenticated  using (true)
--     life_view_counts_insert INSERT  anon,authenticated  with check (view_count >= 0)
--     life_view_counts_update UPDATE  anon,authenticated  using (true) with check (view_count >= 0)
--   table grants: anon/authenticated ALL (incl. DELETE/TRUNCATE)
--   increment_life_view_article_view(text) -> bigint: SECURITY INVOKER, search_path pg_catalog,public,
--   EXECUTE to PUBLIC/anon/authenticated/service_role.
--   => any visitor holding the public anon key can PATCH any view_count to any value and insert
--      unlimited junk rows; the ALL grant also includes TRUNCATE, which RLS does not govern.
--      This migration closes all of that.
--
-- After this migration:
--   * anon/authenticated: SELECT only on the table (front-end fetchLifeViewCounts keeps working).
--   * The ONLY write path is the RPC below, same name/signature/return type:
--       public.increment_life_view_article_view(p_article_id text) returns bigint
--     (front-end src/lib/life-view-views.ts unchanged: POST /rest/v1/rpc/increment_life_view_article_view {p_article_id}).
--   * RPC is SECURITY DEFINER, search_path='', validates the id, caps junk rows, and rate-limits via
--     public._engagement_allow(action, article_id) which is reusable for future like/share counters.
--   * When throttled the RPC returns the CURRENT count unchanged (HTTP 200), so the UI never breaks.
--
-- Rollback: see bottom of file.

begin;

-- ---------------------------------------------------------------------------
-- 1. Table: drop write policies, revoke writes, keep public read.
-- ---------------------------------------------------------------------------
drop policy if exists life_view_counts_insert on public.life_view_article_views;
drop policy if exists life_view_counts_update on public.life_view_article_views;

revoke all on table public.life_view_article_views from public, anon, authenticated;
grant select on table public.life_view_article_views to anon, authenticated;
grant select, insert, update, delete on table public.life_view_article_views to service_role;

-- life_view_counts_read (SELECT, using true) is intentionally kept.

-- ---------------------------------------------------------------------------
-- 2. Generic engagement limiter, keyed by action:article.
--    Reusable for 'like' / 'share' later: call public._engagement_allow('like', id).
--    Keys (all <= 200 chars, no raw IP stored):
--      '<action>:ip:<sha256(action|ip|article) hex>'   per visitor per article
--      '<action>:article:<article_id>'                  global per-article ceiling (unspoofable)
--    IP source: PostgREST request.headers -> first x-forwarded-for entry, else cf-connecting-ip.
--    LIMITATION: these headers are proxy-supplied and spoofable by a caller that hits
--    *.supabase.co directly; the per-article ceiling bounds the damage. Stronger option:
--    move increments behind a Vercel API route / Edge Function that derives the client IP
--    from the platform and calls this logic with service_role (documented in PR body).
-- ---------------------------------------------------------------------------
create or replace function public._engagement_allow(p_action text, p_article_id text)
returns boolean
language plpgsql
volatile
security definer
set search_path = ''
as $$
declare
  v_headers  json;
  v_ip       text;
  v_ip_max   int;
  v_ip_win   int;
  v_art_max  int;
  v_art_win  int;
begin
  -- Per-action policy: allow v_*_max events per window. The limiter blocks once a key reaches
  -- p_max_failures, so pass max + 1: events 1..max are allowed, event max+1 onwards is blocked
  -- until the lock (= one window) expires. Single atomic call per key, no check-then-act race.
  case p_action
    when 'view'  then v_ip_max := 1;  v_ip_win := 1800;  v_art_max := 60;  v_art_win := 600;
    when 'like'  then v_ip_max := 1;  v_ip_win := 86400; v_art_max := 30;  v_art_win := 600;
    when 'share' then v_ip_max := 3;  v_ip_win := 3600;  v_art_max := 30;  v_art_win := 600;
    else raise exception 'unknown engagement action' using errcode = '22023';
  end case;

  if p_article_id is null or p_article_id !~ '^[a-z0-9][a-z0-9-]{0,119}$' then
    raise exception 'invalid article id' using errcode = '22023';
  end if;

  begin
    v_headers := nullif(current_setting('request.headers', true), '')::json;
  exception when others then
    v_headers := null;
  end;
  v_ip := nullif(btrim(split_part(coalesce(v_headers ->> 'x-forwarded-for', ''), ',', 1)), '');
  if v_ip is null then
    v_ip := nullif(btrim(coalesce(v_headers ->> 'cf-connecting-ip', '')), '');
  end if;

  -- Per visitor per article (skipped when no client IP is visible; global ceiling still applies).
  if v_ip is not null then
    if public.record_rate_limit_attempt(
         p_action || ':ip:' || encode(extensions.digest(p_action || '|' || v_ip || '|' || p_article_id, 'sha256'), 'hex'),
         false, v_ip_max + 1, v_ip_win, v_ip_win) then
      return false;
    end if;
  end if;

  -- Global per-article ceiling.
  return not public.record_rate_limit_attempt(p_action || ':article:' || p_article_id,
                                              false, v_art_max + 1, v_art_win, v_art_win);
end;
$$;

revoke execute on function public._engagement_allow(text, text) from public, anon, authenticated;
grant execute on function public._engagement_allow(text, text) to service_role;

-- ---------------------------------------------------------------------------
-- 3. The only write path. SAME name, argument name, argument type and return type.
-- ---------------------------------------------------------------------------
create or replace function public.increment_life_view_article_view(p_article_id text)
returns bigint
language plpgsql
volatile
security definer
set search_path = ''
as $$
declare
  v_count    bigint;
begin
  if p_article_id is null or p_article_id !~ '^[a-z0-9][a-z0-9-]{0,119}$' then
    raise exception 'invalid article id' using errcode = '22023';
  end if;

  select v.view_count into v_count
    from public.life_view_article_views v
   where v.article_id = p_article_id;

  if not public._engagement_allow('view', p_article_id) then
    return coalesce(v_count, 0);
  end if;

  if v_count is null then
    -- Junk-row guard for ids that do not exist yet (real articles are created by the first view).
    if (select count(*) from public.life_view_article_views) >= 500 then
      return 0;
    end if;
    -- at most 20 brand-new ids per hour site-wide
    if public.record_rate_limit_attempt('view:new-article', false, 21, 3600, 3600) then
      return 0;
    end if;
  end if;

  insert into public.life_view_article_views as v (article_id, view_count, updated_at)
  values (p_article_id, 1, now())
  on conflict (article_id) do update
     set view_count = v.view_count + 1,
         updated_at = now()
  returning v.view_count into v_count;

  return v_count;
end;
$$;

revoke execute on function public.increment_life_view_article_view(text) from public;
grant execute on function public.increment_life_view_article_view(text) to anon, authenticated, service_role;

commit;

-- ---------------------------------------------------------------------------
-- ROLLBACK (manual) — restores the exact 2026-10-30 production behaviour:
--   begin;
--   create or replace function public.increment_life_view_article_view(p_article_id text)
--    returns bigint language plpgsql security invoker set search_path to 'pg_catalog', 'public'
--   as $function$
--   declare
--     v_count bigint;
--   begin
--     insert into public.life_view_article_views(article_id, view_count, updated_at)
--     values (p_article_id, 1, now())
--     on conflict (article_id)
--     do update set view_count = life_view_article_views.view_count + 1,
--                   updated_at = now()
--     returning view_count into v_count;
--     return v_count;
--   end;
--   $function$;
--   grant execute on function public.increment_life_view_article_view(text) to public, anon, authenticated, service_role;
--   drop function if exists public._engagement_allow(text, text);
--   grant all on table public.life_view_article_views to anon, authenticated;
--   create policy life_view_counts_insert on public.life_view_article_views
--     for insert to anon, authenticated with check (view_count >= 0);
--   create policy life_view_counts_update on public.life_view_article_views
--     for update to anon, authenticated using (true) with check (view_count >= 0);
--   commit;
-- (Leave rate_limit_buckets in place unless also rolling back PR C.)
-- ---------------------------------------------------------------------------
