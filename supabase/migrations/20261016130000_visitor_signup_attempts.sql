-- Per-IP hourly limiter for the visitor-signup edge function. Stores only salted SHA-256 hashes.
create table if not exists public.visitor_signup_attempts (
  id bigint generated always as identity primary key,
  ip_hash text not null,
  created_at timestamptz not null default now()
);
create index if not exists visitor_signup_attempts_ip_time on public.visitor_signup_attempts (ip_hash, created_at desc);
alter table public.visitor_signup_attempts enable row level security;
revoke all on table public.visitor_signup_attempts from public, anon, authenticated;
grant all on table public.visitor_signup_attempts to service_role;
comment on table public.visitor_signup_attempts is 'Hashed per-IP signup attempts (rate limit). service_role only.';
