# Final closeout — 2026-10-07

## Source of truth and scope

Before edits, GitHub `main`, the canonical Vercel Production alias and its HTTP
`release.json` all resolved to `621e60d2d1dc440acd828387c05d322032c6f926`.
Production was `READY`, deployment `dpl_59pTLcrq6uEHFSVCJJdH8MddphKu`, project
`stone-zhaowu-official`. The working tree matched that commit. Open UI PR #656
was excluded: it is not current main or Production.

Read `AGENTS.md`, `docs/INSTRUCTION-REGISTRY.md`, existing engine, flow, owner,
mobile and visual tests before modification. The owner's explicit closeout
instruction supersedes the optional-test and docs-only SHA exceptions for this
batch only. One branch/PR, no preview deployment, one production release.

No product feature, approved UI redesign, second host/system, Supabase schema,
payment rule, deterministic chart calculation or baseline threshold change.

## Inventory before changes and disposition

| Area | Runtime evidence | Disposition |
| --- | --- | --- |
| Hidden account backgrounds | Authenticated browser fixture entered `/account` and clicked refresh: `report.list`, `background.list`, `report.list`, `background.list`; zero background cards and no background navigation | Remove the unreachable subtree, state, copy, upload/delete handlers and hidden reads |
| Active wallpaper path | `/gallery` → `OwnerGalleryManager` → bridge `uploadBackground` / `setBackgroundWallpaper` → public `background_assets` → `SiteShell` | Preserve; browser regression verifies the action, request order, change event and homepage/Today consumer |
| CSS duplication | PostCSS found an exact same-parent duplicate of the open Today summary-arrow rotation | Delete one copy only; compare actual styles and screenshot |
| Unused imports/locals | TypeScript `noUnusedLocals` identifies unused intro/chart/constants imports, English narrative month/day reads, `tendencyLabel`, and pure unconsumed interpretation locals/helpers | Remove these pure unused pieces only |
| Apparently old exports | `STEM_TELL` / `BRANCH_TELL` are still consumed by `customer-answer`; background base/bridge exports retain existing API and compatibility consumers | Keep; age or source grep alone does not authorize removal |
| Question classification | Unmodified main fails existing father-health and partner-conflict cases; `buildQuestionGraph` feeds the current complex answer composer and boundary selection | Recognize `我爸`, explicit poor-body-health phrasing and `一直吵`; retain the existing tests and add a non-medical/non-conflict counterexample |
| Old source contracts | Tests require the former embedded specialist tree/paywall or D60 implementation inside a component; current main uses `SpecialistHub`, paid specialist routes and the extracted Indian engine | Point assertions at actual consumers; preserve prices, server verification, profile and geocentric assertions; no runtime rollback |
| Main customer flow | Actual browser birth entry → chart → one book → question → answer → reload; hub → Western basic chart with paid interpretation gate | Preserve |
| Home / Today | Three independent Today sections and existing slip dialog | Preserve; responsive interaction checks |

## Verification evidence

Executed in owner-requested order. `npm run build` includes the repository's
existing deploy contracts before Vite/TypeScript; that script was not rewritten.

1. TypeScript (including `--noUnusedLocals`) and production build: passed; build deploy suite 280 tests passed.
2. Core deterministic suite: 79 passed across engine acceptance, birth-time,
   branch/tomb/structural rules, Ziwei primary-source/calendar goldens, Western,
   Qizheng, D60, numerology, theory cases and complex-question contracts.
3. Main flow contracts: 54 passed. `e2e/final-closeout.spec.ts` flow case verifies
   the current nav, birth/chart/book/answer/restoration and locked paid route.
4. Owner contracts: 29 passed. Two browser cases verify report refresh without
   `background.*` requests and the existing gallery-to-wallpaper consumer path.
5. Mobile: five browser cases passed. The same spec checks 320/390/412/820/1440 widths, independent Today
   sections, dialog bounds/close and returning to birth entry.
6. Production: verify the merged commit on the existing canonical alias only.
7. Final main / Production / HTTP `release.json` SHA: record in the final delivery.

The local owner cases use isolated network fixtures, never real owner mutations.
They do not establish real-device upload or authenticated Production acceptance.

CSS evidence: all 165 rendered Today elements have identical computed property
values and dimensions before/after (property enumeration order normalized).
The full Today screenshots are byte-identical, SHA-256:
`ac0d3d080fbe3dd1b96a72eb18a904f31a81f32377b830be3c82ce028c0f35b2`.
No committed visual baseline or threshold was changed.

## Manual mobile acceptance boundary

WebKit browser installation succeeded, but its system-library installation failed
with `su: Authentication failure`. Chromium emulation is not a physical iPhone.
The one remaining manual acceptance item is the real-phone production journey:
Safari keyboard/touch, opening media/audio, owner login and actual media upload,
and a genuine payment/return. Do not claim those are proven by fixtures or by
source contracts; do not change code just to make this status green.

## Rollback and cost

Revert this single PR through the existing main/Production path if needed. No
schema/data migration or asset deletion occurred. No new host, paid plan, runtime
dependency or preview was created. The batch uses the existing build/request
allowances, removes redundant owner reads and leaves failure fallbacks intact.
