---
name: composition-patterns
description: Targeted React 19 component architecture review for ZHAOWU. Use for boolean prop proliferation, component reuse, compound components, prop drilling and state boundary refactors.
license: MIT
metadata:
  source: vercel-labs/agent-skills
  source_commit: "1a2c79d4e6c4a2283dc2c614b6538cbe1ed5ca62"
  adaptation: zhaowu-react-19
---

# React Composition Patterns — ZHAOWU

The expanded Vercel composition rules and examples are in [references/full-rulebook.md](references/full-rulebook.md). Read only the relevant sections for the component in scope.

## Process
1. Read root `AGENTS.md`, `docs/AI-COORDINATION.md`, current state and active PR/file locks. Scope is the specific component(s) the owner approved.
2. Identify the actual code smell: repeated boolean flags, impossible prop combinations, mixed state/visual responsibilities, duplicated variants, or hard-to-test coupling. Do not perform speculative architecture cleanup.
3. Prefer explicit variants, children composition, compound components where useful, and a clear state/context interface. Keep context narrowly scoped; do not proliferate providers merely for style.
4. Use React 19 semantics (including ref as prop where appropriate); do not introduce obsolete patterns or Next.js-specific architecture into the Vite/TanStack Router app.
5. Preserve public component contracts, owner permissions, free/paid visibility, reporting and i18n behavior. Keep SSR/hydration and accessibility correct.
6. Add or adapt focused checks and compare the actual user-facing state/behavior before and after the refactor.

## Output
Provide precise files/lines, rationale, smallest patch, focused tests and remaining risks. A generic desire for "clean code" does not justify moving unrelated route/state logic.
