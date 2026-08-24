import type { AppLocale, Chart } from "@/lib/bazi/types";

const STEM_LINE_HANT: Record<string, string> = {
  甲: "甲木向陽，得根方可成林",
  乙: "乙木隨風，柔處亦有其節",
  丙: "丙火照野，明處自見其勢",
  丁: "丁火守燈，微光亦能照遠",
  戊: "戊土承山，厚處自有其定",
  己: "己土培根，靜裡自成沃野",
  庚: "庚金經鍊，斷處方見其成",
  辛: "辛金含光，清處自見其質",
  壬: "壬水行川，有岸方能致遠",
  癸: "癸水潤物，細處自有回聲",
};

const ELEMENT_LINE_HANT: Record<string, string> = {
  木: "順勢生發，不必催花成春",
  火: "火候既明，一燈便照長路",
  土: "先安其位，再承後來之事",
  金: "界線既明，取捨自有分寸",
  水: "能流則活，能止方見深淺",
};

const MONTH_LINE_HANT: Record<string, string> = {
  寅: "春氣正生，宜行亦宜留根",
  卯: "春氣正生，宜行亦宜留根",
  辰: "春氣正生，宜行亦宜留根",
  巳: "盛時知收，方能留住餘光",
  午: "盛時知收，方能留住餘光",
  未: "盛時知收，方能留住餘光",
  申: "霜意漸起，取捨自見清明",
  酉: "霜意漸起，取捨自見清明",
  戌: "霜意漸起，取捨自見清明",
  亥: "寒意未盡，先護微火再行",
  子: "寒意未盡，先護微火再行",
  丑: "寒意未盡，先護微火再行",
};

const STEM_LINE_EN: Record<string, string> = {
  甲: "Root before reach; then the timber can rise.",
  乙: "Bend with the wind, but keep the inner grain.",
  丙: "Let clear fire reveal the road, not consume it.",
  丁: "A guarded lamp can still carry light far.",
  戊: "Hold the mountain first; movement can follow.",
  己: "Quiet earth grows strength before it shows it.",
  庚: "A clean edge is forged by knowing where to stop.",
  辛: "Refined metal shines most when nothing is forced.",
  壬: "Deep water travels farther when it keeps its banks.",
  癸: "Small rain changes the ground without making a show.",
};

const ELEMENT_LINE_EN: Record<string, string> = {
  木: "Grow with the season; do not force the flower.",
  火: "When the timing is warm, one light is enough.",
  土: "Set the ground first, then carry what arrives.",
  金: "When boundaries are clear, choices gain measure.",
  水: "Flow when needed; stop when depth must return.",
};

const MONTH_LINE_EN: Record<string, string> = {
  寅: "Spring is rising; move, but keep your roots.",
  卯: "Spring is rising; move, but keep your roots.",
  辰: "Spring is rising; move, but keep your roots.",
  巳: "At full heat, restraint is what preserves the glow.",
  午: "At full heat, restraint is what preserves the glow.",
  未: "At full heat, restraint is what preserves the glow.",
  申: "As the air clears, let discernment do the cutting.",
  酉: "As the air clears, let discernment do the cutting.",
  戌: "As the air clears, let discernment do the cutting.",
  亥: "Before winter lifts, protect the small inner flame.",
  子: "Before winter lifts, protect the small inner flame.",
  丑: "Before winter lifts, protect the small inner flame.",
};

function toHans(value: string): string {
  return value
    .replaceAll("陽", "阳")
    .replaceAll("隨", "随")
    .replaceAll("處", "处")
    .replaceAll("見", "见")
    .replaceAll("勢", "势")
    .replaceAll("燈", "灯")
    .replaceAll("靜", "静")
    .replaceAll("裡", "里")
    .replaceAll("經", "经")
    .replaceAll("鍊", "炼")
    .replaceAll("斷", "断")
    .replaceAll("潤", "润")
    .replaceAll("細", "细")
    .replaceAll("發", "发")
    .replaceAll("燈", "灯")
    .replaceAll("長", "长")
    .replaceAll("後", "后")
    .replaceAll("界線", "界线")
    .replaceAll("取捨", "取舍")
    .replaceAll("漸", "渐")
    .replaceAll("盡", "尽")
    .replaceAll("護", "护")
    .replaceAll("餘", "余")
    .replaceAll("淺", "浅")
    .replaceAll("遠", "远");
}

export function buildFreeDecreeCouplet(chart: Chart, locale: AppLocale): string {
  if (locale === "en") {
    const first = STEM_LINE_EN[chart.dayMaster] ?? "Keep your centre clear before you move.";
    const useful = !chart.usefulProvisional ? chart.useful[0] : undefined;
    const second = (useful && ELEMENT_LINE_EN[useful]) || MONTH_LINE_EN[chart.monthBranch] || "Move with timing, and keep enough room to return.";
    return `${first}\n${second}`;
  }

  const first = STEM_LINE_HANT[chart.dayMaster] ?? "守其本心，動靜自有分寸";
  const useful = !chart.usefulProvisional ? chart.useful[0] : undefined;
  const second = (useful && ELEMENT_LINE_HANT[useful]) || MONTH_LINE_HANT[chart.monthBranch] || "應時而動，留一線可回之地";
  const text = `${first}\n${second}`;
  return locale === "zh-Hans" ? toHans(text) : text;
}
