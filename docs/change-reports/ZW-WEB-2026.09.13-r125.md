# ZW-WEB-2026.09.13-r125

## Change
Play the committed 10.04s owner intro on first visit instead of aborting at 1.6s.

## Why
The 9.6MB `/intro/owner-immortal-ascent-r123.mp4` is valid H.264 720×1280. iPhone often takes longer than 1.6s to fire `playing`, so the old watchdog looked like a one-second flash and then marked the intro seen.

## Scope
- `src/components/intro-gate.tsx`
- `src/lib/intro-gate-policy.ts`
- `scripts/intro-loading.test.mjs`

## Out of scope
Bazi, auth, payment, Supabase schema, language catalog, icon system from r124.
