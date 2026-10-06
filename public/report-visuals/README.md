# REPORT VISUALS

The report artwork layer is deterministic and symbolic only. It never changes BaZi calculations, structure judgement, timing, paid-report text, or delivery state.

Seven lightweight grouped WebP assets are used so mobile clients do not have to request 27 separate mother images:

- `groups/day-0.webp` — 甲、乙、丙、丁、戊
- `groups/day-1.webp` — 己、庚、辛、壬、癸
- `groups/month-0.webp` — 寅、卯、辰
- `groups/month-1.webp` — 巳、午、未
- `groups/month-2.webp` — 申、酉、戌
- `groups/month-3.webp` — 亥、子、丑
- `groups/luck-0.webp` — 木、火、土、金、水

Every visible crop is locked to a 9:16 cell. The frontend registry selects the exact cell by an already-calculated visual key. Luck artwork uses only the first heavenly stem of the already-calculated GanZhi: 甲乙木、丙丁火、戊己土、庚辛金、壬癸水.

If an asset is missing or fails to load, the UI falls back to `/wallpaper-song.jpg`. Artwork failure must never block report text, charts, timing, payment flow, or report delivery.

Customer-facing titles, explanations, charts and `STONE 原創` watermarking remain frontend-rendered rather than embedded into these sprite files.


## QC lock (2026-10-06)

The runtime mother-art layer is now protected by `qc-manifest.json` and
`scripts/report-visual-qc.test.mjs`.

- The 10 heavenly-stem and 12 month-command full images were manually reviewed
  for face/head double exposure and obvious ghosting, and their exact Git blob
  SHA plus pixel dimensions are locked.
- Their current legacy full files are 480x854. They remain phone-safe but are
  below the preferred replacement target. Any changed replacement must be at
  least 1080px wide; the old sub-1080 exception applies only while the reviewed
  blob SHA is unchanged.
- The five older generic luck images are archived from runtime because visible
  face/head ghosting was found during QC. Timing views now reuse the exact
  reviewed heavenly-stem mother image selected from the calculated GanZhi.
- The image viewer always opens `fullImageUrl` first. Pinch zoom is capped by
  the loaded image's natural pixel width so the UI cannot magnify a low-resolution
  source beyond its native detail.
- Any pixel change to a reviewed runtime mother image fails CI until the QC
  manifest is deliberately updated after visual review.

Preferred replacement target: 1080x1920 or higher, approximately 9:16.
