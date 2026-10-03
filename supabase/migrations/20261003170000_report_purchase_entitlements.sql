create table if not exists public.report_purchase_entitlements (
  id bigint generated always as identity primary key,
  checkout_session_id text not null unique,
  stripe_event_id text not null,
  access_key text not null,
  product_id text not null check (product_id in ('quick', 'system', 'bundle')),
  system_id text check (system_id is null or system_id in ('ziwei', 'qizheng', 'western', 'indian', 'palm', 'numerology')),
  amount_cents integer not null check (amount_cents in (199, 499, 999)),
  currency text not null default 'usd' check (currency = 'usd'),
  status text not null check (status in ('pending', 'paid', 'failed', 'refunded')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint report_purchase_product_scope_check check (
    (product_id = 'bundle' and system_id is null)
    or (product_id in ('quick', 'system') and system_id is not null)
  ),
  constraint report_purchase_product_amount_check check (
    (product_id = 'quick' and amount_cents = 199)
    or (product_id = 'system' and amount_cents = 499)
    or (product_id = 'bundle' and amount_cents = 999)
  )
);

alter table public.report_purchase_entitlements enable row level security;

revoke all on table public.report_purchase_entitlements from public, anon, authenticated;

comment on table public.report_purchase_entitlements is
  'Server-only Stripe checkout entitlements. Browsers verify through the stripe-checkout Edge Function and cannot read rows directly.';
