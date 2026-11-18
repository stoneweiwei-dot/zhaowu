# ZHAOWU Project Agent Skills

The seven project-scoped Agent Skills are under `.agents/skills/<name>/SKILL.md`. For Claude Code, `.claude/skills/<name>` is a relative symlink to the same skill directory; this avoids a divergent copy. Codex and other Universal-compatible agents use `.agents/skills`. Nothing is installed globally or in production dependencies.

## Installed skill map

| Skill | Trigger | Source / adaptation |
| --- | --- | --- |
| `find-skills` | discover/install/update skills | `vercel-labs/skills`; security and project branch checks |
| `react-best-practices` | React/Vite performance and render audit | Vercel React rulebook bundled as on-demand reference |
| `web-design-guidelines` | responsive, a11y and Song UI audit | Vercel guidelines local snapshot + ZHAOWU theme contracts |
| `vercel-optimize` | Vercel metrics/cost/route analysis | locally adapted read-only metrics workflow; upstream script pipeline not bundled |
| `composition-patterns` | scoped React component composition | Vercel composition rulebook bundled as on-demand reference |
| `deploy-to-vercel` | **explicit** production release request only | project safety replacement; never generic preview/temporary deploy |
| `writing-guidelines` | docs/editorial/three-language review | Vercel writing checklist local snapshot + ZHAOWU style |

## Governance and precedence

1. Read `AGENTS.md`, `docs/AI-COORDINATION.md`, `COLLAB.md`, `docs/INSTRUCTION-REGISTRY.md`, `docs/CURRENT-STATE.md` before task execution. They take precedence over bundled upstream references.
2. Skills are reusable instructions only; no production runtime dependency, new npm dependency, external account entitlement, or new SaaS is created by these files.
3. Do not auto-run the `deploy-to-vercel` skill during development, audits, PR creation, docs-only merges or skill installation. ZHAOWU forbids preview deployments.
4. Where upstream instructions disagree with the single-production, zero-waste, protected data or multi-agent-lock contracts, use this repository's instructions. If an upstream rule cannot safely apply to React/Vite, skip it with explanation.
5. These are **project-local adaptations**, not an unmodified official `npx skills add` installation. The Vercel React and composition full-rulebook snapshots and UI/writing rule snapshots are bundled. The massive `vercel-optimize` executable automation pipeline is intentionally not included.
6. To update: inspect the official upstream commit and license, obtain a separate scoped branch/PR, test skill paths/frontmatter and review all changes. Do not blindly run `npx skills update` or install globally.

## Validation checklist

- Seven `SKILL.md` files exist, with matching `name` frontmatter and nonempty descriptions.
- Claude symlink paths resolve to canonical `.agents/skills/<name>` directories.
- React, composition, web-design and writing skills have the reference files they point to.
- Deployment guard explicitly prohibits preview and temporary deployments; all skills defer to root `AGENTS.md`.
- Repository runtime/application/build/payment/auth/Supabase config is unchanged.
- Agent auto-discovery in a real Codex/Claude session requires a separate session check. A tracked skill file alone does not prove agent runtime activation.

Sources:
- CLI: https://github.com/vercel-labs/skills/tree/9197d919034d19010ae303cf96bf19ad087dd4be
- Official skills: https://github.com/vercel-labs/agent-skills/tree/1a2c79d4e6c4a2283dc2c614b6538cbe1ed5ca62

