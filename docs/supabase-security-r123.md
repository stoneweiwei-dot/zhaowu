# Supabase security close-out｜r123

Project: `plgpxusmemnmzckbwtiv`. This file is the owner-dashboard checklist. Repo source control cannot toggle Auth settings or revoke live EXECUTE grants.

## 1. `get_customer_classic_passage()`

- Live reports historically called this RPC for classic passage copy.
- **If** the public site still needs it for guest readings: keep EXECUTE for `anon` / `authenticated`, document it as a **public read RPC** that must remain `SECURITY DEFINER` with a fixed `search_path` (`public` only, no user-writable schemas), and must not accept unrestricted SQL / table names.
- **If** current `main` no longer calls it: revoke EXECUTE from `anon` and `authenticated`, keep EXECUTE for `service_role` / owner, then re-check Security Advisor.
- Do not drop the function in this close-out; dropping it can fail saved-report rendering.

Owner action: Dashboard → Database → Functions → `get_customer_classic_passage` → Grants + Function definition (`search_path`).

## 2. Leaked-password protection

Enable Auth → Attack Protection → **Leaked password protection** (HaveIBeenPwned). Owner-only Email login still benefits; ordinary users have no signup path.

## 3. Edge Functions inventory (repo = intended live set)

In GitHub `supabase/functions/` on this release:

| Function | Status |
|---|---|
| `gallery-ingest-finalize` | live, keep |
| `gallery-pixel-audit` | live, keep |
| `gallery-pixel-audit-batch-runner` | live, keep |
| `gallery-vision-audit` | live, keep |
| `generate-decree-image` | live, keep |
| `prepare-paid-visual` | live, keep; paid visual PR #295 remains paused, this function must not be bulk-deleted |
| `site-guide` | live, keep |
| `view-decree-image` | live, keep |

No `temp-*`, `*-once`, probe, import, or diagnostic function exists in GitHub source.

Owner action: Dashboard → Edge Functions. Undeploy any live name that is **not** in the table and matches `temp-*` / `*-once` / probe / import / diagnostic. **Do not** bulk-delete Gallery, report image, or site-guide functions.

## 4. Out of scope here

Schema, RLS policies, and paid-visual wiring are unchanged in r123. New high-risk Security Advisor items after the dashboard pass should be recorded in CURRENT-STATE, not silently ignored.
