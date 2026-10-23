# ZW-WEB-2026.10.23-r226 — STONE seven cultural atlases

## Scope
- One new illustrated article under Knowledge → Articles, with traditional/simplified Chinese and English copy.
- Seven distinct original 1080×1920 PNG illustrations stored as first-party /articles/stone-cultural-atlas-01.png through -07.png.
- Corrected calendar boundaries (new moon vs jie), six faculties (not six desires), uncertain Jingshi attribution, and modern editorial status of the other frameworks.
- Tap any article illustration to open the actual full-resolution raster image.

## Non-goals
No changes to login, payments, Supabase schema, astrology, report calculations, themes, site routing, or other articles.

## Checks / release
- Before merging: confirm artwork signatures and dimensions via scripts/seven-cultural-atlas.test.mjs and scripts/article-artwork-acceptance.test.mjs, plus build/typecheck.
- Production may only be claimed after the sole Vercel deployment is READY and https://zhao-wu.com/knowledge renders the title and all seven distinct PNGs on a 390px viewport with no horizontal overflow.
- Record PR, merged SHA, deployment ID, and verification details in public.release_history only after confirmed deployment.
