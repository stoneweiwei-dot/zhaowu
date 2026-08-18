import { BRANCHES, hourBranchOf, lunarYearBranch, toLunar } from "@/lib/bazi/calendar";
import type { Chart, Gender } from "@/lib/bazi/types";
import type { DaoName, PalmPalace, PalmReading } from "@/lib/core/types";

const STAR: Record<string, { star: string; dao: DaoName; verse: string; meaning: string }> = {
  子: { star: "天貴星", dao: "佛道", verse: "天貴紫垣星　人人不可輕\n聰明兼富貴　一世足豐榮", meaning: "守正、清明、學習與助人" },
  丑: { star: "天厄星", dao: "鬼道", verse: "天厄多憂煎　勞心又費力\n先苦後甘來　堅心渡難關", meaning: "敏感、承壓、看見匱乏與隱痛" },
  寅: { star: "天權星", dao: "人道", verse: "天權掌樞機　號令能服人\n善用成大器　妄用反自傷", meaning: "主見、責任、組織與推進" },
  卯: { star: "天破星", dao: "畜生道", verse: "天破主耗散　破後方能立\n韌性在重建　莫戀已碎局", meaning: "生存、破耗、重建與韌性" },
  辰: { star: "天奸星", dao: "修羅道", verse: "天奸主機變　計謀百出全\n善用成大器　妄用惹愆尤", meaning: "策略、競爭、戒備與局勢判斷" },
  巳: { star: "天文星", dao: "仙道", verse: "天文主才學　筆下生光華\n技藝能立身　心思宜落地", meaning: "知識、文藝、靈感與技術" },
  午: { star: "天福星", dao: "佛道", verse: "天福主厚澤　慷慨能照人\n惜福方綿長　過享反折福", meaning: "福分、慷慨、照顧與享受" },
  未: { star: "天驛星", dao: "鬼道", verse: "天驛主遷動　奔走為他人\n適應是本事　莫讓自己無家", meaning: "遷動、服務、漂泊與適應" },
  申: { star: "天孤星", dao: "人道", verse: "天孤主獨立　分析能入微\n專注成一家　疏離是代價", meaning: "獨立、分析、專注與疏離" },
  酉: { star: "天刃星", dao: "畜生道", verse: "天刃主決斷　鋒利能成事\n剛烈宜有度　傷人先傷己", meaning: "決斷、精準、執行與剛烈" },
  戌: { star: "天藝星", dao: "修羅道", verse: "天藝主藝能　巧技藝隨身\n百藝可謀生　到處可安身", meaning: "技藝、表達、競技與成名" },
  亥: { star: "天壽星", dao: "仙道", verse: "天壽主長年　慈心且良善\n晚景福祿全　安然享高壽", meaning: "沉思、修復、靈性與長線" },
};

const CAUSE: Record<DaoName, string> = {
  佛道: "前因落在守正、助人與把福報當存糧。你這一路不是缺善意，是容易把善意花得太快。",
  仙道: "前因落在清貴、才情與抽離。你習慣站在稍高的地方看人間，也容易捨不得下來。",
  人道: "前因落在責任、組織與把事情做成。你靠把局面扛住立足，也容易把別人的擔子當成自己的。",
  修羅道: "前因落在競爭、策略與不肯低頭。你看見局勢比別人快，也容易把每個房間都當成戰場。",
  鬼道: "前因落在敏感、承壓與替人看見隱痛。你能進別人進不去的暗處，也容易把自己留在那裡。",
  畜生道: "前因落在求生、破而後立。你能從碎局里重新長出來，也容易把消耗當成正常。",
};

const FRUIT: Record<DaoName, string> = {
  佛道: "今果是貴人、學習與照見。福要惜，才養得住晚年。",
  仙道: "今果是才藝、修復與長線。作品要比漂着更像你。",
  人道: "今果是職位、推進與被需要。界線要比更多責任更像藥。",
  修羅道: "今果是技藝成名、勝負心與戒備。把刀用在作品上，不要用在每個對手身上。",
  鬼道: "今果是服務、遷動與替人收拾。先給自己一個落點，再去幫人。",
  畜生道: "今果是執行、重建與耐受力。先停掉無效消耗，再談下一次站起來。",
};

const SEED: Record<DaoName, string> = {
  佛道: "後種：佈施有節，學習有出口，福才不會只停在想像裡。",
  仙道: "後種：把靈感做成一件可交付的東西，清貴才不會變成疏離。",
  人道: "後種：少接一件不是你的責任，你的推進才養得住自己。",
  修羅道: "後種：把勝負心留給技藝，把戒備留給真正的局，不要日日開戰。",
  鬼道: "後種：先安頓睡眠與邊界，再進去別人的暗處。",
  畜生道: "後種：重建可以，自耗不行。每一次破，都要留下一塊能用的。",
};

const META: Record<PalmPalace["key"], { label: string; lifeLabel: string; range: string }> = {
  year: { label: "年宮", lifeLabel: "前四世", range: "父母宮・幼年運" },
  month: { label: "月宮", lifeLabel: "前三世", range: "事業交友宮・青年運" },
  day: { label: "日宮", lifeLabel: "前二世", range: "夫妻宮・中年運" },
  time: { label: "時宮", lifeLabel: "前一世", range: "命宮・晚年運・本命主軸" },
};

function step(start: string, count: number, forward: boolean): string {
  const i = BRANCHES.indexOf(start as (typeof BRANCHES)[number]);
  const moved = forward ? i + (count - 1) : i - (count - 1);
  return BRANCHES[((moved % 12) + 12) % 12];
}

function palace(key: PalmPalace["key"], zhi: string): PalmPalace {
  const star = STAR[zhi];
  return { key, ...META[key], zhi, star: star.star, dao: star.dao, verse: star.verse, meaning: star.meaning };
}

export function buildPalm(input: {
  year: number;
  month: number;
  day: number;
  hour: number;
  timeUnknown: boolean;
  gender: Gender;
}): PalmReading {
  const missing: string[] = [];
  if (input.gender === "unspecified") missing.push("性別（定順逆）");
  const lunar = toLunar(input.year, input.month, input.day);
  if (!lunar) missing.push("可轉換的出生日期");

  const empty = (extra: Partial<PalmReading> = {}): PalmReading => ({
    version: "ZW-PALM-1.0",
    ready: false,
    missing,
    forward: null,
    lunarLabel: "",
    palaces: [],
    latest: null,
    firstSentence: missing.length
      ? `這一問要用達摩一掌經排四宮。目前缺${missing.join("、")}，六道先不作判定，不用心理套話填空。`
      : "",
    cause: "",
    fruit: "",
    seed: "",
    minggongNote: "",
    boundary: "此為民俗命理分類，不是可驗證的歷史前世或宗教裁決。",
    ...extra,
  });

  if (!lunar || input.gender === "unspecified") return empty();

  const forward = input.gender === "male";
  const yearZhi = lunarYearBranch(lunar.year);
  let monthCount = lunar.month;
  if (lunar.isLeap && lunar.day >= 15) monthCount += 1;
  const monthZhi = step(yearZhi, monthCount, forward);
  const dayZhi = step(monthZhi, lunar.day, forward);

  const palaces: PalmPalace[] = [
    palace("year", yearZhi),
    palace("month", monthZhi),
    palace("day", dayZhi),
  ];

  let latest: PalmPalace | null = null;
  if (input.timeUnknown) {
    missing.push("出生時辰（時宮／最近一世）");
  } else {
    const hourZhi = hourBranchOf(input.hour);
    const hourIndex = BRANCHES.indexOf(hourZhi) + 1;
    const timeZhi = step(dayZhi, hourIndex, forward);
    latest = palace("time", timeZhi);
    palaces.push(latest);
  }

  const axis = latest ?? palaces[2];
  const firstSentence = latest
    ? `最近一世落在${latest.dao}，主星是${latest.zhi}・${latest.star}。`
    : `年月日三宮已排定；最近一世（時宮）因缺出生時辰，不作判定。`;

  return {
    version: "ZW-PALM-1.0",
    ready: Boolean(latest),
    missing,
    forward,
    lunarLabel: `農曆${lunar.year}年${lunar.isLeap ? "閏" : ""}${lunar.month}月${lunar.day}日　${forward ? "男命順行" : "女命逆行"}`,
    palaces,
    latest,
    firstSentence,
    cause: CAUSE[axis.dao],
    fruit: FRUIT[axis.dao],
    seed: SEED[axis.dao],
    minggongNote: latest
      ? `時宮作今生命宮：強項是${latest.meaning}。失衡時，${latest.dao}會把同一套本事用過量。`
      : "時宮未定，今生命宮總論留白。",
    boundary: "此為民俗命理分類，不是可驗證的歷史前世或宗教裁決。達摩一掌經負責排盤，三世因果歌只轉譯前因、今果、後種。",
  };
}

export function palmFromChart(chart: Chart, civil: { year: number; month: number; day: number; hour: number }): PalmReading {
  return buildPalm({
    year: civil.year,
    month: civil.month,
    day: civil.day,
    hour: civil.hour,
    timeUnknown: chart.timeUnknown,
    gender: chart.gender,
  });
}

export function composePalmReport(question: string, palm: PalmReading, zipingLine: string): string {
  const four = palm.palaces
    .map((p) => `${p.lifeLabel}｜${p.label}${p.zhi}　${p.star}　${p.dao}\n${p.meaning}`)
    .join("\n\n");
  return [
    "昭梧｜前世今生（ZW-PALM-1.0）",
    "",
    "一、你真正問的問題",
    question,
    "",
    palm.firstSentence,
    palm.lunarLabel,
    "",
    "二、四宮",
    four,
    "",
    "三、今生命宮",
    palm.minggongNote,
    "",
    "四、前因、今果、後種",
    palm.cause,
    palm.fruit,
    palm.seed,
    "",
    "五、子平背景（不替代四宮）",
    zipingLine,
    "",
    palm.boundary,
  ].join("\n");
}
