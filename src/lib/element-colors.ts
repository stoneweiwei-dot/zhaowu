export type WuXing = "木" | "火" | "土" | "金" | "水";

export const STEM_ELEMENT: Record<string, WuXing> = {
  甲: "木",
  乙: "木",
  丙: "火",
  丁: "火",
  戊: "土",
  己: "土",
  庚: "金",
  辛: "金",
  壬: "水",
  癸: "水",
};

export const ELEMENT_INK = {
  木: { stem: "#2f6b5a", branch: "#5a8a78" },
  火: { stem: "#b23a2f", branch: "#c45b3a" },
  土: { stem: "#b06a2b", branch: "#c4843a" },
  金: { stem: "#b39858", branch: "#c4b07a" },
  水: { stem: "#355a73", branch: "#4d738c" },
} as const;

export function stemElement(stem: string | undefined | null): WuXing | null {
  if (!stem) return null;
  return STEM_ELEMENT[stem] ?? null;
}
