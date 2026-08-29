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

export type PalmMeaningParts = {
  trait: string;
  habit: string;
};

export type PalmSynthesis = {
  repeatedTitle: string;
  repeatedBody: string;
  presentTitle: string;
  presentBody: string;
  directionTitle: string;
  directionBody: string;
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

const REALM_AMPLIFICATION: Record<DaoName, Record<Locale, string>> = {
  佛道: {
    "zh-Hant": "慈悲、精神潔癖、學習力與替人承擔的傾向",
    "zh-Hans": "慈悲、精神洁癖、学习力与替人承担的倾向",
    en: "compassion, high inner standards, learning and taking responsibility for others",
  },
  仙道: {
    "zh-Hant": "審美、感受力、才情、自由與不願被俗務困住的傾向",
    "zh-Hans": "审美、感受力、才情、自由与不愿被俗务困住的倾向",
    en: "aesthetic sensitivity, imagination, freedom and resistance to being trapped by routine",
  },
  人道: {
    "zh-Hant": "責任感、現實判斷、組織能力與靠自己站穩的傾向",
    "zh-Hans": "责任感、现实判断、组织能力与靠自己站稳的倾向",
    en: "responsibility, practical judgement, organisation and self-reliance",
  },
  修羅道: {
    "zh-Hant": "競爭心、強邊界、快速判斷、不服輸與把本事磨到很深的傾向",
    "zh-Hans": "竞争心、强边界、快速判断、不服输与把本事磨到很深的倾向",
    en: "competitive drive, strong boundaries, quick judgement and the urge to master a craft",
  },
  鬼道: {
    "zh-Hant": "對匱乏與危機的敏感、耐受力、替人操心與難以真正放鬆的傾向",
    "zh-Hans": "对匮乏与危机的敏感、耐受力、替人操心与难以真正放松的倾向",
    en: "sensitivity to scarcity and crisis, endurance, worry for others and difficulty fully relaxing",
  },
  畜生道: {
    "zh-Hant": "求生本能、反應速度、韌性、直接行動與先保護自己的傾向",
    "zh-Hans": "求生本能、反应速度、韧性、直接行动与先保护自己的倾向",
    en: "survival instinct, speed, resilience, direct action and self-protection",
  },
};

const REALM_DIRECTION: Record<DaoName, Record<Locale, string>> = {
  佛道: { "zh-Hant": "把善意留給值得的人，也把界線留給自己；慈悲若沒有邊界，最後只會變成耗損。", "zh-Hans": "把善意留给值得的人，也把界线留给自己；慈悲若没有边界，最后只会变成耗损。", en: "Keep compassion, but give it boundaries. Care without limits eventually becomes depletion." },
  仙道: { "zh-Hant": "把靈感、審美與感受做成能留下來的作品；自由需要方向，才不會只剩漂移。", "zh-Hans": "把灵感、审美与感受做成能留下来的作品；自由需要方向，才不会只剩漂移。", en: "Give imagination and sensitivity a finished form. Freedom needs direction or it turns into drift." },
  人道: { "zh-Hant": "保留承擔能力，但不要把別人的責任全部接走；真正的穩，是分得清誰該做什麼。", "zh-Hans": "保留承担能力，但不要把别人的责任全部接走；真正的稳，是分得清谁该做什么。", en: "Keep your capacity for responsibility, but do not inherit everyone else's duties. Stability needs clear ownership." },
  修羅道: { "zh-Hant": "把勝負心用在作品與解題，不用在每一段關係；你的鋒利需要目標，不需要到處開戰。", "zh-Hans": "把胜负心用在作品与解题，不用在每一段关系；你的锋利需要目标，不需要到处开战。", en: "Put competitive force into craft and problem-solving, not every relationship. The edge needs a target, not constant conflict." },
  鬼道: { "zh-Hant": "你可以看見風險，但不必永遠住在風險裡；先建立自己的安全感，再決定要替誰分擔。", "zh-Hans": "你可以看见风险，但不必永远住在风险里；先建立自己的安全感，再决定要替谁分担。", en: "You may see risk early, but you do not have to live inside it. Build your own security before carrying others." },
  畜生道: { "zh-Hant": "保留韌性與行動力，同時學會辨認什麼已經不值得再撐；能停下也是一種求生智慧。", "zh-Hans": "保留韧性与行动力，同时学会辨认什么已经不值得再撑；能停下也是一种求生智慧。", en: "Keep resilience and speed, while learning what no longer deserves endurance. Stopping can also be survival wisdom." },
};

export function splitPalmMeaning(meaning: string, locale: Locale): PalmMeaningParts {
  if (locale !== "en") {
    const index = meaning.indexOf("今生");
    if (index > 0) {
      return {
        trait: meaning.slice(0, index).trim(),
        habit: meaning.slice(index).trim(),
      };
    }
  }
  const firstStop = meaning.indexOf(".");
  if (firstStop > 0) {
    return {
      trait: meaning.slice(0, firstStop + 1).trim(),
      habit: meaning.slice(firstStop + 1).trim(),
    };
  }
  return { trait: meaning, habit: meaning };
}

export function buildPalmSynthesis(palaces: PalmPalace[], locale: Locale): PalmSynthesis {
  const counts = new Map<DaoName, number>();
  for (const palace of palaces) counts.set(palace.dao, (counts.get(palace.dao) ?? 0) + 1);
  const repeated = [...counts.entries()].filter(([, count]) => count > 1).sort((a, b) => b[1] - a[1]);
  const latest = palaces.at(-1);
  const latestPresentation = latest ? presentPalmPalace(latest, locale) : null;
  const latestHabit = latestPresentation ? splitPalmMeaning(latestPresentation.meaning, locale).habit : "";

  if (locale === "en") {
    const repeatedBody = repeated.length
      ? repeated.map(([dao, count]) => `${dao} appears ${count} times. This strengthens ${REALM_AMPLIFICATION[dao].en}.`).join(" ")
      : "No realm repeats across the available palaces. Your pattern is more mixed: several different habits are carried forward, so none should be treated as the whole personality.";
    return {
      repeatedTitle: "What repeats becomes stronger",
      repeatedBody,
      presentTitle: "The pattern closest to the present",
      presentBody: latestPresentation ? `The most recent prior-life palace falls in ${latestPresentation.dao}, under ${latestPresentation.star}. ${latestHabit}` : "Without a birth time, the nearest prior-life palace remains open.",
      directionTitle: "How to use it now",
      directionBody: latest ? REALM_DIRECTION[latest.dao].en : "Read the three available palaces as background patterns until the birth time is known.",
    };
  }

  const isHans = locale === "zh-Hans";
  const repeatedBody = repeated.length
    ? repeated.map(([dao, count]) => `${dao}${isHans ? "在四世中出现" : "在四世中出現"}${count}${isHans ? "次，表示" : "次，表示"}${REALM_AMPLIFICATION[dao][locale]}${isHans ? "被重复加强。" : "被重複加強。"}`).join("")
    : isHans
      ? "目前四宫没有重复的六道。说明你带来的习性较混合，不能用其中任何一世概括整个人。"
      : "目前四宮沒有重複的六道。說明你帶來的習性較混合，不能用其中任何一世概括整個人。";
  return {
    repeatedTitle: isHans ? "重复出现，习性会加强" : "重複出現，習性會加強",
    repeatedBody,
    presentTitle: isHans ? "离今生最近的一世" : "離今生最近的一世",
    presentBody: latestPresentation
      ? `${isHans ? "前一世落在" : "前一世落在"}${latestPresentation.dao}，${isHans ? "主星是" : "主星是"}${latestPresentation.star}。${latestHabit}`
      : isHans ? "没有出生时辰，前一世这一宫暂不判断。" : "沒有出生時辰，前一世這一宮暫不判斷。",
    directionTitle: isHans ? "今生怎么用这份习性" : "今生怎麼用這份習性",
    directionBody: latest ? REALM_DIRECTION[latest.dao][locale] : isHans ? "时辰未定前，先把前三宫当作背景习性阅读。" : "時辰未定前，先把前三宮當作背景習性閱讀。",
  };
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
