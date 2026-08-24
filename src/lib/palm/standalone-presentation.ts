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

const TRADITIONAL_BY_BRANCH: Record<string, Omit<PalacePresentation, "key" | "zhi" | "lifeLabel" | "range">> = {
  子: { star: "天貴星", dao: "佛道", meaning: "前世若依一掌經象意來看，這一路帶著佛道的清貴與內修：重精神品質，也願意照顧弱者。今生常把智慧、學習與助人放在心上；課題不是一味做善人，而是讓慈悲有邊界、福氣有落點。", verse: "天貴紫垣星，人人不可輕；聰明兼富貴，一世足豐榮。" },
  丑: { star: "天厄星", dao: "鬼道", meaning: "這一路像從幽暗處走過來的人：對匱乏、壓力和別人的隱痛特別敏感。今生往往比別人更能熬、更能察覺危機；課題是別把吃苦當成命，也別長住在別人的黑暗裡。", verse: "天厄多憂煎，勞心又費力；先苦後甘來，堅心渡難關。" },
  寅: { star: "天權星", dao: "人道", meaning: "這一路帶著人道的責任與權柄：習慣扛事、定方向，也容易在混亂中自然接手。今生的本事是組織與推進；課題是分清責任與控制，別把所有人的擔子都背成自己的。", verse: "天權掌樞機，號令能服人；善用成大器，妄用反自傷。" },
  卯: { star: "天破星", dao: "畜生道", meaning: "這一路有很強的求生本能，像經歷過破局、失去與重新站起。今生的韌性往往不是書上學來的；課題是學會在該停時停，不再把反覆消耗誤認成堅強。", verse: "天破主耗散，破後方能立；韌性在重建，莫戀已碎局。" },
  辰: { star: "天奸星", dao: "修羅道", meaning: "這一路帶著修羅的鋒芒與天奸的機變：看局快、反應快，不肯輕易低頭。今生容易有強判斷、強邊界與不服低質規則的性子；課題不是磨鈍自己，而是把刀用在解題，不把每個房間都變成戰場。", verse: "天奸主機變，計謀百出全；善用成大器，妄用惹愆尤。" },
  巳: { star: "天文星", dao: "仙道", meaning: "這一路帶著仙道的清氣與天文的才情：喜知識、審美、靈感，也容易把俗世看得淡一點。今生若能把想法做成作品，才氣便有落腳處；課題是別只活在漂亮的念頭裡。", verse: "天文主才學，筆下生光華；技藝能立身，心思宜落地。" },
  午: { star: "天福星", dao: "佛道", meaning: "這一路帶著佛道的厚福與天福的暖意：願意分享，也比較容易得到善意回流。今生的福不只在得到，而在能否讓身邊人一起變好；課題是惜福、有節，不拿享受代替成長。", verse: "天福主厚澤，慷慨能照人；惜福方綿長，過享反折福。" },
  未: { star: "天驛星", dao: "鬼道", meaning: "這一路帶著遷動與服務的命題：總在路上、總在適應，也很容易替別人奔忙。今生的本事是換環境仍能活下來；課題是先給自己一個家與邊界，再去照顧世界。", verse: "天驛主遷動，奔走為他人；適應是本事，莫讓自己無家。" },
  申: { star: "天孤星", dao: "人道", meaning: "這一路帶著人道裡較孤高的一面：獨立、清醒、能長時間一個人鑽進問題。今生適合靠專注做到別人做不到的深度；課題是別把獨立活成拒絕連結。", verse: "天孤主獨立，分析能入微；專注成一家，疏離是代價。" },
  酉: { star: "天刃星", dao: "畜生道", meaning: "這一路帶著天刃的俐落與強烈生存感：判斷快、下手準、遇事不愛拖。今生很適合需要精準與決斷的技術；課題是讓鋒利受自己控制，而不是先傷人再傷己。", verse: "天刃主決斷，鋒利能成事；剛烈宜有度，傷人先傷己。" },
  戌: { star: "天藝星", dao: "修羅道", meaning: "這一路不是粗烈的修羅，而是把傲氣練進手藝裡的修羅：對完成度、審美與專業有自己的尺。今生越能靠作品站穩，越不必靠爭辯證明自己；課題是把勝負心煉成技藝。", verse: "天藝主藝能，巧技藝隨身；百藝可謀生，到處可安身。" },
  亥: { star: "天壽星", dao: "仙道", meaning: "這一路帶著仙道的清閒與人情味：重感受、懂恢復，也容易讓人卸下戒心。今生的福氣常藏在人緣、長線關係與自我修復裡；課題是給自由一個方向，不讓隨緣變成漂著。", verse: "天壽主長年，慈心且良善；晚景福祿全，安然享高壽。" },
};

const SIMPLIFIED_BY_BRANCH: Record<string, Omit<PalacePresentation, "key" | "zhi" | "lifeLabel" | "range">> = {
  子: { star: "天贵星", dao: "佛道", meaning: "前世若依一掌经象意来看，这一路带着佛道的清贵与内修：重精神品质，也愿意照顾弱者。今生常把智慧、学习与助人放在心上；课题不是一味做善人，而是让慈悲有边界、福气有落点。", verse: "天贵紫垣星，人人不可轻；聪明兼富贵，一世足丰荣。" },
  丑: { star: "天厄星", dao: "鬼道", meaning: "这一路像从幽暗处走过来的人：对匮乏、压力和别人的隐痛特别敏感。今生往往比别人更能熬、更能察觉危机；课题是别把吃苦当成命，也别长住在别人的黑暗里。", verse: "天厄多忧煎，劳心又费力；先苦后甘来，坚心渡难关。" },
  寅: { star: "天权星", dao: "人道", meaning: "这一路带着人道的责任与权柄：习惯扛事、定方向，也容易在混乱中自然接手。今生的本事是组织与推进；课题是分清责任与控制，别把所有人的担子都背成自己的。", verse: "天权掌枢机，号令能服人；善用成大器，妄用反自伤。" },
  卯: { star: "天破星", dao: "畜生道", meaning: "这一路有很强的求生本能，像经历过破局、失去与重新站起。今生的韧性往往不是书上学来的；课题是学会在该停时停，不再把反复消耗误认成坚强。", verse: "天破主耗散，破后方能立；韧性在重建，莫恋已碎局。" },
  辰: { star: "天奸星", dao: "修罗道", meaning: "这一路带着修罗的锋芒与天奸的机变：看局快、反应快，不肯轻易低头。今生容易有强判断、强边界与不服低质规则的性子；课题不是磨钝自己，而是把刀用在解题，不把每个房间都变成战场。", verse: "天奸主机变，计谋百出全；善用成大器，妄用惹愆尤。" },
  巳: { star: "天文星", dao: "仙道", meaning: "这一路带着仙道的清气与天文的才情：喜知识、审美、灵感，也容易把俗世看得淡一点。今生若能把想法做成作品，才气便有落脚处；课题是别只活在漂亮的念头里。", verse: "天文主才学，笔下生光华；技艺能立身，心思宜落地。" },
  午: { star: "天福星", dao: "佛道", meaning: "这一路带着佛道的厚福与天福的暖意：愿意分享，也比较容易得到善意回流。今生的福不只在得到，而在能否让身边人一起变好；课题是惜福、有节，不拿享受代替成长。", verse: "天福主厚泽，慷慨能照人；惜福方绵长，过享反折福。" },
  未: { star: "天驿星", dao: "鬼道", meaning: "这一路带着迁动与服务的命题：总在路上、总在适应，也很容易替别人奔忙。今生的本事是换环境仍能活下来；课题是先给自己一个家与边界，再去照顾世界。", verse: "天驿主迁动，奔走为他人；适应是本事，莫让自己无家。" },
  申: { star: "天孤星", dao: "人道", meaning: "这一路带着人道里较孤高的一面：独立、清醒、能长时间一个人钻进问题。今生适合靠专注做到别人做不到的深度；课题是别把独立活成拒绝连接。", verse: "天孤主独立，分析能入微；专注成一家，疏离是代价。" },
  酉: { star: "天刃星", dao: "畜生道", meaning: "这一路带着天刃的利落与强烈生存感：判断快、下手准、遇事不爱拖。今生很适合需要精准与决断的技术；课题是让锋利受自己控制，而不是先伤人再伤己。", verse: "天刃主决断，锋利能成事；刚烈宜有度，伤人先伤己。" },
  戌: { star: "天艺星", dao: "修罗道", meaning: "这一路不是粗烈的修罗，而是把傲气练进手艺里的修罗：对完成度、审美与专业有自己的尺。今生越能靠作品站稳，越不必靠争辩证明自己；课题是把胜负心炼成技艺。", verse: "天艺主艺能，巧技艺随身；百艺可谋生，到处可安身。" },
  亥: { star: "天寿星", dao: "仙道", meaning: "这一路带着仙道的清闲与人情味：重感受、懂恢复，也容易让人卸下戒心。今生的福气常藏在人缘、长线关系与自我修复里；课题是给自由一个方向，不让随缘变成漂着。", verse: "天寿主长年，慈心且良善；晚景福禄全，安然享高寿。" },
};

const ENGLISH_BY_BRANCH: Record<string, Omit<PalacePresentation, "key" | "zhi" | "lifeLabel" | "range">> = {
  子: { star: "Noble Grace", dao: "Buddha realm", meaning: "A symbolic Buddha-realm line: inner refinement, learning and care for others. Its lesson is not endless self-sacrifice, but compassion with boundaries and somewhere for good fortune to land.", verse: "Clarity and learning bring support; use good fortune with care." },
  丑: { star: "Adversity", dao: "Ghost realm", meaning: "A line shaped by pressure, scarcity and hidden pain. It can produce unusual endurance and sensitivity to crisis; the lesson is not to make suffering a permanent home.", verse: "The road begins under pressure; patience turns strain into strength." },
  寅: { star: "Authority", dao: "Human realm", meaning: "A human-realm line of responsibility and direction. It naturally takes charge when a room becomes chaotic; the lesson is to separate responsibility from control.", verse: "Authority can organise a room; without restraint it can wound." },
  卯: { star: "Breaking", dao: "Animal realm", meaning: "A strong survival line shaped by rupture, loss and rebuilding. Its gift is resilience; its lesson is knowing when endurance has turned into needless depletion.", verse: "What breaks can be rebuilt; do not remain loyal to a ruined structure." },
  辰: { star: "Strategy", dao: "Asura realm", meaning: "An Asura line of sharp judgement, strategy and refusal to bow easily. The gift is seeing the room quickly; the lesson is to use the blade on problems rather than turn every room into a battlefield.", verse: "Strategy is a gift when used cleanly, and a burden when every room becomes a contest." },
  巳: { star: "Scholarship", dao: "Immortal realm", meaning: "An immortal-realm line of knowledge, aesthetics and inspiration. Talent becomes real when an idea is given finished form; the lesson is not to live only inside beautiful thoughts.", verse: "Talent becomes useful when inspiration is given a finished form." },
  午: { star: "Fortune", dao: "Buddha realm", meaning: "A warm Buddha-realm line of generosity and good fortune. Its deeper value is not simply receiving, but allowing others to become better around you; the lesson is to enjoy without wasting.", verse: "Good fortune lasts when it is shared without being wasted." },
  未: { star: "Journey", dao: "Ghost realm", meaning: "A line of movement, service and adaptation. It can survive changing environments with unusual ease; the lesson is to build a home and boundaries before carrying everyone else.", verse: "Adaptation is a skill; service still needs a place to return to." },
  申: { star: "Solitude", dao: "Human realm", meaning: "A more solitary human-realm line: independent, lucid and capable of long concentration. Its gift is depth; the lesson is not to turn independence into refusal of connection.", verse: "Deep focus can become mastery; isolation is its possible cost." },
  酉: { star: "Edge", dao: "Animal realm", meaning: "A precise survival line: quick judgement, clean execution and little patience for delay. It suits exacting craft; the lesson is to command the edge rather than be commanded by it.", verse: "A sharp edge completes the task; restraint keeps it from harming its holder." },
  戌: { star: "Craft", dao: "Asura realm", meaning: "Not a crude Asura line, but one that tempers pride into craft. It keeps its own measure for finish, aesthetics and professionalism; the lesson is to let the work prove what argument does not need to.", verse: "Technique can build a livelihood wherever it is practised with discipline." },
  亥: { star: "Longevity", dao: "Immortal realm", meaning: "An immortal-realm line of ease, recovery and human warmth. Its good fortune often lives in long relationships and restoration; the lesson is to give freedom a direction.", verse: "A long view and a steady heart allow later life to settle well." },
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
  "zh-Hant": { year: "前四世", month: "前三世", day: "前二世", time: "前一世" },
  "zh-Hans": { year: "前四世", month: "前三世", day: "前二世", time: "前一世" },
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
  const translated = locale === "zh-Hant" ? TRADITIONAL_BY_BRANCH[palace.zhi] : locale === "en" ? ENGLISH_BY_BRANCH[palace.zhi] : SIMPLIFIED_BY_BRANCH[palace.zhi];
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
