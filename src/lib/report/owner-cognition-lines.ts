import type { AppLocale, Chart } from "@/lib/bazi/types";
import {
  FIVE_ELEMENT_FIVE_CONSTANTS,
  FOUR_TOMB_OWNER_CHEATSHEET,
  TEN_STEM_SOCIAL_SHORTHAND,
} from "@/lib/bazi/owner-five-element-cognition";

const ELEMENT_KEY = {
  金: "metal",
  木: "wood",
  水: "water",
  火: "fire",
  土: "earth",
} as const;

const EN_VIRTUE = {
  metal: { virtue: "integrity", functions: ["selection", "decisiveness", "boundaries", "standards"] },
  wood: { virtue: "benevolence", functions: ["growth", "direction", "vitality", "unblocking"] },
  water: { virtue: "wisdom", functions: ["flow", "adaptability", "communication", "connection"] },
  fire: { virtue: "propriety", functions: ["expression", "warmth", "action", "visibility"] },
  earth: { virtue: "trust", functions: ["stability", "reliability", "capacity", "containment"] },
} as const;

const STEM_EN: Record<string, string> = {
  甲: "You can understand the logic and still refuse to change course.",
  乙: "You often notice more than you say directly.",
  丙: "When emotion rises, it can become very visible and immediate.",
  丁: "You may say it is fine while remembering the detail for a long time.",
  戊: "You can hear suggestions without necessarily changing the underlying position.",
  己: "Other people's views can matter so much that your own position gets crowded out.",
  庚: "When a line is crossed, you may prefer a clean exit.",
  辛: "A polished surface can hide very sharp internal judgement.",
  壬: "You can acknowledge another view while still keeping your own.",
  癸: "You may look quiet until pressure breaks through, then reflect on it afterwards.",
};

const STEM_EN_NAME: Record<string, string> = {
  甲: "Jia", 乙: "Yi", 丙: "Bing", 丁: "Ding", 戊: "Wu",
  己: "Ji", 庚: "Geng", 辛: "Xin", 壬: "Ren", 癸: "Gui",
};
const ELEMENT_EN_NAME = { 木: "Wood", 火: "Fire", 土: "Earth", 金: "Metal", 水: "Water" } as const;
const BRANCH_EN_NAME = { 辰: "Chen", 丑: "Chou", 未: "Wei", 戌: "Xu" } as const;
const TOMB_EN = {
  辰: { climate: "damp Earth", identity: "Water storehouse" },
  丑: { climate: "cold damp Earth", identity: "Metal storehouse" },
  未: { climate: "dry Earth", identity: "Wood storehouse" },
  戌: { climate: "dry Earth", identity: "Fire storehouse" },
} as const;

function positionLabel(key: string, locale: AppLocale): string {
  if (locale === "en") return ({ year: "year", month: "month", day: "day", time: "time" } as Record<string, string>)[key] ?? key;
  if (locale === "zh-Hans") return ({ year: "年支", month: "月支", day: "日支", time: "时支" } as Record<string, string>)[key] ?? key;
  return ({ year: "年支", month: "月支", day: "日支", time: "時支" } as Record<string, string>)[key] ?? key;
}

export function buildOwnerCognitionReportLines(chart: Chart, locale: AppLocale): string[] {
  const lines: string[] = [];
  const elementKey = ELEMENT_KEY[chart.dayMasterElement];
  const fiveConstant = FIVE_ELEMENT_FIVE_CONSTANTS[elementKey];

  if (locale === "en") {
    const copy = EN_VIRTUE[elementKey];
    lines.push(`Five-element function | ${STEM_EN_NAME[chart.dayMaster] ?? "the day stem"} (${ELEMENT_EN_NAME[chart.dayMasterElement]}) is translated through the traditional virtue of ${copy.virtue}: ${copy.functions.join(", ")}. This is functional symbolism, not a "replace what is missing" rule.`);
    const shorthand = STEM_EN[chart.dayMaster];
    if (shorthand) lines.push(`Stem shorthand | ${shorthand} This is a light social translation only, not a personality verdict.`);
  } else {
    const virtue = fiveConstant.virtue;
    const functions = fiveConstant.function.join(locale === "zh-Hans" ? "、" : "、");
    const label = locale === "zh-Hans" ? "五行功能" : "五行功能";
    const boundary = locale === "zh-Hans"
      ? "这是文化功能语言，不按“缺什么补什么”直接下结论。"
      : "這是文化功能語言，不按「缺什麼補什麼」直接下結論。";
    lines.push(`${label}｜${chart.dayMaster}（${chart.dayMasterElement}）以「${virtue}」為象，重點在${functions}；${boundary}`);
    const shorthand = TEN_STEM_SOCIAL_SHORTHAND[chart.dayMaster as keyof typeof TEN_STEM_SOCIAL_SHORTHAND];
    if (shorthand) {
      const prefix = locale === "zh-Hans" ? "天干一面" : "天干一面";
      const tail = locale === "zh-Hans" ? "这是趣味化翻译，不是人格定论。" : "這是趣味化翻譯，不是人格定論。";
      lines.push(`${prefix}｜${chart.dayMaster}：${shorthand}${tail}`);
    }
  }

  const tombPillars = chart.pillars.filter(
    (pillar) => pillar.ready !== false && pillar.zhi in FOUR_TOMB_OWNER_CHEATSHEET,
  );

  if (tombPillars.length) {
    if (locale === "en") {
      const details = tombPillars.map((pillar) => {
        const zhi = pillar.zhi as keyof typeof TOMB_EN;
        const profile = TOMB_EN[zhi];
        return `${positionLabel(pillar.key, locale)} ${BRANCH_EN_NAME[zhi]} (${profile.climate} / ${profile.identity}; hidden stems ${FOUR_TOMB_OWNER_CHEATSHEET[zhi].hidden.map((stem) => STEM_EN_NAME[stem] ?? stem).join(", ")})`;
      });
      lines.push(`Storehouse note | ${details.join("; ")}. A storehouse is not automatically a wealth store; whether it becomes active still depends on combinations/clashes, exposure, function and timing.`);
    } else {
      const details = tombPillars.map((pillar) => {
        const zhi = pillar.zhi as keyof typeof FOUR_TOMB_OWNER_CHEATSHEET;
        const profile = FOUR_TOMB_OWNER_CHEATSHEET[zhi];
        const hiddenLabel = locale === "zh-Hans" ? "藏" : "藏";
        return `${positionLabel(pillar.key, locale)}${zhi}（${profile.climate}／${profile.identity}；${hiddenLabel}${profile.hidden.join("、")}）`;
      });
      const boundary = locale === "zh-Hans"
        ? "库不等于财库；是否真正被引动，仍看合冲、透出、做功与岁运。"
        : "庫不等於財庫；是否真正被引動，仍看合沖、透出、做功與歲運。";
      lines.push(`${locale === "zh-Hans" ? "四库提示" : "四庫提示"}｜${details.join("；")}。${boundary}`);
    }
  }

  return lines;
}
