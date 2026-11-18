---
name: vercel-optimize
description: Read-only metrics-first Vercel cost, reliability and site performance analysis for ZHAOWU. Use for bandwidth, slow routes, failed requests, invocation counts, caching, quota or Vercel cost reviews.
license: MIT
metadata:
  source: vercel-labs/agent-skills
  source_commit: "1a2c79d4e6c4a2283dc2c614b6538cbe1ed5ca62"
  adaptation: zhaowu-observability-no-paid-features
---

# Vercel Optimize — ZHAOWU safe workflow

Adapted from Vercel Labs' observability-first approach. **This project-local edition deliberately does not bundle the upstream 156-file automation pipeline** and must not pretend it ran those scripts. Use available read-only Vercel metrics and GitHub code inspection.

## Non-negotiable project gates
- Read root `AGENTS.md` and the current coordination/state/registry contracts. Only project `stone-zhaowu-official` on `zhao-wu.com` is Production.
- Zero-cost posture: no Observability Plus purchase, billing upgrade, new account/project, analytics instrumentation, monitoring SaaS, preview deployment or paid experiment without separate owner authorization. Read-only data access only.
- No deployment, configuration changes, repo writes, cron setup, billing action, or credentials in this skill unless the owner separately and explicitly requests implementation.

## Audit sequence
1. Resolve the exact Vercel team/project using the available connected Vercel tools; verify it points to the current official repo and production hostname.
2. Collect **available** recent usage and reliability signals: function invocations/duration/errors, fast data transfer, static asset bytes, cache hit behavior, build minutes, deployment history, CWV and route-level metrics if the account exposes them. Record timeframe, data source, unit and availability.
3. If a paid metric is unavailable, mark `UNAVAILABLE` and use existing free telemetry/source evidence; never invent counts, silently assume paid access, or require a paid upgrade.
4. Compare costs/symptoms to actual traffic and route patterns; do not judge from one slow anecdote. Investigate only implicated files (Vite build, asset strategy, Vercel config, `/api` routes, `/sb` proxy, music stream) and distinguish runtime/data/third-party bottlenecks.
5. Rank fixes by measured impact, risk and implementation scope. Explicitly inspect caching/privacy of paid/auth/owner endpoints before recommending any edge cache change.
6. Record a narrow action plan. Implementation and production deployment are separate locked tasks, not implicit audit steps.

## Report
For each item: `signal → evidence/time window → source or file → impact → safe recommendation → confidence`. If no reliable metrics are accessible, state "code-only inspection; cost/traffic impact unverified."
