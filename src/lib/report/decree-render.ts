import type { AnalysisResult, Element } from "@/lib/bazi/types";
import { buildDecreeOverlay } from "@/lib/report/decree-image";

const PALETTE: Record<Element, { top: string; mid: string; bottom: string; accent: string; accent2: string }> = {
  木: { top: "#f4efe2", mid: "#dce7d9", bottom: "#b8ccbd", accent: "#52765f", accent2: "#8fac92" },
  火: { top: "#f7efe1", mid: "#ead3bd", bottom: "#c98e78", accent: "#9f3f2f", accent2: "#d1a45e" },
  土: { top: "#f3ebdc", mid: "#dfcfb5", bottom: "#b99c76", accent: "#80684d", accent2: "#c5a36c" },
  金: { top: "#f8f4ea", mid: "#deded8", bottom: "#b9b8af", accent: "#777b7b", accent2: "#b99c5e" },
  水: { top: "#f2efe7", mid: "#d9e2e7", bottom: "#9fb0bd", accent: "#36566e", accent2: "#9bafbf" },
};

function roundRect(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  r: number,
) {
  const rr = Math.min(r, w / 2, h / 2);
  ctx.beginPath();
  ctx.moveTo(x + rr, y);
  ctx.arcTo(x + w, y, x + w, y + h, rr);
  ctx.arcTo(x + w, y + h, x, y + h, rr);
  ctx.arcTo(x, y + h, x, y, rr);
  ctx.arcTo(x, y, x + w, y, rr);
  ctx.closePath();
}

function drawCloud(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  s: number,
  stroke: string,
  alpha: number,
) {
  ctx.save();
  ctx.globalAlpha = alpha;
  ctx.strokeStyle = stroke;
  ctx.lineWidth = Math.max(2, 4 * s);
  ctx.lineCap = "round";
  ctx.beginPath();
  ctx.moveTo(x - 150 * s, y + 24 * s);
  ctx.bezierCurveTo(x - 95 * s, y + 24 * s, x - 96 * s, y - 24 * s, x - 48 * s, y - 24 * s);
  ctx.bezierCurveTo(x - 30 * s, y - 72 * s, x + 36 * s, y - 70 * s, x + 52 * s, y - 22 * s);
  ctx.bezierCurveTo(x + 104 * s, y - 28 * s, x + 116 * s, y + 20 * s, x + 162 * s, y + 20 * s);
  ctx.stroke();
  ctx.restore();
}

function drawMountain(ctx: CanvasRenderingContext2D, y: number, fill: string, alpha: number) {
  ctx.save();
  ctx.globalAlpha = alpha;
  ctx.fillStyle = fill;
  ctx.beginPath();
  ctx.moveTo(0, 1920);
  ctx.lineTo(0, y + 180);
  ctx.bezierCurveTo(120, y + 95, 210, y + 170, 330, y + 65);
  ctx.bezierCurveTo(430, y - 20, 500, y + 145, 620, y + 60);
  ctx.bezierCurveTo(760, y - 35, 850, y + 115, 1080, y + 5);
  ctx.lineTo(1080, 1920);
  ctx.closePath();
  ctx.fill();
  ctx.restore();
}

function drawCornerOrnament(ctx: CanvasRenderingContext2D, x: number, y: number, flipX = false, flipY = false) {
  ctx.save();
  ctx.translate(x, y);
  ctx.scale(flipX ? -1 : 1, flipY ? -1 : 1);
  ctx.strokeStyle = "rgba(174, 132, 62, 0.46)";
  ctx.lineWidth = 3;
  ctx.lineCap = "round";
  ctx.beginPath();
  ctx.moveTo(0, 82);
  ctx.bezierCurveTo(42, 42, 84, 38, 122, 0);
  ctx.moveTo(0, 118);
  ctx.bezierCurveTo(66, 58, 120, 70, 182, 12);
  ctx.moveTo(40, 142);
  ctx.bezierCurveTo(88, 110, 136, 118, 196, 58);
  ctx.stroke();
  ctx.restore();
}

function drawSacredGeometry(ctx: CanvasRenderingContext2D, accent: string) {
  ctx.save();
  ctx.translate(540, 760);
  ctx.strokeStyle = "rgba(180, 143, 73, 0.52)";
  ctx.lineWidth = 3;
  for (const r of [300, 262, 186]) {
    ctx.beginPath();
    ctx.arc(0, 0, r, 0, Math.PI * 2);
    ctx.stroke();
  }
  ctx.globalAlpha = 0.22;
  ctx.strokeStyle = accent;
  ctx.lineWidth = 2;
  for (let i = 0; i < 8; i++) {
    ctx.rotate(Math.PI / 4);
    ctx.beginPath();
    ctx.moveTo(0, -315);
    ctx.lineTo(0, 315);
    ctx.stroke();
  }
  ctx.restore();
}

function splitLines(
  ctx: CanvasRenderingContext2D,
  text: string,
  maxWidth: number,
  maxLines = 8,
): string[] {
  const normalized = text.replace(/\s+/g, " ").trim();
  if (!normalized) return [];
  const chars = Array.from(normalized);
  const lines: string[] = [];
  let line = "";
  for (const ch of chars) {
    const next = line + ch;
    if (ctx.measureText(next).width > maxWidth && line) {
      lines.push(line.trim());
      line = ch;
      if (lines.length >= maxLines - 1) break;
    } else {
      line = next;
    }
  }
  if (line && lines.length < maxLines) lines.push(line.trim());
  if (lines.length === maxLines && chars.join("").length > lines.join("").length) {
    const last = lines[maxLines - 1];
    lines[maxLines - 1] = `${last.slice(0, Math.max(1, last.length - 1))}…`;
  }
  return lines;
}

function drawWatermarks(ctx: CanvasRenderingContext2D) {
  ctx.save();
  ctx.fillStyle = "rgba(64, 48, 35, 0.10)";
  ctx.font = "600 42px -apple-system, BlinkMacSystemFont, 'PingFang TC', 'Noto Sans CJK TC', sans-serif";
  ctx.textAlign = "center";
  ctx.translate(540, 970);
  ctx.rotate(-Math.PI / 8);
  for (let y = -720; y <= 720; y += 250) {
    for (let x = -520; x <= 520; x += 350) {
      ctx.fillText("STONE 原創", x, y);
    }
  }
  ctx.restore();
}

/** Browser-side deterministic renderer. Produces a real 1080x1920 PNG data URL. */
export async function renderDecreePng(result: AnalysisResult): Promise<string> {
  if (typeof document === "undefined") throw new Error("目前環境無法生成圖片。");

  const canvas = document.createElement("canvas");
  canvas.width = 1080;
  canvas.height = 1920;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("瀏覽器不支援圖片生成。");

  const palette = PALETTE[result.chart.dayMasterElement] ?? PALETTE.土;
  const overlay = buildDecreeOverlay(result);

  const bg = ctx.createLinearGradient(0, 0, 0, 1920);
  bg.addColorStop(0, palette.top);
  bg.addColorStop(0.42, palette.mid);
  bg.addColorStop(1, palette.bottom);
  ctx.fillStyle = bg;
  ctx.fillRect(0, 0, 1080, 1920);

  const halo = ctx.createRadialGradient(540, 735, 40, 540, 735, 690);
  halo.addColorStop(0, "rgba(255,255,246,0.98)");
  halo.addColorStop(0.42, "rgba(255,250,232,0.48)");
  halo.addColorStop(1, "rgba(255,255,255,0)");
  ctx.fillStyle = halo;
  ctx.fillRect(0, 90, 1080, 1500);

  // soft mineral-paper grain
  ctx.save();
  ctx.globalAlpha = 0.045;
  for (let i = 0; i < 4200; i++) {
    const x = Math.random() * 1080;
    const y = Math.random() * 1920;
    const a = 0.4 + Math.random() * 1.4;
    ctx.fillStyle = i % 3 === 0 ? palette.accent : "#6e5f4c";
    ctx.fillRect(x, y, a, a);
  }
  ctx.restore();

  drawMountain(ctx, 1400, palette.accent, 0.12);
  drawMountain(ctx, 1540, palette.accent2, 0.15);

  for (const [x, y, s, a] of [
    [230, 340, 0.8, 0.16], [820, 430, 0.66, 0.14], [220, 1280, 0.58, 0.11], [865, 1190, 0.72, 0.12],
  ] as const) drawCloud(ctx, x, y, s, palette.accent, a);

  drawCornerOrnament(ctx, 115, 210, false, false);
  drawCornerOrnament(ctx, 965, 210, true, false);
  drawCornerOrnament(ctx, 115, 1450, false, true);
  drawCornerOrnament(ctx, 965, 1450, true, true);
  drawSacredGeometry(ctx, palette.accent);

  // inner decree panel
  ctx.save();
  ctx.fillStyle = "rgba(255, 252, 243, 0.48)";
  ctx.strokeStyle = "rgba(171, 132, 68, 0.58)";
  ctx.lineWidth = 3;
  roundRect(ctx, 100, 205, 880, 1265, 48);
  ctx.fill();
  ctx.stroke();
  ctx.strokeStyle = "rgba(171, 132, 68, 0.23)";
  ctx.lineWidth = 2;
  roundRect(ctx, 132, 238, 816, 1198, 36);
  ctx.stroke();
  ctx.restore();

  drawWatermarks(ctx);

  ctx.textAlign = "center";
  ctx.fillStyle = palette.accent;
  ctx.font = "600 34px -apple-system, BlinkMacSystemFont, 'PingFang TC', 'Noto Sans CJK TC', sans-serif";
  ctx.fillText(overlay.top, 540, 328);

  ctx.fillStyle = "#3d3028";
  ctx.font = "600 66px 'Songti TC', 'STSong', 'Noto Serif CJK TC', serif";
  const lines = splitLines(ctx, overlay.center, 700, 8);
  const lineHeight = 102;
  const total = Math.max(lineHeight, lines.length * lineHeight);
  let y = 760 - total / 2 + lineHeight * 0.8;
  for (const line of lines) {
    ctx.fillText(line, 540, y);
    y += lineHeight;
  }

  // small seal
  ctx.save();
  ctx.strokeStyle = "rgba(150, 45, 34, 0.78)";
  ctx.fillStyle = "rgba(150, 45, 34, 0.08)";
  ctx.lineWidth = 4;
  roundRect(ctx, 772, 1220, 116, 116, 10);
  ctx.fill();
  ctx.stroke();
  ctx.fillStyle = "rgba(150, 45, 34, 0.92)";
  ctx.font = "600 28px 'Songti TC', 'STSong', serif";
  ctx.fillText("昭梧", 830, 1272);
  ctx.fillText("命誥", 830, 1312);
  ctx.restore();

  ctx.fillStyle = "rgba(61, 48, 40, 0.72)";
  ctx.font = "400 26px -apple-system, BlinkMacSystemFont, 'PingFang TC', sans-serif";
  ctx.fillText(overlay.bottom, 540, 1505);

  ctx.fillStyle = "rgba(61, 48, 40, 0.58)";
  ctx.font = "600 31px -apple-system, BlinkMacSystemFont, 'PingFang TC', sans-serif";
  ctx.fillText(overlay.watermark, 540, 1760);

  ctx.fillStyle = "rgba(61, 48, 40, 0.38)";
  ctx.font = "400 21px -apple-system, BlinkMacSystemFont, 'PingFang TC', sans-serif";
  ctx.fillText("ZHAOWU · PERSONAL DECREE · 9:16", 540, 1810);

  return canvas.toDataURL("image/png", 0.94);
}
