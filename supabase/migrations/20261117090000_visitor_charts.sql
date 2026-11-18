create table if not exists public.visitor_charts (
  id uuid primary key default gen_random_uuid(),
  birth_datetime text not null,
  gender text not null check (gender in ('male', 'female', 'unspecified')),
  birthplace text not null,
  true_solar_time text,
  chart_summary text not null,
  language text not null check (language in ('zh-Hant', 'zh-Hans', 'en')),
  chart_snapshot jsonb not null,
  created_at timestamptz not null default now(),
  constraint visitor_charts_birth_datetime_format check (birth_datetime ~ '^\\d{4}-\\d{2}-\\d{2}T\\d{2}:\\d{2}:00$'),
  constraint visitor_charts_field_lengths check (char_length(birthplace) <= 160 and char_length(chart_summary) <= 500),
  constraint visitor_charts_snapshot_object check (jsonb_typeof(chart_snapshot) = 'object')
);

create index if not exists visitor_charts_created_at_idx on public.visitor_charts (created_at desc);
alter table public.visitor_charts enable row level security;
drop policy if exists visitor_charts_owner_read on public.visitor_charts;
create policy visitor_charts_owner_read on public.visitor_charts
  for select to authenticated using (private.zhaowu_is_owner());
revoke all privileges on table public.visitor_charts from anon, authenticated;
grant select on table public.visitor_charts to authenticated;
grant all privileges on table public.visitor_charts to service_role;
