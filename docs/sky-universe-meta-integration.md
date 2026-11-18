# Sydney-date Meta chart integration

Owner-supplied source: https://www.meta.ai/share/a/093716b2-d506-4aa4-99e5-63b0bb462ad1

The existing `/sky-events` page embeds the supplied solar-system animation from
`public/sky-universe/chart.html`. The JavaScript, styles and twelve WebP textures
are hosted with the site; Meta AI and third-party image servers are not runtime
dependencies. React/React DOM license text is retained beside the export.

`chart-context.js` is the date/language integration boundary. It anchors dates
to `Australia/Sydney`, schedules the next actual midnight (including 23/25-hour
days), refreshes after background/focus/pageshow, and translates DOM/canvas
labels into Traditional Chinese, Simplified Chinese or English. The timeline
retains offsets from the current Sydney day; Today resets to zero. The original
11 November 2026 illustration provides the schematic orbit reference, and each
calendar day advances that illustration. Sizes, distances and accelerated
trajectories remain artistic, not measured ephemeris positions.

The iframe is lazy-loaded. It reports ready after a usable canvas mounts;
script/canvas failure and missing startup messages show a localized fallback.
The parent accepts messages only from that iframe and the same origin.
Existing dated observations remain independent and retain their archive state.
Advancing the illustration date requires no scheduler, redeploy or paid call.

Regression checks: `node --import tsx --test scripts/meta-sky-integration.test.mjs
scripts/daily-sky-date.test.mjs scripts/sky-v2-publication.test.mjs`. Browser
coverage is in `e2e/sky-observation-brief.spec.ts`; run it against the intended
build when browser execution is available. A passing build or local date test
does not prove production or iPhone Safari behavior.

Release only after owner approval: one reviewed main merge, one deployment to
the existing `stone-zhaowu-official`, then check the production runtime SHA,
`/sky-events`, local asset responses and actual mobile controls. Rollback is a
revert of this task commit; there are no database or infrastructure changes.
