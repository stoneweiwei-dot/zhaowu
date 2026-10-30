-- 2026-10-30 · ⛰️ 土曜 · Generic rate limiter (H2 owner login, promo-code, engagement counters)
--
-- NOT APPLIED. Migration-only PR; apply only after 金曜 review + 衡明 batching + owner approval.
--
-- Design
--   * public.rate_limit_buckets: one row per bucket key (e.g. 'login:ip:<hash>',
--     'promo:ip:<hash>', 'view:ip:<hash>:<article>'). RLS on, NO policies, no
--     anon/authenticated privileges -> only service_role (Edge Functions) and
--     SECURITY DEFINER functions owned by postgres can touch it.
--   * check_rate_limit(key) returns boolean                 -> true = currently blocked
--   * record_rate_limit_attempt(key, ok, …) returns boolean -> atomic upsert; true = blocked
--     after counting this attempt; success clears the key.
--   Both return ONLY allow/block (no remaining counts / retry-after), per 金曜 review 2026-10-30.
--   * purge_rate_limit_buckets()            -> housekeeping (hourly pg_cron if installed,
--                                              plus ~1% probabilistic purge on writes).
--   Callers should hash IPs before building keys (never store raw IPs).
--
-- Production facts checked read-only on 2026-10-30 (plgpxusmemnmzckbwtiv, PG 17.6):
--   * no existing public.rate_limit_buckets / *rate* functions;
--   * pg_cron is AVAILABLE but NOT installed -> schedule block below is a guarded no-op.
--
-- Rollback: see bottom of file.

begin;

create table if not exists public.rate_limit_buckets (
  bucket_key        text        primary key,
  fail_count        int         not null default 0,
  window_started_at timestamptz not null default now(),
  locked_until      timestamptz,
  updated_at        timestamptz not null default now(),
  constraint rate_limit_buckets_key_len check (char_length(bucket_key) between 1 and 200),
  constraint rate_limit_buckets_fail_nonneg check (fail_count >= 0)
);

comment on table public.rate_limit_buckets is
  'Generic fixed-window failure/attempt counter with lockout. Service-role / SECURITY DEFINER access only. Keys must not contain raw PII (hash IPs).';

create index if not exists rate_limit_buckets_updated_at_idx on public.rate_limit_buckets (updated_at);

alter table public.rate_limit_buckets enable row level security;
-- Intentionally NO policies.
revoke all on table public.rate_limit_buckets from public, anon, authenticated;
grant select, insert, update, delete on table public.rate_limit_buckets to service_role;

-- ---------------------------------------------------------------------------
-- purge_rate_limit_buckets(): drop idle rows that are not currently locked.
-- ---------------------------------------------------------------------------
create or replace function public.purge_rate_limit_buckets()
returns integer
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_deleted integer;
begin
  delete from public.rate_limit_buckets
   where updated_at < now() - interval '24 hours'
     and (locked_until is null or locked_until < now());
  get diagnostics v_deleted = row_count;
  return v_deleted;
end;
$$;

-- ---------------------------------------------------------------------------
-- check_rate_limit(p_key) -> boolean: read-only lock check (true = blocked).
-- ---------------------------------------------------------------------------
create or replace function public.check_rate_limit(p_key text)
returns boolean
language plpgsql
stable
security definer
set search_path = ''
as $$
begin
  if p_key is null or char_length(p_key) = 0 or char_length(p_key) > 200 then
    raise exception 'invalid rate limit key' using errcode = '22023';
  end if;

  -- true = blocked. Deliberately no remaining-count / retry-after leakage (金曜 2026-10-30).
  return exists (
    select 1 from public.rate_limit_buckets b
     where b.bucket_key = p_key
       and b.locked_until is not null
       and b.locked_until > now()
  );
end;
$$;

-- ---------------------------------------------------------------------------
-- record_rate_limit_attempt(): atomic counter.
--   p_success = true  -> delete the key (e.g. correct password) and return false (not blocked).
--   p_success = false -> count one failure/attempt in a fixed window; when the
--                        window expired the count restarts at 1; once
--                        failures >= p_max_failures the key is locked for
--                        p_lock_seconds.
-- Attempts made while already locked still bump the counter but do NOT extend
-- the lock (prevents a permanent lock by a third party hammering the key).
-- ---------------------------------------------------------------------------
create or replace function public.record_rate_limit_attempt(
  p_key            text,
  p_success        boolean,
  p_max_failures   int default 5,
  p_window_seconds int default 900,
  p_lock_seconds   int default 900
)
returns boolean
language plpgsql
volatile
security definer
set search_path = ''
as $$
declare
  v_locked_until timestamptz;
begin
  if p_key is null or char_length(p_key) = 0 or char_length(p_key) > 200 then
    raise exception 'invalid rate limit key' using errcode = '22023';
  end if;
  if p_max_failures is null or p_max_failures < 1
     or p_window_seconds is null or p_window_seconds < 1
     or p_lock_seconds is null or p_lock_seconds < 0 then
    raise exception 'invalid rate limit parameters' using errcode = '22023';
  end if;

  -- ~1% opportunistic housekeeping (cheap; also covers projects without pg_cron).
  if random() < 0.01 then
    perform public.purge_rate_limit_buckets();
  end if;

  if coalesce(p_success, false) then
    delete from public.rate_limit_buckets where bucket_key = p_key;
    return false;
  end if;

  insert into public.rate_limit_buckets as b
         (bucket_key, fail_count, window_started_at, locked_until, updated_at)
  values (p_key, 1, now(),
          case when 1 >= p_max_failures then now() + make_interval(secs => p_lock_seconds) end,
          now())
  on conflict (bucket_key) do update
     set fail_count = case
                        when b.locked_until is not null and b.locked_until > now() then b.fail_count + 1
                        when b.window_started_at <= now() - make_interval(secs => p_window_seconds) then 1
                        else b.fail_count + 1
                      end,
         window_started_at = case
                        when b.locked_until is not null and b.locked_until > now() then b.window_started_at
                        when b.window_started_at <= now() - make_interval(secs => p_window_seconds) then now()
                        else b.window_started_at
                      end,
         locked_until = case
                        -- still locked: keep the existing expiry (do not extend)
                        when b.locked_until is not null and b.locked_until > now() then b.locked_until
                        -- window expired: fresh count of 1
                        when b.window_started_at <= now() - make_interval(secs => p_window_seconds) then
                          case when 1 >= p_max_failures then now() + make_interval(secs => p_lock_seconds) end
                        when b.fail_count + 1 >= p_max_failures then now() + make_interval(secs => p_lock_seconds)
                        else null
                      end,
         updated_at = now()
  returning b.locked_until into v_locked_until;

  -- true = blocked (key locked after counting this attempt). No counts returned.
  return v_locked_until is not null and v_locked_until > now();
end;
$$;

-- Privileges: service_role only (Edge Functions). Other SECURITY DEFINER
-- functions owned by postgres can still call these as owner.
revoke execute on function public.check_rate_limit(text) from public, anon, authenticated;
revoke execute on function public.record_rate_limit_attempt(text, boolean, int, int, int) from public, anon, authenticated;
revoke execute on function public.purge_rate_limit_buckets() from public, anon, authenticated;
grant execute on function public.check_rate_limit(text) to service_role;
grant execute on function public.record_rate_limit_attempt(text, boolean, int, int, int) to service_role;
grant execute on function public.purge_rate_limit_buckets() to service_role;

-- Hourly purge via pg_cron ONLY if the extension is already installed.
-- (Prod 2026-10-30: available but not installed -> this block does nothing.
--  Installing pg_cron is a separate owner decision; the 1% purge above suffices.)
do $cron$
begin
  if exists (select 1 from pg_extension where extname = 'pg_cron') then
    if exists (select 1 from cron.job where jobname = 'purge-rate-limit-buckets') then
      perform cron.unschedule('purge-rate-limit-buckets');
    end if;
    perform cron.schedule('purge-rate-limit-buckets', '17 * * * *',
                          'select public.purge_rate_limit_buckets();');
  end if;
end
$cron$;

commit;

-- ---------------------------------------------------------------------------
-- ROLLBACK (manual; run only if no caller depends on these objects yet):
--   do $$ begin
--     if exists (select 1 from pg_extension where extname='pg_cron') then
--       if exists (select 1 from cron.job where jobname='purge-rate-limit-buckets') then
--         perform cron.unschedule('purge-rate-limit-buckets');
--       end if;
--     end if; end $$;
--   drop function if exists public.record_rate_limit_attempt(text, boolean, int, int, int);
--   drop function if exists public.check_rate_limit(text);
--   drop function if exists public.purge_rate_limit_buckets();
--   drop table if exists public.rate_limit_buckets;
-- NOTE: if PR B (life_view lockdown) is applied, roll it back first — its
-- increment function calls record_rate_limit_attempt().
-- ---------------------------------------------------------------------------
