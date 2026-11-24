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

-- allowlist: seeded from ARTICLE_CATALOG by the migration; add test fixtures (as owner)
do $t$ begin
  assert (select count(*) from public.life_view_article_ids) >= 50, 'catalog seed present';
  assert exists (select 1 from public.life_view_article_ids where article_id = 'cause-action-kindness-life'), 'real id seeded';
  assert not has_table_privilege('anon','public.life_view_article_ids','select'), 'anon cannot read allowlist';
  assert not has_table_privilege('anon','public.life_view_article_ids','insert'), 'anon cannot write allowlist';
  assert not has_table_privilege('authenticated','public.life_view_article_ids','insert'), 'auth cannot write allowlist';
  assert (select relrowsecurity from pg_class where oid='public.life_view_article_ids'::regclass), 'RLS on';
  raise notice 'allowlist privileges: PASS';
end $t$;
insert into public.life_view_article_ids (article_id)
select unnest(array['existing-article','brand-new-article','ceiling-article','parse-a','parse-b','parse-c','parse-d'])
union all select 'peer-'||g from generate_series(0,19) g;

-- simulate PostgREST anon request from visitor A arriving via the Vercel /sb rewrite:
-- Vercel sets x-forwarded-for = visitor, Cloudflare appends the Vercel egress (= cf-connecting-ip).
set role anon;
do $$ begin insert into public.life_view_article_ids values ('anon-added'); raise exception 'anon could add id'; exception when insufficient_privilege then raise notice 'anon allowlist insert denied: PASS'; end $$;
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
  v := public.increment_life_view_article_view('brand-new-article'); assert v = 1, 'new allowlisted article row created: '||v;
  v := public.increment_life_view_article_view('not-in-catalog'); assert v = 0, 'unknown id returns 0: '||v;
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

-- unknown ids: 1000 random ids -> no row, no bucket, no quota; a real catalog article still counts
do $$ declare v bigint; i int; rows0 int; buckets0 int; keys0 text[]; begin
  select count(*) into rows0 from public.life_view_article_views;
  select count(*), array_agg(bucket_key||':'||fail_count order by bucket_key) into buckets0, keys0 from public.rate_limit_buckets;
  for i in 1..1000 loop
    perform set_config('request.headers', json_build_object('x-forwarded-for', '198.18.'||(i/250)||'.'||(i%250)||', 198.51.100.66', 'cf-connecting-ip', '198.51.100.66')::text, false);
    v := public.increment_life_view_article_view('rnd-'||md5(random()::text || i));
    assert v = 0, 'unknown id must return 0';
  end loop;
  assert (select count(*) from public.life_view_article_views) = rows0, 'row count unchanged';
  assert (select count(*) from public.rate_limit_buckets) = buckets0, 'bucket count unchanged';
  assert (select array_agg(bucket_key||':'||fail_count order by bucket_key) from public.rate_limit_buckets) is not distinct from keys0, 'buckets untouched';
  assert not exists (select 1 from public.life_view_article_views where article_id like 'rnd-%'), 'no rnd rows';
  -- a real ARTICLE_CATALOG id with no row yet is created and counted
  perform set_config('request.headers', '{"x-forwarded-for":"203.0.113.90, 198.51.100.200","cf-connecting-ip":"198.51.100.200"}', false);
  v := public.increment_life_view_article_view('cause-action-kindness-life'); assert v = 1, 'real new catalog article counts: '||v;
  raise notice 'random 1000 unknown ids: PASS';
end $$;

-- helpers deny unknown ids too, without creating buckets
do $$ declare n int; begin
  select count(*) into n from public.rate_limit_buckets;
  assert not public._engagement_allow('like','not-in-catalog'), 'like unknown id denied';
  assert (select count(*) from public.rate_limit_buckets) = n, 'no bucket for unknown like';
  raise notice 'helper allowlist: PASS';
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
  assert not exists (select 1 from public.rate_limit_buckets where bucket_key = 'view:new-article'), 'no global new-id quota';
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

-- pepper: without Vault -> plain sha256 (+NOTICE, asserted above via key recompute).
-- With a Vault-like view providing 'rate_limit_pepper' -> HMAC keys, no plain-sha key.
create schema if not exists vault;
create view vault.decrypted_secrets as select 'rate_limit_pepper'::text as name, 'test-pepper-not-real'::text as decrypted_secret;
do $$ begin
  delete from public.rate_limit_buckets;
  perform set_config('request.headers', '{"x-forwarded-for":"203.0.113.21, 198.51.100.200","cf-connecting-ip":"198.51.100.200"}', false);
  perform public._engagement_allow('view','parse-a');
  assert exists (select 1 from public.rate_limit_buckets
                 where bucket_key = 'view:ip:'||encode(extensions.hmac('view|203.0.113.21|parse-a','test-pepper-not-real','sha256'),'hex')), 'HMAC ip key';
  assert exists (select 1 from public.rate_limit_buckets
                 where bucket_key = 'view:peer:'||encode(extensions.hmac('view|198.51.100.200','test-pepper-not-real','sha256'),'hex')), 'HMAC peer key';
  assert not exists (select 1 from public.rate_limit_buckets where bucket_key = pg_temp.k('view','203.0.113.21','parse-a')), 'no plain sha key when peppered';
  raise notice 'pepper HMAC: PASS';
end $$;
drop view vault.decrypted_secrets; drop schema vault;
