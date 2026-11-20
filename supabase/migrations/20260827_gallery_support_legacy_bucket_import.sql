alter table public.gallery_assets
  add column if not exists bucket_id text not null default 'zhaowu-gallery';

insert into public.gallery_assets (
  category,
  asset_key,
  title,
  storage_path,
  content_type,
  tags,
  enabled,
  is_primary,
  bucket_id,
  created_at,
  updated_at
)
select
  'reference-style',
  'reference-' || substr(id::text, 1, 8),
  name,
  storage_path,
  content_type,
  array['imported','style-reference']::text[],
  true,
  false,
  'zhaowu-backgrounds',
  created_at,
  updated_at
from public.background_assets b
where not exists (
  select 1
  from public.gallery_assets g
  where g.bucket_id = 'zhaowu-backgrounds'
    and g.storage_path = b.storage_path
);

delete from public.background_assets b
where exists (
  select 1
  from public.gallery_assets g
  where g.bucket_id = 'zhaowu-backgrounds'
    and g.storage_path = b.storage_path
);
