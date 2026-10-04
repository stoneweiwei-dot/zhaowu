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
  bundle: ["support", "primary", "release", "transform", "settle"],
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

export function parseFiveToneTrackName(name: string) {
  const normalized = name.trim().replaceAll("|", "｜");
  const match = normalized.match(/^([木火土金水])\s*｜\s*([角徵征宮宫商羽])音\s*｜\s*(.+)$/u);
  if (!match) return null;
  const element = match[1] as Element;
  const tone = (match[2] === "征" ? "徵" : match[2] === "宫" ? "宮" : match[2]) as FiveTonePlanItem["tone"];
  if (FIVE_TONE_BY_ELEMENT[element] !== tone) return null;
  return { element, tone, title: match[3].trim() || name.trim() };
}

export function matchFiveToneTracks(plan: FiveTonePlanItem[], tracks: OwnerMusicTrack[]): FiveToneTrackMatch[] {
  const byElement = new Map<Element, { track: OwnerMusicTrack; title: string }>();
  tracks.forEach((track) => {
    const parsed = parseFiveToneTrackName(track.name);
    if (parsed && !byElement.has(parsed.element)) byElement.set(parsed.element, { track, title: parsed.title });
  });

  return plan.map((item) => {
    const match = byElement.get(item.element);
    return { ...item, track: match?.track ?? null, title: match?.title ?? "" };
  });
}
