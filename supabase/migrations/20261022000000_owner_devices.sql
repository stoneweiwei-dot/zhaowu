-- Trusted owner devices (Passkey / WebAuthn).
-- Only the Edge Function `zhaowu-owner-data` (service role) reads or writes this table.
-- RLS is enabled with no policies on purpose: anon and authenticated roles get no access.
create table if not exists public.owner_devices (
  id uuid primary key default gen_random_uuid(),
  credential_id text not null unique,
  public_key text not null,
  sign_count bigint not null default 0,
  transports text[] not null default '{}',
  label text not null default '',
  created_at timestamptz not null default now(),
  last_used_at timestamptz,
  revoked_at timestamptz
);

alter table public.owner_devices enable row level security;

comment on table public.owner_devices is
  'Owner Passkey credentials. public_key is base64url SPKI/COSE as returned by @simplewebauthn/server. Revoke by setting revoked_at; never delete, so a lost phone stays auditable.';
