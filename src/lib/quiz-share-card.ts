import type { Locale } from "@/lib/i18n";

export const QUIZ_SHARE_SIZE = { width: 1080, height: 1920 } as const;
export const QUIZ_SHARE_PALETTE = {
  paper: "#F4F1E9",
  jade: "#305B50",
  indigo: "#1D3550",
  vermilion: "#965342",
  gold: "#A08658",
  ink: "#23302D",
} as const;

export const QUIZ_SHARE_PATHS: Record<string, string> = {
  "earth-online": "/fun-tests/earth-online",
  "cultivation-destiny": "/quiz/cultivation-destiny",
  "divine-affinity": "/quiz/divine-affinity",
  "five-element-overdrive": "/quiz/five-element-overdrive",
  "six-realms": "/quiz/six-realms",
  animal: "/fun-tests?test=animal",
  element: "/fun-tests?test=element",
};

export const QUIZ_SHARE_MIN_GAP = 32;

const ELEMENT_CHIPS: Array<{ keys: string[]; label: Record<Locale, string>; color: string }> = [
  { keys: ["木", "wood"], label: { "zh-Hant": "木", "zh-Hans": "木", en: "Wood" }, color: "#3F7A58" },
  { keys: ["火", "fire"], label: { "zh-Hant": "火", "zh-Hans": "火", en: "Fire" }, color: "#A8463D" },
  { keys: ["土", "earth"], label: { "zh-Hant": "土", "zh-Hans": "土", en: "Earth" }, color: "#B28A45" },
  { keys: ["金", "metal"], label: { "zh-Hant": "金", "zh-Hans": "金", en: "Metal" }, color: "#7A7468" },
  { keys: ["水", "water"], label: { "zh-Hant": "水", "zh-Hans": "水", en: "Water" }, color: "#3A5A6A" },
];

const CTA_LEAD: Record<string, Record<Locale, string>> = {
  "six-realms": { "zh-Hant": "免費測測你是哪一道", "zh-Hans": "免费测测你是哪一道", en: "See which path you lean toward" },
  "divine-affinity": { "zh-Hant": "免費測測你的本緣", "zh-Hans": "免费测测你的本缘", en: "See your affinity" },
  "earth-online": { "zh-Hant": "免費測測你卡在哪一關", "zh-Hans": "免费测测你卡在哪一关", en: "See which level you are on" },
  "cultivation-destiny": { "zh-Hant": "免費測測你的修仙命格", "zh-Hans": "免费测测你的修仙命格", en: "See your cultivation path" },
  animal: { "zh-Hant": "免費測測你的內在動物", "zh-Hans": "免费测测你的内在动物", en: "See your inner animal" },
  element: { "zh-Hant": "免費測測你的五行功能", "zh-Hans": "免费测测你的五行功能", en: "See your five-element function" },
  "five-element-overdrive": { "zh-Hant": "免費測測你的優勢內耗", "zh-Hans": "免费测测你的优势内耗", en: "See which strength you overuse" },
};
const CTA_FALLBACK: Record<Locale, string> = {
  "zh-Hant": "免費測測你是哪一道",
  "zh-Hans": "免费测测你是哪一道",
  en: "Take the free quiz",
};

const SERIF = '"Cormorant Garamond", "Noto Serif CJK TC", "Noto Serif CJK SC", "Noto Serif TC", "Source Han Serif TC", serif';
const SANS = '"Noto Sans CJK TC", "Noto Sans CJK SC", "Noto Sans TC", "Noto Sans", system-ui, sans-serif';

const FRAME = { left: 57, top: 57, right: 1023, bottom: 1863 };
const CORNER = 36;
const CONTENT_LEFT = 120;
const CONTENT_RIGHT = 960;
const CONTENT_WIDTH = CONTENT_RIGHT - CONTENT_LEFT;
const TITLE_WIDTH = 640;
const SEAL = { x: 900, y: 224, size: 148, rotate: (13 * Math.PI) / 180 };
const BOTTOM_SAFE = 1790;
const LANDSCAPE_IMAGE = typeof Image === "undefined" ? null : new Image();
if (LANDSCAPE_IMAGE) LANDSCAPE_IMAGE.src = "/hero-gallery/misty-mountains-lake.webp";

export type QuizShareChip = { label: string; color: string };
export type QuizShareInput = {
  quizId: string;
  quizName: string;
  resultLabel: string;
  description: string;
  traits?: string[];
};
export type QuizShareModel = QuizShareInput & {
  locale: Locale;
  description: string;
  resultLabel: string;
  traits: string[];
  chips: QuizShareChip[];
  shareUrl: string;
  quizPath: string;
  cta: { lead: string; path: string };
  marks: { site: string; original: string };
};

export type ShareBox = { id: string; x: number; y: number; w: number; h: number; role?: "content" | "chrome" };
export type FontMetrics = { width: number; ascent: number; descent: number };
export type MeasureFn = (font: string, text: string) => FontMetrics;
type Fitted = { lines: string[]; size: number; lineHeight: number; ascent: number; descent: number; height: number; font: string };

export function sanitizeResultLabel(label: string, quizId = "", locale: Locale = "zh-Hant"): string {
  let text = String(label ?? "").replace(/[A-G]\s*[·•.．、]\s*/g, "").replace(/\s{2,}/g, " ").trim();
  text = text.replace(/^[·•.\s]+|[·•.\s]+$/g, "").replace(/[·•]\s*[·•]/g, "·").trim();
  if (quizId === "animal") {
    const parts = text.split(/\s*[·•|｜]\s*/).map((part) => part.trim()).filter(Boolean);
    if (parts.length > 1) return parts[0];
  }
  const pipe = text.split(/\s*[｜|]\s*/).map((part) => part.trim()).filter(Boolean);
  if ((quizId === "element" || quizId === "five-element-overdrive") && pipe.length === 2) {
    return formatElementResultName(pipe[0], pipe[1], locale);
  }
  return text;
}

function formatElementResultName(name: string, title: string, locale: Locale): string {
  if (locale === "en" || isMostlyLatin(name)) return `${name} · ${title}`;
  if (/型$/.test(title)) return `${name}·${title}`;
  return `${name}型·${title}`;
}

export function quizSharePath(quizId: string, href = ""): string {
  if (QUIZ_SHARE_PATHS[quizId]) return QUIZ_SHARE_PATHS[quizId];
  const raw = String(href || "/").split("#")[0] || "/";
  const path = raw.startsWith("/") ? raw : `/${raw}`;
  return path.replace(/^\/(zh-hans|en|ja|ko|hi|th|id|vi|fil)(?=\/|\?|$)/i, "") || path;
}

export function buildCta(locale: Locale, quizId: string, path: string): { lead: string; path: string } {
  const lead = CTA_LEAD[quizId]?.[locale] ?? CTA_FALLBACK[locale];
  const display = `zhao-wu.com${path.startsWith("/") ? path : `/${path}`}`;
  return { lead, path: display };
}

export function deriveTraits(description: string, resultLabel = "", quizId = ""): string[] {
  const leftover = quizId === "animal"
    ? String(resultLabel ?? "").split(/\s*[·•|｜]\s*/).map((part) => part.trim()).filter(Boolean).slice(1)
    : [];
  const pipe = String(resultLabel ?? "").split(/\s*[｜|]\s*/).map((part) => part.trim()).filter(Boolean);
  if (pipe.length === 2 && [...pipe[0]].length <= 6) leftover.unshift(pipe[1]);
  const quoted = [...String(description ?? "").matchAll(/[『「“"]([^『「“」」”"]{2,16})[』」”"]/g)].map((match) => match[1]);
  const split = String(description ?? "")
    .split(/\s*[·•/／、|｜，,]\s*|\s{0,2}(?:——|--)\s*/)
    .map((part) => normalizeTraitSource(part))
    .map(stripTraitLead)
    .map((part) => clipPhrase(part, 14, 32))
    .filter((part) => part && !part.endsWith("…") && !isWeakTrait(part));
  const clauses = String(description ?? "")
    .split(/[，,。；;、]/)
    .map((part) => normalizeTraitSource(part))
    .map(stripTraitLead)
    .filter(Boolean)
    .map((part) => clipPhrase(part, 14, 32));
  const preferred = uniquePhrases([...leftover, ...quoted, ...split]);
  const extra = clauses.filter((clause) => !preferred.some((item) => clause.includes(item) || item.includes(clause)));
  const base = uniquePhrases([...preferred, ...extra])
    .map(stripTraitLead)
    .filter((trait) => trait && !isWeakTrait(trait))
    .slice(0, 6);
  if (isMostlyLatin(description) && base.length < 3) {
    for (const fallback of ["Reflective and steady", "Grounded under pressure", "Open to a wider view"]) {
      if (base.length >= 3) break;
      if (!base.some((item) => compact(item) === compact(fallback))) base.push(fallback);
    }
  }
  return base;
}

export function deriveElementChips(quizId: string, resultLabel: string, locale: Locale): QuizShareChip[] {
  if (quizId !== "element" && quizId !== "five-element-overdrive") return [];
  const haystack = resultLabel.toLowerCase();
  return ELEMENT_CHIPS
    .filter((item) => item.keys.some((key) => haystack.includes(key.toLowerCase())))
    .map((item) => ({ label: item.label[locale], color: item.color }))
    .slice(0, 3);
}

export function buildQuizShareModel(input: QuizShareInput & { locale: Locale }, href = typeof window === "undefined" ? "/" : `${window.location.pathname}${window.location.search}`): QuizShareModel {
  const resultLabel = sanitizeResultLabel(input.resultLabel, input.quizId, input.locale);
  const traits = collectTraits(input, resultLabel);
  const chips = dropDuplicateChips(deriveElementChips(input.quizId, `${input.resultLabel} ${resultLabel}`, input.locale), resultLabel);
  const description = clipPhrase(String(input.description ?? ""), 180, 180);
  const origin = typeof window === "undefined" ? "https://zhao-wu.com" : window.location.origin;
  const rawPath = (href.split("#")[0] || "/");
  const sharePath = rawPath.startsWith("/") ? rawPath : `/${rawPath}`;
  const quizPath = quizSharePath(input.quizId, sharePath);
  return {
    ...input,
    resultLabel,
    description,
    traits,
    chips,
    shareUrl: `${origin}${sharePath}`,
    quizPath,
    cta: buildCta(input.locale, input.quizId, quizPath),
    marks: { site: "zhao-wu.com", original: input.locale === "en" ? "© STONE" : "STONE 原創" },
  };
}

function collectTraits(input: QuizShareInput, resultLabel: string): string[] {
  const clean = (trait: string) => clipPhrase(stripTraitLead(normalizeTraitSource(trait)), 14, 32);
  const fromInput = (input.traits ?? []).map(clean).filter(Boolean);
  const derived = deriveTraits(input.description, input.resultLabel, input.quizId).map(clean).filter(Boolean);
  return uniquePhrases([...fromInput, ...derived])
    .filter((trait) => !isRedundantPhrase(trait, resultLabel) && !isWeakTrait(trait))
    .slice(0, 3);
}

function stripTraitLead(text: string): string {
  return text.replace(/^(你擅長|你較容易|你需要|你已經|你已有|而是需要先|而是需要|而是|再讓)/, "").trim();
}

function isWeakTrait(trait: string): boolean {
  const value = trait.trim();
  if (!value) return true;
  if (/^[而或但卻却並并]/.test(value)) return true;
  if (/^(你現在|你較|你有|你在|你對|你擅|你已|你不|您|不是|只是|以及|依你)/.test(value)) return true;
  if (/^(you|i|we|they|he|she|your)\b/i.test(value)) return true;
  if (value.includes("…") && [...value].length > 12) return true;
  return false;
}

function dropDuplicateChips(chips: QuizShareChip[], resultLabel: string): QuizShareChip[] {
  const label = compact(resultLabel);
  return chips.filter((chip) => {
    const key = compact(chip.label);
    return key && !label.includes(key);
  });
}

function isRedundantPhrase(trait: string, resultLabel: string): boolean {
  const a = compact(trait);
  const b = compact(resultLabel);
  if (!a || !b) return true;
  if (a === b || b.includes(a)) return true;
  if (a.length >= 4 && a.includes(b)) return true;
  return false;
}

export function renderQuizShareCard(model: QuizShareModel): HTMLCanvasElement {
  const canvas = document.createElement("canvas");
  canvas.width = QUIZ_SHARE_SIZE.width;
  canvas.height = QUIZ_SHARE_SIZE.height;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Canvas unavailable");
  const layout = planQuizShareLayout(model, measureWithContext(ctx));
  paintQuizShareCard(ctx, model, layout);
  return canvas;
}

export function measureWithContext(ctx: CanvasRenderingContext2D): MeasureFn {
  return (font, text) => {
    ctx.font = font;
    const sample = text || "漢字Ag";
    const metrics = ctx.measureText(sample);
    const size = fontSizeOf(font);
    return {
      width: text ? metrics.width : 0,
      ascent: firstPositive(metrics.fontBoundingBoxAscent, metrics.actualBoundingBoxAscent, size * 0.88),
      descent: firstPositive(metrics.fontBoundingBoxDescent, metrics.actualBoundingBoxDescent, size * 0.24),
    };
  };
}

export function estimateShareText(font: string, text: string): FontMetrics {
  const size = fontSizeOf(font);
  let width = 0;
  for (const char of [...(text || "")]) {
    const code = char.codePointAt(0) ?? 0;
    if (/\s/.test(char)) width += size * 0.33;
    else if (code <= 0x7f) width += size * 0.62;
    else width += size;
  }
  return { width, ascent: size * 0.88, descent: size * 0.24 };
}

export function planQuizShareLayout(model: QuizShareModel, measure: MeasureFn) {
  const kickerFont = `500 28px ${SERIF}`;
  const markFont = `700 24px ${SANS}`;
  const kicker = measure(kickerFont, model.locale === "en" ? "A NOTE FROM ZHAOWU" : "昭梧 · 測驗箋記");
  const markMetrics = measure(markFont, model.marks.original);
  const markHeight = Math.ceil(markMetrics.ascent + markMetrics.descent);

  const headerTop = 118;
  const headerBottom = headerTop + kicker.ascent + kicker.descent;
  const ruleTop = headerBottom + 12;
  const ruleBottom = ruleTop + 6;
  const titleTop = ruleBottom + QUIZ_SHARE_MIN_GAP;
  const title = fitWrapped(measure, model.quizName, TITLE_WIDTH, 2, 54, 34, `500 {size}px ${SERIF}`);
  const titleBottom = titleTop + title.height;

  const lead = fitWrapped(measure, model.cta.lead, 800, 2, 36, 26, `500 {size}px ${SERIF}`);
  const pathLine = fitWrapped(measure, `→ ${model.cta.path}`, 800, 2, 26, 20, `400 {size}px ${SERIF}`);
  const ctaHeight = Math.ceil(lead.height + 18 + pathLine.height + 26);
  const ctaTop = BOTTOM_SAFE - ctaHeight;
  const markTop = ctaTop - 16 - markHeight;
  const middleBottom = markTop - QUIZ_SHARE_MIN_GAP;
  const middleTop = titleBottom + QUIZ_SHARE_MIN_GAP;
  const available = Math.max(0, middleBottom - middleTop);
  const sealBox = sealBounds();

  const layoutFor = (resultSize: number, resultWidth: number, gaps: MiddleGaps) => {
    const result = fitWrapped(measure, model.resultLabel || " ", resultWidth, 3, resultSize, 36, `700 {size}px ${SERIF}`);
    const description = model.description
      ? fitWrapped(measure, model.description, CONTENT_WIDTH, 3, 36, 26, `400 {size}px ${SANS}`)
      : null;
    const chipHeight = model.chips.length ? 56 : 0;
    const traits = model.traits.map((trait) => {
      const fitted = fitWrapped(measure, trait, CONTENT_WIDTH - 48, 2, 34, 24, `600 {size}px ${SANS}`);
      const height = Math.ceil(fitted.height + 22);
      return { trait, fitted, height };
    });
    const traitStack = traits.reduce((sum, item, index) => sum + item.height + (index ? gaps.trait : 0), 0);
    const parts = [
      result.height,
      gaps.afterResult,
      6,
      description ? gaps.afterRule + description.height : 0,
      chipHeight ? gaps.beforeChips + chipHeight : 0,
      traitStack ? gaps.beforeTraits + traitStack : 0,
    ];
    const natural = parts.reduce((sum, value) => sum + value, 0);
    return { result, description, chipHeight, traits, natural };
  };

  let resultSize = 132;
  let resultWidth = CONTENT_WIDTH;
  let gaps: MiddleGaps = { afterResult: 28, afterRule: 24, beforeChips: 28, beforeTraits: 24, trait: 16 };
  let planned = layoutFor(resultSize, resultWidth, gaps);
  const minGaps: MiddleGaps = { afterResult: 20, afterRule: 18, beforeChips: 20, beforeTraits: 18, trait: 12 };

  while (planned.natural > available && resultSize > 36) {
    resultSize -= 4;
    planned = layoutFor(resultSize, resultWidth, gaps);
  }
  if (planned.natural > available) {
    gaps = minGaps;
    planned = layoutFor(resultSize, resultWidth, gaps);
  }

  let leftover = Math.max(0, available - planned.natural);
  let topPad = leftover * 0.34;
  const resultTopCandidate = middleTop + topPad;
  if (resultTopCandidate < sealBox.y + sealBox.h + 16) {
    resultWidth = TITLE_WIDTH;
    planned = layoutFor(resultSize, resultWidth, gaps);
    leftover = Math.max(0, available - planned.natural);
    topPad = leftover * 0.34;
  } else {
    resultWidth = CONTENT_WIDTH;
  }

  // Re-fit at the chosen width/size after any width change, then distribute leftover.
  while (planned.natural > available && resultSize > 36) {
    resultSize -= 4;
    planned = layoutFor(resultSize, resultWidth, gaps);
  }
  leftover = Math.max(0, available - planned.natural);
  topPad = leftover * 0.42;
  const grow = leftover * 0.58;
  const slots = 2 + (planned.description ? 1 : 0) + (planned.chipHeight ? 1 : 0) + (planned.traits.length ? planned.traits.length : 0);
  const extra = slots > 0 ? grow / slots : 0;
  gaps = {
    afterResult: gaps.afterResult + extra,
    afterRule: gaps.afterRule + (planned.description ? extra : 0),
    beforeChips: gaps.beforeChips + (planned.chipHeight ? extra : 0),
    beforeTraits: gaps.beforeTraits + (planned.traits.length ? extra : 0),
    trait: gaps.trait + (planned.traits.length > 1 ? extra : 0),
  };

  let cursor = middleTop + topPad;
  const result = planned.result;
  const resultBox = { id: "result", x: CONTENT_LEFT, y: cursor, w: resultWidth, h: result.height, role: "content" as const };
  cursor += result.height + gaps.afterResult;
  const ruleY = cursor;
  cursor += 6;
  let descriptionBox: ShareBox | null = null;
  if (planned.description) {
    cursor += gaps.afterRule;
    descriptionBox = { id: "description", x: CONTENT_LEFT, y: cursor, w: CONTENT_WIDTH, h: planned.description.height, role: "content" };
    cursor += planned.description.height;
  }
  let chipsBox: ShareBox | null = null;
  if (planned.chipHeight) {
    cursor += gaps.beforeChips;
    chipsBox = { id: "chips", x: CONTENT_LEFT, y: cursor, w: CONTENT_WIDTH, h: planned.chipHeight, role: "content" };
    cursor += planned.chipHeight;
  }
  const traitBoxes: Array<ShareBox & { fitted: Fitted; font: string }> = [];
  planned.traits.forEach((item, index) => {
    cursor += index === 0 ? gaps.beforeTraits : gaps.trait;
    traitBoxes.push({ id: `trait-${index}`, x: CONTENT_LEFT, y: cursor, w: CONTENT_WIDTH, h: item.height, role: "content", fitted: item.fitted, font: item.fitted.font });
    cursor += item.height;
  });

  const headerBox: ShareBox = { id: "header", x: CONTENT_LEFT, y: headerTop, w: Math.ceil(kicker.width), h: headerBottom - headerTop, role: "content" };
  const titleBox: ShareBox = { id: "quizTitle", x: CONTENT_LEFT, y: titleTop, w: TITLE_WIDTH, h: title.height, role: "content" };
  const markBox: ShareBox = { id: "mark", x: CONTENT_LEFT, y: markTop, w: Math.ceil(markMetrics.width + 8), h: markHeight, role: "content" };
  const ctaBox: ShareBox = { id: "cta", x: 108, y: ctaTop, w: 864, h: ctaHeight, role: "content" };
  const corners: ShareBox[] = [
    { id: "corner-tl", x: 78, y: 78, w: CORNER, h: CORNER, role: "chrome" },
    { id: "corner-tr", x: 1002 - CORNER, y: 78, w: CORNER, h: CORNER, role: "chrome" },
    { id: "corner-bl", x: 78, y: 1842 - CORNER, w: CORNER, h: CORNER, role: "chrome" },
    { id: "corner-br", x: 1002 - CORNER, y: 1842 - CORNER, w: CORNER, h: CORNER, role: "chrome" },
  ];

  const boxes: ShareBox[] = [headerBox, titleBox, resultBox, markBox, ctaBox, sealBox, ...corners];
  if (descriptionBox) boxes.push(descriptionBox);
  if (chipsBox) boxes.push(chipsBox);
  for (const box of traitBoxes) boxes.push({ id: box.id, x: box.x, y: box.y, w: box.w, h: box.h, role: "content" });

  return {
    boxes,
    header: { box: headerBox, font: kickerFont, metrics: kicker },
    title: { box: titleBox, fitted: title },
    result: { box: resultBox, fitted: result },
    description: planned.description && descriptionBox ? { box: descriptionBox, fitted: planned.description } : null,
    chips: chipsBox,
    traits: traitBoxes,
    mark: { box: markBox, font: markFont, metrics: markMetrics },
    cta: { box: ctaBox, lead, pathLine },
    ruleY,
    seal: sealBox,
  };
}

type MiddleGaps = { afterResult: number; afterRule: number; beforeChips: number; beforeTraits: number; trait: number };

export function findOverlappingShareBoxes(boxes: ShareBox[], padding = 0): Array<[ShareBox, ShareBox]> {
  const pairs: Array<[ShareBox, ShareBox]> = [];
  for (let i = 0; i < boxes.length; i += 1) {
    for (let j = i + 1; j < boxes.length; j += 1) {
      const a = boxes[i];
      const b = boxes[j];
      if (a.role === "chrome" && b.role === "chrome") continue;
      if (boxesOverlap(a, b, padding)) pairs.push([a, b]);
    }
  }
  return pairs;
}

export function shareLayoutViolations(boxes: ShareBox[]): string[] {
  const violations: string[] = [];
  for (const [a, b] of findOverlappingShareBoxes(boxes)) {
    violations.push(`${a.id} overlaps ${b.id}`);
  }
  const header = boxes.find((box) => box.id === "header");
  const title = boxes.find((box) => box.id === "quizTitle");
  const result = boxes.find((box) => box.id === "result");
  if (header && title && verticalGap(header, title) < QUIZ_SHARE_MIN_GAP - 0.5) {
    violations.push(`header–quizTitle gap ${verticalGap(header, title).toFixed(1)} < ${QUIZ_SHARE_MIN_GAP}`);
  }
  if (title && result && verticalGap(title, result) < QUIZ_SHARE_MIN_GAP - 0.5) {
    violations.push(`quizTitle–result gap ${verticalGap(title, result).toFixed(1)} < ${QUIZ_SHARE_MIN_GAP}`);
  }
  for (const box of boxes) {
    if (box.role !== "content") continue;
    if (box.x < FRAME.left + 8 || box.y < FRAME.top + 8 || box.x + box.w > FRAME.right - 8 || box.y + box.h > FRAME.bottom - 8) {
      violations.push(`${box.id} leaves the inner frame`);
    }
  }
  return violations;
}

function paintQuizShareCard(ctx: CanvasRenderingContext2D, model: QuizShareModel, layout: ReturnType<typeof planQuizShareLayout>) {
  const { paper, jade, indigo, vermilion, gold, ink } = QUIZ_SHARE_PALETTE;
  ctx.fillStyle = paper;
  ctx.fillRect(0, 0, QUIZ_SHARE_SIZE.width, QUIZ_SHARE_SIZE.height);
  drawLandscape(ctx);
  drawRiceTexture(ctx);
  ctx.strokeStyle = "#D7C8AE";
  ctx.lineWidth = 3;
  ctx.strokeRect(38, 38, 1004, 1844);
  ctx.strokeStyle = gold;
  ctx.lineWidth = 2;
  ctx.strokeRect(FRAME.left, FRAME.top, FRAME.right - FRAME.left, FRAME.bottom - FRAME.top);
  drawCornerMarks(ctx, gold, vermilion);
  drawSeal(ctx, SEAL.x, SEAL.y);

  ctx.textAlign = "left";
  ctx.textBaseline = "alphabetic";
  ctx.fillStyle = jade;
  ctx.font = layout.header.font;
  ctx.fillText(model.locale === "en" ? "A NOTE FROM ZHAOWU" : "昭梧 · 測驗箋記", layout.header.box.x, layout.header.box.y + layout.header.metrics.ascent);
  ctx.fillStyle = vermilion;
  ctx.fillRect(CONTENT_LEFT, layout.header.box.y + layout.header.box.h + 12, 86, 6);

  drawFitted(ctx, layout.title.fitted, layout.title.box.x, layout.title.box.y, ink);
  drawFitted(ctx, layout.result.fitted, layout.result.box.x, layout.result.box.y, indigo);

  ctx.fillStyle = gold;
  ctx.fillRect(CONTENT_LEFT, layout.ruleY, 168, 6);

  if (layout.description) drawFitted(ctx, layout.description.fitted, layout.description.box.x, layout.description.box.y, ink);
  if (layout.chips) drawChips(ctx, model.chips, layout.chips.x, layout.chips.y);
  for (const trait of layout.traits) {
    ctx.strokeStyle = "rgba(48,91,80,.38)";
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(trait.x, trait.y + trait.h - 2);
    ctx.lineTo(trait.x + trait.w, trait.y + trait.h - 2);
    ctx.stroke();
    ctx.fillStyle = jade;
    ctx.beginPath();
    ctx.arc(trait.x + 28, trait.y + trait.h / 2, 7, 0, Math.PI * 2);
    ctx.fill();
    drawFitted(ctx, trait.fitted, trait.x + 48, trait.y + (trait.h - trait.fitted.height) / 2, ink);
  }

  ctx.fillStyle = vermilion;
  ctx.font = layout.mark.font;
  ctx.textBaseline = "alphabetic";
  ctx.fillText(model.marks.original, layout.mark.box.x, layout.mark.box.y + layout.mark.metrics.ascent);

  const cta = layout.cta.box;
  ctx.strokeStyle = "rgba(150,83,66,.65)";
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.moveTo(cta.x + 8, cta.y + 5);
  ctx.lineTo(cta.x + cta.w - 8, cta.y + 5);
  ctx.stroke();
  const ctaTextTop = cta.y + (cta.h - (layout.cta.lead.height + 10 + layout.cta.pathLine.height)) / 2;
  drawFitted(ctx, layout.cta.lead, cta.x + 28, ctaTextTop, vermilion);
  drawFitted(ctx, layout.cta.pathLine, cta.x + 28, ctaTextTop + layout.cta.lead.height + 10, jade);
}

function uniquePhrases(values: string[]): string[] {
  const seen = new Set<string>();
  const result: string[] = [];
  for (const value of values) {
    const phrase = value.replace(/\s+/g, " ").trim();
    if (!phrase || seen.has(phrase)) continue;
    seen.add(phrase);
    result.push(phrase);
  }
  return result;
}

function normalizeTraitSource(text: string): string {
  return String(text ?? "")
    .replace(/\s+/g, " ")
    .trim()
    .replace(/^[「『“"'）)\]]+|[」』”"'）。．.!?！？]+$/g, "")
    .trim();
}

function clipPhrase(text: string, maxChars: number, latinMax = maxChars): string {
  const value = String(text ?? "").replace(/\s+/g, " ").trim();
  const max = isMostlyLatin(value) ? latinMax : maxChars;
  const chars = [...value];
  if (chars.length <= max) return chars.join("");
  let clipped = chars.slice(0, Math.max(1, max - 1)).join("");
  if (isMostlyLatin(value)) clipped = clipped.replace(/\s+\S*$/, "").trimEnd() || clipped;
  clipped = clipped.replace(/[,;:、，]+$/g, "").trimEnd() || clipped;
  return `${clipped}…`;
}

function isMostlyLatin(value: string): boolean {
  return (value.match(/[A-Za-z]/g) ?? []).length > (value.match(/[\u4e00-\u9fff]/g) ?? []).length;
}

function compact(value: string): string {
  return value.replace(/[\s·•.|｜型型-]+/g, "").toLowerCase();
}

function drawRiceTexture(ctx: CanvasRenderingContext2D) {
  const { jade, vermilion, gold } = QUIZ_SHARE_PALETTE;
  ctx.save();
  ctx.globalAlpha = 0.045;
  for (let index = 0; index < 420; index += 1) {
    const x = 70 + ((index * 97) % 940);
    const y = 70 + ((index * 53) % 1770);
    const inMargin = x < 115 || x > 965 || y < 115 || y > 1805;
    if (!inMargin) continue;
    ctx.fillStyle = index % 3 === 0 ? jade : index % 3 === 1 ? vermilion : gold;
    ctx.beginPath();
    ctx.ellipse(x, y, 9, 3, (index % 8) * 0.4, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.restore();
}

function drawLandscape(ctx: CanvasRenderingContext2D) {
  if (LANDSCAPE_IMAGE?.complete && LANDSCAPE_IMAGE.naturalWidth) paintLandscapeImage(ctx, LANDSCAPE_IMAGE);
}

function paintLandscapeImage(ctx: CanvasRenderingContext2D, image: HTMLImageElement) {
  ctx.save();
  const scale = Math.max(QUIZ_SHARE_SIZE.width / image.naturalWidth, QUIZ_SHARE_SIZE.height / image.naturalHeight);
  const width = image.naturalWidth * scale;
  const height = image.naturalHeight * scale;
  ctx.globalAlpha = 0.56;
  ctx.drawImage(image, (QUIZ_SHARE_SIZE.width - width) / 2, (QUIZ_SHARE_SIZE.height - height) / 2, width, height);
  ctx.globalAlpha = 0.58;
  ctx.fillStyle = QUIZ_SHARE_PALETTE.paper;
  ctx.fillRect(0, 0, QUIZ_SHARE_SIZE.width, QUIZ_SHARE_SIZE.height);
  ctx.restore();
}

function drawCornerMarks(ctx: CanvasRenderingContext2D, gold: string, vermilion: string) {
  const draw = (x: number, y: number, flipX: number, flipY: number) => {
    ctx.save();
    ctx.translate(x, y);
    ctx.scale(flipX, flipY);
    ctx.strokeStyle = gold;
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(0, 36);
    ctx.lineTo(0, 0);
    ctx.lineTo(36, 0);
    ctx.stroke();
    ctx.strokeStyle = vermilion;
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(8, 28);
    ctx.lineTo(8, 8);
    ctx.lineTo(28, 8);
    ctx.stroke();
    ctx.restore();
  };
  draw(78, 78, 1, 1);
  draw(1002, 78, -1, 1);
  draw(78, 1842, 1, -1);
  draw(1002, 1842, -1, -1);
}

function drawSeal(ctx: CanvasRenderingContext2D, x: number, y: number) {
  const { vermilion, paper } = QUIZ_SHARE_PALETTE;
  const glyph = "昭梧";
  ctx.save();
  ctx.translate(x, y);
  ctx.rotate((-13 * Math.PI) / 180);
  ctx.fillStyle = vermilion;
  roundRect(ctx, -74, -74, 148, 148, 10);
  ctx.fill();
  ctx.strokeStyle = paper;
  ctx.lineWidth = 5;
  roundRect(ctx, -62, -62, 124, 124, 6);
  ctx.stroke();
  ctx.fillStyle = paper;
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  const size = 46;
  ctx.font = `700 ${size}px ${SERIF}`;
  if ([...glyph].length === 2) {
    ctx.fillText([...glyph][0], 0, -22);
    ctx.fillText([...glyph][1], 0, 26);
  } else {
    ctx.fillText(glyph, 0, 2);
  }
  ctx.restore();
  ctx.textAlign = "left";
  ctx.textBaseline = "alphabetic";
}

function sealBounds(): ShareBox {
  const half = SEAL.size / 2;
  const extent = half * Math.abs(Math.cos(SEAL.rotate)) + half * Math.abs(Math.sin(SEAL.rotate));
  return {
    id: "seal",
    x: SEAL.x - extent,
    y: SEAL.y - extent,
    w: extent * 2,
    h: extent * 2,
    role: "chrome",
  };
}

function drawChips(ctx: CanvasRenderingContext2D, chips: QuizShareChip[], x: number, y: number) {
  ctx.textBaseline = "alphabetic";
  ctx.font = `500 30px ${SERIF}`;
  ctx.fillStyle = QUIZ_SHARE_PALETTE.jade;
  chips.forEach((chip, index) => {
    const cursor = x + chips.slice(0, index).reduce((total, item) => total + ctx.measureText(item.label).width + 40, 0);
    ctx.fillStyle = chip.color;
    ctx.fillText(chip.label, cursor, y + 36);
    if (index < chips.length - 1) {
      ctx.fillStyle = QUIZ_SHARE_PALETTE.gold;
      ctx.fillText("·", cursor + ctx.measureText(chip.label).width + 14, y + 36);
    }
  });
}

function fitWrapped(
  measure: MeasureFn,
  text: string,
  maxWidth: number,
  maxLines: number,
  maxSize: number,
  minSize: number,
  fontTemplate: string,
): Fitted {
  let size = maxSize;
  let lines: string[] = [];
  let font = fontTemplate.replace("{size}", String(size));
  let ascent = size * 0.88;
  let descent = size * 0.24;
  while (size >= minSize) {
    font = fontTemplate.replace("{size}", String(size));
    const probe = measure(font, text || "漢字Ag");
    ascent = probe.ascent;
    descent = probe.descent;
    const wrapped = wrapLines(measure, font, text, maxWidth, size === minSize);
    const overflow = wrapped.length > maxLines || wrapped.some((line) => measure(font, line).width > maxWidth + 0.5);
    if (!overflow) {
      lines = wrapped;
      break;
    }
    if (size === minSize) {
      lines = wrapped.slice(0, maxLines);
      const tooWide = lines.some((line) => measure(font, line).width > maxWidth + 0.5);
      if (wrapped.length > maxLines || tooWide) {
        lines = truncateLines(measure, font, lines, maxWidth, wrapped.length > maxLines);
      }
      break;
    }
    size -= 2;
  }
  font = fontTemplate.replace("{size}", String(size));
  const lineHeight = Math.ceil(Math.max(size * 1.2, ascent + descent + 4));
  const height = Math.ceil(ascent + Math.max(0, lines.length - 1) * lineHeight + descent);
  return { lines, size, lineHeight, ascent, descent, height, font };
}

function wrapLines(measure: MeasureFn, font: string, text: string, maxWidth: number, allowGlyphSplit = false): string[] {
  const source = String(text || "").trim() || " ";
  const tokens = source.split(/(\s+|[×·•|｜/／—])/).filter((token) => token !== "");
  const lines: string[] = [];
  let line = "";
  const widthOf = (value: string) => measure(font, value).width;
  const commit = () => {
    const trimmed = line.replace(/\s+$/g, "").trim();
    if (trimmed) lines.push(trimmed);
    line = "";
  };
  const appendWide = (chunk: string) => {
    let piece = "";
    for (const char of [...chunk]) {
      const trial = piece + char;
      if (piece && widthOf(trial) > maxWidth) {
        lines.push(piece);
        piece = char;
      } else piece = trial;
    }
    line = piece;
  };
  for (const token of tokens) {
    if (!line) {
      const start = token.trimStart();
      if (widthOf(start) > maxWidth && allowGlyphSplit) appendWide(start);
      else line = start;
      continue;
    }
    const trial = line + token;
    if (widthOf(trial.trimEnd()) > maxWidth) {
      commit();
      const next = token.replace(/^\s+/, "");
      if (!next) continue;
      if (widthOf(next) > maxWidth && allowGlyphSplit) appendWide(next);
      else line = next;
    } else {
      line = trial;
    }
  }
  commit();
  return lines.filter(Boolean);
}

function truncateLines(measure: MeasureFn, font: string, lines: string[], maxWidth: number, forceEllipsis = false): string[] {
  return lines.map((line, index) => {
    const isLast = index === lines.length - 1;
    const needEllipsis = isLast && (forceEllipsis || measure(font, line).width > maxWidth);
    if (!needEllipsis && measure(font, line).width <= maxWidth) return line;
    const chars = [...line];
    const suffix = needEllipsis ? "…" : "";
    while (chars.length && measure(font, `${chars.join("")}${suffix}`).width > maxWidth) chars.pop();
    return `${chars.join("")}${suffix}`;
  });
}

function drawFitted(ctx: CanvasRenderingContext2D, fitted: Fitted, x: number, top: number, color: string) {
  ctx.fillStyle = color;
  ctx.textAlign = "left";
  ctx.textBaseline = "alphabetic";
  ctx.font = fitted.font;
  const baseline = top + fitted.ascent;
  fitted.lines.forEach((line, index) => ctx.fillText(line, x, baseline + index * fitted.lineHeight));
}

function boxesOverlap(a: ShareBox, b: ShareBox, padding = 0): boolean {
  return a.x < b.x + b.w + padding && a.x + a.w + padding > b.x && a.y < b.y + b.h + padding && a.y + a.h + padding > b.y;
}

function verticalGap(a: ShareBox, b: ShareBox): number {
  const upper = a.y <= b.y ? a : b;
  const lower = upper === a ? b : a;
  return lower.y - (upper.y + upper.h);
}

function firstPositive(...values: Array<number | undefined>): number {
  return values.find((value) => typeof value === "number" && Number.isFinite(value) && value > 0) ?? 0;
}

function fontSizeOf(font: string): number {
  return Number(/(\d+(?:\.\d+)?)px/.exec(font)?.[1] ?? 16);
}

function roundRect(ctx: CanvasRenderingContext2D, x: number, y: number, width: number, height: number, radius: number) {
  const r = Math.min(radius, width / 2, height / 2);
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + width, y, x + width, y + height, r);
  ctx.arcTo(x + width, y + height, x, y + height, r);
  ctx.arcTo(x, y + height, x, y, r);
  ctx.arcTo(x, y, x + width, y, r);
  ctx.closePath();
}
