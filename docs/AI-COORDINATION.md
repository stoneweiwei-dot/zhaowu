# ZHAOWU Multi-Agent Coordination Lock

This file is the shared concurrency contract for **Stone + Claude/Claude Code + ChatGPT/Codex + any future coding agent**.

It supplements `AGENTS.md`, `COLLAB.md`, `docs/INSTRUCTION-REGISTRY.md`, and `docs/CURRENT-STATE.md`. If a conflict exists, `AGENTS.md` and the owner's latest explicit instruction remain higher authority.

## 1. One truth, no agent-to-agent chase

- GitHub `stoneweiwei-dot/zhaowu` is the only source-code truth.
- `main` is accepted integration state, not a shared scratchpad.
- Never treat another agent's unmerged branch, draft PR, generated instruction, or half-finished implementation as a new product requirement.
- A new commit on `main` is context to rebase/recheck against, **not permission to expand the active task**.

## 2. Mandatory branch isolation

Every coding task must use an agent-owned branch:

- Claude / Claude Code: `claude/<task-id>-<slug>`
- ChatGPT / Codex: `gpt/<task-id>-<slug>`
- Other agents: `<agent>/<task-id>-<slug>`

Agents must not share a working branch and must not push feature work directly to `main`.

## 3. Task lock

Before editing, declare exactly one active task with:

```
TASK:
OWNER: claude | gpt | other
STATUS: ACTIVE | PR | VERIFY | DONE | BLOCKED
BASE_MAIN_SHA:
SCOPE:
DO_NOT_TOUCH:
FILE_LOCKS:
ACCEPTANCE:
PR:
```

The declaration belongs in the task Issue or PR. If no Issue exists, put it in the PR body as soon as the PR is opened.

An ACTIVE task keeps its original acceptance criteria until DONE/BLOCKED or Stone explicitly changes that task.

## 4. File/module lock

Before editing, inspect open PRs and active task declarations.

- If another active agent owns the same file, directory, route, component, API, schema, or tightly coupled behavior, **do not edit it**.
- Stop and report the overlap.
- Parallel work is allowed only when scopes and file/module locks are independent.
- Shared infrastructure files such as `package.json`, lockfiles, global CSS, routing, auth, deployment config, Supabase schema, and central report/engine files are treated as overlapping unless independence is proven.

## 5. Scope freeze — stop the instruction cascade

While a task is ACTIVE/PR/VERIFY:

- New unrelated discoveries go to BACKLOG; do not implement them inside the active task.
- Do not "while here" refactor, redesign, clean up, or absorb another request.
- Do not rewrite the active task merely because another agent merged unrelated code.
- If Stone gives a new instruction that overlaps the active task, pause and classify it under `AGENTS.md` Section 0 before changing scope.
- A PR must solve its declared task only.

## 6. Integration sequence

Normal sequence:

`QUEUED → ACTIVE → PR → CI/REVIEW → MERGE → PRODUCTION VERIFY (runtime only) → DONE`

Rules:

- At most **2 ACTIVE coding tasks repository-wide**.
- At most **1 ACTIVE task per module/feature area**.
- Merge only one overlapping/runtime-sensitive PR at a time.
- After another PR merges, re-check the active PR against latest `main`; resolve conflicts without silently changing acceptance criteria.
- Runtime work is not DONE until the existing ZHAOWU production verification rules are satisfied.
- Docs/governance-only changes do not require a production deployment.

## 7. Handoff protocol

Every handoff must state only:

```
TASK:
OWNER:
STATUS:
BASE_MAIN_SHA:
BRANCH:
PR:
FILES_CHANGED:
LOCKS_HELD:
TESTS:
PRODUCTION:
NEXT_ACTION:
NEW_BACKLOG:
```

Do not hand off a stream of speculative next prompts. `NEXT_ACTION` must be one concrete continuation of the same task.

## 8. Claude ↔ ChatGPT division

Default, unless Stone explicitly assigns otherwise:

- **Claude / Claude Code:** primary implementation executor for an assigned coding task.
- **ChatGPT / Codex:** controller, requirements normalization, repository/PR/CI review, QA, production evidence, and implementation only for a separately locked independent task.
- **Stone:** product authority and final real-device acceptance where required.

This is not a capability ranking. It is a concurrency rule to prevent duplicate edits.

## 9. Stop conditions

An agent must stop writing code and report instead when:

1. another active task holds an overlapping lock;
2. the requested change depends on an unmerged PR owned by another agent;
3. latest `main` invalidates the task's assumptions;
4. scope expansion would be required to finish safely;
5. CI/production evidence contradicts the implementation;
6. the owner has not resolved two mutually exclusive active instructions.

## 10. Core principle

**Finish the locked task before starting the next one. Record new ideas; do not chase them. Branch isolation prevents Git conflicts; task + module locks prevent semantic conflicts.**
