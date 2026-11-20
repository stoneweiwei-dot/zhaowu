create table if not exists public.social_meta_accounts (
  id uuid primary key default gen_random_uuid(),
  page_id text not null unique,
  page_name text not null,
  instagram_user_id text,
  instagram_username text,
  profile_picture_url text,
  access_token_ciphertext text not null,
  token_fingerprint text not null,
  token_expires_at timestamptz,
  connected_at timestamptz not null default now(),
  last_verified_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint social_meta_accounts_page_id_shape check (page_id ~ '^[0-9]{3,30}$'),
  constraint social_meta_accounts_page_name_shape check (char_length(page_name) between 1 and 160),
  constraint social_meta_accounts_instagram_id_shape check (instagram_user_id is null or instagram_user_id ~ '^[0-9]{3,30}$'),
  constraint social_meta_accounts_instagram_username_shape check (instagram_username is null or instagram_username ~ '^[A-Za-z0-9._]{1,80}$'),
  constraint social_meta_accounts_ciphertext_shape check (access_token_ciphertext like 'v1.%')
);

alter table public.social_meta_accounts enable row level security;
revoke all on table public.social_meta_accounts from public, anon, authenticated;
grant all on table public.social_meta_accounts to service_role;

comment on table public.social_meta_accounts is
  'Owner-only Meta OAuth Page connections. Page access tokens are AES-256-GCM ciphertext; only service_role may access rows.';
