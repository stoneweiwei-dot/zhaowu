import type { AnalysisResult } from "@/lib/bazi/types";
import type { Locale } from "@/lib/i18n";
import { buildReportVisualModel } from "@/lib/report/report-visual-model";

export type ShareCardModel = {
  brand: string;
  title: string;
  subtitle: string;
  summary: string;
  keywords: string[];
  facts: Array<{ label: string; value: string }>;
  artworkPath: string;
  artworkFallback: string;
  watermark: string;
};

function compactSummary(text: string): string {
  return text.replace(/\s+/g, " ").trim().slice(0, 220);
}

export function buildShareCardModel(result: AnalysisResult, locale: Locale): ShareCardModel {
  const visual = buildReportVisualModel(result.chart, locale);
  const summary = compactSummary(result.reading.directAnswer || visual.dayMaster.summary);

  if (locale === "en") {
    return {
      brand: "ZHAOWU",
      title: visual.dayMaster.title,
      subtitle: "A personal chart snapshot",
      summary,
      keywords: visual.dayMaster.keywords.slice(0, 4),
      facts: [
        { label: "Polarity", value: visual.dayMaster.yinYangLabel },
        { label: "Element", value: visual.dayMaster.elementLabel },
        { label: "Birth season", value: visual.season.seasonLabel },
      ],
      artworkPath: visual.dayMaster.imagePath,
      artworkFallback: "/wallpaper-song.jpg",
      watermark: "© STONE",
    };
  }

  const hans = locale === "zh-Hans";
  return {
    brand: "昭梧 · ZHAOWU",
    title: visual.dayMaster.title,
    subtitle: hans ? "个人命象摘要" : "個人命象摘要",
    summary,
    keywords: visual.dayMaster.keywords.slice(0, 4),
    facts: [
      { label: "陰陽", value: visual.dayMaster.yinYangLabel },
      { label: "五行", value: visual.dayMaster.elementLabel },
      { label: hans ? "月令时节" : "月令時節", value: visual.season.seasonLabel },
    ],
    artworkPath: visual.dayMaster.imagePath,
    artworkFallback: "/wallpaper-song.jpg",
    watermark: "STONE 原創",
  };
}

function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const image = new Image();
    image.decoding = "async";
    image.onload = () => resolve(image);
    image.onerror = () => reject(new Error(`Unable to load ${src}`));
    image.src = src;
  });
}

async function loadArtwork(primary: string, fallback: string): Promise<HTMLImageElement | null> {
  try {
    return await loadImage(primary);
  } catch {
    try {
      return await loadImage(fallback);
    } catch {
      return null;
    }
  }
}

function roundedRect(ctx: CanvasRenderingContext2D, x: number, y: number, width: number, height: number, radius: number) {
  const r = Math.min(radius, width / 2, height / 2);
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + width, y, x + width, y + height, r);
  ctx.arcTo(x + width, y + height, x, y + height, r);
  ctx.arcTo(x, y + height, x, y, r);
  ctx.arcTo(x, y, x + width, y, r);
  ctx.closePath();
}

function drawCoverImage(ctx: CanvasRenderingContext2D, image: HTMLImageElement, x: number, y: number, width: number, height: number) {
  const scale = Math.max(width / image.naturalWidth, height / image.naturalHeight);
  const drawWidth = image.naturalWidth * scale;
  const drawHeight = image.naturalHeight * scale;
  const dx = x + (width - drawWidth) / 2;
  const dy = y + (height - drawHeight) / 2;
  ctx.drawImage(image, dx, dy, drawWidth, drawHeight);
}

function splitText(ctx: CanvasRenderingContext2D, text: string, maxWidth: number): string[] {
  const chars = Array.from(text);
  const lines: string[] = [];
  let line = "";
  for (const char of chars) {
    const next = line + char;
    if (line && ctx.measureText(next).width > maxWidth) {
      lines.push(line);
      line = char;
    } else {
      line = next;
    }
  }
  if (line) lines.push(line);
  return lines;
}

function drawWrappedText(ctx: CanvasRenderingContext2D, text: string, x: number, y: number, maxWidth: number, lineHeight: number, maxLines: number) {
  const lines = splitText(ctx, text, maxWidth);
  const shown = lines.slice(0, maxLines);
  if (lines.length > maxLines && shown.length) {
    let last = shown[shown.length - 1];
    while (last && ctx.measureText(`${last}…`).width > maxWidth) last = last.slice(0, -1);
    shown[shown.length - 1] = `${last}…`;
  }
  shown.forEach((line, index) => ctx.fillText(line, x, y + index * lineHeight));
  return y + shown.length * lineHeight;
}

function canvasBlob(canvas: HTMLCanvasElement): Promise<Blob> {
  return new Promise((resolve, reject) => {
    canvas.toBlob((blob) => blob ? resolve(blob) : reject(new Error("Unable to export share card")), "image/png", 0.95);
  });
}

export async function renderShareCardPng(model: ShareCardModel): Promise<Blob> {
  const canvas = document.createElement("canvas");
  canvas.width = 1080;
  canvas.height = 1920;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Canvas is unavailable");

  const serif = '"Songti TC", "Songti SC", "STSong", "Noto Serif CJK TC", serif';
  const artwork = await loadArtwork(model.artworkPath, model.artworkFallback);

  ctx.fillStyle = "#f4ead7";
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  ctx.save();
  ctx.globalAlpha = 0.08;
  ctx.fillStyle = "#725b3f";
  for (let y = 40; y < 1920; y += 54) {
    for (let x = 30 + ((y / 54) % 2) * 22; x < 1080; x += 72) ctx.fillRect(x, y, 1, 18);
  }
  ctx.restore();

  ctx.fillStyle = "#8d6a3c";
  ctx.font = `700 25px ${serif}`;
  ctx.fillText(model.brand, 88, 106);

  ctx.fillStyle = "#27241f";
  ctx.font = `600 72px ${serif}`;
  ctx.fillText(model.title, 88, 206);

  ctx.fillStyle = "#8c714f";
  ctx.font = `500 28px ${serif}`;
  ctx.fillText(model.subtitle, 88, 257);

  roundedRect(ctx, 70, 318, 940, 650, 34);
  ctx.save();
  ctx.clip();
  if (artwork) {
    drawCoverImage(ctx, artwork, 70, 318, 940, 650);
  } else {
    const gradient = ctx.createLinearGradient(70, 318, 1010, 968);
    gradient.addColorStop(0, "#e7dcc6");
    gradient.addColorStop(1, "#cdd7d2");
    ctx.fillStyle = gradient;
    ctx.fillRect(70, 318, 940, 650);
  }
  const veil = ctx.createLinearGradient(0, 318, 0, 968);
  veil.addColorStop(0, "rgba(244,234,215,0.05)");
  veil.addColorStop(1, "rgba(35,32,27,0.19)");
  ctx.fillStyle = veil;
  ctx.fillRect(70, 318, 940, 650);
  ctx.restore();
  ctx.strokeStyle = "rgba(141,106,60,0.42)";
  ctx.lineWidth = 2;
  roundedRect(ctx, 70, 318, 940, 650, 34);
  ctx.stroke();

  ctx.fillStyle = "#373129";
  ctx.font = `400 36px ${serif}`;
  let cursorY = drawWrappedText(ctx, model.summary, 88, 1058, 904, 59, 5);
  cursorY += 26;

  let tagX = 88;
  ctx.font = `600 26px ${serif}`;
  for (const keyword of model.keywords) {
    const width = Math.min(250, ctx.measureText(keyword).width + 62);
    if (tagX + width > 992) {
      tagX = 88;
      cursorY += 68;
    }
    roundedRect(ctx, tagX, cursorY, width, 50, 25);
    ctx.fillStyle = "#eadcc1";
    ctx.fill();
    ctx.strokeStyle = "rgba(141,106,60,0.30)";
    ctx.stroke();
    ctx.fillStyle = "#4f4437";
    ctx.fillText(keyword, tagX + 31, cursorY + 34);
    tagX += width + 16;
  }
  cursorY += 103;

  ctx.strokeStyle = "rgba(141,106,60,0.26)";
  ctx.beginPath();
  ctx.moveTo(88, cursorY);
  ctx.lineTo(992, cursorY);
  ctx.stroke();
  cursorY += 46;

  const factWidth = 286;
  model.facts.slice(0, 3).forEach((fact, index) => {
    const x = 88 + index * 300;
    ctx.fillStyle = "#8c7455";
    ctx.font = `500 21px ${serif}`;
    ctx.fillText(fact.label, x, cursorY);
    ctx.fillStyle = "#302c26";
    ctx.font = `600 31px ${serif}`;
    const value = fact.value.length > 10 ? `${fact.value.slice(0, 10)}…` : fact.value;
    ctx.fillText(value, x, cursorY + 48, factWidth);
  });

  ctx.save();
  ctx.globalAlpha = 0.34;
  ctx.fillStyle = "#6f5a3f";
  ctx.font = `700 30px ${serif}`;
  ctx.textAlign = "right";
  ctx.fillText(model.watermark, 984, 1810);
  ctx.globalAlpha = 0.11;
  ctx.font = `700 20px ${serif}`;
  ctx.textAlign = "center";
  ctx.fillText(model.watermark, 540, 1658);
  ctx.restore();

  return canvasBlob(canvas);
}
