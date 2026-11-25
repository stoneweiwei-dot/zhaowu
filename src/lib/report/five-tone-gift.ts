import type { Element } from "@/lib/bazi/types";
import type { OwnerMusicTrack } from "@/lib/owner-music-client";
import type { ReportAccessLevel } from "@/lib/report-access";

export type PaidReportAccessLevel = Exclude<ReportAccessLevel, "none">;
export type FiveToneRole = "support" | "primary" | "release" | "transform" | "settle";

export type FiveTonePlanItem = {
  element: Element;
  tone: "角" | "徵" | "宮" | "商" | "羽";
  role: FiveToneRole;
};

export type FiveToneTrackMatch = FiveTonePlanItem & {
  track: OwnerMusicTrack | null;
  title: string;
};

const GENERATING_CYCLE: Element[] = ["木", "火", "土", "金", "水"];

export const FIVE_TONE_BY_ELEMENT: Record<Element, FiveTonePlanItem["tone"]> = {
  木: "角",
  火: "徵",
  土: "宮",
  金: "商",
  水: "羽",
};

const ROLE_SEQUENCE: Record<PaidReportAccessLevel, FiveToneRole[]> = {
  quick: ["primary"],
  system: ["support", "primary", "release"],
};

function cycleElement(index: number) {
  return GENERATING_CYCLE[(index + GENERATING_CYCLE.length) % GENERATING_CYCLE.length];
}

export function resolveFiveTonePrimary(chart: { useful?: Element[]; dayMasterElement: Element }): Element {
  return chart.useful?.[0] ?? chart.dayMasterElement;
}

/**
 * The sequence is centred on the chart's current functional emphasis:
 * source/support -> primary -> what the primary generates -> the remaining cycle.
 * It deliberately does not infer a prescription from raw element counts.
 */
export function buildFiveTonePlan(primary: Element, level: PaidReportAccessLevel): FiveTonePlanItem[] {
  const primaryIndex = GENERATING_CYCLE.indexOf(primary);
  const elements = level === "quick"
    ? [primary]
    : [
        cycleElement(primaryIndex - 1),
        primary,
        cycleElement(primaryIndex + 1),
        cycleElement(primaryIndex + 2),
        cycleElement(primaryIndex + 3),
      ];

  return elements.slice(0, ROLE_SEQUENCE[level].length).map((element, index) => ({
    element,
    tone: FIVE_TONE_BY_ELEMENT[element],
    role: ROLE_SEQUENCE[level][index],
  }));
}

const ELEMENT_BY_EN = { Wood: "木", Fire: "火", Earth: "土", Metal: "金", Water: "水" } as const;
const TONE_BY_EN = { Jue: "角", Zhi: "徵", Gong: "宮", Shang: "商", Yu: "羽" } as const;

export function parseFiveToneTrackName(name: string) {
  const normalized = name.trim().replaceAll("|", "｜");
  // Standardized owner-library names: 木｜角音｜<title>
  const standard = normalized.match(/^([木火土金水])\s*｜\s*([角徵征宮宫商羽])音\s*｜\s*(.+)$/u);
  if (standard) {
    const element = standard[1] as Element;
    const tone = (standard[2] === "征" ? "徵" : standard[2] === "宫" ? "宮" : standard[2]) as FiveTonePlanItem["tone"];
    if (FIVE_TONE_BY_ELEMENT[element] !== tone) return null;
    return { element, tone, title: standard[3].trim() || name.trim() };
  }
  // Descriptive library names, as actually stored in the owner music library
  // (2026-11-25: all five live tones use this form, e.g. 古木角聲｜Wood · Jue · Ancient Grove).
  // The element/tone are read from the English "Element · Tone" part, which is unambiguous;
  // the Chinese descriptive name is kept as the display title.
  const descriptive = normalized.match(/^(.+?)｜\s*(Wood|Fire|Earth|Metal|Water)\s*[·•]\s*(Jue|Zhi|Gong|Shang|Yu)\s*[·•]\s*(.+)$/u);
  if (descriptive) {
    const element = ELEMENT_BY_EN[descriptive[2] as keyof typeof ELEMENT_BY_EN] as Element;
    const tone = TONE_BY_EN[descriptive[3] as keyof typeof TONE_BY_EN] as FiveTonePlanItem["tone"];
    if (FIVE_TONE_BY_ELEMENT[element] !== tone) return null;
    return { element, tone, title: descriptive[1].trim() || descriptive[4].trim() || name.trim() };
  }
  return null;
}

export function matchFiveToneTracks(plan: FiveTonePlanItem[], tracks: OwnerMusicTrack[]): FiveToneTrackMatch[] {
  const byElement = new Map<Element, { track: OwnerMusicTrack; title: string }>();
  tracks.forEach((track) => {
    const parsed = parseFiveToneTrackName(track.name);
    if (parsed && track.enabled !== false && !byElement.has(parsed.element)) byElement.set(parsed.element, { track, title: parsed.title });
  });

  return plan.map((item) => {
    const match = byElement.get(item.element);
    return { ...item, track: match?.track ?? null, title: match?.title ?? "" };
  });
}
