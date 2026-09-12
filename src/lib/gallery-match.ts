import type { Chart, Element } from "@/lib/bazi/types";
import { galleryPublicUrl, type GalleryAsset } from "@/lib/gallery-assets";
import { PUBLIC_ATLAS_ASSETS, type PublicAtlasAsset } from "@/lib/public-atlas";

export type VisualElementScores = {
  wood: number;
  fire: number;
  earth: number;
  metal: number;
  water: number;
};

export type GalleryArtKnowledge = {
  asset_id: string;
  element_scores: VisualElementScores;
  climate_scores: { warm: number; cool: number; dry: number; moist: number };
  palette: string[];
  mood_labels: string[];
  summary: string;
  confidence: number;
  analysis_status?: string;
  client_eligible?: boolean;
  subject_labels: string[];
  style_labels: string[];
  motifs: string[];
  use_roles: string[];
};

export type CustomerGalleryArt = {
  asset: GalleryAsset;
  knowledge: GalleryArtKnowledge;
  score: number;
  imageUrl: string;
  matchedElements: Element[];
};

export type GalleryReasonLocale = "zh-Hant" | "zh-Hans" | "en";

const ELEMENT_KEY: Record<Element, keyof VisualElementScores> = {
  木: "wood",
  火: "fire",
  土: "earth",
  金: "metal",
  水: "water",
};

const ELEMENT_EN: Record<Element, string> = {
  木: "Wood",
  火: "Fire",
  土: "Earth",
  金: "Metal",
  水: "Water",
};

const LOVE_QUESTION_RE = /(感情|戀愛|恋爱|正緣|正缘|婚姻|伴侶|伴侣|關係|关系|桃花|love|relationship|partner)/i;
const TRAVEL_QUESTION_RE = /(旅行|旅遊|旅游|出行|出國|出国|搬家|城市|國家|国家|方向|度假|假期|行程|旅程|travel|trip|vacation|holiday|journey|tour|move|city|country)/i;
const FINANCE_QUESTION_RE = /(財|财|收入|資源|资源|福氣|福气|money|finance|income|career|work)/i;
const HEALTH_QUESTION_RE = /(健康|清理|淨化|净化|修復|修复|療癒|疗愈|health|healing|recover)/i;
const DESTINY_QUESTION_RE = /(格局|命格|命局|命理|亮點|亮点|八字|命盤|命盘|自己|性格|人生|destiny|chart|self|life)/i;
const HISTORICAL_STYLE_RE = /(宋|song|宣紙|宣纸|xuan|絹|绢|silk|工筆|工笔|gongbi|岩彩|mineral|古畫|古画|historical|圖譜|图谱|atlas|山水|landscape|東方|东方|east.asian)/i;

function stringList(value: unknown): string[] {
  return Array.isArray(value) ? value.map(String).map((item) => item.trim()).filter(Boolean) : [];
}

export function emptyGalleryKnowledge(assetId = ""): GalleryArtKnowledge {
  return {
    asset_id: assetId,
    element_scores: { wood: 0, fire: 0, earth: 0, metal: 0, water: 0 },
    climate_scores: { warm: 0, cool: 0, dry: 0, moist: 0 },
    palette: [],
    mood_labels: [],
    summary: "",
    confidence: 0,
    subject_labels: [],
    style_labels: [],
    motifs: [],
    use_roles: [],
  };
}

export function scoreCustomerGalleryArt(chart: Pick<Chart, "useful" | "drain">, knowledge: GalleryArtKnowledge): number {
  const useful = [...new Set(chart.useful)];
  const drain = [...new Set(chart.drain)].filter((element) => !useful.includes(element));
  if (!useful.length) return 0;

  const usefulScores = useful.map((element) => knowledge.element_scores[ELEMENT_KEY[element]]);
  const support = usefulScores.reduce((sum, value) => sum + value, 0) / usefulScores.length;
  const balance = usefulScores.length > 1 ? Math.min(...usefulScores) : usefulScores[0];
  const drainScore = drain.length
    ? drain.reduce((sum, element) => sum + knowledge.element_scores[ELEMENT_KEY[element]], 0) / drain.length
    : 0;

  let score = support + balance * 0.18 - drainScore * 0.36 + knowledge.confidence * 4;
  // Approval is a ranking signal only. It must never exclude a closer visual-library image.
  if (knowledge.analysis_status === "approved") score += 4;
  if (knowledge.client_eligible === true) score += 6;

  // Decorative matching only. The chart is immutable input; image metadata never feeds back into BaZi calculation.
  return Number(score.toFixed(6));
}

const TEA_GUARDIAN_ART_RE = /(?:tea[-_\s]?(?:guardian|deity)|茶仙|茶神|茶守護|茶守护)/i;

export function isPersonalDecreeAsset(candidate: { asset: GalleryAsset; knowledge: GalleryArtKnowledge }): boolean {
  if (candidate.asset.category === "tea-guardian") return false;
  return !TEA_GUARDIAN_ART_RE.test(semanticText(candidate));
}

export function rankCustomerGalleryArt(
  chart: Pick<Chart, "useful" | "drain">,
  candidates: Array<{ asset: GalleryAsset; knowledge: GalleryArtKnowledge }>,
): CustomerGalleryArt[] {
  return candidates
    .filter(isPersonalDecreeAsset)
    .map(({ asset, knowledge }) => ({
      asset,
      knowledge,
      score: scoreCustomerGalleryArt(chart, knowledge),
      imageUrl: galleryPublicUrl(asset.storage_path, asset.bucket_id),
      matchedElements: [...new Set(chart.useful)].sort() as Element[],
    }))
    .filter((candidate) => Number.isFinite(candidate.score))
    .sort((a, b) => b.score - a.score || a.asset.id.localeCompare(b.asset.id));
}

export function chooseCustomerGalleryArt(
  chart: Pick<Chart, "useful" | "drain">,
  candidates: Array<{ asset: GalleryAsset; knowledge: GalleryArtKnowledge }>,
): CustomerGalleryArt | null {
  return rankCustomerGalleryArt(chart, candidates)[0] ?? null;
}

function semanticText(candidate: { asset: GalleryAsset; knowledge: GalleryArtKnowledge }): string {
  return [
    candidate.asset.title,
    candidate.asset.asset_key,
    candidate.asset.category,
    ...stringList(candidate.asset.tags),
    ...candidate.knowledge.subject_labels,
    ...candidate.knowledge.style_labels,
    ...candidate.knowledge.motifs,
    ...candidate.knowledge.use_roles,
  ].filter(Boolean).join(" ").toLowerCase();
}

function questionTheme(question: string): "love" | "travel" | "finance" | "health" | "destiny" | "general" {
  if (LOVE_QUESTION_RE.test(question)) return "love";
  if (TRAVEL_QUESTION_RE.test(question)) return "travel";
  if (FINANCE_QUESTION_RE.test(question)) return "finance";
  if (HEALTH_QUESTION_RE.test(question)) return "health";
  if (DESTINY_QUESTION_RE.test(question)) return "destiny";
  return "general";
}

type Cue = { re: RegExp; zhHant: string; zhHans: string; en: string };

const CUES: Record<ReturnType<typeof questionTheme>, Cue[]> = {
  love: [
    { re: /(蓮|莲|lotus)/i, zhHant: "蓮", zhHans: "莲", en: "lotus" },
    { re: /(結|结|knot)/i, zhHant: "結", zhHans: "结", en: "knot" },
    { re: /(月|moon)/i, zhHant: "月", zhHans: "月", en: "moon" },
    { re: /(雙|双|pair)/i, zhHant: "雙生／成對", zhHans: "双生／成对", en: "paired forms" },
    { re: /(狐|fox)/i, zhHant: "狐", zhHans: "狐", en: "fox" },
    { re: /(花|flower)/i, zhHant: "花", zhHans: "花", en: "flowers" },
  ],
  travel: [
    { re: /(雲|云|cloud)/i, zhHant: "雲", zhHans: "云", en: "cloud" },
    { re: /(水|water|川|river)/i, zhHant: "水／川", zhHans: "水／川", en: "water" },
    { re: /(山|mountain)/i, zhHant: "山", zhHans: "山", en: "mountain" },
    { re: /(路|path)/i, zhHant: "路徑", zhHans: "路径", en: "path" },
    { re: /(舟|boat)/i, zhHant: "舟", zhHans: "舟", en: "boat" },
    { re: /(鶴|鹤|crane)/i, zhHant: "鶴", zhHans: "鹤", en: "crane" },
  ],
  finance: [
    { re: /(金|gold)/i, zhHant: "金", zhHans: "金", en: "gold" },
    { re: /(寶|宝|treasure)/i, zhHant: "寶物", zhHans: "宝物", en: "treasure" },
    { re: /(瓶|vase)/i, zhHant: "寶瓶", zhHans: "宝瓶", en: "vase" },
    { re: /(玉|jade)/i, zhHant: "玉", zhHans: "玉", en: "jade" },
    { re: /(鹿|deer)/i, zhHant: "鹿", zhHans: "鹿", en: "deer" },
    { re: /(鶴|鹤|crane)/i, zhHant: "鶴", zhHans: "鹤", en: "crane" },
  ],
  health: [
    { re: /(蓮|莲|lotus)/i, zhHant: "蓮", zhHans: "莲", en: "lotus" },
    { re: /(水|water)/i, zhHant: "清水", zhHans: "清水", en: "clear water" },
    { re: /(玉|jade)/i, zhHant: "玉", zhHans: "玉", en: "jade" },
    { re: /(光|light)/i, zhHant: "光", zhHans: "光", en: "light" },
    { re: /(藥|药|medicine)/i, zhHant: "藥意", zhHans: "药意", en: "healing imagery" },
    { re: /(月|moon)/i, zhHant: "月", zhHans: "月", en: "moon" },
  ],
  destiny: [
    { re: /(龍|龙|dragon)/i, zhHant: "龍", zhHans: "龙", en: "dragon" },
    { re: /(山水|landscape)/i, zhHant: "山水", zhHans: "山水", en: "landscape" },
    { re: /(護法|护法|guardian)/i, zhHant: "守護意象", zhHans: "守护意象", en: "guardian imagery" },
    { re: /(聖|圣|sacred)/i, zhHant: "聖相", zhHans: "圣相", en: "sacred imagery" },
    { re: /(月|moon)/i, zhHant: "月", zhHans: "月", en: "moon" },
    { re: /(雲|云|cloud)/i, zhHant: "雲", zhHans: "云", en: "cloud" },
  ],
  general: [],
};

function formatList(items: string[], locale: GalleryReasonLocale): string {
  if (!items.length) return "";
  if (locale === "en") {
    if (items.length === 1) return items[0];
    if (items.length === 2) return `${items[0]} and ${items[1]}`;
    return `${items.slice(0, -1).join(", ")}, and ${items.at(-1)}`;
  }
  return items.join("、");
}

export function explainCustomerGalleryChoice(
  chart: Pick<Chart, "useful" | "drain">,
  question: string,
  candidate: { asset: GalleryAsset; knowledge: GalleryArtKnowledge },
  locale: GalleryReasonLocale,
): string {
  const theme = questionTheme(question);
  const text = semanticText(candidate);
  const cues = CUES[theme]
    .filter((cue) => cue.re.test(text))
    .slice(0, 3)
    .map((cue) => locale === "en" ? cue.en : locale === "zh-Hans" ? cue.zhHans : cue.zhHant);

  const elements = [...new Set(chart.useful)]
    .filter((element) => ELEMENT_KEY[element])
    .sort((a, b) => candidate.knowledge.element_scores[ELEMENT_KEY[b]] - candidate.knowledge.element_scores[ELEMENT_KEY[a]])
    .slice(0, 2);
  const elementText = locale === "en"
    ? formatList(elements.map((element) => ELEMENT_EN[element]), locale)
    : formatList(elements, locale);

  const themeName = locale === "en"
    ? ({ love: "relationships", travel: "travel and movement", finance: "work and resources", health: "recovery and wellbeing", destiny: "your overall chart and personal pattern", general: "your question" } as const)[theme]
    : locale === "zh-Hans"
      ? ({ love: "感情与关系", travel: "旅行与流动", finance: "工作与资源", health: "修复与身心状态", destiny: "命格与自我", general: "这次问题" } as const)[theme]
      : ({ love: "感情與關係", travel: "旅行與流動", finance: "工作與資源", health: "修復與身心狀態", destiny: "命格與自我", general: "這次問題" } as const)[theme];

  const cueText = formatList(cues, locale);
  const styleMatched = HISTORICAL_STYLE_RE.test(text);

  if (locale === "en") {
    const parts = [
      `This image was not picked at random. Your question is mainly about ${themeName}.`,
      elementText ? `The match also uses the ${elementText} visual direction from this report.` : "",
      cueText ? `Its ${cueText} imagery supports that theme.` : styleMatched ? "Its historical East Asian painting language also fits the report's visual system." : "",
      "That combination is why it was selected from the current library.",
    ].filter(Boolean);
    return parts.join(" ");
  }

  if (locale === "zh-Hans") {
    return [
      `这张图不是随机抽到的。你这次的问题主要落在「${themeName}」方向。`,
      elementText ? `系统同时把这份报告用于视觉匹配的${elementText}方向纳入比较。` : "",
      cueText ? `这张图里的${cueText}等意象也与主题相呼应。` : styleMatched ? "它的古画／东方图谱语汇也与昭梧这份报告的视觉系统一致。" : "",
      "综合这些条件后，它在当前作品库中被选为这份命诰图。",
    ].filter(Boolean).join("");
  }

  return [
    `這張圖不是隨機抽到的。你這次的問題主要落在「${themeName}」方向。`,
    elementText ? `系統同時把這份報告用於視覺匹配的${elementText}方向納入比較。` : "",
    cueText ? `這張圖裡的${cueText}等意象也與主題相呼應。` : styleMatched ? "它的古畫／東方圖譜語彙也與昭梧這份報告的視覺系統一致。" : "",
    "綜合這些條件後，它在目前作品庫中被選為這份命誥圖。",
  ].filter(Boolean).join("");
}

const STATIC_ATLAS_DATE = "2026-09-12T00:00:00.000Z";

function staticElementFor(asset: PublicAtlasAsset): keyof VisualElementScores | null {
  const text = asset.id.toLowerCase();
  if (/(?:wood|spring)/.test(text)) return "wood";
  if (/(?:fire|summer)/.test(text)) return "fire";
  if (/(?:earth)/.test(text)) return "earth";
  if (/(?:metal|autumn)/.test(text)) return "metal";
  if (/(?:water|winter)/.test(text)) return "water";
  return null;
}

function staticGalleryAsset(asset: PublicAtlasAsset, index: number): GalleryAsset {
  const semanticName = asset.id.replace(/[-_]+/g, " ");
  const groupPrefix = asset.id.startsWith("report-") ? "library-report-art-" : "library-auspicious-";
  const id = `static:${asset.id}`;
  return {
    id,
    category: "visual-library",
    asset_key: `${groupPrefix}${asset.id}`,
    title: `Zhaowu ${semanticName}`,
    storage_path: asset.url,
    bucket_id: "public-fallback",
    content_type: "image/webp",
    tags: ["visual-library", "static-public", semanticName],
    enabled: true,
    is_primary: index === 0,
    created_at: STATIC_ATLAS_DATE,
    updated_at: STATIC_ATLAS_DATE,
  };
}

function staticGalleryKnowledge(asset: PublicAtlasAsset, assetId: string): GalleryArtKnowledge {
  const selected = staticElementFor(asset);
  const element_scores: VisualElementScores = {
    wood: 52,
    fire: 52,
    earth: 52,
    metal: 52,
    water: 52,
  };
  if (selected) element_scores[selected] = 92;
  const semanticName = asset.id.replace(/[-_]+/g, " ");
  return {
    ...emptyGalleryKnowledge(assetId),
    asset_id: assetId,
    element_scores,
    confidence: 1,
    analysis_status: "approved",
    client_eligible: true,
    subject_labels: [semanticName],
    style_labels: ["static public atlas"],
    motifs: [semanticName],
    use_roles: ["decree", "public atlas"],
  };
}

export async function loadCustomerGalleryCandidates(): Promise<Array<{ asset: GalleryAsset; knowledge: GalleryArtKnowledge }>> {
  // Customer artwork is served from the Vercel build. Supabase remains the owner/admin source
  // and is intentionally not queried from public report or gallery surfaces.
  return PUBLIC_ATLAS_ASSETS.map((asset, index) => {
    const row = staticGalleryAsset(asset, index);
    return { asset: row, knowledge: staticGalleryKnowledge(asset, row.id) };
  });
}
