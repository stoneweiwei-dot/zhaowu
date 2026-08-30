export const PREMIUM_COMPOSITION_VERSION = "four-pillar-one-painting-v1-20260831";

type AnyPillar = {
  key?: string;
  ganZhi?: string;
  gan?: string;
  zhi?: string;
  ready?: boolean;
};

function pillarOf(chart: any, key: string): AnyPillar | null {
  const pillars = Array.isArray(chart?.pillars) ? chart.pillars : [];
  return pillars.find((item: AnyPillar) => item?.key === key) ?? null;
}

function list(value: unknown): string {
  return Array.isArray(value) ? value.map(String).filter(Boolean).join("、") : "";
}

export function premiumCompositionDirective(chart: any): string {
  const year = pillarOf(chart, "year");
  const month = pillarOf(chart, "month");
  const day = pillarOf(chart, "day");
  const hour = pillarOf(chart, "time");
  const useful = list(chart?.useful);
  const drain = list(chart?.drain);
  const dayMaster = String(chart?.dayMaster ?? "").trim();
  const strength = String(chart?.strength?.tendency ?? "").trim();
  const hourReady = hour?.ready !== false && Boolean(hour?.ganZhi) && hour?.ganZhi !== "未定";

  return [
    "PREMIUM MODE — ZHAOWU original four-pillar ONE-PAINTING composition. Deliver one unified 9:16 Song album-leaf painting, never four tiles, never a 15-page booklet.",
    "Translate stems into temperament first and branches into force first, then choose forms. Do not use a fixed stem/branch-to-object table.",
    "Stem temperament: 甲 upright, 乙 yielding, 丙 bright, 丁 warm, 戊 thick, 己 soft-earth, 庚 decisive, 辛 refined, 壬 deep, 癸 fine.",
    "Branch force: 寅 sprout, 卯 unfold, 辰 store, 巳 intense, 午 reveal, 未 hold, 申 refine, 酉 gather, 戌 warehouse, 亥 flow, 子 conceal, 丑 cultivate.",
    `Year ${year?.ganZhi || "unknown"} = SKY + DISTANT WORLD: year stem sets sky weather, color temperature and light character; year branch sets far landform and world skeleton.`,
    `Month ${month?.ganZhi || "unknown"} = PLACE: month branch sets the main space type; month stem sets the atmosphere of that place.`,
    `Day ${day?.ganZhi || dayMaster || "unknown"} = SUBJECT: day stem sets temperament; day branch sets the body/form of one clear subject (person, auspicious beast, or numinous being). Day master ${dayMaster || "unspecified"}, strength ${strength || "unspecified"}.`,
    hourReady
      ? `Hour ${hour?.ganZhi} = PATH + ONE IMPLEMENT: hour branch sets future gesture (root, flow, gather, open). Hour stem only gives the implement its elemental quality. The actual object must be derived from useful gods ${useful || "(whole chart)"}, drain ${drain || "none listed"}, and circulation — never “壬寅=compass” or “印木=brush”.`
      : "Hour unknown = PATH left open: keep a quiet open road or void in the lower/forward space; do not invent a fake hour implement.",
    "If a single-pillar image fights the whole-chart useful gods, keep the chart and change the image.",
    "Style: original Zhaowu East-Asian modern graphic illustration × Song album leaf × warm xuan paper. Flat color fields, few hues, silhouette clarity, generous empty paper, light fiber/grain. One subject, one implement, restrained environment. No photoreal game poster, no xianxia gold storm, no four-panel collage, no copied third-party booklet art.",
  ].join("\n");
}
