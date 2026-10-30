# Mythic Atlas / 怪力亂神 web derivatives — 2026-10-30 (⛰️ 土曜)

Status: **Modified + Committed on branch `tudo/gallery-web-derivatives-20261030` — NOT deployed, NOT verified live.**

## Why
`/mythic-atlas` and `/guaili-luanshen` served the 941×1672 STONE original PNGs (3.2–4.4 MB each) and a
44 MB 1080p MP4 directly to phones. This change adds web-sized derivatives and points only the
**display** `<img>`/`poster`/first `<source>` at them. The originals are untouched (byte-identical; their
SHA-256 values are still checked by `scripts/huangquan-original-media.test.mjs`) and remain the
"open full-resolution original" link target, so rollback is a one-commit revert.

## Mapping (pure asset-path change)
| Original (unchanged, still linked) | Rendered now |
|---|---|
| `/mythic-atlas/originals/<name>.png` (plate) | `/mythic-atlas/web/originals/<name>.webp` |
| `/mythic-atlas/originals/<name>.png` (contents thumbnail, 94px) | `/mythic-atlas/web/originals/<name>-thumb.webp` |
| `/mythic-atlas/zodiac/<name>.png` (`/mythic-atlas#guaili`, `/guaili-luanshen`) | `/mythic-atlas/web/zodiac/<name>.webp` |
| video poster `/mythic-atlas/originals/01-skeleton-puppet.png` (3.77 MB) | `/mythic-atlas/web/films/huangquan-chronicles-poster.webp` |
| `/mythic-atlas/films/huangquan-chronicles.mp4` (42.1 MB) | first `<source>`: `/mythic-atlas/web/films/huangquan-chronicles-720p.mp4`; the original stays as the second `<source>` fallback |

Paths are built by `src/lib/mythic-web-assets.ts` (`mythicWebPlate`, `mythicWebThumb`, `MYTHIC_WEB_FILM`,
`MYTHIC_WEB_FILM_POSTER`). Not touched: header logo (木曜), `painted-home.tsx`, the older hand-named
WebPs in `originals/` (`01-skeleton-puppet.webp`, `07-mountain-sea-bestiary.webp`, used by home / guaili cover).

## Sizes
| folder | original PNG | original size | web WebP (941w q80) | thumb (240w q75) | saving | webp sha256[:16] |
|---|---|---:|---:|---:|---:|---|
| originals | `01-skeleton-puppet.png` | 3.59 MB | 402 KB | 21 KB | 89% | `a8bb355b7c75a362` |
| originals | `02-t-shaped-silk.png` | 3.54 MB | 388 KB | 24 KB | 89% | `b835c67a581a3cc0` |
| originals | `03-celestial-court.png` | 3.58 MB | 398 KB | 27 KB | 89% | `33695f79bb97234d` |
| originals | `04-guan-yu-captive.png` | 3.68 MB | 447 KB | 30 KB | 88% | `fa07b9954ac4e511` |
| originals | `05-ten-kings.png` | 3.45 MB | 384 KB | 25 KB | 89% | `df0da05d13d23ca0` |
| originals | `06-nine-dragons.png` | 3.69 MB | 419 KB | 32 KB | 89% | `785f578e35021830` |
| originals | `07-shanhaijing-atlas.png` | 4.15 MB | 538 KB | 34 KB | 87% | `87b16b27a64b2147` |
| originals | `08-ghostly-amusements.png` | 3.47 MB | 358 KB | 24 KB | 90% | `617591c6c9c75605` |
| originals | `09-uncovering-the-bowl.png` | 3.68 MB | 432 KB | 27 KB | 89% | `b6f58df97547b788` |
| originals | `10-coastal-invasion.png` | 3.74 MB | 439 KB | 28 KB | 89% | `09b1adf0a3bfa6ce` |
| originals | `11-searching-the-mountain.png` | 4.03 MB | 501 KB | 31 KB | 88% | `4463e36c4e2e37d3` |
| originals | `12-five-planets-28-mansions.png` | 3.43 MB | 363 KB | 26 KB | 90% | `2b36e65286e41964` |
| zodiac | `01-zi-rat.png` | 3.01 MB | 270 KB | 20 KB | 91% | `2e3255c03ae75b1f` |
| zodiac | `02-chou-ox.png` | 3.21 MB | 336 KB | 26 KB | 90% | `761d4383def269a4` |
| zodiac | `03-yin-tiger.png` | 3.26 MB | 347 KB | 28 KB | 90% | `6e2f4837a85fb4b9` |
| zodiac | `04-mao-rabbit.png` | 3.16 MB | 314 KB | 25 KB | 90% | `002f824d07b6938a` |
| zodiac | `05-chen-dragon.png` | 3.30 MB | 352 KB | 27 KB | 90% | `eb109089b8b18807` |
| zodiac | `06-si-snake.png` | 3.14 MB | 318 KB | 25 KB | 90% | `e6ffa03f2800c667` |
| zodiac | `07-wu-horse.png` | 3.21 MB | 351 KB | 28 KB | 89% | `a771034ab82178c6` |
| zodiac | `08-wei-sheep.png` | 3.18 MB | 336 KB | 27 KB | 90% | `1580bb1e04edf708` |
| zodiac | `09-shen-monkey.png` | 3.35 MB | 379 KB | 30 KB | 89% | `e3662989e24581e9` |
| zodiac | `10-you-rooster.png` | 3.30 MB | 379 KB | 30 KB | 89% | `21682840c78c84ec` |
| zodiac | `11-xu-dog.png` | 3.15 MB | 332 KB | 27 KB | 90% | `2cf09e6e1a63e184` |
| zodiac | `12-hai-boar.png` | 3.25 MB | 348 KB | 28 KB | 90% | `332ee444de27da18` |
| **total (24)** | | **82.54 MB** | **8.92 MB** | **651 KB** | **89.2%** | |
| Film asset | Before | After | Saving |
|---|---:|---:|---:|
| MP4 (1080×1920, 12.8 Mbps, 27.6 s, no audio) → 720×1280 H.264 High CRF 24, maxrate 3M, `+faststart` | 42.11 MB | 6.08 MB | 85.6% |
| Poster PNG → WebP 720×1280 q80 | 3.59 MB | 229 KB | 93.8% |

Image bytes if every plate on `/mythic-atlas` loads (12 plates; before, the thumbnails and the poster reused the
same PNG URLs): ≈ 44.0 MB → ≈ 5.5 MB (plates 4.95 MB + thumbs 0.32 MB + poster 0.23 MB). The 12 zodiac plates
(`#guaili`, `/guaili-luanshen`): 38.5 MB → 3.97 MB. Film: 42.1 MB → 6.1 MB.

## How they were made (reproducible)
```bash
# Pillow 11+, Lanczos; full = native 941 px width q80 method 6; thumb = 240 px wide q75
python3 - <<'PY'
from PIL import Image; import glob, os
for folder in ("originals", "zodiac"):
    os.makedirs(f"public/mythic-atlas/web/{folder}", exist_ok=True)
    for p in sorted(glob.glob(f"public/mythic-atlas/{folder}/*.png")):
        n = os.path.basename(p)[:-4]; im = Image.open(p).convert("RGB")
        im.save(f"public/mythic-atlas/web/{folder}/{n}.webp", "WEBP", quality=80, method=6)
        t = im.resize((240, round(im.height * 240 / im.width)), Image.LANCZOS)
        t.save(f"public/mythic-atlas/web/{folder}/{n}-thumb.webp", "WEBP", quality=75, method=6)
PY
ffmpeg -i public/mythic-atlas/films/huangquan-chronicles.mp4 -vf scale=720:-2 -c:v libx264 -profile:v high \
  -preset slow -crf 24 -maxrate 3M -bufsize 6M -pix_fmt yuv420p -movflags +faststart -an \
  public/mythic-atlas/web/films/huangquan-chronicles-720p.mp4
```
(Only the 12 `originals/NN-*.png` listed in `docs/mythic-atlas/huangquan-original-media-20261028.json`
and the 12 `zodiac/*.png` got derivatives.)

## Other findings from the same audit (no code change in this PR)
* `public/visuals/tianlong-report-hero.jpg` (7,401 B) — truncated JPEG (no EOI). GitHub history has exactly
  one commit for the path (`df90fb8`, 2026-08-24 10:46 AEST, "add compressed Tianlong report hero asset"): it was
  committed already broken, so **no good version exists to restore**. Not referenced by any source file. Recommend
  deleting it in a later cleanup PR or re-exporting from the owner's original.
* `public/articles/face-mind-cultivation-2026-09-14.webp` (≈7.5 KB, RIFF header declares ≈41 KB) — truncated.
  Single commit `a671f02` (r134, 2026-09-15 00:27 AEST) — committed broken, **no good version in history**.
  The article renders `face-mind-cultivation-2026-09-14.svg`; the webp is only mentioned in
  `docs/change-reports/ZW-WEB-2026.09.15-r134.md`. Needs a re-export from the owner's original if wanted.
* Abhidhamma "duplicates" (≈12.7 MB): `art-source/abhidhamma-31-realms-*-stone-original.png.part0-2`
  concatenate to byte-identical copies of `public/articles/abhidhamma-31-realms-*-stone-original.png`
  (SHA-256 verified for all four). **Both copies are referenced**: the parts by
  `scripts/assemble-abhidhamma-art.mjs` (run in `prebuild`, and watched by
  `.github/workflows/article-assets-prebuild.yml`), the PNGs by
  `src/lib/life-view-long-form/abhidhamma-thirty-one-planes.ts`. Per the "remove only if unreferenced" rule,
  nothing was removed. Options for a future PR: (a) git-ignore the assembled PNGs and rely on prebuild,
  or (b) drop the parts + assembler and keep the committed PNGs. Separately the article ships 2.6–3.5 MB PNGs
  to readers; a WebP derivative (same approach as above) would save ≈ 90 %, but that touches article content
  (火曜 / article-artwork gate), so it is left for the owner of that area.
