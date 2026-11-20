-- Holds only the SHA-256 of the server-to-server secret for the zhaowu-social-queue edge function.
-- The secret itself lives in Vercel (ZHAOWU_SOCIAL_QUEUE_SECRET). The hash row is inserted out-of-band
-- (and rotated the same way) so no secret material is committed to the repository.
create table if not exists public.social_queue_gateway (
  id smallint primary key default 1,
  secret_sha256 text not null,
  rotated_at timestamptz not null default now(),
  constraint social_queue_gateway_singleton check (id = 1),
  constraint social_queue_gateway_hash_shape check (secret_sha256 ~ '^[0-9a-f]{64}$')
);
alter table public.social_queue_gateway enable row level security;
revoke all on table public.social_queue_gateway from public, anon, authenticated;
grant all on table public.social_queue_gateway to service_role;
comment on table public.social_queue_gateway is 'SHA-256 of the shared secret the Vercel server uses to call zhaowu-social-queue. service_role only.';
