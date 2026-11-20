create table if not exists public.gallery_ingest_queue (
  id uuid primary key default gen_random_uuid(),
  token text not null,
  category text not null,
  asset_key text not null,
  title text not null default '',
  content_type text not null,
  file_ext text not null,
  tags text[] not null default '{}',
  is_primary boolean not null default true,
  base64_data text not null,
  created_at timestamptz not null default now(),
  expires_at timestamptz not null default (now() + interval '1 hour'),
  constraint gallery_ingest_queue_category_check check (char_length(category) between 1 and 100),
  constraint gallery_ingest_queue_asset_key_check check (char_length(asset_key) between 1 and 120),
  constraint gallery_ingest_queue_token_check check (char_length(token) >= 24),
  constraint gallery_ingest_queue_payload_check check (octet_length(base64_data) <= 14000000),
  constraint gallery_ingest_queue_title_check check (char_length(title) <= 180),
  constraint gallery_ingest_queue_ext_check check (file_ext in ('jpg','jpeg','png','webp','avif')),
  constraint gallery_ingest_queue_content_type_check check (content_type in ('image/jpeg','image/png','image/webp','image/avif')),
  constraint gallery_ingest_queue_tags_limit check (cardinality(tags) <= 20)
);

alter table public.gallery_ingest_queue enable row level security;
revoke all on public.gallery_ingest_queue from anon, authenticated;

create index if not exists gallery_ingest_queue_expires_idx on public.gallery_ingest_queue (expires_at);
create unique index if not exists gallery_ingest_queue_token_uidx on public.gallery_ingest_queue (token);

create or replace function public.cleanup_expired_gallery_ingest_queue()
returns integer
language plpgsql
security definer
set search_path = public
as $$
declare
  deleted_count integer;
begin
  delete from public.gallery_ingest_queue where expires_at < now();
  get diagnostics deleted_count = row_count;
  return deleted_count;
end;
$$;
revoke all on function public.cleanup_expired_gallery_ingest_queue() from public, anon, authenticated;

create or replace function public.claim_gallery_ingest_queue()
returns setof public.gallery_ingest_queue
language plpgsql
security definer
set search_path = public
as $$
begin
  delete from public.gallery_ingest_queue where expires_at < now();
  return query
  delete from public.gallery_ingest_queue
  where id = (
    select q.id
    from public.gallery_ingest_queue q
    where q.expires_at >= now()
    order by q.created_at asc
    for update skip locked
    limit 1
  )
  returning *;
end;
$$;
revoke all on function public.claim_gallery_ingest_queue() from public, anon, authenticated;
grant execute on function public.claim_gallery_ingest_queue() to service_role;
