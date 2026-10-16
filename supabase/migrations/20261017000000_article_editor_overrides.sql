-- Public reads, owner-only writes through the existing cookie + Supabase service-role bridge.
create table if not exists public.article_editor_overrides (
  id text primary key check (id ~ '^[a-z0-9][a-z0-9-]{0,119}$'),
  title jsonb,
  summary jsonb,
  body jsonb,
  archived boolean not null default false,
  updated_at timestamptz not null default now(),
  constraint article_title_object check (title is null or jsonb_typeof(title) = 'object'),
  constraint article_summary_object check (summary is null or jsonb_typeof(summary) = 'object'),
  constraint article_body_object check (body is null or jsonb_typeof(body) = 'object')
);
alter table public.article_editor_overrides enable row level security;
revoke all on public.article_editor_overrides from anon, authenticated;
grant select on public.article_editor_overrides to anon, authenticated;
drop policy if exists "Article published overlay read" on public.article_editor_overrides;
create policy "Article published overlay read"
  on public.article_editor_overrides for select
  to anon, authenticated using (true);
comment on table public.article_editor_overrides is 'Public display overlays/soft-delete markers for code-backed articles; service-role owner bridge is the only writer.';
