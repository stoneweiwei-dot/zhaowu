create table if not exists public.social_threads_accounts (
  id uuid primary key default gen_random_uuid(),
  threads_user_id text not null unique,
  username text not null,
  profile_picture_url text,
  access_token_ciphertext text not null,
  token_fingerprint text not null,
  token_expires_at timestamptz,
  connected_at timestamptz not null default now(),
  last_verified_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint social_threads_accounts_user_id_shape check (threads_user_id ~ '^[0-9]{3,30}$'),
  constraint social_threads_accounts_username_shape check (username ~ '^[A-Za-z0-9._]{1,80}$'),
  constraint social_threads_accounts_ciphertext_shape check (access_token_ciphertext like 'v1.%')
);

alter table public.social_threads_accounts enable row level security;
revoke all on table public.social_threads_accounts from public, anon, authenticated;
grant all on table public.social_threads_accounts to service_role;

comment on table public.social_threads_accounts is
  'Owner-only Threads OAuth accounts. Tokens are AES-256-GCM ciphertext and only service_role may access rows.';
