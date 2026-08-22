import type { Locale } from "@/lib/i18n";
import type { DaoName, PalmPalace } from "@/lib/core/types";

type PalacePresentation = Pick<PalmPalace, "key" | "zhi"> & {
  lifeLabel: string;
  range: string;
  star: string;
  dao: string;
  meaning: string;
  verse: string;
};

const SIMPLIFIED_BY_BRANCH: Record<string, Omit<PalacePresentation, "key" | "zhi" | "lifeLabel" | "range">> = {
  子: { star: "天贵星", dao: "佛道", meaning: "守正、清明、学习与助人", verse: "天贵紫垣星，人人不可轻；聪明兼富贵，一世足丰荣。" },
  丑: { star: "天厄星", dao: "鬼道", meaning: "敏感、承压、看见匮乏与隐痛", verse: "天厄多忧煎，劳心又费力；先苦后甘来，坚心渡难关。" },
  寅: { star: "天权星", dao: "人道", meaning: "主见、责任、组织与推进", verse: "天权掌枢机，号令能服人；善用成大器，妄用反自伤。" },
  卯: { star: "天破星", dao: "畜生道", meaning: "生存、破耗、重建与韧性", verse: "天破主耗散，破后方能立；韧性在重建，莫恋已碎局。" },
  辰: { star: "天奸星", dao: "修罗道", meaning: "策略、竞争、戒备与局势判断", verse: "天奸主机变，计谋百出全；善用成大器，妄用惹愆尤。" },
  巳: { star: "天文星", dao: "仙道", meaning: "知识、文艺、灵感与技术", verse: "天文主才学，笔下生光华；技艺能立身，心思宜落地。" },
  午: { star: "天福星", dao: "佛道", meaning: "福分、慷慨、照顾与享受", verse: "天福主厚泽，慷慨能照人；惜福方绵长，过享反折福。" },
  未: { star: "天驿星", dao: "鬼道", meaning: "迁动、服务、漂泊与适应", verse: "天驿主迁动，奔走为他人；适应是本事，莫让自己无家。" },
  申: { star: "天孤星", dao: "人道", meaning: "独立、分析、专注与疏离", verse: "天孤主独立，分析能入微；专注成一家，疏离是代价。" },
  酉: { star: "天刃星", dao: "畜生道", meaning: "决断、精准、执行与刚烈", verse: "天刃主决断，锋利能成事；刚烈宜有度，伤人先伤己。" },
  戌: { star: "天艺星", dao: "修罗道", meaning: "技艺、表达、竞技与成名", verse: "天艺主艺能，巧技艺随身；百艺可谋生，到处可安身。" },
  亥: { star: "天寿星", dao: "仙道", meaning: "沉思、修复、灵性与长线", verse: "天寿主长年，慈心且良善；晚景福禄全，安然享高寿。" },
};

const ENGLISH_BY_BRANCH: Record<string, Omit<PalacePresentation, "key" | "zhi" | "lifeLabel" | "range">> = {
  子: { star: "Noble Grace", dao: "Buddha realm", meaning: "Integrity, clarity, learning and service", verse: "Clarity and learning bring support; use good fortune with care." },
  丑: { star: "Adversity", dao: "Ghost realm", meaning: "Sensitivity, pressure and awareness of hidden pain", verse: "The road begins under pressure; patience turns strain into strength." },
  寅: { star: "Authority", dao: "Human realm", meaning: "Direction, responsibility, organisation and momentum", verse: "Authority can organise a room; without restraint it can wound." },
  卯: { star: "Breaking", dao: "Animal realm", meaning: "Survival, disruption, rebuilding and resilience", verse: "What breaks can be rebuilt; do not remain loyal to a ruined structure." },
  辰: { star: "Strategy", dao: "Asura realm", meaning: "Strategy, competition, vigilance and situational judgement", verse: "Strategy is a gift when used cleanly, and a burden when every room becomes a contest." },
  巳: { star: "Scholarship", dao: "Immortal realm", meaning: "Knowledge, art, inspiration and technique", verse: "Talent becomes useful when inspiration is given a finished form." },
  午: { star: "Fortune", dao: "Buddha realm", meaning: "Generosity, care, enjoyment and good fortune", verse: "Good fortune lasts when it is shared without being wasted." },
  未: { star: "Journey", dao: "Ghost realm", meaning: "Movement, service, wandering and adaptation", verse: "Adaptation is a skill; service still needs a place to return to." },
  申: { star: "Solitude", dao: "Human realm", meaning: "Independence, analysis, focus and distance", verse: "Deep focus can become mastery; isolation is its possible cost." },
  酉: { star: "Edge", dao: "Animal realm", meaning: "Decisiveness, precision, execution and force", verse: "A sharp edge completes the task; restraint keeps it from harming its holder." },
  戌: { star: "Craft", dao: "Asura realm", meaning: "Craft, expression, competition and recognition", verse: "Technique can build a livelihood wherever it is practised with discipline." },
  亥: { star: "Longevity", dao: "Immortal realm", meaning: "Reflection, recovery, spirituality and the long view", verse: "A long view and a steady heart allow later life to settle well." },
};

const ENGLISH_BRANCHES: Record<string, { short: string; full: string }> = {
  子: { short: "Zi", full: "Zi · Rat" },
  丑: { short: "Chou", full: "Chou · Ox" },
  寅: { short: "Yin", full: "Yin · Tiger" },
  卯: { short: "Mao", full: "Mao · Rabbit" },
  辰: { short: "Chen", full: "Chen · Dragon" },
  巳: { short: "Si", full: "Si · Snake" },
  午: { short: "Wu", full: "Wu · Horse" },
  未: { short: "Wei", full: "Wei · Goat" },
  申: { short: "Shen", full: "Shen · Monkey" },
  酉: { short: "You", full: "You · Rooster" },
  戌: { short: "Xu", full: "Xu · Dog" },
  亥: { short: "Hai", full: "Hai · Pig" },
};

const LIFE_LABELS = {
  "zh-Hant": { year: "前四世", month: "前三世", day: "前二世", time: "最近一世" },
  "zh-Hans": { year: "前四世", month: "前三世", day: "前二世", time: "最近一世" },
  en: { year: "Fourth prior life", month: "Third prior life", day: "Second prior life", time: "Most recent prior life" },
} as const;

const RANGE_LABELS = {
  "zh-Hant": { year: "年宮 · 根基與早年", month: "月宮 · 青年與人際", day: "日宮 · 關係與中年", time: "時宮 · 命宮主軸" },
  "zh-Hans": { year: "年宫 · 根基与早年", month: "月宫 · 青年与人际", day: "日宫 · 关系与中年", time: "时宫 · 命宫主轴" },
  en: { year: "Year palace · roots", month: "Month palace · early adulthood", day: "Day palace · relationships", time: "Hour palace · life axis" },
} as const;

const DAO_TONES: Record<DaoName, string> = {
  佛道: "#9a7422",
  仙道: "#2f7773",
  人道: "#526e91",
  修羅道: "#873f38",
  鬼道: "#625482",
  畜生道: "#746148",
};

export function palmDaoTone(dao: DaoName): string {
  return DAO_TONES[dao];
}

export function presentPalmPalace(palace: PalmPalace, locale: Locale): PalacePresentation {
  const key = palace.key;
  if (locale === "zh-Hant") {
    return {
      key,
      zhi: palace.zhi,
      lifeLabel: LIFE_LABELS[locale][key],
      range: RANGE_LABELS[locale][key],
      star: palace.star,
      dao: palace.dao,
      meaning: palace.meaning,
      verse: palace.verse.replaceAll("\n", "；"),
    };
  }
  const translated = locale === "en" ? ENGLISH_BY_BRANCH[palace.zhi] : SIMPLIFIED_BY_BRANCH[palace.zhi];
  const zhi = locale === "en" ? (ENGLISH_BRANCHES[palace.zhi]?.short ?? "—") : palace.zhi;
  return { key, zhi, lifeLabel: LIFE_LABELS[locale][key], range: RANGE_LABELS[locale][key], ...translated };
}

export function presentPalmHourLabel(branch: string, range: string, locale: Locale): string {
  if (locale !== "en") return `${branch} · ${range}`;
  return `${ENGLISH_BRANCHES[branch]?.full ?? "Unknown branch"} · ${range}`;
}

export function presentLunarLabel(label: string, locale: Locale): string {
  if (locale === "zh-Hant") return label;
  if (locale === "zh-Hans") {
    return label
      .replaceAll("農曆", "农历")
      .replaceAll("閏", "闰")
      .replaceAll("男命順行", "男命顺行")
      .replaceAll("女命逆行", "女命逆行");
  }
  const matched = label.match(/農曆(\d+)年(閏)?(\d+)月(\d+)日/);
  const direction = label.includes("順行") ? "forward sequence" : "reverse sequence";
  return matched ? `Lunar ${matched[1]} · ${matched[2] ? "leap " : ""}month ${matched[3]} · day ${matched[4]} · ${direction}` : direction;
}
