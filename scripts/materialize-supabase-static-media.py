#!/usr/bin/env python3
from __future__ import annotations

import hashlib
import json
import os
import sys
import urllib.parse
import urllib.request
from io import BytesIO
from pathlib import Path

from PIL import Image, ImageOps

SUPABASE_URL = "https://plgpxusmemnmzckbwtiv.supabase.co"
SUPABASE_KEY = "sb_publishable_7prU26nA0AX7dny0PW_ReA_GKwI588H"
BACKGROUND_BUCKET = "zhaowu-backgrounds"
AUDIO_BUCKET = "zhaowu-audio"
AUDIO_SOURCE = "background/uploads/2026-09-09/16bf293f-bf59-4b79-b4ce-92b67f6d534d.m4a"
AUDIO_OUTPUT = Path("public/audio/river-in-my-breathing-2.m4a")
BACKGROUND_OUTPUT = Path("public/backgrounds/supabase-migrated")
MANIFEST_OUTPUT = Path("docs/backups/supabase-static-media-migration-2026-09-19.json")
MAX_EDGE = 2560
WEBP_QUALITY = 82

def request_bytes(url: str, headers: dict[str, str] | None = None) -> bytes:
    req = urllib.request.Request(url, headers=headers or {})
    with urllib.request.urlopen(req, timeout=90) as res:
        status = getattr(res, "status", 200)
        if status < 200 or status >= 300:
            raise RuntimeError(f"HTTP {status}: {url}")
        return res.read()

def get_enabled_backgrounds() -> list[dict]:
    query = urllib.parse.urlencode({
        "enabled": "eq.true",
        "select": "id,name,storage_path,content_type,theme,created_at,updated_at",
        "order": "created_at.desc",
        "limit": "1000",
    })
    payload = request_bytes(
        f"{SUPABASE_URL}/rest/v1/background_assets?{query}",
        {"apikey": SUPABASE_KEY, "Authorization": f"Bearer {SUPABASE_KEY}", "Accept": "application/json"},
    )
    rows = json.loads(payload.decode("utf-8"))
    if not isinstance(rows, list):
        raise RuntimeError("Unexpected background_assets response")
    return rows

def public_object_url(bucket: str, path: str) -> str:
    quoted = "/".join(urllib.parse.quote(part, safe="") for part in path.split("/"))
    return f"{SUPABASE_URL}/storage/v1/object/public/{bucket}/{quoted}"

def sha256(data: bytes) -> str:
    return hashlib.sha256(data).hexdigest()

def encode_webp(source: bytes) -> tuple[bytes, dict]:
    with Image.open(BytesIO(source)) as opened:
        image = ImageOps.exif_transpose(opened)
        original_size = image.size
        if max(image.size) > MAX_EDGE:
            image.thumbnail((MAX_EDGE, MAX_EDGE), Image.Resampling.LANCZOS)
        if "A" in image.getbands():
            image = image.convert("RGBA")
        else:
            image = image.convert("RGB")
        out = BytesIO()
        image.save(out, "WEBP", quality=WEBP_QUALITY, method=6, optimize=True)
        return out.getvalue(), {
            "source_width": original_size[0],
            "source_height": original_size[1],
            "output_width": image.size[0],
            "output_height": image.size[1],
        }

def main() -> int:
    rows = get_enabled_backgrounds()
    if not rows:
        raise RuntimeError("No enabled backgrounds returned; refusing empty migration")
    BACKGROUND_OUTPUT.mkdir(parents=True, exist_ok=True)
    AUDIO_OUTPUT.parent.mkdir(parents=True, exist_ok=True)
    MANIFEST_OUTPUT.parent.mkdir(parents=True, exist_ok=True)

    assets = []
    source_total = 0
    output_total = 0
    for index, row in enumerate(rows, 1):
        asset_id = str(row["id"])
        storage_path = str(row["storage_path"])
        source = request_bytes(public_object_url(BACKGROUND_BUCKET, storage_path), {"apikey": SUPABASE_KEY})
        webp, meta = encode_webp(source)
        out_rel = f"/backgrounds/supabase-migrated/{asset_id}.webp"
        out_path = Path("public") / out_rel.lstrip("/")
        out_path.write_bytes(webp)
        source_total += len(source)
        output_total += len(webp)
        assets.append({
            "id": asset_id,
            "name": row.get("name"),
            "theme": row.get("theme"),
            "source_storage_path": storage_path,
            "source_content_type": row.get("content_type"),
            "source_bytes": len(source),
            "source_sha256": sha256(source),
            "static_path": out_rel,
            "output_bytes": len(webp),
            "output_sha256": sha256(webp),
            **meta,
        })
        print(f"[{index}/{len(rows)}] {storage_path} -> {out_rel} ({len(source)} -> {len(webp)} bytes)", flush=True)

    audio = request_bytes(public_object_url(AUDIO_BUCKET, AUDIO_SOURCE), {"apikey": SUPABASE_KEY})
    if len(audio) < 100_000:
        raise RuntimeError(f"River In My Breathing 2 download is unexpectedly small: {len(audio)} bytes")
    AUDIO_OUTPUT.write_bytes(audio)

    manifest = {
        "generated_at": "2026-09-19",
        "project_id": "plgpxusmemnmzckbwtiv",
        "background_count": len(assets),
        "background_source_bytes": source_total,
        "background_output_bytes": output_total,
        "background_reduction_ratio": round(1 - (output_total / source_total), 6) if source_total else 0,
        "format": "webp",
        "quality": WEBP_QUALITY,
        "max_edge": MAX_EDGE,
        "assets": assets,
        "audio": {
            "name": "River In My Breathing 2",
            "source_storage_path": AUDIO_SOURCE,
            "static_path": "/audio/river-in-my-breathing-2.m4a",
            "bytes": len(audio),
            "sha256": sha256(audio),
        },
    }
    MANIFEST_OUTPUT.write_text(json.dumps(manifest, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    print(json.dumps({
        "background_count": len(assets),
        "source_bytes": source_total,
        "output_bytes": output_total,
        "reduction_pct": round((1 - output_total/source_total) * 100, 2) if source_total else 0,
        "audio_bytes": len(audio),
    }))
    return 0

if __name__ == "__main__":
    try:
        raise SystemExit(main())
    except Exception as exc:
        print(f"migration failed: {exc}", file=sys.stderr)
        raise
