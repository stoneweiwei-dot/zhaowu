-- PR B tests. Scratch DB after 00_prod_baseline.sql + PR C + PR B migrations.
\set ON_ERROR_STOP on
-- privileges
do $t$ begin
  assert has_table_privilege('anon','public.life_view_article_views','select'), 'anon select kept';
  assert not has_table_privilege('anon','public.life_view_article_views','insert'), 'anon insert revoked';
  assert not has_table_privilege('anon','public.life_view_article_views','update'), 'anon update revoked';
  assert not has_table_privilege('authenticated','public.life_view_article_views','delete'), 'auth delete revoked';
  assert not has_table_privilege('anon','public.life_view_article_views','truncate'), 'anon truncate revoked';
  assert (select array_agg(policyname::text order by policyname) from pg_policies where tablename='life_view_article_views') = array['life_view_counts_read'], 'only read policy';
  assert has_function_privilege('anon','public.increment_life_view_article_view(text)','execute'), 'anon exec rpc';
  assert not has_function_privilege('anon','public._engagement_allow(text,text)','execute'), 'anon no helper';
  assert (select prosecdef and proconfig = array['search_path=""'] and prorettype='bigint'::regtype
          from pg_proc where oid='public.increment_life_view_article_view(text)'::regprocedure), 'definer/search_path/bigint';
  assert (select proargnames from pg_proc where oid='public.increment_life_view_article_view(text)'::regprocedure) = array['p_article_id'], 'arg name';
  assert not exists (select 1 from pg_proc p join pg_namespace n on n.oid=p.pronamespace
                     where n.nspname='public' and p.proname='increment_life_view_article_view' and p.oid <> 'public.increment_life_view_article_view(text)'::regprocedure), 'no overloads';
  raise notice 'PR B privilege checks: PASS';
end $t$;

-- simulate PostgREST anon request from visitor A arriving via the Vercel /sb rewrite:
-- Vercel sets x-forwarded-for = visitor, Cloudflare appends the Vercel egress (= cf-connecting-ip).
set role anon;
select set_config('request.headers', '{"x-forwarded-for":"203.0.113.7, 198.51.100.200","cf-connecting-ip":"198.51.100.200"}', false);
do $$ begin perform 1 from public.life_view_article_views; raise notice 'anon select: PASS'; end $$;
do $$ begin update public.life_view_article_views set view_count = 999999; raise exception 'anon could update'; exception when insufficient_privilege then raise notice 'anon update denied: PASS'; end $$;
do $$ begin insert into public.life_view_article_views values ('junk-row', 5, now()); raise exception 'anon could insert'; exception when insufficient_privilege then raise notice 'anon insert denied: PASS'; end $$;
do $$ begin delete from public.life_view_article_views; raise exception 'anon could delete'; exception when insufficient_privilege then raise notice 'anon delete denied: PASS'; end $$;
do $$ begin perform public._engagement_allow('view','existing-article'); raise exception 'anon could call helper'; exception when insufficient_privilege then raise notice 'anon helper denied: PASS'; end $$;
do $$ declare v bigint; begin
  v := public.increment_life_view_article_view('existing-article'); assert v = 42, 'first view counts: '||v;
  v := public.increment_life_view_article_view('existing-article'); assert v = 42, 'same visitor within 30 min throttled, returns current: '||v;
  begin perform public.increment_life_view_article_view('Bad Id!'); assert false; exception when sqlstate '22023' then null; end;
  begin perform public.increment_life_view_article_view(null); assert false; exception when sqlstate '22023' then null; end;
  begin perform public.increment_life_view_article_view(repeat('a',121)); assert false; exception when sqlstate '22023' then null; end;
  v := public.increment_life_view_article_view('brand-new-article'); assert v = 1, 'new article row created: '||v;
  raise notice 'visitor A: PASS';
end $$;
-- visitor B, also via Vercel, same egress IP as A
select set_config('request.headers', '{"x-forwarded-for":"203.0.113.8, 198.51.100.200","cf-connecting-ip":"198.51.100.200"}', false);
do $$ declare v bigint; begin
  v := public.increment_life_view_article_view('existing-article'); assert v = 43, 'second visitor counts: '||v;
  raise notice 'visitor B: PASS';
end $$;
-- no IP header at all -> only the global per-article ceiling applies
select set_config('request.headers', '{}', false);
do $$ declare v bigint; begin
  v := public.increment_life_view_article_view('existing-article'); assert v = 44, 'no-ip counts: '||v;
  raise notice 'no-ip: PASS';
end $$;
reset role;

-- global per-article ceiling: 60 per 10 min across spoofed IPs
do $$ declare v bigint; i int; begin
  for i in 1..80 loop
    -- direct supabase.co caller forging x-forwarded-for; Cloudflare appends the real peer
    perform set_config('request.headers', json_build_object('x-forwarded-for', '192.0.2.'||i||', 198.51.100.66', 'cf-connecting-ip', '198.51.100.66')::text, false);
    v := public.increment_life_view_article_view('ceiling-article');
  end loop;
  assert v = 60, 'ceiling at 60: '||v;
  raise notice 'per-article ceiling: PASS';
end $$;

-- junk-id guard: max 20 brand-new ids per hour (1 already used above by brand-new-article)
do $$ declare v bigint; i int; created int; begin
  for i in 1..40 loop
    perform set_config('request.headers', json_build_object('x-forwarded-for', '198.18.0.'||i)::text, false);
    v := public.increment_life_view_article_view('junk-'||i);
  end loop;
  select count(*) into created from public.life_view_article_views where article_id like 'junk-%';
  -- 'brand-new-article' and 'ceiling-article' consumed 2 of the 20 slots
  assert created = 18, 'new-id hourly cap: '||created;
  raise notice 'new-id cap: PASS';
end $$;

-- 500-row table cap
do $$ declare v bigint; begin
  delete from public.rate_limit_buckets where bucket_key = 'view:new-article';
  insert into public.life_view_article_views select 'filler-'||g, 0, now() from generate_series(1, 500) g;
  perform set_config('request.headers', '{"x-forwarded-for":"192.0.2.250"}', false);
  v := public.increment_life_view_article_view('one-more-new'); assert v = 0, 'table cap returns 0';
  assert not exists (select 1 from public.life_view_article_views where article_id='one-more-new'), 'not created';
  v := public.increment_life_view_article_view('filler-1'); assert v = 1, 'existing rows still count at cap: '||v;
  delete from public.life_view_article_views where article_id like 'filler-%';
  raise notice 'table cap: PASS';
end $$;

-- helper reusable for like/share; unknown actions rejected
do $$ begin
  perform set_config('request.headers', '{"x-forwarded-for":"203.0.113.50"}', false);
  assert public._engagement_allow('like','existing-article'), 'like 1 allowed';
  assert not public._engagement_allow('like','existing-article'), 'like 2 blocked';
  assert public._engagement_allow('share','existing-article') and public._engagement_allow('share','existing-article')
         and public._engagement_allow('share','existing-article') and not public._engagement_allow('share','existing-article'), 'share 3/h';
  begin perform public._engagement_allow('hack','existing-article'); assert false; exception when sqlstate '22023' then null; end;
  assert (select max(char_length(bucket_key)) from public.rate_limit_buckets) <= 200, 'keys <= 200';
  assert not exists (select 1 from public.rate_limit_buckets where bucket_key like '%203.0.113%' or bucket_key like '%198.51%'), 'no raw IP in keys';
  raise notice 'like/share helper: PASS';
end $$;

-- client-IP parsing rule (keys are hashed, so recompute the expected hashes)
create or replace function pg_temp.k(a text, ip text, art text) returns text language sql as
$f$ select a||':ip:'||encode(extensions.digest(a||'|'||ip||'|'||art,'sha256'),'hex') $f$;
create or replace function pg_temp.pk(a text, peer text) returns text language sql as
$f$ select a||':peer:'||encode(extensions.digest(a||'|'||peer,'sha256'),'hex') $f$;
do $$ begin
  delete from public.rate_limit_buckets;
  -- via Vercel: client = entry before the peer
  perform set_config('request.headers', '{"x-forwarded-for":"203.0.113.21, 198.51.100.200","cf-connecting-ip":"198.51.100.200"}', false);
  perform public._engagement_allow('view','parse-a');
  assert exists (select 1 from public.rate_limit_buckets where bucket_key = pg_temp.k('view','203.0.113.21','parse-a')), 'vercel: visitor ip';
  assert exists (select 1 from public.rate_limit_buckets where bucket_key = pg_temp.pk('view','198.51.100.200')), 'vercel: peer bucket';
  -- direct, no XFF from client: Cloudflare XFF = peer -> client = peer
  perform set_config('request.headers', '{"x-forwarded-for":"198.51.100.77","cf-connecting-ip":"198.51.100.77"}', false);
  perform public._engagement_allow('view','parse-b');
  assert exists (select 1 from public.rate_limit_buckets where bucket_key = pg_temp.k('view','198.51.100.77','parse-b')), 'direct: peer ip';
  -- direct with forged chain: right-most claimed entry is used (forgeable) but the peer bucket is real
  perform set_config('request.headers', '{"x-forwarded-for":"1.1.1.1, 192.0.2.9, 198.51.100.78","cf-connecting-ip":"198.51.100.78"}', false);
  perform public._engagement_allow('view','parse-c');
  assert exists (select 1 from public.rate_limit_buckets where bucket_key = pg_temp.k('view','192.0.2.9','parse-c')), 'forged: right-most claimed';
  assert exists (select 1 from public.rate_limit_buckets where bucket_key = pg_temp.pk('view','198.51.100.78')), 'forged: peer bucket';
  -- garbage header -> no per-IP key, ceiling only
  perform set_config('request.headers', json_build_object('x-forwarded-for', repeat('x',100))::text, false);
  assert public._engagement_allow('view','parse-d'), 'garbage ip still allowed by ceiling';
  raise notice 'client-ip parsing: PASS';
end $$;

-- per-peer cap: a direct caller rotating forged x-forwarded-for values is bounded by its real peer IP
do $$ declare i int; allowed int := 0; begin
  delete from public.rate_limit_buckets;
  for i in 1..700 loop
    perform set_config('request.headers', json_build_object('x-forwarded-for', '10.'||(i/250)||'.'||(i%250)||'.1, 198.51.100.99', 'cf-connecting-ip', '198.51.100.99')::text, false);
    if public._engagement_allow('view', 'peer-'||(i%20)) then allowed := allowed + 1; end if;
  end loop;
  assert allowed = 600, 'peer cap 600/10min: '||allowed;
  raise notice 'per-peer cap: PASS';
end $$;
