-- Pixel/color statistics are useful for palette matching but are not semantic image understanding.
-- General visual-library rows that were only pixel-profiled must not remain semantically "approved".
update public.gallery_asset_knowledge as knowledge
set
  analysis_status = 'review_required',
  client_eligible = false,
  confidence = least(coalesce(knowledge.confidence, 0), 0.49),
  rationale = 'Pixel-only profile retained for palette data; semantic subject/style understanding requires strict vision consensus.',
  updated_at = now()
from public.gallery_assets as asset
where knowledge.asset_id = asset.id
  and asset.category = 'visual-library'
  and knowledge.analysis_version = 'pixel-metadata-v1'
  and coalesce(knowledge.client_eligible, false) = false;
