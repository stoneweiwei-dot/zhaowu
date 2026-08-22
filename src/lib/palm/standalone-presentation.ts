import type { Locale } from "@/lib/i18n";
import type { DaoName, PalmPalace, PalmReading } from "@/lib/core/types";

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

const GUIDANCE: Record<Locale, Record<DaoName, { cause: string; fruit: string; seed: string }>> = {
  "zh-Hant": {
    佛道: { cause: "前因落在守正、助人與珍惜福分。", fruit: "今生較容易從學習、貴人與照見他人中得到回應。", seed: "善意要有邊界，福分才養得久。" },
    仙道: { cause: "前因落在才情、清貴與抽離。", fruit: "今生容易靠靈感、技藝與長線眼光建立自己的位置。", seed: "把靈感做成可交付的作品，不只停在想像裡。" },
    人道: { cause: "前因落在責任、組織與把事情做成。", fruit: "今生容易被需要，也容易比別人多扛一層。", seed: "少接一件不屬於你的責任，才能保留真正的推進力。" },
    修羅道: { cause: "前因落在競爭、策略與不肯低頭。", fruit: "今生的技藝與勝負心都很強，成敗常取決於力量用在哪裡。", seed: "把勝負心留給作品，不把每段關係都變成戰場。" },
    鬼道: { cause: "前因落在敏感、承壓與看見隱痛。", fruit: "今生容易替人收拾，也容易把別人的重量留在自己身上。", seed: "先安頓睡眠與邊界，再去承接別人的需要。" },
    畜生道: { cause: "前因落在求生、耐受與破後重建。", fruit: "今生的執行力和韌性可用，但不能把長期消耗當成正常。", seed: "每一次重建都要留下能用的結構，不再只靠硬撐。" },
  },
  "zh-Hans": {
    佛道: { cause: "前因落在守正、助人与珍惜福分。", fruit: "今生较容易从学习、贵人与照见他人中得到回应。", seed: "善意要有边界，福分才养得久。" },
    仙道: { cause: "前因落在才情、清贵与抽离。", fruit: "今生容易靠灵感、技艺与长线眼光建立自己的位置。", seed: "把灵感做成可交付的作品，不只停在想象里。" },
    人道: { cause: "前因落在责任、组织与把事情做成。", fruit: "今生容易被需要，也容易比别人多扛一层。", seed: "少接一件不属于你的责任，才能保留真正的推进力。" },
    修羅道: { cause: "前因落在竞争、策略与不肯低头。", fruit: "今生的技艺与胜负心都很强，成败常取决于力量用在哪里。", seed: "把胜负心留给作品，不把每段关系都变成战场。" },
    鬼道: { cause: "前因落在敏感、承压与看见隐痛。", fruit: "今生容易替人收拾，也容易把别人的重量留在自己身上。", seed: "先安顿睡眠与边界，再去承接别人的需要。" },
    畜生道: { cause: "前因落在求生、耐受与破后重建。", fruit: "今生的执行力和韧性可用，但不能把长期消耗当成正常。", seed: "每一次重建都要留下能用的结构，不再只靠硬撑。" },
  },
  en: {
    佛道: { cause: "The inherited pattern centres on integrity, service and careful use of good fortune.", fruit: "Learning, support and helping others tend to open the path.", seed: "Give with boundaries so that generosity remains sustainable." },
    仙道: { cause: "The inherited pattern centres on talent, refinement and distance.", fruit: "Inspiration, craft and a long view can become a distinct place in the world.", seed: "Turn inspiration into finished work instead of leaving it in imagination." },
    人道: { cause: "The inherited pattern centres on responsibility, organisation and making things work.", fruit: "Being needed is a strength, but it can also become excess weight.", seed: "Release one responsibility that was never yours." },
    修羅道: { cause: "The inherited pattern centres on competition, strategy and refusal to yield.", fruit: "Skill and competitive force are both strong; the outcome depends on where they are directed.", seed: "Keep the contest inside the work, not inside every relationship." },
    鬼道: { cause: "The inherited pattern centres on sensitivity, pressure and hidden pain.", fruit: "You may be quick to carry what others leave behind.", seed: "Settle sleep and boundaries before carrying another person's needs." },
    畜生道: { cause: "The inherited pattern centres on survival, endurance and rebuilding.", fruit: "Resilience is available, but chronic depletion must not become normal.", seed: "Make each rebuild leave behind a structure you can keep." },
  },
};

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
  return { key, zhi: palace.zhi, lifeLabel: LIFE_LABELS[locale][key], range: RANGE_LABELS[locale][key], ...translated };
}

export function presentPalmGuidance(palm: PalmReading, locale: Locale) {
  const axis = palm.latest ?? palm.palaces.at(-1);
  return axis ? GUIDANCE[locale][axis.dao] : null;
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
