TASK: Member sign-in, sign-up and password-reset feedback
OWNER: gpt
STATUS: VALIDATED LOCALLY — Production pending
BASE_MAIN_SHA: 35baa8d4bf0a636f4c83f24db059f9e1da5383b8
SCOPE: explicit localized member-form validation and bounded visitor-auth requests
DO_NOT_TOUCH: owner/tester roles, PR #817 owner auth, payments, Bazi/Jyotish calculations, schema, global skins
FILE_LOCKS: src/routes/member.tsx; src/lib/auth/visitor.ts; src/lib/auth/member-form.ts; src/lib/auth/request-timeout.ts; visitor auth request sections of src/lib/supabase-rest.ts
ACCEPTANCE: empty/invalid fields produce persistent localized alerts; valid requests show busy state; failed/timed-out requests release busy and show feedback; recovery success remains non-enumerating; preserve language/session contracts
PR: pending

## Evidence and verification

- Production empty-form submit was blocked by native validation with no persistent role=alert. The page already contained backend error/status strings, so the report's blanket “no feedback anywhere” claim is not treated as proven.
- Add noValidate plus explicit email/password/confirmation checks, a focused persistent alert and visible busy status. Preserve non-enumerating recovery success text and existing account/session roles.
- Bound visitor signup/signin/recovery/password-update and saved-session refresh fetches to 15 seconds using AbortController, including response-body consumption. Aborts map to the existing localized network feedback.
- npm run check and npm run build passed. Prebuild: themes 16/16, privacy 12 pass + 1 browser skip (missing /bin/chromium), sacred days 9/9.
- New tests cover real request-wrapper behavior with synthetic fetch responses: bad credentials, signup validation, recovery callback, abort mapping, saved session/change event and logout language retention. No account or email is created/sent by tests.
- Public-changelog addition is a separate entry after #815; PR #817's pending owner-auth entry is not overwritten. Other open PRs are not merged or modified.
- Full Production credentials, registration/email delivery and 390px browser layout have not been exercised. Production verification will use empty-field validation only, without credentials or mail.
- Rollback: revert this isolated PR. No data/schema migration, paid dependency or permission change.
