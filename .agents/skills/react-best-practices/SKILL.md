---
name: react-best-practices
description: React 19 and Vite performance review and targeted optimization for ZHAOWU. Use for slow pages, bundle size, data loading, expensive renders, and React performance work.
license: MIT
metadata:
  source: vercel-labs/agent-skills
  source_commit: "1a2c79d4e6c4a2283dc2c614b6538cbe1ed5ca62"
  adaptation: zhaowu-react-vite
---

# React Best Practices — ZHAOWU

The upstream expanded Vercel React rules are available in [references/full-rulebook.md](references/full-rulebook.md), loaded only for relevant rule families. This repository uses **Vite 7, React 19 and TanStack Router**, not Next.js. Ignore framework-specific Next.js examples unless proven applicable.

## Trigger and preflight
When the owner requests React implementation/performance review, first read root `AGENTS.md`, coordination/state/registry docs, active PR locks, and the affected route. Establish a reproducible bottleneck or explicit feature scope. Do not launch a repo-wide rewrite, refactor protected logic, or run unrelated disabled CI suites.

## Procedure
1. Record baseline from the affected route or bundle: network waterfall, JS/CSS bytes, LCP/INP/CLS, memory or render profiles **if actually available**. Distinguish measured metrics from suspected issues.
2. Check the critical path: eliminate sequential awaits when independent; cache/dedupe repeated client fetches without weakening auth, permissions or data freshness.
3. Reduce JS loaded before interaction: route-level lazy imports, dynamic imports for heavyweight optional features, careful `Suspense` boundaries, no new unapproved CDN or SaaS. Measure visual and interaction effects.
4. Avoid unneeded render churn: stable state boundaries, derived values rather than redundant effects, use callback/updater patterns where justified, never add memoization without a measured or credible reason.
5. Preserve server/client boundaries, payment entitlement checks, Supabase auth, hydration consistency, local data privacy, three languages and image quality.
6. Compare affected measurements with baseline and run focused tests/check/build only when required for the concrete modification. Mobile 320/390/430 px and iPhone Safari matter for user-facing changes.

## Output
Give file:line findings with severity, evidence, exact intended change and verification. Do not claim an improvement without before/after measurements; do not claim production completion from a branch.
