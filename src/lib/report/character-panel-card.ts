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

export const CARD_WIDTH = 1600;
export const CARD_HEIGHT = 1000;

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
  return school === "dao" ? "道門｜玄門五術" : school === "fo" ? "佛門｜禎觀法門" : "巫門｜巫祝契盟";
}

export function panelCaptions(locale: Locale): string[] {
  if (locale === "en") {
    return [
      "Ten attributes: Jing, Qi, Shen, Wu, Shu, Hu, Bao, Dun, Guang, Cha. Each scores 10, total 100.",
      "Besides the ten attributes there are three method schools: Dao, Buddha and Wu.",
      "Dao: immortal, medicine, fate, form, divination. Buddha: chan, knowing, seeing, hearing, recognition. Wu: shaman, invocator, ghost, spirit, pact.",
    ];
  }
  if (locale === "zh-Hans") {
    return [
      "我们会用到十项属性：精、炁、神、武、术、护、宝、遁、广、察，每项十分，总分一百分。",
      "除这十项属性之外，还有道、佛、巫三套功法类型：",
      "仙、医、命、相、卜，属玄门五术；禅、悉、观、闻、识；巫、祝、鬼、妖、契。",
    ];
  }
  return [
    "我們會用到十項屬性：精、炁、神、武、術、護、寶、遁、廣、察，每項十分，總分一百分。",
    "除這十項屬性之外，還有道、佛、巫三套功法類型：",
    "仙、醫、命、相、卜，屬玄門五術；禎、悉、觀、聞、識；巫、祝、鬼、妖、契。",
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

export function buildLandscapePanelSvg(panel: CharacterPanel, locale: Locale): string {
  const labels = PANEL_ATTRS.map((key) => attrLabel(key, locale));
  const arts = artRows(locale);
  const captions = panelCaptions(locale);
  const fill = radarPolygon(panel.scores, 1148, 368, 168);
  const ring = PANEL_ATTRS.map((_, index) => radarVertex(index, 1148, 368, 168));
  const empty = locale === "en"
    ? "Matching gallery portrait"
    : locale === "zh-Hans"
      ? "正在按你的命盘匹配图库画像"
      : "正在按你的命盤匹配圖庫畫像";
  const artKeys = [DAO_ARTS, FO_ARTS, WU_ARTS];

  const artCells = [arts.dao, arts.fo, arts.wu].flatMap((row, rowIndex) =>
    row.map((art, colIndex) => {
      const x = 56 + colIndex * 97.6;
      const y = 684 + rowIndex * 44;
      const active = isActiveArt(panel.artScores[artKeys[rowIndex][colIndex]]);
      const bg = active ? "#f6e4d6" : rowIndex === 0 ? "#f3ead8" : "#fffaf1";
      const color = active ? "#a7352b" : "#29251f";
      return `<rect x="${x}" y="${y}" width="97.6" height="44" fill="${bg}" stroke="#7a6240" /><text x="${x + 48.8}" y="${y + 28}" text-anchor="middle" font-size="20" fill="${color}">${art}</text>`;
    }),
  ).join("");

  const scoreHeads = labels.map((label, index) => {
    const x = 590 + index * 96;
    return `<rect x="${x}" y="684" width="96" height="44" fill="#f3ead8" stroke="#7a6240" /><text x="${x + 48}" y="712" text-anchor="middle" font-size="20">${escapeXml(label)}</text>`;
  }).join("");
  const scoreVals = PANEL_ATTRS.map((key, index) => {
    const x = 590 + index * 96;
    return `<rect x="${x}" y="728" width="96" height="44" fill="#fffaf1" stroke="#7a6240" /><text x="${x + 48}" y="758" text-anchor="middle" font-size="22">${panel.scores[key]}</text>`;
  }).join("");

  const radarLabels = labels.map((label, index) => {
    const pos = radarVertex(index, 1148, 368, 208);
    return `<text x="${pos.x.toFixed(1)}" y="${(pos.y + 6).toFixed(1)}" text-anchor="middle" font-size="22">${escapeXml(label)}</text>`;
  }).join("");

  return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="${CARD_WIDTH}" height="${CARD_HEIGHT}" viewBox="0 0 ${CARD_WIDTH} ${CARD_HEIGHT}">
  <rect width="100%" height="100%" fill="#f7f1e4"/>
  <rect x="28" y="24" width="1544" height="952" fill="#fbf5e9" stroke="#cbb58a"/>
  <rect x="56" y="48" width="488" height="612" fill="#fffaf1" stroke="#5c4a32"/>
  <text x="300" y="360" text-anchor="middle" fill="#8a8173" font-size="22">${escapeXml(empty)}</text>
  ${artCells}
  <text x="590" y="96" font-size="54" font-family="Songti SC, STSong, Noto Serif CJK SC, serif">${escapeXml(panel.title)}</text>
  <text x="590" y="132" font-size="20" fill="#675b4c">${escapeXml(schoolCaption(panel.school, locale))} · ${escapeXml(panel.dayMaster)}</text>
  <polygon points="${polygonAttr(ring)}" fill="#efe6d4" stroke="#7a6240" stroke-width="2"/>
  <polygon points="${polygonAttr(fill)}" fill="#5c5853" stroke="#2f2b27" stroke-width="1.5"/>
  ${radarLabels}
  ${scoreHeads}
  ${scoreVals}
  <text x="56" y="860" font-size="22" fill="#29251f">${escapeXml(captions[0])}</text>
  <text x="56" y="900" font-size="22" fill="#29251f">${escapeXml(captions[1])}</text>
  <text x="56" y="940" font-size="22" fill="#29251f">${escapeXml(captions[2])}</text>
  <text x="1520" y="956" text-anchor="end" font-size="14" fill="#9a6f3c">STONE · 昭梧</text>
</svg>`;
}

export async function downloadCharacterPanelImage(
  panel: CharacterPanel,
  locale: Locale,
  portraitUrl?: string | null,
): Promise<void> {
  const svg = buildLandscapePanelSvg(panel, locale);
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
        ctx.drawImage(pic, 56, 48, 488, 612);
      } catch {
      }
    }
    const png = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, "image/png"));
    const file = png ?? blob;
    const href = URL.createObjectURL(file);
    const anchor = document.createElement("a");
    anchor.href = href;
    anchor.download = `zhaowu-character-panel-${panel.dayMaster}.png`;
    document.body.appendChild(anchor);
    anchor.click();
    anchor.remove();
    URL.revokeObjectURL(href);
  } catch {
    const anchor = document.createElement("a");
    anchor.href = objectUrl;
    anchor.download = `zhaowu-character-panel-${panel.dayMaster}.svg`;
    document.body.appendChild(anchor);
    anchor.click();
    anchor.remove();
  } finally {
    URL.revokeObjectURL(objectUrl);
  }
}
