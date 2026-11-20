-- Gallery categories describe application routing, not religious or iconographic interpretation.
-- Preserve the old bucket as a rollback/audit tag while consolidating general artwork.
update public.gallery_assets
set
  tags = case
    when ('legacy-category:' || category) = any(tags) then tags
    else array_append(tags, 'legacy-category:' || category)
  end,
  category = 'visual-library',
  updated_at = now()
where category in (
  'buddhist',
  'daoist',
  'guardian-beast',
  'auspicious-motif',
  'report-art',
  'reference-style'
);

-- Future semantic interpretation remains in gallery_asset_knowledge rather than gallery_assets.category.
