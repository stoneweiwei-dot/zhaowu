-- Owner auto-publishing: singleton settings + post queue/history.
-- Additive only. service_role access only (the edge function `zhaowu-social-queue` is the single gateway).

create table if not exists public.social_autopublish_settings (
  id smallint primary key default 1,
  enabled boolean not null default false,
  -- 0 = Sunday ... 6 = Saturday, evaluated in Asia/Taipei. Default Tue / Thu / Sat = 3 posts a week.
  publish_days smallint[] not null default '{2,4,6}',
  channels text[] not null default '{threads}',
  attach_image boolean not null default true,
  paused_reason text,
  updated_at timestamptz not null default now(),
  constraint social_autopublish_singleton check (id = 1),
  constraint social_autopublish_days_range check (
    cardinality(publish_days) between 1 and 3
    and publish_days <@ array[0,1,2,3,4,5,6]::smallint[]
  ),
  constraint social_autopublish_channels_allowed check (
    channels <@ array['threads','instagram','xiaohongshu','facebook','x']::text[]
  )
);

insert into public.social_autopublish_settings (id) values (1) on conflict (id) do nothing;

create table if not exists public.social_post_queue (
  id uuid primary key default gen_random_uuid(),
  status text not null default 'scheduled',
  source text not null default 'owner',
  bank_key text,
  body text not null,
  image_url text,
  alt_text text,
  channels text[] not null default '{threads}',
  not_before timestamptz,
  slot_date date,
  results jsonb not null default '{}'::jsonb,
  attempts smallint not null default 0,
  last_error text,
  published_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint social_post_queue_status check (status in ('draft','scheduled','publishing','published','partial','failed','manual','skipped')),
  constraint social_post_queue_source check (source in ('owner','bank')),
  constraint social_post_queue_body_len check (char_length(body) between 1 and 2200),
  constraint social_post_queue_channels_allowed check (
    cardinality(channels) >= 1
    and channels <@ array['threads','instagram','xiaohongshu','facebook','x']::text[]
  )
);

-- At most one in-flight or finished automatic run per Taipei calendar day (the daily cron is idempotent).
create unique index if not exists social_post_queue_one_run_per_day
  on public.social_post_queue (slot_date)
  where slot_date is not null and status in ('publishing','published','partial');

create index if not exists social_post_queue_status_created on public.social_post_queue (status, created_at desc);
create index if not exists social_post_queue_bank_key on public.social_post_queue (bank_key) where bank_key is not null;

alter table public.social_autopublish_settings enable row level security;
alter table public.social_post_queue enable row level security;
revoke all on table public.social_autopublish_settings from public, anon, authenticated;
revoke all on table public.social_post_queue from public, anon, authenticated;
grant all on table public.social_autopublish_settings to service_role;
grant all on table public.social_post_queue to service_role;

comment on table public.social_autopublish_settings is 'Owner-only auto-publish schedule (singleton row id=1). service_role only.';
comment on table public.social_post_queue is 'Owner-only social post queue + publish history. service_role only.';
