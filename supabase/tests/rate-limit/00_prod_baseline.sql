-- Local scratch reproduction of the relevant production objects (2026-10-30, read-only survey).
do $r$ begin if not exists (select 1 from pg_roles where rolname='anon') then create role anon nologin; create role authenticated nologin; create role service_role nologin bypassrls; end if; end $r$;
create schema extensions; create extension pgcrypto schema extensions;
grant usage on schema public, extensions to anon, authenticated, service_role;
create table public.life_view_article_views(article_id text primary key, view_count bigint default 0, updated_at timestamptz default now());
alter table public.life_view_article_views enable row level security;
create policy life_view_counts_insert on public.life_view_article_views for insert to anon, authenticated with check (view_count >= 0);
create policy life_view_counts_read on public.life_view_article_views for select to anon, authenticated using (true);
create policy life_view_counts_update on public.life_view_article_views for update to anon, authenticated using (true) with check (view_count >= 0);
grant all on public.life_view_article_views to anon, authenticated, service_role;
CREATE OR REPLACE FUNCTION public.increment_life_view_article_view(p_article_id text)
 RETURNS bigint LANGUAGE plpgsql SET search_path TO 'pg_catalog', 'public'
AS $function$
declare v_count bigint;
begin
  insert into public.life_view_article_views(article_id, view_count, updated_at)
  values (p_article_id, 1, now())
  on conflict (article_id) do update set view_count = life_view_article_views.view_count + 1, updated_at = now()
  returning view_count into v_count;
  return v_count;
end; $function$;
grant execute on function public.increment_life_view_article_view(text) to anon, authenticated, service_role;
insert into public.life_view_article_views values ('existing-article', 41, now());
