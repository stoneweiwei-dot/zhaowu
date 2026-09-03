create table if not exists public.classic_sources (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  title_zh_hant text not null,
  title_zh_hans text not null,
  title_en text not null default '',
  tradition text not null,
  canon_code text not null default '',
  edition_name text not null default '',
  source_url text not null default '',
  verification_note text not null default '',
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint classic_sources_slug_check check (slug ~ '^[a-z0-9][a-z0-9_-]{1,80}$'),
  constraint classic_sources_tradition_check check (tradition in ('daoist','buddhist','confucian','yijing','other'))
);

create table if not exists public.classic_passages (
  id uuid primary key default gen_random_uuid(),
  source_id uuid not null references public.classic_sources(id) on delete restrict,
  passage_key text not null unique,
  locator text not null,
  original_text text not null,
  simplified_text text not null default '',
  display_note_zh_hant text not null default '',
  display_note_zh_hans text not null default '',
  theme_tags text[] not null default '{}',
  element_tags text[] not null default '{}',
  stem_tags text[] not null default '{}',
  branch_tags text[] not null default '{}',
  question_tags text[] not null default '{}',
  life_stage_tags text[] not null default '{}',
  avoid_tags text[] not null default '{}',
  score_bias integer not null default 0,
  verification_status text not null default 'pending',
  verified_against text not null default '',
  verified_at timestamptz,
  is_direct_quote boolean not null default true,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint classic_passages_key_check check (passage_key ~ '^[a-z0-9][a-z0-9_-]{2,120}$'),
  constraint classic_passages_verification_check check (verification_status in ('pending','verified','rejected')),
  constraint classic_passages_verified_source_check check (
    verification_status <> 'verified'
    or (char_length(verified_against) > 0 and verified_at is not null)
  ),
  constraint classic_passages_tag_limits check (
    cardinality(theme_tags) <= 32
    and cardinality(element_tags) <= 8
    and cardinality(stem_tags) <= 12
    and cardinality(branch_tags) <= 14
    and cardinality(question_tags) <= 24
    and cardinality(life_stage_tags) <= 24
    and cardinality(avoid_tags) <= 24
  )
);

create table if not exists public.classic_passage_matches (
  id uuid primary key default gen_random_uuid(),
  report_id uuid not null references public.report_requests(id) on delete cascade,
  slot text not null default 'free_summary',
  passage_id uuid not null references public.classic_passages(id) on delete restrict,
  score integer not null,
  match_context jsonb not null default '{}'::jsonb,
  match_reason jsonb not null default '{}'::jsonb,
  engine_version text not null default 'classic-match-v1',
  created_at timestamptz not null default now(),
  constraint classic_passage_matches_slot_check check (char_length(slot) between 1 and 64),
  constraint classic_passage_matches_report_slot_unique unique (report_id, slot)
);

alter table public.classic_sources enable row level security;
alter table public.classic_passages enable row level security;
alter table public.classic_passage_matches enable row level security;

revoke all on public.classic_sources from anon, authenticated;
revoke all on public.classic_passages from anon, authenticated;
revoke all on public.classic_passage_matches from anon, authenticated;
grant select, insert, update, delete on public.classic_sources to service_role;
grant select, insert, update, delete on public.classic_passages to service_role;
grant select, insert, update, delete on public.classic_passage_matches to service_role;

create index if not exists classic_passages_source_idx on public.classic_passages (source_id);
create index if not exists classic_passages_verified_idx on public.classic_passages (verification_status, is_active);
create index if not exists classic_passages_theme_tags_gin on public.classic_passages using gin (theme_tags);
create index if not exists classic_passages_element_tags_gin on public.classic_passages using gin (element_tags);
create index if not exists classic_passages_stem_tags_gin on public.classic_passages using gin (stem_tags);
create index if not exists classic_passages_branch_tags_gin on public.classic_passages using gin (branch_tags);
create index if not exists classic_passages_question_tags_gin on public.classic_passages using gin (question_tags);
create index if not exists classic_passages_life_stage_tags_gin on public.classic_passages using gin (life_stage_tags);
create index if not exists classic_passage_matches_report_idx on public.classic_passage_matches (report_id, created_at desc);

create or replace function public.classic_jsonb_text_array(payload jsonb, key_name text)
returns text[]
language sql
immutable
as $$
  select coalesce(
    array(
      select jsonb_array_elements_text(
        case
          when jsonb_typeof(coalesce(payload, '{}'::jsonb) -> key_name) = 'array'
            then coalesce(payload, '{}'::jsonb) -> key_name
          else '[]'::jsonb
        end
      )
    ),
    '{}'::text[]
  );
$$;

create or replace function public.classic_overlap_count(left_tags text[], right_tags text[])
returns integer
language sql
immutable
as $$
  select count(*)::integer
  from (
    select distinct tag from unnest(coalesce(left_tags, '{}'::text[])) as tag
    intersect
    select distinct tag from unnest(coalesce(right_tags, '{}'::text[])) as tag
  ) overlap_rows;
$$;

revoke all on function public.classic_jsonb_text_array(jsonb, text) from public, anon, authenticated;
revoke all on function public.classic_overlap_count(text[], text[]) from public, anon, authenticated;
grant execute on function public.classic_jsonb_text_array(jsonb, text) to service_role;
grant execute on function public.classic_overlap_count(text[], text[]) to service_role;

create or replace function public.match_classic_passage(
  p_context jsonb,
  p_limit integer default 1
)
returns table (
  passage_id uuid,
  passage_key text,
  source_slug text,
  source_title_zh_hant text,
  source_title_zh_hans text,
  locator text,
  original_text text,
  simplified_text text,
  score integer,
  match_reason jsonb
)
language sql
stable
security definer
set search_path = public
as $$
  with ctx as (
    select
      public.classic_jsonb_text_array(p_context, 'themes') as themes,
      public.classic_jsonb_text_array(p_context, 'elements') as elements,
      public.classic_jsonb_text_array(p_context, 'stems') as stems,
      public.classic_jsonb_text_array(p_context, 'branches') as branches,
      public.classic_jsonb_text_array(p_context, 'questions') as questions,
      public.classic_jsonb_text_array(p_context, 'life_stages') as life_stages,
      public.classic_jsonb_text_array(p_context, 'avoid') as avoid_tags,
      coalesce(p_context ->> 'stable_key', '') as stable_key
  ), scored as (
    select
      p.id as passage_id,
      p.passage_key,
      s.slug as source_slug,
      s.title_zh_hant as source_title_zh_hant,
      s.title_zh_hans as source_title_zh_hans,
      p.locator,
      p.original_text,
      p.simplified_text,
      (
        p.score_bias
        + public.classic_overlap_count(p.theme_tags, ctx.themes) * 12
        + public.classic_overlap_count(p.element_tags, ctx.elements) * 8
        + public.classic_overlap_count(p.stem_tags, ctx.stems) * 8
        + public.classic_overlap_count(p.branch_tags, ctx.branches) * 6
        + public.classic_overlap_count(p.question_tags, ctx.questions) * 10
        + public.classic_overlap_count(p.life_stage_tags, ctx.life_stages) * 7
      )::integer as score,
      jsonb_build_object(
        'theme_hits', public.classic_overlap_count(p.theme_tags, ctx.themes),
        'element_hits', public.classic_overlap_count(p.element_tags, ctx.elements),
        'stem_hits', public.classic_overlap_count(p.stem_tags, ctx.stems),
        'branch_hits', public.classic_overlap_count(p.branch_tags, ctx.branches),
        'question_hits', public.classic_overlap_count(p.question_tags, ctx.questions),
        'life_stage_hits', public.classic_overlap_count(p.life_stage_tags, ctx.life_stages),
        'score_bias', p.score_bias
      ) as match_reason,
      ctx.stable_key
    from public.classic_passages p
    join public.classic_sources s on s.id = p.source_id
    cross join ctx
    where p.is_active = true
      and s.is_active = true
      and p.verification_status = 'verified'
      and p.is_direct_quote = true
      and public.classic_overlap_count(p.avoid_tags, ctx.avoid_tags) = 0
  )
  select
    passage_id,
    passage_key,
    source_slug,
    source_title_zh_hant,
    source_title_zh_hans,
    locator,
    original_text,
    simplified_text,
    score,
    match_reason
  from scored
  order by score desc, md5(stable_key || ':' || passage_key) asc
  limit least(greatest(coalesce(p_limit, 1), 1), 5);
$$;

revoke all on function public.match_classic_passage(jsonb, integer) from public, anon, authenticated;
grant execute on function public.match_classic_passage(jsonb, integer) to service_role;

create or replace function public.select_classic_passage_for_report(
  p_report_id uuid,
  p_context jsonb,
  p_slot text default 'free_summary'
)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  cached jsonb;
  chosen record;
  match_id uuid;
begin
  select jsonb_build_object(
    'match_id', m.id,
    'report_id', m.report_id,
    'slot', m.slot,
    'passage_id', p.id,
    'passage_key', p.passage_key,
    'source_slug', s.slug,
    'source_title_zh_hant', s.title_zh_hant,
    'source_title_zh_hans', s.title_zh_hans,
    'locator', p.locator,
    'original_text', p.original_text,
    'simplified_text', p.simplified_text,
    'score', m.score,
    'match_reason', m.match_reason,
    'engine_version', m.engine_version
  )
  into cached
  from public.classic_passage_matches m
  join public.classic_passages p on p.id = m.passage_id
  join public.classic_sources s on s.id = p.source_id
  where m.report_id = p_report_id and m.slot = p_slot
  limit 1;

  if cached is not null then
    return cached;
  end if;

  select * into chosen
  from public.match_classic_passage(
    coalesce(p_context, '{}'::jsonb) || jsonb_build_object('stable_key', p_report_id::text || ':' || p_slot),
    1
  )
  limit 1;

  if not found then
    return null;
  end if;

  insert into public.classic_passage_matches (
    report_id,
    slot,
    passage_id,
    score,
    match_context,
    match_reason
  ) values (
    p_report_id,
    p_slot,
    chosen.passage_id,
    chosen.score,
    coalesce(p_context, '{}'::jsonb),
    chosen.match_reason
  )
  on conflict (report_id, slot) do nothing
  returning id into match_id;

  if match_id is null then
    return public.select_classic_passage_for_report(p_report_id, p_context, p_slot);
  end if;

  return jsonb_build_object(
    'match_id', match_id,
    'report_id', p_report_id,
    'slot', p_slot,
    'passage_id', chosen.passage_id,
    'passage_key', chosen.passage_key,
    'source_slug', chosen.source_slug,
    'source_title_zh_hant', chosen.source_title_zh_hant,
    'source_title_zh_hans', chosen.source_title_zh_hans,
    'locator', chosen.locator,
    'original_text', chosen.original_text,
    'simplified_text', chosen.simplified_text,
    'score', chosen.score,
    'match_reason', chosen.match_reason,
    'engine_version', 'classic-match-v1'
  );
end;
$$;

revoke all on function public.select_classic_passage_for_report(uuid, jsonb, text) from public, anon, authenticated;
grant execute on function public.select_classic_passage_for_report(uuid, jsonb, text) to service_role;
