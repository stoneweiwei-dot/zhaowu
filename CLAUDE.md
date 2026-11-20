# CLAUDE.md — ZHAOWU entry contract

Claude / Claude Code must read and obey these files **before editing**:

1. `AGENTS.md`
2. `docs/AI-COORDINATION.md`
3. `COLLAB.md`
4. `docs/INSTRUCTION-REGISTRY.md`
5. `docs/CURRENT-STATE.md`
6. task-specific contracts/tests

## Claude-specific mandatory rules

- Use only `claude/<task-id>-<slug>` branches for implementation.
- Never push feature work directly to `main`.
- Before editing, inspect open PRs/tasks for ChatGPT/Codex or other agent locks.
- Declare TASK / OWNER / BASE_MAIN_SHA / SCOPE / DO_NOT_TOUCH / FILE_LOCKS / ACCEPTANCE.
- If an overlapping lock exists, stop; do not "helpfully" rewrite the same module.
- Do not use another agent's unfinished branch or PR as a product requirement.
- New unrelated findings go to BACKLOG. Finish the current acceptance criteria first.
- Do not expand a PR because `main` moved; rebase/recheck and preserve scope.
- Do not merge or begin the next overlapping task until required CI/review/verification for the current task is complete.
- Existing ZHAOWU rules on single production, zero deployment churn, protected core logic, and no false completion remain unchanged.

Default role: **primary implementation executor for the task Stone assigned to Claude**. ChatGPT may concurrently review/QA or implement a separately locked independent task.

If any instruction from chat conflicts with repository governance, apply the precedence rules in `AGENTS.md`; do not silently improvise.
