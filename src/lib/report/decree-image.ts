import type { AnalysisResult, Element } from "@/lib/bazi/types";

const ELEMENT_ART: Record<Element, string> = {
  木: "soft celadon jade branches, gentle growth grain, quiet spring mineral green",
  火: "cinnabar and warm gold glow, restrained ember light, no aggressive blaze",
  土: "rice-gold mountain silhouette, ceramic-jade texture, stable earth mineral tones",
  金: "white jade planes, silver-gold filigree, precise geometric inlay",
  水: "indigo water grain, moon-white mist, deep still pools",
};

const BASE =
  "Vertical 9:16 premium Chinese metaphysical decree artwork, elegant Eastern celestial civilization aesthetic, refined Song-dynasty-inspired mineral pigments on warm ivory xuan paper, subtle layered clouds, luminous jade, fine gold filigree, restrained sacred geometry, one central empty visual focus reserved for later typography, symmetrical but not rigid, calm authority, sophisticated spiritual atmosphere, high detail, soft dimensional lighting, premium editorial poster, no people required, no deity identity claims, no zodiac chart, no astrological wheel, no Western constellation symbols, no readable text, no letters, no calligraphy, no logo, no watermark, no UI, no border touching the edge, generous safe margins for iPhone crop, 9:16.";

export type DecreeOverlay = {
  top: string;
  center: string;
  bottom: string;
  watermark: string;
  secondaryWatermark: string;
};

/** AI image prompt only — no Chinese text in the image itself. */
export function buildDecreeImagePrompt(dayMasterElement: Element): string {
  const accent = ELEMENT_ART[dayMasterElement] ?? ELEMENT_ART.土;
  return `${BASE} Optional aesthetic accent only (not a fate judgment): ${accent}.`;
}

/** Frontend / post-process overlay. Never send these strings into the image model. */
export function buildDecreeOverlay(result: AnalysisResult): DecreeOverlay {
  return {
    top: "昭梧 · 命诰",
    center: result.reading.decree,
    bottom: `命理档案 ${result.id}`,
    watermark: "STONE 原創",
    secondaryWatermark: "STONE 原創",
  };
}

export function decreeImagePackage(result: AnalysisResult) {
  return {
    version: "ZW-DECREE-IMG-1.0" as const,
    aspect: "9:16" as const,
    prompt: buildDecreeImagePrompt(result.chart.dayMasterElement),
    overlay: buildDecreeOverlay(result),
    notes: [
      "图像模型只出干净背景，不画中文。",
      "叠字与水印由前端完成。",
      "日主五行只作色调，不作喜用或吉凶结论。",
      "禁止紫微／西占／吠陀／奇门等未接入流派符号。",
    ],
  };
}
