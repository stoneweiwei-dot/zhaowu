-- Reduce avoidable public RPC exposure and pin helper-function search paths.
-- This migration intentionally keeps get_customer_classic_passage(jsonb) public:
-- it is the bounded customer-facing RPC for classic passage lookup.

revoke execute on function public.activate_background_music(uuid) from anon, public;
grant execute on function public.activate_background_music(uuid) to authenticated, service_role;

alter function public.classic_jsonb_text_array(jsonb, text)
  set search_path = pg_catalog;

alter function public.classic_overlap_count(text[], text[])
  set search_path = pg_catalog;

alter function public.increment_life_view_article_view(text)
  set search_path = pg_catalog, public;
