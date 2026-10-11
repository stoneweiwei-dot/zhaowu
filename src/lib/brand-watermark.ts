// Brand watermark for owner-published images.
//
// Two layers work together (see docs/LEGAL-COMPLIANCE.md §6b):
//  1. Burn-in at publish time (this file): every image uploaded through the owner tools is
//     re-drawn with the ZHAOWU mark and tagged "wm-baked", so a saved copy of the file carries it.
//  2. Display-time overlay (src/brand-watermark.css, class "zhaowu-wm"): covers every asset that
//     was published before this existed, videos, and anything that is not baked, without touching
//     the stored originals. Components skip the overlay for baked assets so the mark never doubles.

export const WATERMARK_TEXT = "昭梧 ZHAOWU";
export const WATERMARK_BAKED_TAG = "wm-baked";

const MAX_PIXELS = 16_000_000; // keeps iPhone Safari canvases within memory limits
const MAX_OUTPUT_BYTES = 9.5 * 1024 * 1024; // gallery/background upload limit is 10 MB
const FONT_STACK = '"Songti TC", "Noto Serif TC", "Songti SC", "Noto Serif SC", "PMingLiU", serif';

export function isBakedWatermark(asset?: { tags?: readonly string[] | null } | null) {
  return Boolean(asset?.tags?.includes(WATERMARK_BAKED_TAG));
}

/** Pixel geometry for a width x height image; mirrors the proportions used by the CSS overlay. */
export function watermarkLayout(width: number, height: number) {
  const short = Math.min(width, height);
  return {
    cornerFont: Math.max(14, Math.round(short * 0.034)),
    margin: Math.max(10, Math.round(short * 0.035)),
    centreFont: Math.max(24, Math.round(short * 0.085)),
    angleRad: (-24 * Math.PI) / 180,
  };
}

export function drawBrandWatermark(ctx: CanvasRenderingContext2D, width: number, height: number) {
  const layout = watermarkLayout(width, height);
  const spaced = ctx as CanvasRenderingContext2D & { letterSpacing?: string };

  ctx.save();
  ctx.textBaseline = "alphabetic";

  // Faint centre mark: survives a casual crop of the corner.
  ctx.save();
  ctx.translate(width / 2, height / 2);
  ctx.rotate(layout.angleRad);
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.font = `600 ${layout.centreFont}px ${FONT_STACK}`;
  if ("letterSpacing" in spaced) spaced.letterSpacing = `${Math.round(layout.centreFont * 0.12)}px`;
  ctx.fillStyle = "rgba(255,255,255,0.14)";
  ctx.shadowColor = "rgba(0,0,0,0.12)";
  ctx.shadowBlur = 2;
  ctx.fillText(WATERMARK_TEXT, 0, 0);
  ctx.restore();

  // Visible corner mark.
  ctx.textAlign = "right";
  ctx.textBaseline = "alphabetic";
  ctx.font = `600 ${layout.cornerFont}px ${FONT_STACK}`;
  if ("letterSpacing" in spaced) spaced.letterSpacing = `${Math.round(layout.cornerFont * 0.18)}px`;
  ctx.fillStyle = "rgba(255,255,255,0.66)";
  ctx.shadowColor = "rgba(0,0,0,0.55)";
  ctx.shadowBlur = Math.max(2, Math.round(layout.cornerFont * 0.25));
  ctx.fillText(WATERMARK_TEXT, width - layout.margin, height - layout.margin);
  ctx.restore();
}

export type WatermarkResult = { file: File; applied: boolean };

function outputName(source: File, type: string) {
  const base = (source.name.replace(/\.[^.]+$/, "") || "image").slice(0, 120);
  return `${base}.${type === "image/jpeg" ? "jpg" : "webp"}`;
}

/**
 * Re-draw an image file with the brand mark. Fails open: if the browser cannot decode/encode the
 * image (for example AVIF on an older phone) the original file is returned with applied=false,
 * and the display-time overlay still covers it.
 */
export async function applyBrandWatermark(file: File): Promise<WatermarkResult> {
  const unchanged: WatermarkResult = { file, applied: false };
  if (typeof document === "undefined" || typeof createImageBitmap !== "function") return unchanged;
  if (!file.type.startsWith("image/") || file.type === "image/gif" || file.type === "image/svg+xml") return unchanged;
  try {
    const bitmap = await createImageBitmap(file, { imageOrientation: "from-image" });
    const scale = Math.min(1, Math.sqrt(MAX_PIXELS / (bitmap.width * bitmap.height)));
    const width = Math.max(1, Math.round(bitmap.width * scale));
    const height = Math.max(1, Math.round(bitmap.height * scale));
    const canvas = document.createElement("canvas");
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext("2d");
    if (!ctx) { bitmap.close?.(); return unchanged; }
    ctx.drawImage(bitmap, 0, 0, width, height);
    bitmap.close?.();
    drawBrandWatermark(ctx, width, height);
    const type = file.type === "image/jpeg" ? "image/jpeg" : "image/webp";
    const blob = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, type, 0.92));
    if (!blob || blob.type !== type || blob.size > MAX_OUTPUT_BYTES) return unchanged;
    return { file: new File([blob], outputName(file, type), { type, lastModified: Date.now() }), applied: true };
  } catch {
    return unchanged;
  }
}
