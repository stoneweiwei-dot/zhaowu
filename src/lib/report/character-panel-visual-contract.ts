export const CHARACTER_PANEL_VISUAL_CONTRACT_ID = "ZW-CHARACTER-PANEL-9X16-SONG-HUIZONG-1.0";

export const CHARACTER_PANEL_IMAGE_WIDTH = 1080;
export const CHARACTER_PANEL_IMAGE_HEIGHT = 1920;
export const CHARACTER_PANEL_ASPECT_RATIO = "9:16" as const;

export const CHARACTER_PANEL_PORTRAIT_SLOT = {
  x: 60,
  y: 190,
  width: 472,
  height: 720,
} as const;

/**
 * Canonical deep-image direction for every generic Zhaowu character / attribute panel.
 * This is intentionally kept separate from Tea Guardian. Tea imagery is exclusive to
 * the dedicated tea quiz and its result page.
 */
export const CHARACTER_PANEL_DEEP_IMAGE_PROMPT = `
ZHAOWU generic character attribute result panel. Exact output aspect ratio 9:16 portrait (1080×1920).

ART DIRECTION — SONG HUIZONG / NORTHERN SONG COURT AESTHETIC:
Create one continuous refined album-leaf page, not a modern dashboard and not a collection of app cards. The visual language must evoke Northern Song imperial painting and Song Huizong taste: slender, restrained, clear, elegant, quiet, scholarly and courtly. Use old silk / xuan-paper texture, warm ivory, faded parchment beige, pale ochre, tea-brown ink only as a colour name, grey ink, muted mineral blue-green, and very small cinnabar seal accents. Use delicate ruled borders, generous breathing space, subtle mist, distant mountains, pine, cloud vapour, fine gongbi details and restrained ink wash. Typography should feel thin, upright and cultivated rather than bold or commercial. Branding may appear only as a discreet STONE · 昭梧 / ZHAOWU seal or footer.

COMPOSITION:
The page is a vertical 9:16 collectible report sheet. Preserve the information hierarchy of the Zhaowu attribute panel: an elegant Song-style matched figure / guardian-scholar portrait, result title and method-school subtitle, a ten-axis radar chart, a ten-score table, the three method-school rows, and short explanatory copy. The portrait may hold a scroll, tablet, fan, ruyi or other neutral scholarly / ritual object. Keep all chart labels crisp and readable. The ten attributes are 精、炁、神、武、術、護、寶、遁、廣、察. The visual should feel like one historical album page translated into a premium contemporary interface.

ABSOLUTE EXCLUSION FOR THIS GENERIC PANEL:
No tea guardian, no tea deity, no tea immortal, no teapot, no teacup, no tea tray, no tea leaves, no tea ceremony, no beverage props, and no tea recommendation wording. Tea Guardian artwork belongs only to the dedicated tea quiz result and must never appear in a generic character panel, BaZi report, Ziwei report, Qizheng report, previous-life result, or other non-tea test/report.

AVOID:
modern SaaS cards, loud gradients, neon, black sci-fi backgrounds, concentric-circle logos, notebook grids, cartoon framing, thick rounded cards, heavy shadows, bold black poster typography, mismatched category branding, or three separate visual systems.
`.trim();

const TEA_VISUAL_RE = /(?:tea[-_\s/]?(?:guardian|guardians|deity|immortal)|tea[-_\s/]?ceremony|tea[-_\s/]?leaf|teapot|teacup|茶仙|茶神|茶守護|茶守护|茶席|茶具|茶壺|茶壶|茶杯|茶葉|茶叶)/i;

export type CharacterPanelVisualCandidate = {
  category?: unknown;
  asset_key?: unknown;
  title?: unknown;
  storage_path?: unknown;
  summary?: unknown;
  subject_labels?: unknown;
  motifs?: unknown;
  use_roles?: unknown;
};

function textList(value: unknown): string {
  return Array.isArray(value) ? value.map(String).join(" ") : String(value ?? "");
}

/** Hard gate: generic attribute panels can never select Tea Guardian imagery. */
export function isCharacterPanelVisualEligible(candidate: CharacterPanelVisualCandidate): boolean {
  const category = String(candidate.category ?? "");
  const storagePath = String(candidate.storage_path ?? "");
  if (category === "tea-guardian") return false;
  if (/(?:^|\/)tea-guardians?(?:\/|$)/i.test(storagePath)) return false;

  const semanticText = [
    category,
    candidate.asset_key,
    candidate.title,
    storagePath,
    candidate.summary,
    textList(candidate.subject_labels),
    textList(candidate.motifs),
    textList(candidate.use_roles),
  ].map((value) => String(value ?? "")).join(" ");

  return !TEA_VISUAL_RE.test(semanticText);
}
