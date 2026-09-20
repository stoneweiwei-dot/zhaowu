# ZHAOWU ABSOLUTE EXECUTION PROTOCOL

This file is the highest repository-level execution protocol for all work on **ZHAOWU / 昭梧**.

Repository: `stoneweiwei-dot/zhaowu`
Production project: Vercel `stone-zhaowu-official`
Production URL: `https://stone-zhaowu-official.vercel.app/`
Database/Auth/Storage: Supabase `plgpxusmemnmzckbwtiv`
Primary branch: `main`
Cost posture: **A$0/month target unless the owner explicitly approves paid infrastructure**

## 2026-09-20 OWNER ABSOLUTE ZERO-COST / SINGLE-PRODUCTION SUPERSESSION

This is the owner's newest explicit infrastructure instruction and has **highest repository-level authority** for hosting, deployment, quota, storage and external-tool behavior. It fully supersedes the 2026-09-19 r154 Netlify-hosting supersession and every older 40/44/50/80-deploy budget rule.

### A. Zero-cost is the default operating constraint

- ZHAOWU must be operated at **A$0/month wherever the existing free tiers can safely support the actual traffic and workload**.
- No AI, APP, agent, connector or automation may create, enable, upgrade or subscribe to a paid infrastructure plan, paid add-on, paid storage tier or parallel paid host without the owner's **new explicit approval for that exact spend**.
- When any platform reports a quota/limit, the first response must be: **measure actual usage → identify waste → stop redundant triggers → deduplicate/clean safe waste → wait for free-tier reset where appropriate → only then report a genuine external blocker**.
- "Upgrade", "add credits", "buy Pro" or "move to another paid host" is never the default fix for a quota caused by development churn.

### B. One production path only

- GitHub `stoneweiwei-dot/zhaowu` branch `main` is the only source of truth.
- Vercel project `stone-zhaowu-official` is the **only active production host**.
- Canonical production origin is `https://stone-zhaowu-official.vercel.app/` until the owner explicitly assigns another canonical domain.
- Netlify `archive-stone-zhaowu-official`, Replit, Sites, AppDeploy, Lovable, Floot, Cloudflare or any other platform may be used only as development/reference tooling when needed. They must not become a second production source, canonical URL, auth callback origin or runtime dependency unless the owner explicitly changes this rule.
- Older Netlify-as-production wording in docs/issues/chats is **superseded** and must not be revived.

### C. Deployment budget: release once, do not deploy to test

- **No automatic Vercel preview deployment is allowed for tool branches, Codex branches, fix branches, docs-only branches or exploratory work.**
- Branches may exist in GitHub, but they must be tested with local/GitHub CI first and must not be used as a way to consume Vercel deployment quota.
- Batch compatible work. The normal release path is: **edit/test off-production → merge one vetted batch to `main` → one production deployment → verify production**.
- Never use repeated Vercel deployments as a debugging loop when the same failure can be found by source inspection, unit tests, typecheck, build or GitHub CI.
- Documentation/governance-only edits should not trigger production builds where platform configuration can safely exclude them.
- A cancelled/ignored Vercel deployment is still treated as quota consumption for project governance purposes; agents must prevent the trigger rather than intentionally creating a cancelled deployment.
- Do not create another Vercel project to evade limits.

### D. Supabase free-tier operating envelope

- Keep the existing Supabase project `plgpxusmemnmzckbwtiv`; do not create a replacement project merely to reset quota.
- Database/Auth stay on the current free project while capacity is sufficient.
- Supabase Storage operating target is **below 900 MB**, leaving safety margin below the free-tier 1 GB limit.
- Before uploading new media: check for an existing identical asset; avoid duplicate binaries; prefer production-appropriate compressed formats. Do not upload large WAV/PNG originals when a smaller production derivative is sufficient.
- Cleanup order is: **unreferenced/orphan objects → exact duplicate binaries → disabled temporary/test assets → obsolete one-time imports**, but only after references and rollback needs are proven.
- Never delete customer reports, user data, currently referenced production assets, originals required for rollback, or database records merely to reduce quota.
- Temporary / probe / `*-once` Edge Functions are development artifacts. After their job is complete, they must be audited and retired from the active surface when safe; they must never become accidental permanent runtime dependencies.
- Storage pressure must be solved by safe cleanup/deduplication before any paid upgrade is proposed.

### E. External plugins are development tools, not production dependencies

- ChatGPT plugins/connectors such as Canva, Replit, Runway, Sites, Floot, AppDeploy or other creative/dev tools must never be required for a visitor to load the site, log in, calculate a chart, read a report or use normal production features.
- A plugin reaching its own daily limit must not take the live website down.
- Runtime-critical dependencies are restricted to the explicitly approved production stack. Adding a new runtime SaaS dependency requires an explicit need, a free-tier/cost review, failure-mode review and owner approval.

### F. Cost and quota acceptance gate

Before any infrastructure change is called complete, record:
1. what resource it consumes;
2. whether it can trigger per-deploy/per-request/per-storage cost;
3. whether the free tier is sufficient for current usage;
4. what happens when that dependency is unavailable;
5. how to roll back without data loss.

**Governing rule: first remove waste, then simplify architecture, then use the free tier. Spending money is a last resort and requires explicit owner approval.**

## 0. HIGHEST PRIORITY — SAFE NEW-INSTRUCTION SUPERSESSION

This rule applies to **every AI / APP / coding agent / automation / platform** that works on ZHAOWU, including but not limited to ChatGPT, Codex, Grok, AppDeploy, GitHub-connected agents, deployment agents and future tools.

Before executing **every new user instruction**, the agent must first perform an instruction-conflict preflight against all currently active project instructions that overlap the same feature, route, workflow, asset, automation or behavior.

Required process:

1. Identify the new instruction's exact scope and intended result.
2. Read `docs/INSTRUCTION-REGISTRY.md`, then search the active repository truth for older overlapping instructions, implementations, flags, automations, docs, issues, branches, tests, contracts and legacy code that could enforce a conflicting behavior.
3. Classify each older item as:
   - **Compatible** — keep it.
   - **Independent** — outside the new instruction's scope; keep it untouched.
   - **Superseded / conflicting** — the newer explicit user instruction replaces it.
   - **Runtime-protected / dependency-required** — it may look old, but removal could break logic, data, compatibility, build, routing or production flow.
4. For a **superseded / conflicting** older instruction, remove it from the **active execution path** only when safe removal is proven. This may mean deleting obsolete active code/config/docs/automation references or disabling the obsolete behavior so it can no longer override the new instruction.
5. The newer instruction supersedes **only the conflicting portion** of the older instruction. Never delete unrelated requirements merely because they are older.
6. **Do not delete, disable or rewrite an older instruction/implementation if doing so could break or degrade any existing logic, data integrity, build, deployment, auth, permissions, report generation, report history, routing, payment, multilingual behavior, calendar, Bazi/destiny calculation, Supabase data, user flow or production stability.**
7. If safe deletion cannot be proven, do **not** force-delete it. Instead:
   - keep the dependency needed for runtime compatibility,
   - mark or isolate the obsolete behavior as deprecated/inactive where possible,
   - prevent it from overriding the newer instruction,
   - report the exact dependency conflict before changing protected logic.
8. Before removing an old active instruction or implementation, check all imports, references, tests, routes, CSS selectors, assets, database dependencies, environment variables, automations and deployment contracts that depend on it.
9. After superseding/removing anything, run the normal regression gates. The change is invalid if it makes the website less stable, less smooth, slower in a material way, or breaks any previously working core path.
10. Never revive an older instruction from old chat, issue, branch, deployment, automation or legacy file if a newer active instruction has already superseded it.
11. Never create a parallel production path to preserve an obsolete instruction. ZHAOWU keeps one production source of truth.
12. Deletion under this rule means **removal from the current active instruction/execution path**, not rewriting Git history. Keep normal repository history for auditability and rollback.

Instruction precedence for overlapping project behavior:

**latest explicit user instruction → current `main` / production truth → this repository protocol + `docs/INSTRUCTION-REGISTRY.md` + current contracts → older active docs/issues → stale chats/branches/deployments.**

Safety exception: a newer instruction does not automatically authorize breaking locked core logic, data integrity, security, auth, payment, production routing or other protected contracts. Those may change only when the user explicitly requests that scope and the dependency/regression checks pass.

The governing principle is:

> **New intent wins over conflicting old intent, but never by breaking working logic or production flow. Remove obsolete active instructions only when their removal is demonstrably safe.**

## 1. No false completion

Never call a task "done", "fixed", "finished", "live", or equivalent unless the full production loop is complete.

Use these states precisely:

- **Analysed**: problem understood only.
- **Modified**: code/assets changed only.
- **Committed**: change exists in GitHub and has a real commit SHA.
- **Deployed**: the matching active-host deployment is `READY`.
- **Live**: production alias points to that deployment/commit.
- **Verified**: the production URL/path and requested behavior were actually checked.

Only **Verified** may be reported as complete.

## 2. Mandatory preflight before every website task

Before changing anything, check the current truth:

1. Current `main` HEAD SHA.
2. `docs/INSTRUCTION-REGISTRY.md` plus current contents of relevant files.
3. Recent related commits.
4. Existing implementation, assets, tests and duplicate/legacy paths.
5. Current active-host production deployment and its GitHub commit SHA.
6. Failed deployments or CI checks relevant to the task.
7. Open PRs if they may overlap the requested work.

Do not work from memory, old chat context, assumptions, or stale local state when repository/production tools can answer the question.

## 3. Task boundary discipline

For each task, determine:

- What must change.
- What must not change.

Use the smallest safe change surface. Do not refactor unrelated code, redesign unrelated UI, change architecture, or "improve" adjacent systems without an explicit request.

High-risk areas that must not be touched incidentally:

- Bazi / destiny calculation logic
- report generation and current focused-report contracts
- auth/login permissions
- owner/admin permissions
- Supabase data and schema
- payment
- calendar
- yizhangjing / palm logic
- method routes
- report history and user data
- production routing
- multilingual system

## 4. Dependency and contract check

Before committing a feature/fix, search all relevant:

- imports and references
- CSS selectors
- tests
- UI contract tests
- routes
- build scripts
- asset paths
- duplicate implementations
- legacy implementation still enforcing the opposite behavior

If code changes invalidate an old test/contract, update the test in the same change. Never leave a feature implemented while CI still forbids it.

## 5. "Add this to the website" means production, not a patch

If a request says add/fix/change/update/remove something on the website, the default task scope is:

**source change -> GitHub main -> tests/build -> active production host -> production URL verification**

A ZIP, SVG, PNG, code snippet, patch file, local asset or draft is not "added to the website" until it is actually integrated and verified in production.

## 6. Visual asset rules

For UI/images/emblems/backgrounds/logos:

- asset must exist in the repo/public build
- code must reference the correct asset path
- production must return the asset successfully
- mobile rendering must be considered first
- visual decoration must not block text, inputs or buttons
- dark/light/image backgrounds must keep acceptable legibility
- no invented or unwanted logos, marks or decorative overlays

For random decoration requests, verify whether behavior is truly random, where it appears, route coverage, hydration safety, mobile overlap, and whether any route was intentionally excluded.

## 7. Tests and build are hard gates

Run/inspect all available relevant gates:

- project tests
- UI contract tests
- build
- TypeScript/typecheck
- lint if configured
- deployment build result

If any required gate fails, status is:

**NOT COMPLETE — blocked by CI/build/test failure.**

Do not claim success because source code "looks correct".

## 8. Active-host production verification

After a main commit:

1. Find the active-host deployment for the exact commit SHA.
2. Confirm state is `READY`.
3. Confirm target/alias is production.
4. Confirm production is serving that exact commit.
5. Fetch/check the relevant production URL and asset URLs.

A preview deployment is not production completion.

## 9. Production verification

A `READY` deployment alone is not enough.

Check the real production path(s) involved in the task. For UI tasks, verify at minimum the available evidence for:

- `/`
- the affected route(s)
- `/login` if the shell/login is involved
- target static assets
- mobile behavior where the tooling can verify it

## 10. ZERO-COST DEPLOYMENT BUDGET

All older numeric Vercel project-side deployment budgets, including **40 / 44 / 50 / 80 per day**, are superseded.

The active rule is not "use up to N deployments". The active rule is:

- **development/test deployments to Vercel: 0 by default**;
- **preview deployments from non-main branches: 0**;
- **production deployments: one per vetted release batch whenever possible**;
- emergency redeployment is allowed only to restore a broken production path, not to iterate on cosmetics;
- a quota warning never authorizes a new host/project or paid plan;
- if Vercel quota is near exhaustion, stop deployment churn, continue source/CI work, and preserve the remaining quota for a verified production release or emergency fix.

The objective is reliable production under the free tier, not maximizing the daily quota.

## 11. Failure handling

When a step fails:

1. identify the exact failure
2. inspect evidence/logs
3. fix it if the available tools allow
4. rerun the required gate
5. redeploy/recheck
6. continue until verified or a concrete external blocker remains

If blocked, state exactly:

- where the blocker is
- the exact error/state
- why current tools cannot resolve it
- the smallest user action required, if any

## 12. Required completion report

For every website task, final status must include:

### Modification
`COMPLETE` / `INCOMPLETE`

### GitHub
Commit: `<SHA>`

### CI / Build
`PASS` / `FAIL`

### Hosting
`READY` / `ERROR` / `BUILDING`
Deployment: `<deployment id>`

### Production
Production commit: `<SHA>`

### Verification
List affected routes/assets as `PASS`, `FAIL`, or `NOT VISUALLY VERIFIED`.

### Final conclusion
Only one of:

- `VERIFIED COMPLETE`
- `MODIFIED BUT NOT LIVE/VERIFIED`
- `INCOMPLETE — BLOCKED BY: <exact reason>`

Never use ambiguous completion language.

## 13. Absolute rule

For ZHAOWU work, facts beat assumptions, production beats local state, and verification beats implementation.

If there is no production evidence, there is no completion claim.

## 14. MANDATORY RELEASE LEDGER

Every change that reaches ZHAOWU production and modifies runtime behavior, backend behavior, customer-facing UI, report output, deployment behavior, or production data/configuration must leave a release record. This applies to every AI, APP, agent and manual maintainer.

Before merge:

1. Bump the public release fallback in `src/lib/site-stats.ts`.
2. Increase `updateNumber` by exactly one from the latest recorded production release.
3. Create one matching file under `docs/change-reports/` named with the same release version/date.
4. The change report must state: what changed, why, affected scope, protected scope, rollback path, and verification state.
5. Tests must fail if the footer release metadata and matching report drift apart.

After Production is VERIFIED:

6. Insert the same version and `update_number` into Supabase `public.release_history` with summary, PR, source commit, deployment id and verification notes.
7. Never overwrite or delete older `release_history` rows merely to make the count look cleaner. Historical rows are audit records.
8. The website footer must always show current version, cumulative recorded update count, latest update date, and the latest update-report summary. If Supabase is temporarily stale/unavailable, the code fallback must still show the current release.
9. A production change without its release report is **INCOMPLETE**, even if the feature itself works.
10. Documentation-only changes that do not affect production runtime/configuration may be exempt unless the user explicitly asks to version them.

The release ledger is the canonical answer to: **which version is live, how many recorded production updates have occurred, and what changed in the latest release.**

## 15. CANONICAL METAPHYSICS DEFAULT

For every ZHAOWU metaphysics analysis, report, AI prompt, rule-ingestion task or specialist route, the current doctrine is `docs/STONE-R6.2.1-CURRENT-MASTER.md` together with mandatory runtime patches `docs/STONE-R6.2.1-P2-STRUCTURAL-DYNAMICS.md` and `docs/STONE-R6.2.1-P3-PINKU-BINGYAO-GATE.md`, unless the site owner explicitly overrides the current task. `docs/METAPHYSICS-DEFAULT-PROTOCOL-v1.0.md` is retained only as a historical redirect and must never stop at R6.1.

Mandatory interpretation boundaries:

1. Zi Ping Bazi remains the primary structural judgement system.
2. Zi Wei Dou Shu is an independent phenomenon / life-scene validation layer and must follow `docs/ZIWEI-INTERPRETATION-GRAMMAR-v1.0.md`.
3. Zi Wei calculation truth and interpretation truth are separate. Calculation changes require deterministic tests, source profiles and provenance; interpretation material must never silently alter placements or Four-Transformation tables.
4. New metaphysics material follows `docs/ANALYSIS-INGESTION-POLICY.md` and must be classified as CALC_TRUTH, CLASSICAL_INTERPRETATION, MODERN_INTERPRETATION, OWNER_MATERIAL or QUARANTINE.
5. Serious claims cannot be produced from a single star, transformation, malefic or isolated annual signal. Medical diagnosis, death/lifespan claims and unsupported severity scoring remain prohibited.
6. Deterministic calculation happens first and once; report pages reuse the same engine snapshot/evidence trace. AI may synthesize or translate but must not recalculate the chart.
7. R6.2.1 Governance Layer and Runtime Layer remain separate; Progressive Execution, Stage Checkpoint, No Silent Reinterpretation, dual-axis evidence, Tie Procedure, Regression Test and Governance Stop Rule are mandatory.
8. P2 is mandatory for branch relations, Ten-God functional state, dynamic tomb/storage logic, ODL/FC flow, symbolism and cross-system boundaries.
9. P3 is mandatory for 偏枯／病藥: no element-count diagnosis, special-pattern Gate first, six-state 偏枯 output, functional disease/remedy, ODL → FC, and no direct element-to-personality/disease/occupation or object-to-destiny mapping.
10. Every Bazi / metaphysics subgroup must inherit the canonical top-level mainline: data validation → special-pattern truth → month command → climate → roots/exposure → structure → PK-6 → pathology/remedy → ODL → FC → capacity → branch/tomb dynamics → dayun → annual trigger → LBX → event nature → kinship → month window → confidence/evidence → plain-language output. EC-7 is mandatory: concentration is not a personality/direction/achievement verdict; double-strong conflict is not an automatic advantage; equilibrium is not element-count averaging; missing is not disease; mediation is conditional; lifestyle element symbolism cannot rewrite structure/useful-god/remedy/timing.

If an older prompt, document, issue or implementation conflicts with these boundaries, the newer canonical default wins only for the conflicting portion, subject to the safety and regression rules above.
