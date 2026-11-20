#!/usr/bin/env python3
"""Rasterize P0 brand icons from the locked pine/sun/cloud language."""
from __future__ import annotations

from pathlib import Path

from PIL import Image, ImageDraw, ImageFont

ROOT = Path(__file__).resolve().parents[1]
OUT = Path(__file__).resolve().parent / "home-icons"
FONT = "/usr/share/fonts/truetype/wqy/wqy-zenhei.ttc"

IVORY = (250, 248, 241, 255)
GOLD = (212, 176, 116, 255)
GOLD_TEXT = (243, 230, 196, 255)
PINE = (31, 78, 58, 255)
SAGE = (138, 156, 136, 255)
PINE_LINE = (197, 213, 196, 255)


def font(size: int) -> ImageFont.FreeTypeFont:
    return ImageFont.truetype(FONT, size=size)


def leaf(draw: ImageDraw.ImageDraw, x: int, y: int, w: int, h: int, color) -> None:
    draw.ellipse((x, y, x + w, y + h), fill=color)


def draw_app(size: int) -> Image.Image:
    im = Image.new("RGBA", (size, size), (0, 0, 0, 0))
    d = ImageDraw.Draw(im)
    pad = max(2, round(size * 0.03))
    radius = round(size * 0.22)
    d.rounded_rectangle((pad, pad, size - pad, size - pad), radius=radius, fill=PINE)
    inner = pad + max(3, round(size * 0.04))
    d.rounded_rectangle(
        (inner, inner, size - inner, size - inner),
        radius=max(8, radius - 6),
        outline=GOLD,
        width=max(2, round(size * 0.015)),
    )
    sun_r = max(4, round(size * 0.06))
    sun = (round(size * 0.66), round(size * 0.22))
    d.ellipse((sun[0] - sun_r, sun[1] - sun_r, sun[0] + sun_r, sun[1] + sun_r), fill=GOLD)

    f = font(max(12, round(size * 0.23)))
    d.text((round(size * 0.18), round(size * 0.28)), "昭", font=f, fill=GOLD_TEXT)
    d.text((round(size * 0.18), round(size * 0.52)), "梧", font=f, fill=GOLD_TEXT)

    s = size / 200
    foliage = [
        (104, 96, 34, 22),
        (126, 80, 34, 22),
        (152, 70, 34, 22),
        (136, 108, 34, 22),
    ]
    for x, y, w, h in foliage:
        leaf(d, round(x * s), round(y * s), round(w * s), round(h * s), SAGE)

    trunk_w = max(2, round(size * 0.03))
    d.line(
        [(round(124 * s), round(152 * s)), (round(168 * s), round(82 * s))],
        fill=PINE_LINE,
        width=trunk_w,
    )
    cloud_y = round(size * 0.78)
    d.arc((round(size * 0.14), cloud_y - round(size * 0.08), round(size * 0.42), cloud_y + round(size * 0.08)), 200, 340, fill=GOLD, width=max(2, trunk_w))
    d.arc((round(size * 0.34), cloud_y - round(size * 0.07), round(size * 0.62), cloud_y + round(size * 0.09)), 200, 340, fill=GOLD, width=max(2, trunk_w))
    d.arc((round(size * 0.54), cloud_y - round(size * 0.06), round(size * 0.82), cloud_y + round(size * 0.1)), 200, 340, fill=GOLD, width=max(2, trunk_w))
    return im


def draw_favicon(size: int) -> Image.Image:
    im = Image.new("RGBA", (size, size), (0, 0, 0, 0))
    d = ImageDraw.Draw(im)
    ring = max(2, round(size * 0.06))
    d.ellipse((ring, ring, size - ring, size - ring), fill=IVORY, outline=GOLD, width=ring)
    sun_r = max(2, round(size * 0.08))
    d.ellipse((round(size * 0.58), round(size * 0.18), round(size * 0.58) + sun_r * 2, round(size * 0.18) + sun_r * 2), fill=GOLD)
    s = size / 64
    for x, y, w, h in [(18, 30, 21, 12), (28, 22, 21, 12), (38, 18, 21, 12)]:
        leaf(d, round(x * s), round(y * s), max(3, round(w * s)), max(2, round(h * s)), PINE)
    d.line([(round(22 * s), round(48 * s)), (round(52 * s), round(20 * s))], fill=PINE, width=max(2, round(size * 0.05)))
    return im


def save(im: Image.Image, path: Path) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    im.save(path, "PNG")
    print(f"wrote {path} {im.size} {path.stat().st_size}B")


def main() -> None:
    for size, name in [(16, "zhaowu-app-16.png"), (32, "zhaowu-app-32.png")]:
        save(draw_favicon(size), OUT / name)
    for size, name in [
        (180, "zhaowu-app-180.png"),
        (192, "zhaowu-app-192.png"),
        (512, "zhaowu-app-512.png"),
    ]:
        save(draw_app(size), OUT / name)


if __name__ == "__main__":
    main()
