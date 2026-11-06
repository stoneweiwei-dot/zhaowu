---
name: web-design-guidelines
description: Audit ZHAOWU web UI, accessibility, responsive design and theme consistency. Use for UI reviews, design bugs, mobile layout, contrast, forms and usability checks.
license: MIT
metadata:
  source: vercel-labs/agent-skills
  source_commit: "1a2c79d4e6c4a2283dc2c614b6538cbe1ed5ca62"
  adaptation: zhaowu-song-ui
---

# Web Design Guidelines — ZHAOWU

Use the locally available complete checklist in [references/web-interface-guidelines.md](references/web-interface-guidelines.md). Refresh from upstream `https://raw.githubusercontent.com/vercel-labs/web-interface-guidelines/main/command.md` only when source freshness affects the task; do not silently overwrite this snapshot.

## Workflow
1. Read root `AGENTS.md`, `docs/AI-COORDINATION.md`, registry/state, `docs/ZHAOWU-SONG-AESTHETIC-FRAMEWORK.md` and task-specific UI/artwork contracts. Their explicit design decisions outrank generic Vercel styling.
2. Inspect only requested components/screens and their direct styles. Identify real findings in `file:line` form; do not invent a screenshot result.
3. Verify semantic HTML, keyboard focus, tap targets, form labeling/error states, legible text, images/alt, contrast and reduced-motion behavior.
4. Check 320/390/430 px plus desktop where feasible; avoid horizontal scrolling and obscured controls. Test zh-TW / zh-Hans / en copy lengths, RTL only where actually supported, and proper locale formatting.
5. Theme integration means matching artwork, icons, section details, cards, whitespace and mobile layout; **not** merely inserting a background image. Preserve distinct artwork character, Song visual system and accepted source assets. Do not make geometric SVG posters masquerade as paintings.
6. If asked to fix, lock the narrowest files, change safely, and validate actual UI rendering; preserve owner/admin, Supabase, payment, chart/report engine and the single-production workflow.

## Deliver
Prioritize user-blocking issues over cosmetic preferences; separate observed FAIL, code-based risk and unverified visual claims. No routine previews or production deployment for an audit.
