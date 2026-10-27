## 2026-10-28｜《借星》原創九圖優先發布（站主最新指令）

涉及《借星》九幕圖片、圖錄、文章、素材、壓縮、發布或後台上傳時，**執行前必須先讀 `docs/BORROW-STAR-ARTWORK-PUBLISHING.md`**。此文件是九幅獨立 9:16 真正原創畫作的唯一交付與驗收契約；不能以幾何 SVG、拼貼裁切、縮圖、假圖或單純 HTTP 200 代替。圖片是站主的核心輸出，優先於同範圍美術微調。仍須遵守安全、授權、分支/CI/唯一 Production 發布流程；文件合併不等於圖片上線。

# ZHAOWU ABSOLUTE EXECUTION PROTOCOL

This file is the highest repository-level execution protocol for all work on **ZHAOWU / 昭梧**.

Repository: `stoneweiwei-dot/zhaowu`
Production project: Vercel `stone-zhaowu-official`
Production URL: `https://zhao-wu.com/` (Vercel alias: `https://stone-zhaowu-official.vercel.app/`)
Database/Auth/Storage: Supabase `plgpxusmemnmzckbwtiv`
Primary branch: `main`
Cost posture: **A$0/month target unless the owner explicitly approves paid infrastructure**

### 2026-10-19｜異獸畫像生成指令唯一版本（owner instruction）

只要現有功能需要**內在動物／本命異獸／命局瑞獸**的創作提示詞，預設先讀 `docs/SONG-BEAST-ART-PROMPT-v1.md`，並調用 `src/lib/song-beast-art-prompt.ts` 的 `buildSongBeastArtPrompt`（版本 `ZW-SONG-BEAST-ART-v1.0-20261019`）；不要另外創造黑底仙俠、滿版金飾、遊戲角色卡或通用鹿狐混種的 prompt。這只是既有結果的宋式畫像轉譯，不改八字 Truth Layer／測驗答案，不創建每位訪客即時付費生圖，不擴大至非異獸題材；新增圖片供應商／額度消耗需站主另行授權。站主後台 `/gallery` 及 `/fun-tests?test=animal` 結果提供零成本指令組裝／複製入口。真正上線以 main + 唯一 Production 驗證為準。


## 2026-10-07 OWNER LAUNCH / OPERATIONS MODE SUPERSESSION

ZHAOWU is now in **Launch / Operations mode**. The default objective is no longer continuous feature development or cosmetic perfection. The product objective is: **keep the live service stable, let real users complete the core flow, accept paid orders reliably, and promote the product.**

This instruction supersedes any older workflow that implicitly treats every small defect, visual preference, stale check, or admin inconvenience as a reason to keep the product in pre-launch development.

### A. Launch severity

Classify new findings before doing work:

- **P0 — launch / revenue blocker:** production unavailable; checkout/webhook/paid entitlement broken; core birth/chart calculation unavailable; report generation unusable; owner/customer access required for the core flow is broken; security/data-integrity issue that makes live operation unsafe. P0 may block promotion and should be fixed first.
- **P1 — material conversion / trust issue:** a reproducible issue on the public purchase or reading path that materially confuses users, hides the offer, prevents a common mobile action, or visibly damages trust. Batch P1 work; do not create a long chain of isolated releases.
- **P2 — cosmetic / convenience / polish:** spacing, minor icon taste, admin convenience, non-blocking visual differences, optional integrations, stale diagnostics, or edge-case polish. Record it and continue operating. P2 never blocks launch, promotion, payment, or declaring the product operational.

### B. Stop development churn

- Do not start a new coding task merely because a small issue exists.
- Do not reopen disabled CI / Production Smoke / Deploy Gate / Engine suite / iPhone Safari / Visual Regression as routine launch gates.
- Do not convert owner fatigue into more verification work. Use the smallest current evidence that can answer the question.
- During launch, keep at most **one active runtime/product coding task** unless the owner explicitly asks for parallel work.
- Prefer one batched production release over repeated cosmetic deployments.
- New feature ideas, experimental tools, alternate hosts, new agent frameworks, and optional automation go to backlog unless the owner explicitly promotes them.

### C. Runtime truth versus docs-only main

Vercel Production must match the latest **runtime-affecting** commit intended for release. A docs/governance-only commit that is deliberately skipped by Vercel does **not** make the current Production stale or incomplete.

Do not require `Production SHA == literal current main SHA` when the only newer commits are docs/governance/workflow references that do not change the built runtime. In that case, report both:
- current main SHA;
- current live runtime SHA;
and state that the difference is intentional and non-runtime.

### D. Operations and promotion become the default next phase

Once no confirmed P0 remains:

1. keep the site live;
2. promote the public product;
3. watch real-user/payment failures;
4. fix evidence-backed P0/P1 issues;
5. leave P2 polish for scheduled batches.

Meta / Instagram / Threads automation is an **optional distribution integration**, not a launch gate. Missing Meta credentials must not keep ZHAOWU in perpetual development; manual or alternate promotion may proceed.

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
- Canonical production origin is `https://zhao-wu.com/`, explicitly assigned by the owner on 2026-10-17. Keep `stone-zhaowu-official.vercel.app` as a compatible alias on the same sole Vercel Production project.
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

### D. Supabase current paid-plan operating envelope (2026-09-24 owner supersession)

- Keep the existing Supabase project `plgpxusmemnmzckbwtiv`; do not create a replacement project merely to reset quota.
- The existing organization is owner-approved **Supabase Pro**. Do not treat it as Free, reapply the retired 900 MB freeze, or downgrade it without a newer explicit owner instruction.
- Use the live organization plan and current official quota as truth. As of 2026-09-24, Pro includes 100 GB Storage; measure current usage before reporting pressure.
- Before uploading new media: check for an existing identical asset; avoid duplicate binaries; prefer production-appropriate compressed formats. Do not upload large WAV/PNG originals when a smaller production derivative is sufficient.
- Cleanup order is: **unreferenced/orphan objects → exact duplicate binaries → disabled temporary/test assets → obsolete one-time imports**, but only after references and rollback needs are proven.
- Never delete customer reports, user data, currently referenced production assets, originals required for rollback, or database records merely to reduce quota.
- Temporary / probe / `*-once` Edge Functions are development artifacts. After their job is complete, they must be audited and retired from the active surface when safe; they must never become accidental permanent runtime dependencies.
- Storage pressure must still be solved by safe cleanup/deduplication before proposing any additional paid capacity beyond the already approved Pro plan.

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
6. Failed deployments relevant to the task; CI/check status only when the owner explicitly asked for that diagnostic.
7. Open PRs if they may overlap the requested work.

Do not work from memory, old chat context, assumptions, or stale local state when repository/production tools can answer the question.

## 2.5 Stone AI Partner operating layer — audit / link / level-up

ZHAOWU adopts only three workflow patterns from the external AI-Partner concept: **audit**, **link**, and **level-up**. This is a governance method only. Do **not** install or vendor the upstream project, add its runtime, create a parallel memory system, or duplicate ZHAOWU truth into a second knowledge base.

Execution details live in `docs/AI-COORDINATION.md` §§11–13. Canonical reusable source pointers live in `docs/SOURCE-INDEX.md`.

Apply these rules:

- **Audit:** a completion/status claim must be backed by evidence that is current for the claim. PR text, old screenshots, stale checks, or another agent saying "done" are not proof. Respect §7: disabled/non-required CI suites are not default evidence and must not be re-run merely to satisfy audit.
- **Link:** when a durable external/internal source will be reused, register only its canonical pointer, authority, purpose and freshness rule in `docs/SOURCE-INDEX.md`. Do not copy the source body into a second truth store. Never record secrets, tokens, private credentials, or unnecessary personal data.
- **Level-up:** at most once per week, identify one confirmed workflow bottleneck worth removing. Prefer deleting steps, merging duplicate paths, or clarifying authority over adding tools. Do not auto-implement an unrelated improvement inside an active task; put it in the existing backlog unless the owner explicitly assigns it.
- If there is no meaningful evidence-backed improvement, record nothing. "Finding something to optimize" is not itself a goal.
- These methods never authorize a new runtime SaaS dependency, paid plan, deployment path, production host, database, or agent framework.

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

### 2026-10-21｜GLOBAL ARTICLE ARTWORK GATE (owner confirmation; ACTIVE)

Extend artwork inspection beyond one illustrated essay. Source-audit `src/lib/life-view*.ts` and `src/lib/life-view-long-form/**/*.ts`: reject unapproved SVG pictures masquerading as artwork, missing image sources, invalid real-file signatures, and the three confirmed problematic code-art articles. Genuine five-phases/timing educational diagrams remain explicitly permitted. This gate is structural only, never a substitute for source→production visual QA. Do not rebrand older in-repository WebP assets as fresh generated art.

### 2026-10-21｜ARTICLE ARTWORK MUST BE ARTWORK (owner visual bugfix; ACTIVE)

The user reported that published article illustrations repeatedly look like low-grade code-generated cards. Root cause confirmed in PR #820: an agent authored geometric SVG posters (`<rect>`, `<text>`, gradient bands) and passed them off as paintings, while genuine generated images were never connected to the article. This is an authoring/asset-choice failure, **not** a browser image transformation or a Supabase upload bug.

For future website images (all agents/workflows):
- Classify the requested output **before creation**: **painting/illustration**, **diagram/chart**, **UI mockup**, or **text-led infographic**. Never substitute one class for another merely because SVG/source code is cheaper or simpler to commit.
- If the owner asks for artwork, create/obtain the actual visually rich source image; compositional substance, painted details and material feel must dominate. A box-and-number SVG, CSS gradients, geometric mountains or bare text are NOT an acceptable substitute. Use text/HTML outside the art for exact facts and accessible multilingual explanations. Use SVG only for genuinely visual illustration or a specifically requested scalable diagram, not to disguise a simple card as a painting.
- **No fake success**: the generated file, uploaded file, code reference, public URL, and browser-visible pixels must all be traced as the SAME intended asset. A generated preview is not live media. The existence of an SVG/WebP path is not evidence of artistic quality. Visual acceptance must inspect the actual rendered picture, including at iPhone width; reject poor detail, mass-produced template blocks, illegible fake writing and unsupported labels.
- If image bytes cannot be reliably transferred to the approved GitHub/Supabase destination, STOP at staged/pending for that specific art. Never silently generate a replacement SVG via code, link to expiring third-party media, claim Gallery ingestion, or call placeholders "approved original art". Existing legitimate local raster art may be used only as an **explicitly identified interim editorial illustration**, not a new original commissioned painting.
- Reusable policy: `docs/ARTWORK-ACCEPTANCE.md`. Retain existing protected artwork, calculations, users, payments and storage contracts. No new paid generation service or second production host is authorized.

## 6. Visual asset rules

For every new image generated for ZHAOWU, Codex and other agents must use the active image-generation direction in `docs/ZHAOWU-SONG-AESTHETIC-FRAMEWORK.md` by default: Song-informed composition, warm paper/silk texture, soft mineral-pastel washes, fine ink lines, restrained gold, spacious scale and a quiet poetic narrative. Default to a single 9:16 artwork without collage or multi-panel layouts unless the owner explicitly specifies otherwise. Preserve the source culture's own visual language for non-Chinese subjects, then apply the shared material and compositional qualities. A per-task explicit style request overrides this default for that task only.

For UI/images/emblems/backgrounds/logos:

- asset must exist in the repo/public build
- code must reference the correct asset path
- production must return the asset successfully
- mobile rendering must be considered first
- visual decoration must not block text, inputs or buttons
- dark/light/image backgrounds must keep acceptable legibility
- no invented or unwanted logos, marks or decorative overlays

For random decoration requests, verify whether behavior is truly random, where it appears, route coverage, hydration safety, mobile overlap, and whether any route was intentionally excluded.

## 7. Tests and build are diagnostic tools, not default release gates

Owner supersession — 2026-10-06:

- GitHub Production CI, Deploy gate, Engine suite, iPhone Safari and Visual regression are **not required checks** and must not be treated as merge, release, completion or reporting gates.
- Do not automatically wait for, inspect, rerun or report these checks unless the owner explicitly asks for that specific diagnostic.
- A red, yellow, skipped or absent GitHub check by itself does **not** mean the requested work is incomplete.
- The repository workflow is manual-only. Routine pull requests and pushes must not trigger these diagnostic suites.
- Source inspection, targeted local reasoning, current `main`, and actual Vercel Production state are the default evidence for routine work.
- Tests/build may still be run manually when they are directly useful for debugging a concrete defect or when the owner explicitly requests them.

Do not reintroduce branch-protection or required-check assumptions without a newer explicit owner instruction.

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
`NOT REQUIRED BY DEFAULT` / `RUN ON REQUEST` / `PASS` / `FAIL`

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

## 14. RELEASE LEDGER — RELEASE-ONLY GATE

The release ledger is maintained for formal production releases. Ordinary feature PRs and routine CI must not be blocked by release-number sequencing.

- Ordinary PR / main CI may run build, engine, UI and contract tests, but must not run `scripts/release-ledger.release.mjs`.
- A normal feature PR is not required to bump `src/lib/site-stats.ts`, change `updateNumber`, update `lib/zhaowu-verification.js`, or create a numbered change report before merge. Concurrent work must not compete for the next release number.
- The strict release ledger check runs only from a `v*` or `release-*` tag, or by manually dispatching the release-ledger workflow on `main`.
- Before a formal release, the declared version and `updateNumber` must agree, `lib/zhaowu-verification.js` must match, and a corresponding `docs/change-reports/` report must exist with scope, rationale, verification and rollback notes. The release test derives version values from `src/lib/site-stats.ts`; it must not hardcode a moving release number.
- After the matching Vercel Production deployment is verified, record the formal release in Supabase `public.release_history`. Keep existing rows; include source commit, PR, deployment ID and verification evidence in the existing `notes` JSON where available. No schema change is implied by this rule.
- The release ledger is the audit trail for formal releases. Its numbering is not derived from Git commit count and must not be used as a daily merge gate.

## 15. CANONICAL METAPHYSICS DEFAULT

For every ZHAOWU metaphysics analysis, report, AI prompt, rule-ingestion task or specialist route, the current governance doctrine is `docs/STONE-R6.2.2-CURRENT-MASTER.md`. The deterministic runtime it governs remains `docs/STONE-R6.2.1-CURRENT-MASTER.md` together with mandatory runtime patches `docs/STONE-R6.2.1-P2-STRUCTURAL-DYNAMICS.md` and `docs/STONE-R6.2.1-P3-PINKU-BINGYAO-GATE.md`, including the r191 structural addendum, unless the site owner explicitly approves a later runtime patch. `docs/METAPHYSICS-DEFAULT-PROTOCOL-v1.0.md` is retained only as a historical redirect.

Since the 2026-09-27 owner "final closure" instruction, `docs/STONE-R6.2.2-CURRENT-MASTER-DECLARATION.md` is the authoritative five-layer routing map (L1 CORE ZI-PING / L2 STRUCTURAL PATCH / L3 TEMPORAL-EVENT / L4 EVIDENCE-AUXILIARY / L5 OPERATIONAL INFRASTRUCTURE) for where each governance document and runtime file sits, and `docs/STONE-R6.2.2-SIX-PATCHES.md` is a mandatory ACTIVE RUNTIME PATCH (GF-13 extension, ODL→FC→CAPACITY, time-layer evidence gap, data evidence boundary, event-chain separation, annual mechanism independence + VAL-C retroactive downgrade) bound to runtime via `src/lib/bazi/six-patches-instruction.ts`. Both refine L2/L3/L4 governance in place; neither rewrites L1 deterministic chart truth.

Mandatory interpretation boundaries:

1. Zi Ping Bazi remains the primary structural judgement system.
2. Zi Wei Dou Shu is an independent phenomenon / life-scene validation layer and must follow `docs/ZIWEI-INTERPRETATION-GRAMMAR-v1.0.md`.
3. Zi Wei calculation truth and interpretation truth are separate. Calculation changes require deterministic tests, source profiles and provenance; interpretation material must never silently alter placements or Four-Transformation tables.
4. New metaphysics material follows `docs/ANALYSIS-INGESTION-POLICY.md` and must be classified as CALC_TRUTH, CLASSICAL_INTERPRETATION, MODERN_INTERPRETATION, OWNER_MATERIAL or QUARANTINE.
5. Serious claims cannot be produced from a single star, transformation, malefic or isolated annual signal. Medical diagnosis, death/lifespan claims and unsupported severity scoring remain prohibited.
6. Deterministic calculation happens first and once; report pages reuse the same engine snapshot/evidence trace. AI may synthesize or translate but must not recalculate the chart.
7. R6.2.2 is the current governance/evidence layer. Governance and deterministic runtime remain separate; Progressive Execution, Stage Checkpoint, No Silent Reinterpretation, evidence class, baseline, Tie Procedure, Regression Test and Governance Stop Rule are mandatory.
8. P2 is mandatory for branch relations, Ten-God functional state, dynamic tomb/storage logic, ODL/FC flow, symbolism and cross-system boundaries.
9. P3 is mandatory for 偏枯／病藥: no element-count diagnosis, special-pattern Gate first, six-state 偏枯 output, functional disease/remedy, ODL → FC, and no direct element-to-personality/disease/occupation or object-to-destiny mapping.
10. Every Bazi / metaphysics subgroup must inherit the canonical top-level mainline: data validation → special-pattern truth → month command → climate → roots/exposure → structure → PK-6 → pathology/remedy → ODL → FC → capacity → branch/tomb dynamics → dayun → annual trigger → LBX → event nature → kinship → month window → confidence/evidence → plain-language output. Timing hierarchy is 原局定結構 → 大運給場 → 流年觸發 → 流月縮窗; annual luck is not assigned a fixed “strongest force” status. EC-7 is mandatory: concentration is not a personality/direction/achievement verdict; double-strong conflict is not an automatic advantage; equilibrium is not element-count averaging; missing is not disease; mediation is conditional; lifestyle element symbolism cannot rewrite structure/useful-god/remedy/timing.

If an older prompt, document, issue or implementation conflicts with these boundaries, the newer canonical default wins only for the conflicting portion, subject to the safety and regression rules above.
