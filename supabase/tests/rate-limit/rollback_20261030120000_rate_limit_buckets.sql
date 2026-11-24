do $$ begin
  if exists (select 1 from pg_extension where extname='pg_cron') then
    if exists (select 1 from cron.job where jobname='purge-rate-limit-buckets') then
      perform cron.unschedule('purge-rate-limit-buckets');
    end if;
  end if; end $$;
drop function if exists public.record_rate_limit_attempt(text, boolean, int, int, int);
drop function if exists public.check_rate_limit(text);
drop function if exists public.purge_rate_limit_buckets();
drop table if exists public.rate_limit_buckets;
