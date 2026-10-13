# Reference theme compositions — 2026-10-13

## Scope

The owner supplied eight visual references and rejected the previous shared form-first layout. The homepage now has four composition families: koi portals, dragon/lotus scroll, day/night flute, and comic preview. Artwork is separate from real text and controls. The existing birth/report/question flow opens from the homepage rather than filling the landing screen.

The owner theme catalog uses actual rendered Traditional Chinese homepage images in `public/theme-previews/`, including the default. Regenerate with a local production preview on port 4173 and `node scripts/render-theme-home-previews.mjs`; optionally set `CHROME_EXECUTABLE_PATH`. All service calls are intercepted. No live theme publishing or customer data is used to create previews.

The report guide has illustrated paper sections for existing answer/reason/risk/action fields. Calculation, entitlements, backend APIs and shared theme publishing are unchanged. Music/help/replay remain accessible below the landing composition.

## Evidence

- Production build and TypeScript: passed locally.
- Existing theme acceptance: 54 configurations (18 themes, Chinese mobile, English mobile, Chinese desktop). Initial run passed 52; two English page loads collided with local bundle rebuilding. Both passed on a stable rebuild; the affected four-theme, three-viewport/language rerun passed all 12.
- Four composition families: actual homepage CTA clicks reached the existing birth form and daily almanac.
- All 18 rendered Chinese landing pages were reviewed. Busy light-theme artwork needed a paper tint to keep title text readable. Mobile screenshots had no horizontal overflow or broken images.
- Theme catalog validates a rendered preview exists for every registered theme, including future additions.

## Fidelity limits

This is a composition rebuild, not a claim of pixel-identical reproduction of all eight references. New artwork is derived from the references, rather than extracted source layers. The opening storyboard/animation was not replaced. The decision report keeps actual question-specific fields and does not fabricate the reference image's three choice outcomes or life stages. Existing personalized report illustrations are retained.
