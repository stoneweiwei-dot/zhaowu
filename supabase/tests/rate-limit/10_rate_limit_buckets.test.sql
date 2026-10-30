-- PR C tests. Run as a superuser on a scratch DB after applying 20261030120000_rate_limit_buckets.sql.
\set ON_ERROR_STOP on
do $t$
declare r record; ok boolean;
begin
  -- shape
  assert (select relrowsecurity from pg_class where oid='public.rate_limit_buckets'::regclass), 'RLS on';
  assert (select count(*) from pg_policies where tablename='rate_limit_buckets') = 0, 'no policies';
  assert not has_table_privilege('anon','public.rate_limit_buckets','select'), 'anon no select';
  assert not has_table_privilege('authenticated','public.rate_limit_buckets','insert'), 'auth no insert';
  assert has_table_privilege('service_role','public.rate_limit_buckets','delete'), 'service_role delete';
  assert not has_function_privilege('anon','public.record_rate_limit_attempt(text,boolean,int,int,int)','execute'), 'anon no exec record';
  assert not has_function_privilege('authenticated','public.check_rate_limit(text)','execute'), 'auth no exec check';
  assert not has_function_privilege('anon','public.purge_rate_limit_buckets()','execute'), 'anon no exec purge';
  assert has_function_privilege('service_role','public.record_rate_limit_attempt(text,boolean,int,int,int)','execute'), 'svc exec';
  assert (select bool_and(prosecdef) and bool_and(proconfig @> array['search_path=""']) from pg_proc
          where proname in ('check_rate_limit','record_rate_limit_attempt','purge_rate_limit_buckets')), 'definer + empty search_path';

  -- signatures: boolean only (no counts leaked)
  assert (select prorettype = 'boolean'::regtype and not proretset from pg_proc where oid='public.check_rate_limit(text)'::regprocedure), 'check returns boolean';
  assert (select prorettype = 'boolean'::regtype and not proretset from pg_proc where oid='public.record_rate_limit_attempt(text,boolean,int,int,int)'::regprocedure), 'record returns boolean';

  -- unknown key is not blocked
  assert not public.check_rate_limit('t:a'), 'fresh not blocked';

  -- 4 failures not blocked, 5th blocks (default max 5 / 900s)
  for i in 1..4 loop assert not public.record_rate_limit_attempt('t:a', false), 'fail '||i; assert not public.check_rate_limit('t:a'); end loop;
  assert public.record_rate_limit_attempt('t:a', false), 'blocked at 5';
  assert public.check_rate_limit('t:a'), 'check blocked';
  assert (select fail_count = 5 and locked_until between now() + interval '899 seconds' and now() + interval '900 seconds'
          from public.rate_limit_buckets where bucket_key='t:a'), 'row state 5 / +900s';

  -- attempts while locked stay blocked and do NOT extend the lock
  update public.rate_limit_buckets set locked_until = now() + interval '100 seconds' where bucket_key='t:a';
  assert public.record_rate_limit_attempt('t:a', false), 'still blocked';
  assert (select fail_count = 6 and locked_until <= now() + interval '100 seconds' from public.rate_limit_buckets where bucket_key='t:a'), 'no lock extension';

  -- success clears the key
  assert not public.record_rate_limit_attempt('t:a', true), 'success not blocked';
  assert not exists (select 1 from public.rate_limit_buckets where bucket_key='t:a'), 'row deleted';
  assert not public.check_rate_limit('t:a'), 'cleared';

  -- window expiry resets count to 1
  perform public.record_rate_limit_attempt('t:w', false, 3, 60, 60);
  perform public.record_rate_limit_attempt('t:w', false, 3, 60, 60);
  update public.rate_limit_buckets set window_started_at = now() - interval '61 seconds' where bucket_key='t:w';
  assert not public.record_rate_limit_attempt('t:w', false, 3, 60, 60), 'window reset not blocked';
  assert (select fail_count from public.rate_limit_buckets where bucket_key='t:w') = 1, 'count reset to 1';

  -- expired lock + expired window -> fresh start
  update public.rate_limit_buckets set fail_count = 9, locked_until = now() - interval '1 second',
         window_started_at = now() - interval '2 hours' where bucket_key='t:w';
  assert not public.check_rate_limit('t:w'), 'expired lock not blocked';
  assert not public.record_rate_limit_attempt('t:w', false, 3, 60, 60), 'fresh after expiry';
  assert (select fail_count from public.rate_limit_buckets where bucket_key='t:w') = 1, 'fresh count 1';

  -- max=1 blocks on first attempt
  assert public.record_rate_limit_attempt('t:one', false, 1, 30, 30), 'max1';

  -- key validation
  begin perform public.check_rate_limit(repeat('k',201)); assert false, 'len'; exception when sqlstate '22023' then null; end;
  begin perform public.record_rate_limit_attempt('', false); assert false, 'empty'; exception when sqlstate '22023' then null; end;
  begin perform public.record_rate_limit_attempt(null, false); assert false, 'null'; exception when sqlstate '22023' then null; end;
  begin perform public.record_rate_limit_attempt('x', false, 0); assert false, 'max0'; exception when sqlstate '22023' then null; end;
  perform public.check_rate_limit(repeat('k',200));

  -- purge: idle & unlocked rows go, locked or recent rows stay
  insert into public.rate_limit_buckets values ('p:old', 1, now()-interval '3 days', null, now()-interval '25 hours'),
                                               ('p:oldlocked', 9, now()-interval '3 days', now()+interval '1 hour', now()-interval '25 hours'),
                                               ('p:oldexpired', 9, now()-interval '3 days', now()-interval '1 hour', now()-interval '25 hours'),
                                               ('p:new', 1, now(), null, now());
  assert public.purge_rate_limit_buckets() = 2, 'purged 2';
  assert (select array_agg(bucket_key order by bucket_key) from public.rate_limit_buckets where bucket_key like 'p:%') = array['p:new','p:oldlocked'], 'purge set';
  raise notice 'PR C rate limiter tests: PASS';
end $t$;

-- role-level denial
set role anon;
do $$ begin perform public.check_rate_limit('x'); raise exception 'anon could execute'; exception when insufficient_privilege then raise notice 'anon exec denied: PASS'; end $$;
do $$ begin perform 1 from public.rate_limit_buckets; raise exception 'anon could read'; exception when insufficient_privilege then raise notice 'anon table denied: PASS'; end $$;
reset role;
set role service_role;
select public.record_rate_limit_attempt('svc:test', false) as service_role_blocked;
reset role;

-- concurrency smoke: 200 attempts in one statement must count exactly
select count(public.record_rate_limit_attempt('t:burst', false, 1000, 900, 900)) from generate_series(1,200);
select fail_count as burst_count_expect_200 from public.rate_limit_buckets where bucket_key='t:burst';
