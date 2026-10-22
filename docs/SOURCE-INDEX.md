# ZHAOWU Canonical Source Index

Purpose: keep **pointers to authoritative or reusable sources** without copying their contents into a second knowledge base.

This file is governed by `AGENTS.md` and `docs/AI-COORDINATION.md`. It contains no secrets and is not a replacement for `docs/INSTRUCTION-REGISTRY.md` or `docs/CURRENT-STATE.md`.

## Authority order

For conflicting project behavior, use the precedence already defined in `AGENTS.md`:

**latest explicit owner instruction → current `main` / production truth → repository protocol + instruction registry + current contracts → older active docs/issues → stale chats/branches/deployments.**

## Canonical sources

### Source code
- Name: ZHAOWU repository
- Authority: PRIMARY — source code
- Scope: accepted implementation state
- Location: https://github.com/stoneweiwei-dot/zhaowu
- Canonical branch: `main`
- Freshness: inspect current `main` before implementation/status claims

### Execution protocol
- Name: `AGENTS.md`
- Authority: PRIMARY — repository execution governance
- Scope: all agents and website/project tasks
- Location: https://github.com/stoneweiwei-dot/zhaowu/blob/main/AGENTS.md
- Freshness: read current `main` before overlapping work

### Active instruction registry
- Name: `docs/INSTRUCTION-REGISTRY.md`
- Authority: PRIMARY — active/superseded owner instructions
- Scope: product behavior and instruction supersession
- Location: https://github.com/stoneweiwei-dot/zhaowu/blob/main/docs/INSTRUCTION-REGISTRY.md
- Freshness: read before changing an overlapping feature or workflow

### Current project state
- Name: `docs/CURRENT-STATE.md`
- Authority: PRIMARY — maintained project state and backlog context
- Scope: current architecture, known state, unresolved items
- Location: https://github.com/stoneweiwei-dot/zhaowu/blob/main/docs/CURRENT-STATE.md
- Freshness: re-check against current `main` and live services when the claim is runtime-sensitive

### Multi-agent coordination
- Name: `docs/AI-COORDINATION.md`
- Authority: PRIMARY — agent concurrency/workflow rules
- Scope: task locks, handoff, audit, link, weekly level-up
- Location: https://github.com/stoneweiwei-dot/zhaowu/blob/main/docs/AI-COORDINATION.md
- Freshness: read before agent implementation or handoff

### Production
- Name: Vercel `stone-zhaowu-official`
- Authority: PRIMARY — live runtime state
- Scope: only active production host
- Location: https://zhao-wu.com/
- Runtime release evidence: https://zhao-wu.com/release.json
- Freshness: inspect only when runtime/live status is in scope; docs/governance-only work does not require production verification

### Data/Auth/Storage
- Name: Supabase project `plgpxusmemnmzckbwtiv`
- Authority: PRIMARY — live database/storage state
- Scope: ZHAOWU database, storage and related service state
- Location: project identifier only; credentials are never stored here
- Freshness: query live state only when the task actually depends on Supabase

## External method references

### AI-Partner
- Name: Jaycheng1103/AI-Partner
- Authority: REFERENCE ONLY
- Scope: conceptual source for audit/link/level-up workflow patterns
- Location: https://github.com/Jaycheng1103/AI-Partner
- Imported behavior: methodology only; no package, runtime, memory store or framework dependency
- Supersession: ZHAOWU's own `AGENTS.md` and `docs/AI-COORDINATION.md` are authoritative

### Open-source adoption radar
- Name: `docs/OPEN-SOURCE-RADAR.md`
- Authority: REFERENCE — adoption decisions, not product/runtime truth
- Scope: external GitHub projects, licence/security/fit triage and adoption status
- Location: https://github.com/stoneweiwei-dot/zhaowu/blob/main/docs/OPEN-SOURCE-RADAR.md
- Freshness: re-check a project's current repository/licence/security state before any actual adoption

### 易經智慧精編講義（第二版）— 2026-10-20 owner upload
- Name: 《易經智慧精編講義（第二版）》— 校勘與入庫裁決
- Authority: REFERENCE ONLY — OWNER_MATERIAL / MODERN_INTERPRETATION; not classical or runtime truth
- Scope: Bazi／盲派教學的來源界線、形式錯盤負例與去重規則
- Location: [內部研究裁決](STONE-THEORY-LECTURE-V2-INGESTION-20261020.md); 原始 DOCX 為 2026-10-20 私人聊天附件，未在 repository 重製
- Test: `node --test docs/theory-audit/lecture-v2-audit.test.mjs`（僅檢核負面樣本，不是正式引擎測試）
- Rights: 來源明示未經許可不得轉載、改編、公開傳播或商用；作者／授權 UNKNOWN
- Freshness: 要公開再利用、修改判讀規則或宣稱案例應驗之前，重新取得合法來源、核對原始記錄並重跑主鏈／證據 Gate
- Supersession: R6.2.2 governance + R6.2.1 runtime + P2/P3 + 既有 12 組 TUC 優先；此來源不另立 active 盲派主判
