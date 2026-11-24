\set ON_ERROR_STOP on
do $$ begin
  assert (select array_agg(policyname::text order by policyname) from pg_policies where tablename='life_view_article_views')
         = array['life_view_counts_insert','life_view_counts_read','life_view_counts_update'], 'policies restored';
  assert not (select prosecdef from pg_proc where oid='public.increment_life_view_article_view(text)'::regprocedure), 'invoker restored';
  assert has_table_privilege('anon','public.life_view_article_views','update'), 'grants restored';
  assert to_regclass('public.life_view_article_ids') is null and to_regprocedure('public._rate_limit_hash(text,text)') is null, 'allowlist + hash helper dropped';
end $$;
set role anon;
select public.increment_life_view_article_view('existing-article') > 0 as old_rpc_works;
reset role;
do $$ begin raise notice 'rollback B: PASS'; end $$;
