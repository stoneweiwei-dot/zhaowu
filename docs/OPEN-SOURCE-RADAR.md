# Stone Open Source Radar

Checked: 2026-10-07 (Australia/Sydney)

Purpose: track useful public GitHub projects that may improve ZHAOWU or Stone's AI workflow **without turning the repository into a dependency dump**.

This file is a decision index, not an installation manifest. External code does not enter ZHAOWU production unless a later task explicitly proves need, licence compatibility, security, cost, maintenance, mobile/workflow fit, rollback and a smaller alternative cannot solve the same problem.

## Decision scale

- **KEEP / EXISTING** — already appropriate in the current stack.
- **USE STANDALONE** — potentially useful as a separate tool; do not embed into ZHAOWU runtime.
- **ABSORB METHOD** — copy the workflow/design idea, not the project/runtime.
- **WATCH** — promising, but no current need justifies integration.
- **HOLD** — current licensing/security/maintenance/fit risk blocks adoption.
- **REJECT CURRENTLY** — duplicate, over-heavy, archived, or incompatible with current constraints.

## Priority shortlist

1. **OpenHands/OpenHands** — USE STANDALONE / ABSORB METHOD  
   High-value agent control-center patterns; active, MIT. Could orchestrate coding agents on a server, but this duplicates capabilities already available through ChatGPT/Claude and adds hosting/ops. Do not embed.

2. **browser-use/browser-use** — ABSORB METHOD  
   Strong browser-agent patterns; active, MIT. Useful for resilient automation ideas, but ChatGPT Work/browser tooling already covers much of the use case. No runtime addition.

3. **browserbase/stagehand** — ABSORB METHOD / WATCH  
   Playwright-compatible AI browser actions; active, MIT. Relevant only when deterministic Playwright is too brittle for a concrete workflow. Avoid adding LLM/browser-service cost by default.

4. **n8n-io/n8n** — USE STANDALONE / WATCH  
   Very broad workflow automation and integrations. Valuable for future cross-app automations, but fair-code licensing and an always-on host make it unsuitable as a casual ZHAOWU dependency.

5. **activepieces/activepieces** — USE STANDALONE / WATCH  
   Strong AI/MCP automation ecosystem. Potentially simpler than n8n for selected workflows, but mixed licensing/packages require per-component review before reuse.

6. **mem0ai/mem0** — WATCH / ABSORB METHOD  
   Mature agent memory layer; active, Apache-2.0. Do not add now because ZHAOWU does not need a second memory truth. Revisit only for a concrete end-user persistent-memory feature.

7. **Mintplex-Labs/anything-llm** — USE STANDALONE / WATCH  
   Local-first document/agent workspace; active, MIT. Good standalone product, but largely duplicates ChatGPT + connected sources for Stone's current workflow.

8. **khoj-ai/khoj** — USE STANDALONE / WATCH  
   Self-hosted second-brain/automation product with phone access. AGPL-3.0; avoid embedding. Only consider as a separate service if a real gap appears.

9. **louislam/uptime-kuma** — WATCH  
   Excellent MIT uptime monitor. Requires an always-on host, so it does not fit the present A$0/serverless posture unless an existing free host can run it without becoming a production dependency.

10. **GoogleChrome/lighthouse** — KEEP / ON-DEMAND  
    Mature Apache-2.0 web audit tool. Use manually for a concrete performance/accessibility investigation; do not restore broad mandatory CI.

## Coding agents

- **Aider-AI/aider** — ABSORB METHOD / USE STANDALONE. Apache-2.0, mature, terminal-centric; poor fit for iPhone/iPad-first operation.
- **cline/cline** — USE STANDALONE / WATCH. Apache-2.0, active; IDE/CLI focus duplicates existing coding-agent access.
- **aaif-goose/goose** — USE STANDALONE / WATCH. Apache-2.0, active, MCP-friendly; still desktop/CLI-first.
- **SWE-agent/SWE-agent** — ABSORB METHOD. MIT; useful issue→fix/evidence patterns, but no need for another autonomous coding runtime.
- **continuedev/continue** — REJECT CURRENTLY. Repository states it is no longer actively maintained/read-only.
- **RooCodeInc/Roo-Code** — REJECT CURRENTLY. Archived/read-only since 2026-05-15.

## Knowledge / memory / RAG

- **letta-ai/letta** — WATCH. Apache-2.0 stateful-agent/memory architecture; active source has shifted to its newer codebase. No second memory system now.
- **infiniflow/ragflow** — REJECT CURRENTLY / WATCH LATER. Apache-2.0 and powerful, but far heavier than ZHAOWU needs.
- **Mintplex-Labs/anything-llm** — see priority shortlist.
- **mem0ai/mem0** — see priority shortlist.
- **khoj-ai/khoj** — see priority shortlist.

## Workflow automation

- **windmill-labs/windmill** — HOLD. Powerful developer workflow engine, but AGPLv3 and additional infrastructure are unnecessary for current needs.
- **triggerdotdev/trigger.dev** — WATCH. Apache-2.0 durable workflow platform; would add a new runtime/service layer. Use only for a proven background-job need that current stack cannot handle.
- **n8n-io/n8n** — see priority shortlist.
- **activepieces/activepieces** — see priority shortlist.

## Browser / QA

- **microsoft/playwright** — KEEP / EXISTING. Apache-2.0 and already part of ZHAOWU. This remains the deterministic default browser test/automation layer.
- **Skyvern-AI/skyvern** — HOLD. Active and capable, but AGPL-3.0, heavier, and duplicates browser-agent capabilities.
- **browser-use/browser-use** — see priority shortlist.
- **browserbase/stagehand** — see priority shortlist.
- **pa11y/pa11y** — WATCH / ON-DEMAND. LGPL-3.0. Useful for focused accessibility diagnostics, not a default release gate.
- **GoogleChrome/lighthouse** — see priority shortlist.

## Monitoring / operations

- **henrygd/beszel** — REJECT CURRENTLY. MIT and lightweight, but aimed at servers/containers; ZHAOWU production is Vercel serverless.
- **amir20/dozzle** — HOLD. MIT container log viewer, but irrelevant to the current hosting model and had multiple 2026 security advisories.
- **louislam/uptime-kuma** — see priority shortlist.

## Media / visual tools

- **Comfy-Org/ComfyUI** — USE STANDALONE / WATCH. GPL-3.0, extremely capable, but local GPU/desktop workflow is a poor fit for Stone's iPad/iPhone-first operation. Never embed casually.
- **browser-use/video-use** — WATCH. MIT, agent-driven video editing is relevant to social content, but still a separate Python workflow and not a website dependency.
- **FFmpeg/FFmpeg** — KEEP AS EXTERNAL TOOL / ABSORB CAPABILITY. Industry-standard media processing. Use behind a concrete media task; do not bundle a heavy binary into Vercel without need.
- **danielgatis/rembg** — HOLD. Useful MIT background-removal tool, but 2026 GitHub advisories include path traversal/SSRF/model-injection issues. Do not expose as a network service without a fresh patched-version security review.

## Current adoption rule

For any future GitHub repository Stone sends:

1. Identify the exact problem it solves.
2. Check current maintenance/archive state.
3. Check licence **for the actual files/packages to be reused**, not only repository marketing.
4. Check known security advisories and risky network/file capabilities.
5. Compare against features already available in ChatGPT, connected plugins, GitHub, Vercel, Supabase and current ZHAOWU code.
6. Prefer in this order: **use existing capability → absorb method → use standalone → integrate dependency**.
7. Integration requires an explicit task and rollback path. No automatic cloning/vendor/importing into `main`.
8. New runtime SaaS, server, database, production host or paid dependency still requires explicit owner approval under `AGENTS.md`.

## First-round conclusion

The scan does **not** justify installing 20–30 projects.

The highest-value result is a smaller toolset:
- keep Playwright and use Lighthouse only when needed;
- absorb browser-agent and issue-to-fix methods from Browser Use / Stagehand / SWE-agent;
- keep OpenHands, n8n and Activepieces as standalone candidates for a future concrete workflow;
- keep memory/RAG systems out until ZHAOWU has a real persistent-memory requirement;
- reject archived projects and avoid current security/licensing/hosting mismatches.

This radar should shrink the stack over time, not enlarge it.
