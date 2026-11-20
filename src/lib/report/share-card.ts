import type { AnalysisResult } from "@/lib/bazi/types";
import type { Locale } from "@/lib/i18n";
import { buildReportVisualModel } from "@/lib/report/report-visual-model";
import { getDayStemCharacterAsset, getReportVisualAsset, type ReportVisualAsset } from "@/lib/report/report-visual-assets";
import { customerCopy } from "@/lib/report/customer-copy";

export type ShareCardModel = {
  brand: string;
  title: string;
  subtitle: string;
  summary: string;
  keywords: string[];
  facts: Array<{ label: string; value: string }>;
  artwork: ReportVisualAsset | null;
  artworkFallback: string;
  watermark: string;
};

function compactSummary(text: string): string {
  return customerCopy(text).replace(/\s+/g, " ").trim().slice(0, 220);
}

export function buildShareCardModel(result: AnalysisResult, locale: Locale): ShareCardModel {
  const visual = buildReportVisualModel(result.chart, locale);
  const chartSummary = locale === "en"
    ? `${result.chart.dayMaster} (${result.chart.dayMasterElement}) day master. ${visual.dayMaster.summary}`
    : `日主${result.chart.dayMaster}${result.chart.dayMasterElement}。${visual.dayMaster.summary}`;
  const summary = compactSummary(chartSummary);
  const artwork = locale === "zh-Hant" || locale === "zh-Hans"
    ? getDayStemCharacterAsset(visual.dayMaster.visualKey)
    : getReportVisualAsset("day-master", visual.dayMaster.visualKey);

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
      artwork,
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
    artwork,
    artworkFallback: "/wallpaper-song.jpg",
    watermark: "STONE 原創",
  };
}

function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const image = new Image();
    if (/^https?:\/\//.test(src)) image.crossOrigin = "anonymous";
    image.decoding = "async";
    image.onload = () => resolve(image);
    image.onerror = () => reject(new Error(`Unable to load ${src}`));
    image.src = src;
  });
}

type LoadedArtwork = { image: HTMLImageElement; asset: ReportVisualAsset | null };

async function loadArtwork(primary: ReportVisualAsset | null, fallback: string): Promise<LoadedArtwork | null> {
  if (primary) {
    try {
      return { image: await loadImage(primary.fullImageUrl || primary.thumbnailUrl || primary.src), asset: { ...primary, count: 1, index: 0, src: primary.fullImageUrl || primary.thumbnailUrl || primary.src } };
    } catch {
      // fall through to paper background
    }
  }
  try {
    return { image: await loadImage(fallback), asset: null };
  } catch {
    return null;
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

function drawCoverImage(
  ctx: CanvasRenderingContext2D,
  image: HTMLImageElement,
  x: number,
  y: number,
  width: number,
  height: number,
  asset: ReportVisualAsset | null,
) {
  const sourceWidth = asset ? image.naturalWidth / asset.count : image.naturalWidth;
  const sourceHeight = image.naturalHeight;
  const sourceX = asset ? asset.index * sourceWidth : 0;
  const sourceY = 0;
  const scale = Math.min(width / sourceWidth, height / sourceHeight);
  const drawWidth = sourceWidth * scale;
  const drawHeight = sourceHeight * scale;
  ctx.drawImage(image, sourceX, sourceY, sourceWidth, sourceHeight,
    x + (width - drawWidth) / 2, y + (height - drawHeight) / 2, drawWidth, drawHeight);
}

function drawCharacterImage(ctx: CanvasRenderingContext2D, image: HTMLImageElement, x: number, y: number, width: number, height: number) {
  // Character sources are 720x773. Keep them at native pixels and show the full
  // figure; the surrounding warm-paper fill remains visible at the sides.
  const scale = Math.min(1, width / image.naturalWidth, height / image.naturalHeight);
  const drawWidth = image.naturalWidth * scale;
  const drawHeight = image.naturalHeight * scale;
  ctx.drawImage(image, x + (width - drawWidth) / 2, y + (height - drawHeight) / 2, drawWidth, drawHeight);
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

  const serif = '\"Noto Serif TC\", \"Songti TC\", \"Songti SC\", \"Noto Serif CJK TC\", PMingLiU, serif';
  const artwork = await loadArtwork(model.artwork, model.artworkFallback);

  ctx.fillStyle = "#fffaf0";
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  ctx.save();
  ctx.globalAlpha = 0.045;
  ctx.fillStyle = "#315e50";
  for (let y = 36; y < 1920; y += 64) {
    for (let x = 28 + ((y / 64) % 2) * 20; x < 1080; x += 86) ctx.fillRect(x, y, 1, 14);
  }
  ctx.restore();

  ctx.fillStyle = "#315e50";
  ctx.font = `700 25px ${serif}`;
  ctx.fillText(model.brand, 88, 106);

  ctx.fillStyle = "#27241f";
  ctx.font = `650 72px ${serif}`;
  ctx.fillText(model.title, 88, 206);

  ctx.fillStyle = "#5a554c";
  ctx.font = `500 28px ${serif}`;
  ctx.fillText(model.subtitle, 88, 257);

  ctx.beginPath();
  ctx.rect(70, 318, 940, 650);
  ctx.save();
  ctx.clip();
  ctx.fillStyle = "#fffaf0";
  ctx.fillRect(70, 318, 940, 650);
  if (artwork) {
    if (artwork.asset?.id.endsWith("-character")) {
      drawCharacterImage(ctx, artwork.image, 70, 318, 940, 650);
    } else {
      drawCoverImage(ctx, artwork.image, 70, 318, 940, 650, artwork.asset);
    }
  } else {
    const gradient = ctx.createLinearGradient(70, 318, 1010, 968);
    gradient.addColorStop(0, "#f4ead9");
    gradient.addColorStop(1, "#d8c7a4");
    ctx.fillStyle = gradient;
    ctx.fillRect(70, 318, 940, 650);
  }
  const veil = ctx.createLinearGradient(0, 318, 0, 968);
  veil.addColorStop(0, "rgba(255,250,240,0.02)");
  veil.addColorStop(1, "rgba(11,47,38,0.24)");
  ctx.fillStyle = veil;
  ctx.fillRect(70, 318, 940, 650);
  ctx.restore();
  ctx.strokeStyle = "rgba(216,199,164,0.9)";
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.rect(70, 318, 940, 650);
  ctx.stroke();

  ctx.fillStyle = "#27241f";
  ctx.font = `400 37px ${serif}`;
  let cursorY = drawWrappedText(ctx, model.summary, 88, 1058, 904, 59, 5);
  cursorY += 26;

  let tagX = 88;
  ctx.font = `500 25px ${serif}`;
  for (const keyword of model.keywords) {
    const width = Math.min(250, ctx.measureText(keyword).width + 62);
    if (tagX + width > 992) {
      tagX = 88;
      cursorY += 68;
    }
    ctx.beginPath();
    ctx.rect(tagX, cursorY, width, 50);
    ctx.fillStyle = "#f6f1e6";
    ctx.fill();
    ctx.strokeStyle = "rgba(49,94,80,0.24)";
    ctx.stroke();
    ctx.fillStyle = "#315e50";
    ctx.fillText(keyword, tagX + 31, cursorY + 34);
    tagX += width + 16;
  }
  cursorY += 103;

  ctx.strokeStyle = "rgba(39,36,31,0.18)";
  ctx.beginPath();
  ctx.moveTo(88, cursorY);
  ctx.lineTo(992, cursorY);
  ctx.stroke();
  cursorY += 46;

  const factWidth = 286;
  model.facts.slice(0, 3).forEach((fact, index) => {
    const x = 88 + index * 300;
    ctx.fillStyle = "#5a554c";
    ctx.font = `500 21px ${serif}`;
    ctx.fillText(fact.label, x, cursorY);
    ctx.fillStyle = "#27241f";
    ctx.font = `600 31px ${serif}`;
    const value = fact.value.length > 10 ? `${fact.value.slice(0, 10)}…` : fact.value;
    ctx.fillText(value, x, cursorY + 48, factWidth);
  });

  ctx.fillStyle = "#5a554c";
  ctx.font = `600 24px ${serif}`;
  ctx.textAlign = "right";
  ctx.fillText(model.watermark, 984, 1810);

  return canvasBlob(canvas);
}

/** 在本機產生橫版分享圖；只使用明確列出的日柱及既有關鍵詞。 */
export async function renderLandscapeShareCardPng(model: ShareCardModel, dayPillar: string, locale: Locale): Promise<Blob> {
  const canvas = document.createElement("canvas");
  canvas.width = 1200;
  canvas.height = 630;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Canvas is unavailable");
  const serif = '"Songti TC", "Songti SC", "Noto Serif CJK TC", serif';
  ctx.fillStyle = "#f6f3e9";
  ctx.fillRect(0, 0, 1200, 630);
  ctx.strokeStyle = "#a18a5b";
  ctx.lineWidth = 2;
  ctx.strokeRect(30, 30, 1140, 570);
  ctx.fillStyle = "#38594b";
  ctx.font = `600 28px ${serif}`;
  ctx.fillText(model.brand, 75, 90);
  ctx.font = `600 66px ${serif}`;
  ctx.fillText(model.title, 75, 190, 1030);
  ctx.font = `400 30px ${serif}`;
  const pillarLabel = locale === "en" ? "Day pillar" : locale === "zh-Hans" ? "日柱" : "日柱";
  ctx.fillText(`${pillarLabel} · ${dayPillar || "—"}`, 75, 260, 1030);
  ctx.fillStyle = "#435a4e";
  ctx.font = `400 30px ${serif}`;
  drawWrappedText(ctx, model.keywords.join("  ·  "), 75, 345, 1020, 48, 2);
  const quote = locale === "en" ? "Know what to keep, and where to go." : locale === "zh-Hans" ? "知所守，知所往" : "知所守，知所往";
  ctx.font = `400 31px ${serif}`;
  ctx.fillText(quote, 75, 465, 1020);
  ctx.font = `400 22px ${serif}`;
  ctx.fillText("zhao-wu.com", 75, 550);
  ctx.textAlign = "right";
  ctx.fillText(model.watermark, 1125, 550);
  return canvasBlob(canvas);
}
