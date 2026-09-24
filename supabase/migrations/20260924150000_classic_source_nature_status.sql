-- Separate source provenance from passage verification state.
-- Existing verified classic passages keep their current behavior.
-- Screenshot transcriptions stay pending until collated against a reliable edition.
-- Modern owner material is explicitly non-applicable for classic-text verification.

alter table public.classic_sources
  add column if not exists source_nature text not null default 'classic';

alter table public.classic_sources
  drop constraint if exists classic_sources_source_nature_check;

alter table public.classic_sources
  add constraint classic_sources_source_nature_check
  check (
    source_nature = any (
      array[
        'classic'::text,
        'screenshot_transcription'::text,
        'modern_compilation'::text,
        'other_reference'::text
      ]
    )
  );

update public.classic_sources
set source_nature = case
  when slug = 'caigen-tan-jiazi-app-screenshots-20260906' then 'screenshot_transcription'
  when slug = 'stone-owner-material-20260903' then 'modern_compilation'
  else 'classic'
end
where source_nature is distinct from case
  when slug = 'caigen-tan-jiazi-app-screenshots-20260906' then 'screenshot_transcription'
  when slug = 'stone-owner-material-20260903' then 'modern_compilation'
  else 'classic'
end;

alter table public.classic_passages
  drop constraint if exists classic_passages_verification_check;

alter table public.classic_passages
  add constraint classic_passages_verification_check
  check (
    verification_status = any (
      array[
        'pending'::text,
        'verified'::text,
        'rejected'::text,
        'not_applicable'::text
      ]
    )
  );

update public.classic_passages p
set
  verification_status = 'not_applicable',
  is_direct_quote = false,
  verified_against = '',
  verified_at = null,
  updated_at = now()
from public.classic_sources s
where s.id = p.source_id
  and s.slug = 'stone-owner-material-20260903'
  and (
    p.verification_status is distinct from 'not_applicable'
    or p.is_direct_quote is distinct from false
    or p.verified_against <> ''
    or p.verified_at is not null
  );

comment on column public.classic_sources.source_nature is
  'Provenance class independent of passage verification_status.';

comment on column public.classic_passages.verification_status is
  'Classic-text verification state: pending, verified, rejected, or not_applicable.';
