begin;
create or replace function public.increment_life_view_article_view(p_article_id text)
 returns bigint language plpgsql security invoker set search_path to 'pg_catalog', 'public'
as $function$
declare
  v_count bigint;
begin
  insert into public.life_view_article_views(article_id, view_count, updated_at)
  values (p_article_id, 1, now())
  on conflict (article_id)
  do update set view_count = life_view_article_views.view_count + 1,
                updated_at = now()
  returning view_count into v_count;
  return v_count;
end;
$function$;
grant execute on function public.increment_life_view_article_view(text) to public, anon, authenticated, service_role;
drop function if exists public._engagement_allow(text, text);
drop function if exists public._rate_limit_hash(text, text);
drop table if exists public.life_view_article_ids;
grant all on table public.life_view_article_views to anon, authenticated;
create policy life_view_counts_insert on public.life_view_article_views
  for insert to anon, authenticated with check (view_count >= 0);
create policy life_view_counts_update on public.life_view_article_views
  for update to anon, authenticated using (true) with check (view_count >= 0);
commit;
