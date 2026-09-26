# ZW-WEB-2026.09.27-r205

## Scope

Integrate the owner-provided《易經智慧盲派理論》as a bounded regression/research supplement without creating a second Bazi master.

## Changes

- Added 12 synthetic theory-unit cases covering 宮位、虛實／根氣、賓主／體用、合來／合絆／合閉、沖庫、婚姻宮星歲運、遷移／職業、傷病災三級觸發、無原局種子、反過度確定、十神 vs 宮位、做功效率。
- Added `ZW-BAZI-BLIND-THEORY-OPERATIONAL-0.1` to the production instruction registry.
- Bound the regression layer into R6.2.2 governance while keeping R6.2.1 + P2/P3 deterministic/runtime authority unchanged.
- Added `scripts/r205-theory-unit-cases.test.mjs` to the production build gate.

## Guardrails

- Source provenance remains `OWNER_MATERIAL`.
- Synthetic cases do not count as EVP evidence.
- No deterministic chart calculation, auth, payment or Supabase schema change.
- No customer-facing new section or card; this is an internal analysis-quality/runtime change.

## Verification target

- GitHub CI / build must pass.
- Production Vercel SHA must match merged main SHA.
- Supabase `release_history` records the exact production deployment after READY verification.
