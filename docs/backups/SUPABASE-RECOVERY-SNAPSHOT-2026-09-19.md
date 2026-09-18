# Supabase recovery snapshot — 2026-09-19

Project: `plgpxusmemnmzckbwtiv`
Control plane: ACTIVE_HEALTHY
Public Storage data plane: verified recovered with HTTP 200 on 2026-09-19 (Sydney time).

## Storage
- zhaowu-audio: 15 objects, 81,813,838 bytes
- zhaowu-backgrounds: 291 objects, 627,245,539 bytes
- zhaowu-gallery: 249 objects, 370,798,037 bytes
- zhaowu-report-images: 33 objects, 116,286,938 bytes (PRIVATE; paths intentionally excluded from repository manifest)
- Total: 588 objects, 1,196,144,352 bytes

## Relevant database state
- profiles: 8 rows (private/user data; not exported to repository)
- report_requests: 33 rows (private/report data; not exported to repository)
- background_assets: 279 rows
- gallery_assets: 565 rows
- background_music_assets: 13 rows
- site_settings: 8 rows
- release_history: 79 rows
- gallery_asset_knowledge: 290 rows
- gallery_analysis_runs: 3 rows
- classic_sources: 10 rows
- classic_passages: 53 rows
- paid_visual_blueprints: 0 rows
- site_visits: 8,287 rows

## Externalization state
- background_assets with cdn_url: 0
- gallery_assets with cdn_url: 36
- private report-image bucket remains on Supabase by design.

## Safety
This snapshot is non-destructive. No Supabase object or database row was deleted or overwritten.
Private user/report rows and private storage object names are deliberately not copied into this public repository snapshot.

## First migration batch
The existing read-only `admin-media-export-once` function exposes a fixed allow-list of 20 legacy background PNGs. They are approximately 4 MB each (~80 MB total), so they should be converted to WebP/AVIF before being committed into Vercel static assets rather than copied verbatim.

See `supabase-public-storage-manifest-2026-09-19.csv` for the complete public-object inventory.
