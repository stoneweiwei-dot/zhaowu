import type { Locale } from "@/lib/i18n";

export const QUIZ_SHARE_SIZE = { width: 1080, height: 1350 } as const;
export const QUIZ_SHARE_PALETTE = {
  paper: "#F3EBDD",
  jade: "#286653",
  indigo: "#414C78",
  vermilion: "#A8463D",
  gold: "#B28A45",
  ink: "#28271F",
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

const SERIF = '"Noto Serif CJK TC", "Noto Serif CJK SC", "Noto Serif TC", "Source Han Serif TC", serif';
const SANS = '"Noto Sans CJK TC", "Noto Sans CJK SC", "Noto Sans TC", "Noto Sans", system-ui, sans-serif';

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

export function sanitizeResultLabel(label: string, quizId = ""): string {
  let text = String(label ?? "").replace(/[A-G]\s*[·•.．、]\s*/g, "").replace(/\s{2,}/g, " ").trim();
  text = text.replace(/^[·•.\s]+|[·•.\s]+$/g, "").replace(/[·•]\s*[·•]/g, "·").trim();
  if (quizId === "animal") {
    const parts = text.split(/\s*[·•|｜]\s*/).map((part) => part.trim()).filter(Boolean);
    if (parts.length > 1) return parts[0];
  }
  const pipe = text.split(/\s*[｜|]\s*/).map((part) => part.trim()).filter(Boolean);
  if (pipe.length === 2 && [...pipe[0]].length <= 6) return pipe[0];
  return text;
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
    .split(/\s*[·•/／、|｜]\s*|\s{0,2}(?:——|--)\s*/)
    .map((part) => part.replace(/^[「『“"')\]）]+|[」』”"')\]）。.!?！？]+$/g, "").trim())
    .filter((part) => part && [...part].length <= 18);
  const clauses = String(description ?? "")
    .split(/[，,。；;]/)
    .map((part) => part.trim())
    .filter(Boolean)
    .map((part) => clipPhrase(part, 16));
  const preferred = uniquePhrases([...leftover, ...quoted, ...(split.length >= 2 ? split : [])]);
  const extra = clauses.filter((clause) => !preferred.some((item) => clause.includes(item) || item.includes(clause)));
  return uniquePhrases(preferred.length >= 2 ? preferred : [...preferred, ...extra]).slice(0, 3);
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
  const resultLabel = sanitizeResultLabel(input.resultLabel, input.quizId);
  const traits = uniquePhrases(input.traits?.length ? input.traits.map((trait) => clipPhrase(trait, 16)) : deriveTraits(input.description, input.resultLabel, input.quizId)).slice(0, 3);
  const chips = deriveElementChips(input.quizId, `${input.resultLabel} ${resultLabel}`, input.locale);
  const description = [...String(input.description ?? "")].slice(0, 40).join("");
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

export function renderQuizShareCard(model: QuizShareModel): HTMLCanvasElement {
  const canvas = document.createElement("canvas");
  canvas.width = QUIZ_SHARE_SIZE.width;
  canvas.height = QUIZ_SHARE_SIZE.height;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Canvas unavailable");
  const { paper, jade, indigo, vermilion, gold, ink } = QUIZ_SHARE_PALETTE;
  ctx.fillStyle = paper;
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  drawRiceTexture(ctx);
  ctx.strokeStyle = "#D7C8AE";
  ctx.lineWidth = 3;
  ctx.strokeRect(38, 38, 1004, 1274);
  ctx.strokeStyle = gold;
  ctx.lineWidth = 2;
  ctx.strokeRect(57, 57, 966, 1236);
  drawCornerMarks(ctx, gold, vermilion);

  const textLeft = 120;
  const textWidth = 640;
  ctx.textBaseline = "alphabetic";
  ctx.textAlign = "left";
  ctx.fillStyle = jade;
  ctx.font = `600 28px ${SANS}`;
  ctx.fillText("ZHAOWU · QUIZ", textLeft, 168);
  ctx.fillStyle = vermilion;
  ctx.fillRect(textLeft, 188, 86, 6);
  drawSeal(ctx, 900, 196, model.quizId);

  ctx.fillStyle = ink;
  const quizName = fitWrapped(ctx, model.quizName, textWidth, 2, 42, 28, `600 {size}px ${SANS}`);
  drawLines(ctx, quizName.lines, textLeft, 250, quizName.lineHeight, ink);

  const nameTop = 250 + quizName.lines.length * quizName.lineHeight + 36;
  ctx.fillStyle = indigo;
  const result = fitWrapped(ctx, model.resultLabel || " ", textWidth, 3, 110, 36, `700 {size}px ${SERIF}`);
  drawLines(ctx, result.lines, textLeft, nameTop, result.lineHeight, indigo);

  let cursor = nameTop + (result.lines.length - 1) * result.lineHeight + result.size * 0.35 + 34;
  ctx.fillStyle = gold;
  ctx.fillRect(textLeft, cursor, 168, 6);
  cursor += 42;

  if (model.chips.length) {
    drawChips(ctx, model.chips, textLeft, cursor);
    cursor += 86;
  }
  if (model.traits.length) {
    cursor = drawTraits(ctx, model.traits, textLeft, cursor, 840);
  } else if (!model.chips.length && model.description) {
    const body = fitWrapped(ctx, model.description, 840, 3, 36, 28, `400 {size}px ${SANS}`);
    drawLines(ctx, body.lines, textLeft, cursor, body.lineHeight, ink);
    cursor += body.lines.length * body.lineHeight;
  }

  const ctaTop = 1128;
  ctx.fillStyle = "rgba(168,70,61,.12)";
  roundRect(ctx, 108, ctaTop, 864, 132, 22);
  ctx.fill();
  ctx.strokeStyle = "rgba(168,70,61,.28)";
  ctx.lineWidth = 1.5;
  ctx.stroke();
  ctx.fillStyle = vermilion;
  const lead = fitWrapped(ctx, model.cta.lead, 800, 2, 36, 26, `700 {size}px ${SERIF}`);
  drawLines(ctx, lead.lines, 136, ctaTop + 46, lead.lineHeight, vermilion);
  ctx.fillStyle = jade;
  const pathLine = fitWrapped(ctx, `→ ${model.cta.path}`, 800, 2, 30, 22, `600 {size}px ${SANS}`);
  drawLines(ctx, pathLine.lines, 136, ctaTop + 46 + lead.lines.length * lead.lineHeight + 8, pathLine.lineHeight, jade);

  ctx.textAlign = "left";
  ctx.fillStyle = vermilion;
  ctx.font = `700 24px ${SANS}`;
  ctx.fillText(model.marks.original, 120, 1298);
  return canvas;
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

function clipPhrase(text: string, maxChars: number): string {
  const value = String(text ?? "").replace(/\s+/g, " ").trim();
  const latin = (value.match(/[A-Za-z]/g) ?? []).length > (value.match(/[\u4e00-\u9fff]/g) ?? []).length;
  const max = latin ? Math.max(maxChars, 72) : maxChars;
  const chars = [...value];
  if (chars.length <= max) return chars.join("");
  let clipped = chars.slice(0, max - 1).join("");
  if (latin) clipped = clipped.replace(/\s+\S*$/, "").trimEnd() || clipped;
  return `${clipped}…`;
}

function drawRiceTexture(ctx: CanvasRenderingContext2D) {
  const { jade, vermilion, gold } = QUIZ_SHARE_PALETTE;
  ctx.save();
  ctx.globalAlpha = 0.045;
  for (let index = 0; index < 420; index += 1) {
    const x = 70 + ((index * 97) % 940);
    const y = 70 + ((index * 53) % 1210);
    const inMargin = x < 115 || x > 965 || y < 115 || y > 1235;
    if (!inMargin) continue;
    ctx.fillStyle = index % 3 === 0 ? jade : index % 3 === 1 ? vermilion : gold;
    ctx.beginPath();
    ctx.ellipse(x, y, 9, 3, (index % 8) * 0.4, 0, Math.PI * 2);
    ctx.fill();
  }
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
  draw(78, 1272, 1, -1);
  draw(1002, 1272, -1, -1);
}

function drawSeal(ctx: CanvasRenderingContext2D, x: number, y: number, quizId: string) {
  const { vermilion, paper } = QUIZ_SHARE_PALETTE;
  const glyph = sealGlyph(quizId);
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
  const size = [...glyph].length > 1 ? 42 : 72;
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

function sealGlyph(quizId: string): string {
  switch (quizId) {
    case "six-realms": return "道";
    case "divine-affinity": return "緣";
    case "earth-online": return "關";
    case "cultivation-destiny": return "修";
    case "animal": return "獸";
    case "element":
    case "five-element-overdrive": return "行";
    default: return "測";
  }
}

function drawChips(ctx: CanvasRenderingContext2D, chips: QuizShareChip[], x: number, y: number) {
  let cursor = x;
  ctx.textBaseline = "middle";
  ctx.font = `700 30px ${SANS}`;
  for (const chip of chips) {
    const width = Math.min(220, Math.max(108, ctx.measureText(chip.label).width + 70));
    ctx.fillStyle = chip.color;
    roundRect(ctx, cursor, y, width, 56, 28);
    ctx.fill();
    ctx.fillStyle = "#F8F3E8";
    ctx.beginPath();
    ctx.arc(cursor + 28, y + 28, 10, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = "#F8F3E8";
    ctx.textAlign = "left";
    ctx.fillText(chip.label, cursor + 48, y + 30, width - 64);
    cursor += width + 16;
  }
  ctx.textBaseline = "alphabetic";
}

function drawTraits(ctx: CanvasRenderingContext2D, traits: string[], x: number, y: number, maxWidth: number): number {
  let cursor = y;
  for (const trait of traits) {
    const fitted = fitWrapped(ctx, trait, maxWidth - 48, 2, 36, 26, `600 {size}px ${SANS}`);
    const height = fitted.lines.length * fitted.lineHeight + 28;
    ctx.fillStyle = "rgba(40,102,83,.08)";
    roundRect(ctx, x, cursor, maxWidth, height, 18);
    ctx.fill();
    ctx.fillStyle = QUIZ_SHARE_PALETTE.jade;
    ctx.beginPath();
    ctx.arc(x + 28, cursor + height / 2, 7, 0, Math.PI * 2);
    ctx.fill();
    drawLines(ctx, fitted.lines, x + 48, cursor + 20 + fitted.size * 0.8, fitted.lineHeight, QUIZ_SHARE_PALETTE.ink);
    cursor += height + 16;
  }
  return cursor;
}

function fitWrapped(
  ctx: CanvasRenderingContext2D,
  text: string,
  maxWidth: number,
  maxLines: number,
  maxSize: number,
  minSize: number,
  fontTemplate: string,
): { lines: string[]; size: number; lineHeight: number } {
  let size = maxSize;
  let lines: string[] = [];
  while (size >= minSize) {
    ctx.font = fontTemplate.replace("{size}", String(size));
    const wrapped = wrapLines(ctx, text, maxWidth, Number.POSITIVE_INFINITY, size === minSize);
    const overflow = wrapped.length > maxLines || wrapped.some((line) => ctx.measureText(line).width > maxWidth + 0.5);
    if (!overflow) {
      lines = wrapped;
      break;
    }
    if (size === minSize) {
      lines = wrapped.slice(0, maxLines);
      if (wrapped.length > maxLines || lines.some((line) => ctx.measureText(line).width > maxWidth + 0.5)) {
        lines = truncateLines(ctx, lines, maxWidth);
      }
      break;
    }
    size -= 2;
  }
  ctx.font = fontTemplate.replace("{size}", String(size));
  return { lines, size, lineHeight: Math.round(size * 1.18) };
}

function wrapLines(ctx: CanvasRenderingContext2D, text: string, maxWidth: number, maxLines: number, allowGlyphSplit = false): string[] {
  const source = String(text || "").trim() || " ";
  const tokens = source.split(/(\s+|[×·•|｜/／—])/).filter((token) => token !== "");
  const lines: string[] = [];
  let line = "";
  const commit = () => {
    const trimmed = line.replace(/\s+$/g, "").trim();
    if (trimmed) lines.push(trimmed);
    line = "";
  };
  const appendWide = (chunk: string) => {
    let piece = "";
    for (const char of [...chunk]) {
      const trial = piece + char;
      if (piece && ctx.measureText(trial).width > maxWidth) {
        lines.push(piece);
        piece = char;
      } else piece = trial;
    }
    line = piece;
  };
  for (const token of tokens) {
    if (!line) {
      const start = token.trimStart();
      if (ctx.measureText(start).width > maxWidth && allowGlyphSplit) appendWide(start);
      else line = start;
      continue;
    }
    const trial = line + token;
    if (ctx.measureText(trial.trimEnd()).width > maxWidth) {
      commit();
      const next = token.replace(/^\s+/, "");
      if (!next) continue;
      if (ctx.measureText(next).width > maxWidth && allowGlyphSplit) appendWide(next);
      else line = next;
    } else {
      line = trial;
    }
  }
  commit();
  return lines.filter(Boolean).slice(0, Math.max(maxLines, lines.length));
}

function truncateLines(ctx: CanvasRenderingContext2D, lines: string[], maxWidth: number): string[] {
  return lines.map((line, index) => {
    if (ctx.measureText(line).width <= maxWidth) return line;
    const chars = [...line];
    const suffix = index === lines.length - 1 ? "…" : "";
    while (chars.length && ctx.measureText(`${chars.join("")}${suffix}`).width > maxWidth) chars.pop();
    return `${chars.join("")}${suffix}`;
  });
}

function drawLines(ctx: CanvasRenderingContext2D, lines: string[], x: number, y: number, lineHeight: number, color: string) {
  ctx.fillStyle = color;
  ctx.textAlign = "left";
  ctx.textBaseline = "alphabetic";
  lines.forEach((line, index) => ctx.fillText(line, x, y + index * lineHeight));
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
