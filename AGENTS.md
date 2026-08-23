# ZHAOWU ABSOLUTE EXECUTION PROTOCOL

This file is the highest repository-level execution protocol for all work on **ZHAOWU / 昭梧**.

Repository: `stoneweiwei-dot/zhaowu`
Production project: `stone-zhaowu-official`
Production URL: `https://stone-zhaowu-official.vercel.app/`
Primary branch: `main`

## 1. No false completion

Never call a task "done", "fixed", "finished", "live", or equivalent unless the full production loop is complete.

Use these states precisely:

- **Analysed**: problem understood only.
- **Modified**: code/assets changed only.
- **Committed**: change exists in GitHub and has a real commit SHA.
- **Deployed**: the matching Vercel deployment is `READY`.
- **Live**: production alias points to that deployment/commit.
- **Verified**: the production URL/path and requested behavior were actually checked.

Only **Verified** may be reported as complete.

## 2. Mandatory preflight before every website task

Before changing anything, check the current truth:

1. Current `main` HEAD SHA.
2. Current contents of relevant files.
3. Recent related commits.
4. Existing implementation, assets, tests and duplicate/legacy paths.
5. Current Vercel production deployment and its GitHub commit SHA.
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
- report generation and nine-page report contracts
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

**source change -> GitHub main -> tests/build -> Vercel production -> production URL verification**

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

## 8. Vercel production verification

After a main commit:

1. Find the Vercel deployment for the exact commit SHA.
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

If tooling cannot visually render a behavior, say so explicitly and do not invent a visual PASS. In that case report the task as technically deployed but visually unverified until direct evidence exists.

## 10. Mobile first

For UI work, prioritize mobile widths around 390–430 px.

Check for:

- horizontal overflow
- clipped content
- blocked buttons
- non-clickable controls
- oversized art
- text/background contrast
- safe-area issues
- layering/z-index problems

## 11. Regression rule

Every fix must consider whether it breaks adjacent behavior.

At minimum, when relevant, check:

- home
- login/auth
- account/admin
- report output
- background system
- header/navigation
- language selector/copy
- mobile layout
- static assets

Fixing A by silently breaking B is a failed task.

## 12. No shortcuts / no clever evasions

Forbidden behaviors:

- reporting a generated patch as a completed website change
- saying permissions/tools are unavailable before actually checking
- saying "should work" as "works"
- stopping at problem discovery when the fix is within available tools
- skipping CI/production checks to save time or tokens
- asking the user to manually do work that the connected tools can perform safely
- hiding a failed build behind a long explanation
- relying on stale previous-state claims after the repository has changed

When a user reports "I cannot see it", "it is still wrong", "it is old", "it is blank", or equivalent, production evidence outranks model assumptions. Re-check production first.

## 13. Failure handling

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

## 14. Required completion report

For every website task, final status must include:

### Modification
`COMPLETE` / `INCOMPLETE`

### GitHub
Commit: `<SHA>`

### CI / Build
`PASS` / `FAIL`

### Vercel
`READY` / `ERROR` / `BUILDING`
Deployment: `<deployment id>`

### Production
Production commit: `<SHA>`

### Verification
List affected routes/assets as `PASS`, `FAIL`, or `NOT VISUALLY VERIFIED`.

### Final conclusion
Only one of:

- `✅ VERIFIED COMPLETE`
- `🟡 MODIFIED BUT NOT LIVE/VERIFIED`
- `❌ INCOMPLETE — BLOCKED BY: <exact reason>`

Never use ambiguous completion language.

## 15. Absolute rule

For ZHAOWU work, facts beat assumptions, production beats local state, and verification beats implementation.

If there is no production evidence, there is no completion claim.
