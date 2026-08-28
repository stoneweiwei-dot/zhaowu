-- Backfill reliable semantic proxy tags from the owner's legacy Gallery group labels.
-- This does not overwrite vision outputs. It only enriches gallery_assets.tags so the
-- existing decree matcher can distinguish report themes while full vision coverage is incomplete.

update public.gallery_assets
set tags = (
  select array_agg(distinct tag order by tag)
  from unnest(coalesce(tags, '{}'::text[]) || array['semantic-proxy:east-asian']) as tag
), updated_at = now()
where enabled = true
  and category = 'visual-library'
  and (
    tags @> array['legacy-category:daoist']::text[]
    or tags @> array['legacy-category:buddhist']::text[]
    or tags @> array['legacy-category:guardian-beast']::text[]
    or tags @> array['legacy-category:auspicious-motif']::text[]
    or tags @> array['legacy-category:report-art']::text[]
  );

update public.gallery_assets
set tags = (
  select array_agg(distinct tag order by tag)
  from unnest(coalesce(tags, '{}'::text[]) || array[
    'semantic-proxy:cloud','semantic-proxy:water','semantic-proxy:mountain',
    'semantic-proxy:path','semantic-proxy:moon','semantic-proxy:jade'
  ]) as tag
), updated_at = now()
where enabled = true and category = 'visual-library'
  and tags @> array['legacy-category:daoist']::text[];

update public.gallery_assets
set tags = (
  select array_agg(distinct tag order by tag)
  from unnest(coalesce(tags, '{}'::text[]) || array[
    'semantic-proxy:dragon','semantic-proxy:guardian',
    'semantic-proxy:cloud','semantic-proxy:mountain'
  ]) as tag
), updated_at = now()
where enabled = true and category = 'visual-library'
  and tags @> array['legacy-category:guardian-beast']::text[];

update public.gallery_assets
set tags = (
  select array_agg(distinct tag order by tag)
  from unnest(coalesce(tags, '{}'::text[]) || array[
    'semantic-proxy:lotus','semantic-proxy:light',
    'semantic-proxy:moon','semantic-proxy:jade'
  ]) as tag
), updated_at = now()
where enabled = true and category = 'visual-library'
  and tags @> array['legacy-category:buddhist']::text[];

update public.gallery_assets
set tags = (
  select array_agg(distinct tag order by tag)
  from unnest(coalesce(tags, '{}'::text[]) || array[
    'semantic-proxy:flower','semantic-proxy:knot','semantic-proxy:pair',
    'semantic-proxy:treasure','semantic-proxy:gold','semantic-proxy:jade'
  ]) as tag
), updated_at = now()
where enabled = true and category = 'visual-library'
  and tags @> array['legacy-category:auspicious-motif']::text[];

update public.gallery_assets
set tags = (
  select array_agg(distinct tag order by tag)
  from unnest(coalesce(tags, '{}'::text[]) || array[
    'semantic-proxy:landscape','semantic-proxy:cloud','semantic-proxy:water',
    'semantic-proxy:mountain','semantic-proxy:path'
  ]) as tag
), updated_at = now()
where enabled = true and category = 'visual-library'
  and tags @> array['legacy-category:report-art']::text[];
