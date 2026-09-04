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
