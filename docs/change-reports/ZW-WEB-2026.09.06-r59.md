# ZW-WEB-2026.09.06-r59

## Scope

Owner-console repair focused on the issue reproduced on iPhone: background-music upload stopped at 3%, and owner administration pages were visually over-expanded.

## Audio upload repair

- Replaced the heavy dual-output owner upload path with a mobile-first normalization path.
- MP3 input skips transcoding completely and uploads directly.
- Other common audio inputs are normalized once to MP3 128 kbps / 48 kHz / stereo.
- The FFmpeg loader now has two CDN providers and explicit load/start timeouts instead of waiting indefinitely at the old 3% loader stage.
- Storage upload now uses XMLHttpRequest upload progress and a 120-second upload timeout.
- A new track is activated only after storage and metadata writes succeed.
- Existing verified AAC background music remains valid; the player now honors each active asset's real MIME type so both legacy AAC and new MP3 tracks play correctly.
- No Vercel deployment is required when the owner changes tracks after this release.

## Owner console layout

- Added an owner-only compact management dashboard to `/account`.
- The dashboard groups Background Music, Homepage Backgrounds, Gallery, and Customer Reports into four clear management cards.
- Homepage-background and report sections are collapsed by default; only the group being managed is expanded.
- Existing owner permissions and report/background logic are unchanged.

## Gallery layout

- Owner Gallery no longer renders the entire image library as a permanently open wall.
- The image grid is inside a collapsed drawer by default.
- Opening the drawer renders images in batches of 18 with a Load more control.
- Upload remains immediately available above the collapsed drawer.

## Protected behavior

- Owner gating remains `user.isOwner` + authenticated session.
- Existing background-music activation RPC remains the authority for the active track.
- Existing r52 verified AAC fallback is preserved.
- Existing report, background, auth, multilingual and paid-report flows are not modified by this release.

## Verification required before Production

1. Deterministic contract tests.
2. TypeScript check.
3. Production Vite build.
4. iPhone Safari regression suite.
5. Fresh-main preflight before merge.
6. Production `githubCommitSha` must exactly match merged `main`.
7. Production `/`, `/login`, `/account`, `/gallery` must respond successfully.
8. Physical owner-device upload remains a real-device check and must not be claimed until Stone performs it.
