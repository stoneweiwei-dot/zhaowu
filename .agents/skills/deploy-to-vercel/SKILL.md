---
name: deploy-to-vercel
description: Guarded ZHAOWU release workflow. Use only for explicit requests to publish, release or verify deployment to the existing production Vercel project.
license: MIT
metadata:
  source: vercel-labs/agent-skills
  source_commit: "1a2c79d4e6c4a2283dc2c614b6538cbe1ed5ca62"
  adaptation: zhaowu-single-production-no-preview
---

# Deploy to Vercel — ZHAOWU production guard

**This is an intentional safety adaptation, NOT the generic Vercel Labs deploy recipe.** Upstream defaults to preview deployments; ZHAOWU explicitly prohibits tool-branch previews, temporary deployments, extra hosts and test-by-deploy loops. Root `AGENTS.md` always wins.

## Preconditions
1. Confirm the owner actually requested this release. Installing a skill, committing docs, reviewing a PR or testing locally **does not** authorize deployment.
2. Read root `AGENTS.md`, `docs/AI-COORDINATION.md`, `docs/INSTRUCTION-REGISTRY.md`, `docs/CURRENT-STATE.md`, current `main`, task PR and latest production state.
3. Verify protected/auth/payment/report/data contracts remain stable and one vetted batch is approved. Identify the precise runtime-affecting commit and rollback SHA.
4. Use **only** Vercel project `stone-zhaowu-official`; canonical `https://zhao-wu.com/`. Never create a new project, temporary claim URL, Vercel preview, parallel production, or deploy from an agent branch.
5. Keep zero-cost constraints. Do not change the hosting plan or use new paid capabilities.

## Release
1. Complete targeted source checks and review. Follow existing branch/PR integration rules; avoid direct feature pushes to main.
2. Merge the vetted batch through approved GitHub workflow, check main commit, and allow exactly one intended Production deploy through the existing connected project.
3. Observe actual Vercel deployment target/status/commit and that the canonical alias resolves to it. `READY` alone is not enough.
4. Verify affected routes, assets and user flows on `https://zhao-wu.com/`; measure 320/390 px where the change is visual. Do not expose real user data or secrets.
5. If failed, inspect evidence, restore the known-safe release using the existing Production path rather than opening a second host.
6. Documentation/governance-only commits may be skipped by Vercel and must **not** be reported as stale runtime. Do not deploy such changes for appearance's sake.

## Completion
Report GitHub SHA, actual Production deployment ID, deployed runtime SHA, tested URLs and PASS/FAIL/UNVERIFIED. Only declare LIVE/VERIFIED on matching real production evidence; a PR or a successful build is not deployment.
