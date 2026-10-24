-- Owner edit history for stored customer reports. The original section text is snapshotted once (version 0)
-- before the first edit and is never overwritten, so any version, including the original, can be restored.
-- Reachable only through the service-role owner Edge Function.
create table if not exists public.report_section_edits (
  id uuid primary key default gen_random_uuid(),
  report_id uuid not null references public.report_requests(id) on delete cascade,
  version integer not null check (version >= 0),
  kind text not null check (kind in ('original', 'edit', 'restore')),
  sections jsonb not null,
  note text not null default '',
  restored_from integer,
  created_at timestamptz not null default now(),
  unique (report_id, version)
);

create index if not exists report_section_edits_report_idx
  on public.report_section_edits (report_id, version desc);

alter table public.report_section_edits enable row level security;

revoke all privileges on table public.report_section_edits from anon, authenticated;
grant all privileges on table public.report_section_edits to service_role;
