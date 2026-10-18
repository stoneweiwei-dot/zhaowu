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

To be completed after the branch is reviewed and merged: PR/merge commit, Vercel Production deployment SHA and direct verification of `/member`.
