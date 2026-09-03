# ZW-WEB-2026.09.04-r35

## Summary

Absorb the owner-approved practical material from `DeepSeek - 探索未至之境(8).pdf` into the existing report reflection layer without importing its supernatural or unverified scientific claims.

## What changed

- Added `src/lib/report/practical-cultivation-advice.ts` with six targeted, tri-lingual practical themes:
  - inner practice over outward form
  - kindness with boundaries
  - concrete behaviour-change plans
  - using adversity to observe automatic patterns without romanticising suffering
  - having versus possessing
  - balancing self-reflection with external problem-solving
- Wired the new layer into the existing `buildMindAdviceLines()` path after the established `修心與環境` targeting and before generic fallback advice.
- Kept the existing maximum of two advice lines and did not add a report card, report session, calculation path or new paid-report page.
- Added source-ingestion documentation and a seven-topic article draft pack for later article-library deduplication.
- Added regression coverage that keeps quarantined supernatural concepts out of customer advice copy.

## Why

The uploaded source contains useful practical material about self-observation, boundaries, action and attachment, but it also mixes Buddhist/Taoist language, folk-spiritual claims, DeepSeek commentary and unsupported science-like explanations. The useful behavioural guidance should be available to reports while the unsupported claims remain isolated.

## Affected scope

- `src/lib/report/mind-advice.ts`
- `src/lib/report/practical-cultivation-advice.ts`
- reflection copy selected for matching customer questions
- public release fallback metadata
- research/content-draft documentation

## Protected scope

Unchanged:

- BaZi calculations, solar-time handling, pillars, hidden stems, Ten Gods, luck-cycle calculations
- Ziwei calculations and interpretation grammar
- auth/login/account permissions
- payment
- Supabase schema and customer data
- report page/session structure
- image generation providers
- production routing
- multilingual framework architecture

## Safety / source boundaries

- The PDF is treated as a secondary AI digest, not a primary Buddhist/Taoist/classical source.
- `松果體＝天眼`, scientific proof of supernatural perception, `接靈`, `地魂`, mediumship, karmic illness and similar claims remain `QUARANTINE`.
- Health, legal, financial and safety matters remain subject to real-world professional handling.
- No deterministic metaphysics rule is created from this material.

## Tests

Added `scripts/practical-cultivation-advice.test.mjs` to lock:

- OWNER_MATERIAL classification
- two-line output cap
- existing environment-advice priority
- quarantine boundaries
- no leakage of named supernatural claims into customer advice copy

## Rollback

Revert the release commit. This removes the new practical advice module/import and restores `SITE_RELEASE_FALLBACK` to the prior release. No database migration or customer-data rollback is required.

## Verification state

Release-candidate state at authoring time: **PENDING CI / PREVIEW / PRODUCTION VERIFICATION**.

After the exact merged SHA is `READY` on `stone-zhaowu-official` and the affected production path is checked, the final deployment ID, source commit and verification note must be recorded in `public.release_history` under version `ZW-WEB-2026.09.04-r35`, update number `35`.
