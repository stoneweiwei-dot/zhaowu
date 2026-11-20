# ZW-WEB-2026.09.01-r23 — Auth callback cleanup

Status: pending production verification until PR merge and Vercel Production READY.

## Problem
New Google OAuth users and some email-confirmation users could return to the site with Supabase access/refresh tokens left in the URL hash/query. To customers this appeared as a long string of unreadable text after signup. Google/Apple login also supplied `/login` as a relative OAuth redirect target instead of relying on the canonical absolute site callback.

## Change
- `src/lib/auth/provider.tsx`: capture Supabase OAuth/email-confirmation callbacks at the app root before restoring local session state. This lets callbacks landing on any allowed site URL be consumed and cleaned.
- `src/routes/login.tsx`: call `startOAuth(provider)` so `supabase-rest.ts` builds the canonical absolute `${window.location.origin}/login` redirect target; callback errors are caught instead of becoming an unhandled promise rejection.
- `scripts/auth-callback.test.mjs`: regression contract for absolute OAuth callback use, global callback capture, and URL token cleanup.

## Security / UX effect
Sensitive `access_token` / `refresh_token` values are consumed and then removed with `history.replaceState`, so they should not remain visible in the address bar after successful callback processing.

## Not changed
No BaZi, Palm, Zi Wei, report calculation, payment, Gallery, image-generation, database schema, RLS, or pricing logic changed.

## Acceptance
1. Google login uses an absolute production `/login` callback.
2. Google callback session is restored and token hash/query is removed from the visible URL.
3. Email confirmation landing on `/` or another allowed site route is captured globally rather than leaving token text visible.
4. Email/password sign-in remains functional.
5. iPhone Safari regression remains green.
6. Production deployment SHA must equal the merged main SHA before this release is recorded in Supabase `release_history`.
