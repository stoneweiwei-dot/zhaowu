# ZW-WEB-2026.10.18 — Member password recovery

## Task

Restore email password recovery on `/member` for existing email/password visitor accounts.

## Changes

- Add a trilingual “Forgot password?” form that requests Supabase Auth recovery email and returns to the current site origin.
- Capture Supabase recovery tokens on `/member`, remove tokens from the address bar, and allow the visitor to set and confirm a new password.
- Preserve the existing sign-in, sign-up and owner-only authorization paths.
- Show an enumeration-safe confirmation message, so the UI does not reveal whether an email is registered.

## Verification

- `npm run check` — passed.
- `npm run build` — passed, including the required theme, guest-privacy and sacred-days prebuild checks.
- The browser-only Chromium case in the guest account suite was skipped because Chromium is not installed in this environment; all remaining cases in that suite passed.
- `git diff --check` — passed.

## Production dependency / limit

The reset redirect is `/member?mode=recovery` on the active site origin (`https://zhao-wu.com`). Supabase Auth must allow this URL in its redirect URL allowlist and have recovery email delivery configured. The available project tooling did not expose those settings; email delivery and actual redemption therefore remain an end-to-end production check, not something this code build alone proves.

## Release evidence

- PR #800: https://github.com/stoneweiwei-dot/zhaowu/pull/800
- Merge commit: `a08ef1d9151ce23afb76138b8e7f030a16fa3d9b`.
- Vercel Production deployment `dpl_EhW9of5o45tCfm7LnQAGHk8uPB6C`: READY, built from the same merge SHA. Inspector: https://vercel.com/stone-weiwei-5213s-projects/stone-zhaowu-official/EhW9of5o45tCfm7LnQAGHk8uPB6C
- Direct production verification on 2026-10-18: `https://zhao-wu.com/member` and `https://stone-zhaowu-official.vercel.app/member` both returned HTTP 200; the canonical page embeds the merge SHA, and its served member JavaScript includes the new “Forgot password?” / `忘記密碼` flow.
- Actual email delivery and recovery-link redemption were not exercised; see the production dependency above.
