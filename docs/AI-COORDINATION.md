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

## 11. Evidence audit

Use audit when judging whether a requested change, fix, release, integration, or workflow state is actually true.

Evidence classes:

- **PROVEN** — current evidence directly supports the claim.
- **UNVERIFIED** — implementation or intent exists, but the relevant current state was not observed.
- **BLOCKED** — a concrete external/permission/dependency blocker prevents the required evidence or action.
- **REGRESSION** — newer evidence contradicts a previously proven state.

Audit rules:

1. Require evidence that is temporally relevant to the claim. Evidence from before the change cannot prove the change.
2. Prefer direct state over narrative: current `main`/file contents, the target service state, and real runtime state when runtime is in scope.
3. A PR body, issue comment, generated handoff, commit message, another agent's summary, or "checks expected to pass" is context, not proof.
4. Do not manufacture evidence by re-running broad suites that the owner has disabled or made non-required. Follow `AGENTS.md` §7 and use the smallest evidence source that answers the question.
5. Do not downgrade a working task to "incomplete" merely because a non-required check is red, skipped, absent, or stale.
6. When a claim cannot be verified with available access, report **UNVERIFIED** or **BLOCKED** rather than filling the gap with inference.

## 12. Link protocol — pointer, not copy

`docs/SOURCE-INDEX.md` is the reusable source map. It is intentionally pointer-only.

Add a link entry only when a source is expected to be reused across tasks and has clear authority or reference value. Each entry records:

- canonical name;
- authority level;
- purpose/scope;
- canonical location;
- freshness or re-check rule;
- supersession note when needed.

Rules:

1. Do not paste mirrored copies of source documents into the index.
2. Do not create a second instruction registry, second current-state document, second memory store, or second product truth.
3. Never store API keys, cookies, tokens, passwords, private credentials, sensitive customer data, or unnecessary personal data.
4. If a linked source conflicts with the owner's latest explicit instruction or `AGENTS.md`, the linked source loses.
5. Temporary research links belong in task notes unless they become durable project references.
6. External projects such as AI-Partner may be registered as **reference only** and never become runtime or instruction authority by implication.

## 13. Weekly level-up rule

Level-up is a restraint mechanism, not a feature generator.

At most once in a seven-day period, an agent may nominate **one** workflow improvement when all are true:

1. the friction is evidenced by repeated manual work, repeated defects, duplicated paths, unnecessary verification, stale authority, or avoidable cost;
2. the proposed improvement reduces steps, ambiguity, failure modes, cost, or maintenance burden;
3. it does not expand the active task's scope;
4. it does not add a paid plan, new production host, parallel database, runtime SaaS dependency, or another agent framework;
5. it has a clear acceptance condition.

Default handling:

- If the improvement is part of the owner's current task, implement it within the declared scope.
- If it is unrelated, add one concise item to the existing Backlog / `NEW_BACKLOG`; do not open a cascade of follow-up tasks.
- Prefer **remove → merge → clarify → automate** in that order.
- If no material improvement is justified, do nothing.

The objective is a smaller, more legible operating system for ZHAOWU — not a larger automation stack.

