# REPORT VISUALS

Phase 1 mother-image paths are intentionally deterministic and optional at runtime.

Expected directories:

- `day-master/` — `jia-wood.webp`, `yi-wood.webp`, `bing-fire.webp`, `ding-fire.webp`, `wu-earth.webp`, `ji-earth.webp`, `geng-metal.webp`, `xin-metal.webp`, `ren-water.webp`, `gui-water.webp`
- `month/` — `yin-spring.webp`, `mao-spring.webp`, `chen-spring.webp`, `si-summer.webp`, `wu-summer.webp`, `wei-summer.webp`, `shen-autumn.webp`, `you-autumn.webp`, `xu-autumn.webp`, `hai-winter.webp`, `zi-winter.webp`, `chou-winter.webp`

Until a mother image exists, the UI falls back to `/wallpaper-song.jpg`. Missing art must never block report text or charts.

Artwork files contain no customer-facing report text. All titles, descriptions, labels and watermarking are rendered by the frontend.
