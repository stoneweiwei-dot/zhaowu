import type { Locale } from "@/lib/i18n";
import {
  DAO_ARTS,
  FO_ARTS,
  PANEL_ATTRS,
  WU_ARTS,
  isActiveArt,
  type CharacterPanel,
  type MethodSchool,
  type PanelAttr,
} from "@/lib/report/character-panel";
import {
  CHARACTER_PANEL_DEEP_IMAGE_PROMPT,
  CHARACTER_PANEL_IMAGE_HEIGHT,
  CHARACTER_PANEL_IMAGE_WIDTH,
  CHARACTER_PANEL_PORTRAIT_SLOT,
  CHARACTER_PANEL_VISUAL_CONTRACT_ID,
} from "@/lib/report/character-panel-visual-contract";

export const CARD_WIDTH = CHARACTER_PANEL_IMAGE_WIDTH;
export const CARD_HEIGHT = CHARACTER_PANEL_IMAGE_HEIGHT;

const ATTR_HANS: Record<PanelAttr, string> = {
  精: "精",
  炁: "炁",
  神: "神",
  武: "武",
  術: "术",
  護: "护",
  寶: "宝",
  遁: "遁",
  廣: "广",
  察: "察",
};

const DAO_HANS = ["仙", "医", "命", "相", "卜"] as const;
const FO_HANS = ["禅", "悉", "观", "闻", "识"] as const;
const WU_HANS = ["巫", "祝", "鬼", "妖", "契"] as const;

export function attrLabel(key: PanelAttr, locale: Locale): string {
  if (locale === "zh-Hans") return ATTR_HANS[key];
  return key;
}

export function artRows(locale: Locale) {
  if (locale === "zh-Hans") {
    return { dao: [...DAO_HANS], fo: [...FO_HANS], wu: [...WU_HANS] };
  }
  return { dao: [...DAO_ARTS], fo: [...FO_ARTS], wu: [...WU_ARTS] };
}

export function schoolCaption(school: MethodSchool, locale: Locale): string {
  if (locale === "en") {
    return school === "dao" ? "Dao · five arts" : school === "fo" ? "Buddha · contemplation" : "Wu · pact arts";
  }
  if (locale === "zh-Hans") {
    return school === "dao" ? "道门｜玄门五术" : school === "fo" ? "佛门｜禅观法门" : "巫门｜巫祝契盟";
  }
  return school === "dao" ? "道門｜玄門五術" : school === "fo" ? "佛門｜禪觀法門" : "巫門｜巫祝契盟";
}

export function panelCaptions(locale: Locale): string[] {
  if (locale === "en") {
    return [
      "Ten attributes: Jing, Qi, Shen, Wu, Shu, Hu, Bao, Dun, Guang and Cha. Each scores 10, total 100.",
      "Besides the ten attributes there are three method schools: Dao, Buddha and Wu.",
      "This is a general character attribute panel. Its matched art is separate from all dedicated theme quizzes.",
    ];
  }
  if (locale === "zh-Hans") {
    return [
      "我们会用到十项属性：精、炁、神、武、术、护、宝、遁、广、察，每项十分，总分一百分。",
      "除这十项属性之外，还有道、佛、巫三套功法类型：仙、医、命、相、卜；禅、悉、观、闻、识；巫、祝、鬼、妖、契。",
      "这是通用人物属性结果面板，配图只服务当前属性结果，并与任何独立主题测验的专属图像分开。",
    ];
  }
  return [
    "我們會用到十項屬性：精、炁、神、武、術、護、寶、遁、廣、察，每項十分，總分一百分。",
    "除這十項屬性之外，還有道、佛、巫三套功法類型：仙、醫、命、相、卜；禪、悉、觀、聞、識；巫、祝、鬼、妖、契。",
    "這是通用人物屬性結果面板，配圖只服務當前屬性結果，並與任何獨立主題測驗的專屬圖像分開。",
  ];
}

export function radarVertex(index: number, cx: number, cy: number, r: number) {
  const angle = -Math.PI / 2 + (index * 2 * Math.PI) / PANEL_ATTRS.length;
  return { x: cx + Math.cos(angle) * r, y: cy + Math.sin(angle) * r };
}

export function radarPolygon(scores: Record<PanelAttr, number>, cx: number, cy: number, r: number) {
  return PANEL_ATTRS.map((key, index) => radarVertex(index, cx, cy, (scores[key] / 10) * r));
}

function escapeXml(value: string): string {
  return String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}

function polygonAttr(points: { x: number; y: number }[]): string {
  return points.map((point) => `${point.x.toFixed(1)},${point.y.toFixed(1)}`).join(" ");
}

function tableCell(x: number, y: number, width: number, height: number, fill: string, text: string, active = false) {
  const color = active ? "#9b342a" : "#2e2922";
  return `<rect x="${x}" y="${y}" width="${width}" height="${height}" fill="${fill}" stroke="#9c8258" stroke-width="1"/><text x="${x + width / 2}" y="${y + height / 2 + 7}" text-anchor="middle" font-size="24" fill="${color}">${escapeXml(text)}</text>`;
}

export function buildPortraitPanelSvg(panel: CharacterPanel, locale: Locale): string {
  const labels = PANEL_ATTRS.map((key) => attrLabel(key, locale));
  const arts = artRows(locale);
  const captions = panelCaptions(locale);
  const radarCx = 800;
  const radarCy = 530;
  const radarR = 168;
  const fill = radarPolygon(panel.scores, radarCx, radarCy, radarR);
  const ring = PANEL_ATTRS.map((_, index) => radarVertex(index, radarCx, radarCy, radarR));
  const ringInner = PANEL_ATTRS.map((_, index) => radarVertex(index, radarCx, radarCy, radarR * 0.66));
  const ringCore = PANEL_ATTRS.map((_, index) => radarVertex(index, radarCx, radarCy, radarR * 0.33));
  const empty = locale === "en"
    ? "Matched Song-style portrait"
    : locale === "zh-Hans"
      ? "正在匹配宋系人物画像"
      : "正在匹配宋系人物畫像";
  const artKeys = [DAO_ARTS, FO_ARTS, WU_ARTS];

  const artCells = [arts.dao, arts.fo, arts.wu].flatMap((row, rowIndex) =>
    row.map((art, colIndex) => {
      const x = 60 + colIndex * 192;
      const y = 1110 + rowIndex * 58;
      const active = isActiveArt(panel.artScores[artKeys[rowIndex][colIndex]]);
      const fillColor = active ? "#f2dfcf" : rowIndex === 0 ? "#efe5d2" : "#faf4e7";
      return tableCell(x, y, 192, 58, fillColor, art, active);
    }),
  ).join("");

  const scoreHeads = labels.map((label, index) => {
    const x = 60 + index * 96;
    return tableCell(x, 956, 96, 52, "#eee2cc", label);
  }).join("");
  const scoreVals = PANEL_ATTRS.map((key, index) => {
    const x = 60 + index * 96;
    return tableCell(x, 1008, 96, 52, "#faf4e8", String(panel.scores[key]));
  }).join("");

  const radarLabels = labels.map((label, index) => {
    const pos = radarVertex(index, radarCx, radarCy, 212);
    return `<text x="${pos.x.toFixed(1)}" y="${(pos.y + 7).toFixed(1)}" text-anchor="middle" font-size="24" fill="#4c3d2e">${escapeXml(label)}</text>`;
  }).join("");

  const portrait = CHARACTER_PANEL_PORTRAIT_SLOT;
  const totalLabel = locale === "en" ? "TOTAL" : locale === "zh-Hans" ? "总分" : "總分";
  const panelLabel = locale === "en" ? "CHARACTER ATTRIBUTE SHEET" : locale === "zh-Hans" ? "人物属性图鉴" : "人物屬性圖鑑";

  return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="${CARD_WIDTH}" height="${CARD_HEIGHT}" viewBox="0 0 ${CARD_WIDTH} ${CARD_HEIGHT}" data-visual-contract="${CHARACTER_PANEL_VISUAL_CONTRACT_ID}">
  <metadata>${escapeXml(CHARACTER_PANEL_VISUAL_CONTRACT_ID)}</metadata>
  <desc>${escapeXml(CHARACTER_PANEL_DEEP_IMAGE_PROMPT)}</desc>
  <defs>
    <pattern id="paper-fibre" width="18" height="18" patternUnits="userSpaceOnUse">
      <path d="M0 4 C6 2 12 6 18 3 M2 14 C8 11 12 16 18 12" fill="none" stroke="#8e7350" stroke-opacity="0.05" stroke-width="0.8"/>
    </pattern>
    <linearGradient id="portrait-wash" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0" stop-color="#eadcc2"/>
      <stop offset="0.55" stop-color="#f4ead8"/>
      <stop offset="1" stop-color="#d8c6a7"/>
    </linearGradient>
  </defs>
  <rect width="100%" height="100%" fill="#eee3cd"/>
  <rect x="22" y="24" width="1036" height="1870" fill="#f8f0df" stroke="#b49a70" stroke-width="1.5"/>
  <rect x="32" y="34" width="1016" height="1850" fill="url(#paper-fibre)" stroke="#c8b28b" stroke-width="0.8"/>

  <text x="60" y="82" font-size="17" letter-spacing="5" fill="#8e6b42">ZHAOWU · ${escapeXml(panelLabel)}</text>
  <text x="1020" y="82" text-anchor="end" font-size="16" fill="#8f653c">STONE · 昭梧</text>
  <line x1="60" y1="104" x2="1020" y2="104" stroke="#baa27b" stroke-width="1"/>

  <rect x="${portrait.x}" y="${portrait.y}" width="${portrait.width}" height="${portrait.height}" fill="url(#portrait-wash)" stroke="#9b8059" stroke-width="1.4"/>
  <path d="M85 800 C190 715 245 748 330 675 C395 620 448 610 507 538" fill="none" stroke="#79664e" stroke-opacity="0.18" stroke-width="2"/>
  <path d="M80 850 C174 790 256 820 358 744 C410 706 460 690 520 640" fill="none" stroke="#79664e" stroke-opacity="0.11" stroke-width="1.5"/>
  <text x="${portrait.x + portrait.width / 2}" y="${portrait.y + portrait.height / 2}" text-anchor="middle" fill="#887d6d" font-size="23">${escapeXml(empty)}</text>

  <text x="570" y="176" font-size="62" font-family="Songti SC, STSong, Noto Serif CJK SC, serif" fill="#211e1a">${escapeXml(panel.title)}</text>
  <text x="572" y="222" font-size="22" fill="#675a4a">${escapeXml(schoolCaption(panel.school, locale))} · ${escapeXml(panel.dayMaster)}</text>
  <rect x="936" y="145" width="62" height="62" fill="none" stroke="#a53c2e" stroke-width="2"/>
  <text x="967" y="184" text-anchor="middle" font-size="24" fill="#a53c2e">昭梧</text>

  <polygon points="${polygonAttr(ring)}" fill="#eee3ce" fill-opacity="0.52" stroke="#8d7450" stroke-width="2"/>
  <polygon points="${polygonAttr(ringInner)}" fill="none" stroke="#9d8664" stroke-opacity="0.38" stroke-width="1" stroke-dasharray="4 5"/>
  <polygon points="${polygonAttr(ringCore)}" fill="none" stroke="#9d8664" stroke-opacity="0.28" stroke-width="1" stroke-dasharray="3 5"/>
  ${PANEL_ATTRS.map((_, index) => {
    const edge = radarVertex(index, radarCx, radarCy, radarR);
    return `<line x1="${radarCx}" y1="${radarCy}" x2="${edge.x.toFixed(1)}" y2="${edge.y.toFixed(1)}" stroke="#9b8564" stroke-opacity="0.22" stroke-width="1"/>`;
  }).join("")}
  <polygon points="${polygonAttr(fill)}" fill="#716654" fill-opacity="0.72" stroke="#40372c" stroke-width="1.4"/>
  ${radarLabels}

  <text x="60" y="934" font-size="22" letter-spacing="3" fill="#795f40">十項屬性 · TEN ATTRIBUTES</text>
  ${scoreHeads}
  ${scoreVals}

  <text x="60" y="1090" font-size="22" letter-spacing="3" fill="#795f40">三門功法 · METHOD SCHOOLS</text>
  ${artCells}

  <line x1="60" y1="1325" x2="1020" y2="1325" stroke="#b9a078" stroke-width="1"/>
  <text x="60" y="1384" font-size="25" fill="#302a23">${escapeXml(captions[0])}</text>
  <text x="60" y="1442" font-size="22" fill="#4a4035">${escapeXml(captions[1])}</text>
  <text x="60" y="1500" font-size="22" fill="#4a4035">${escapeXml(captions[2])}</text>

  <rect x="60" y="1560" width="960" height="176" fill="#f2e7d3" fill-opacity="0.68" stroke="#b59a70" stroke-width="1"/>
  <text x="96" y="1615" font-size="18" letter-spacing="4" fill="#8b6a46">${escapeXml(totalLabel)}</text>
  <text x="96" y="1700" font-size="76" font-family="Songti SC, STSong, serif" fill="#8d352b">${panel.total}</text>
  <text x="220" y="1692" font-size="22" fill="#6d5b46">/ 100</text>
  <path d="M430 1688 C545 1606 660 1663 780 1598 C860 1555 920 1560 987 1516" fill="none" stroke="#708273" stroke-opacity="0.18" stroke-width="3"/>
  <path d="M455 1714 C570 1648 680 1702 805 1635 C875 1598 930 1600 995 1568" fill="none" stroke="#8b6c4b" stroke-opacity="0.12" stroke-width="2"/>

  <line x1="60" y1="1802" x2="1020" y2="1802" stroke="#b9a078" stroke-width="1"/>
  <text x="60" y="1848" font-size="16" letter-spacing="2" fill="#84694a">${escapeXml(CHARACTER_PANEL_VISUAL_CONTRACT_ID)} · 9:16</text>
  <text x="1020" y="1848" text-anchor="end" font-size="16" fill="#9a6f3c">STONE · 昭梧 · ZHAOWU</text>
</svg>`;
}

/** Backward-compatible name; output is now the canonical portrait 9:16 sheet. */
export const buildLandscapePanelSvg = buildPortraitPanelSvg;

function drawImageCover(
  ctx: CanvasRenderingContext2D,
  image: HTMLImageElement,
  x: number,
  y: number,
  width: number,
  height: number,
) {
  const sourceWidth = image.naturalWidth || image.width;
  const sourceHeight = image.naturalHeight || image.height;
  if (!sourceWidth || !sourceHeight) return;
  const scale = Math.max(width / sourceWidth, height / sourceHeight);
  const cropWidth = width / scale;
  const cropHeight = height / scale;
  const sx = Math.max(0, (sourceWidth - cropWidth) / 2);
  const sy = Math.max(0, (sourceHeight - cropHeight) / 2);
  ctx.drawImage(image, sx, sy, cropWidth, cropHeight, x, y, width, height);
}

export async function downloadCharacterPanelImage(
  panel: CharacterPanel,
  locale: Locale,
  portraitUrl?: string | null,
): Promise<void> {
  const svg = buildPortraitPanelSvg(panel, locale);
  const blob = new Blob([svg], { type: "image/svg+xml;charset=utf-8" });
  const objectUrl = URL.createObjectURL(blob);
  try {
    const sheet = new Image();
    sheet.decoding = "async";
    const loaded = new Promise<void>((resolve, reject) => {
      sheet.onload = () => resolve();
      sheet.onerror = () => reject(new Error("PANEL_IMAGE_RENDER_FAILED"));
    });
    sheet.src = objectUrl;
    await loaded;
    const canvas = document.createElement("canvas");
    canvas.width = CARD_WIDTH;
    canvas.height = CARD_HEIGHT;
    const ctx = canvas.getContext("2d");
    if (!ctx) throw new Error("PANEL_IMAGE_RENDER_FAILED");
    ctx.drawImage(sheet, 0, 0, CARD_WIDTH, CARD_HEIGHT);
    if (portraitUrl) {
      try {
        const pic = new Image();
        pic.crossOrigin = "anonymous";
        const picLoaded = new Promise<void>((resolve, reject) => {
          pic.onload = () => resolve();
          pic.onerror = () => reject(new Error("PORTRAIT_LOAD_FAILED"));
        });
        pic.src = portraitUrl;
        await picLoaded;
        const slot = CHARACTER_PANEL_PORTRAIT_SLOT;
        drawImageCover(ctx, pic, slot.x, slot.y, slot.width, slot.height);
        ctx.strokeStyle = "#9b8059";
        ctx.lineWidth = 2;
        ctx.strokeRect(slot.x, slot.y, slot.width, slot.height);
      } catch {
      }
    }
    const png = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, "image/png"));
    const file = png ?? blob;
    const href = URL.createObjectURL(file);
    const anchor = document.createElement("a");
    anchor.href = href;
    anchor.download = `zhaowu-character-panel-${panel.dayMaster}-9x16.png`;
    document.body.appendChild(anchor);
    anchor.click();
    anchor.remove();
    URL.revokeObjectURL(href);
  } catch {
    const anchor = document.createElement("a");
    anchor.href = objectUrl;
    anchor.download = `zhaowu-character-panel-${panel.dayMaster}-9x16.svg`;
    document.body.appendChild(anchor);
    anchor.click();
    anchor.remove();
  } finally {
    URL.revokeObjectURL(objectUrl);
  }
}
