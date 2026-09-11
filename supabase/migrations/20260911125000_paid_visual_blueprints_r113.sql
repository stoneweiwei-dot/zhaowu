create table if not exists public.paid_visual_blueprints (
  id uuid primary key default gen_random_uuid(),
  report_id uuid not null references public.report_requests(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  visual_kind text not null default 'aura_chakra',
  status text not null default 'locked',
  blueprint jsonb not null default '{}'::jsonb,
  generation_job jsonb,
  result_path text,
  provider text,
  provider_job_id text,
  last_error text,
  attempts integer not null default 0,
  ready_at timestamptz,
  generating_at timestamptz,
  completed_at timestamptz,
  failed_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint paid_visual_blueprints_status_check
    check (status in ('locked', 'ready', 'generating', 'completed', 'failed')),
  constraint paid_visual_blueprints_attempts_check
    check (attempts >= 0),
  constraint paid_visual_blueprints_kind_check
    check (visual_kind in ('aura_chakra')),
  constraint paid_visual_blueprints_blueprint_object_check
    check (jsonb_typeof(blueprint) = 'object'),
  constraint paid_visual_blueprints_report_kind_key
    unique (report_id, visual_kind)
);

create index if not exists paid_visual_blueprints_user_id_idx
  on public.paid_visual_blueprints(user_id);

create index if not exists paid_visual_blueprints_status_idx
  on public.paid_visual_blueprints(status);

alter table public.paid_visual_blueprints enable row level security;

create policy paid_visual_blueprints_select_access
  on public.paid_visual_blueprints
  for select
  to authenticated
  using (
    user_id = (select auth.uid())
    or private.zhaowu_is_owner()
  );

create trigger paid_visual_blueprints_set_updated_at
before update on public.paid_visual_blueprints
for each row execute function public.zhaowu_set_updated_at();

comment on table public.paid_visual_blueprints is
  'Private paid-report visual blueprint/job state. Normal clients may read their own rows but cannot insert/update/delete; service-role edge functions own mutations.';

comment on column public.paid_visual_blueprints.status is
  'State machine: locked -> ready -> generating -> completed/failed. Provider generation is never authorized by client-side state alone.';
