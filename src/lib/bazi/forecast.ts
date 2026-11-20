import { BRANCH_ELEMENT } from "./constants";
import { jieqiAround, tenGod, yearMonthPillars } from "./calendar";
import type { Chart, QuestionKind } from "./types";

export type ForecastTopic = QuestionKind | "travel";

export type ForecastPeriod = {
  year: number;
  month: number;
  yearGanZhi: string;
  monthGanZhi: string;
  jieStart: string;
  jieEnd: string;
  score: number;
  notes: string[];
};

export type ForecastYear = {
  year: number;
  yearGanZhi: string;
  score: number;
  best: ForecastPeriod[];
  caution: ForecastPeriod[];
  months: ForecastPeriod[];
  destinationStyle: string;
};

export type ForecastOptions = {
  months?: number[];
  explain?: boolean;
};

const COMBINE: Record<string, string> = {
  子: "丑", 丑: "子", 寅: "亥", 亥: "寅", 卯: "戌", 戌: "卯",
  辰: "酉", 酉: "辰", 巳: "申", 申: "巳", 午: "未", 未: "午",
};

const CLASH: Record<string, string> = {
  子: "午", 午: "子", 丑: "未", 未: "丑", 寅: "申", 申: "寅",
  卯: "酉", 酉: "卯", 辰: "戌", 戌: "辰", 巳: "亥", 亥: "巳",
};

const HARM: Record<string, string> = {
  子: "未", 未: "子", 丑: "午", 午: "丑", 寅: "巳", 巳: "寅",
  卯: "辰", 辰: "卯", 申: "亥", 亥: "申", 酉: "戌", 戌: "酉",
};

function readyBranches(chart: Chart): { day: string; month: string; all: string[] } {
  const ready = chart.pillars.filter((p) => p.ready);
  const day = ready.find((p) => p.key === "day")?.zhi ?? "";
  const month = ready.find((p) => p.key === "month")?.zhi ?? chart.monthBranch;
  return { day, month, all: ready.map((p) => p.zhi).filter(Boolean) };
}

function godScore(god: string, topic: ForecastTopic, strong: boolean): number {
  const isWealth = god === "正財" || god === "偏財";
  const isOfficer = god === "正官" || god === "七殺";
  const isOutput = god === "食神" || god === "傷官";
  const isResource = god === "正印" || god === "偏印";
  const isPeer = god === "比肩" || god === "劫財" || god === "日主";

  switch (topic) {
    case "travel":
      if (isOutput) return 3;
      if (isWealth) return 2;
      if (isPeer) return strong ? -1 : 1;
      if (isResource) return strong ? -1 : 1;
      return 0;
    case "love":
      if (isWealth || isOfficer) return 2;
      if (isOutput) return 1;
      if (isPeer) return -1;
      return 0;
    case "career":
      if (isOfficer || isOutput) return 2;
      if (isWealth) return 1;
      if (isResource) return strong ? 0 : 1;
      return 0;
    case "money":
      if (isWealth) return 3;
      if (isOutput) return 2;
      if (isOfficer) return 1;
      if (isPeer) return -1;
      return 0;
    case "home":
      if (isResource) return 2;
      if (isPeer) return 1;
      return 0;
    case "health":
      if (isResource) return strong ? 0 : 1;
      if (isOutput) return 1;
      if (isOfficer) return -1;
      return 0;
    case "self":
      if (isOutput || isResource) return 1;
      return 0;
    default:
      return 0;
  }
}

function relationScore(branch: string, chart: Chart, topic: ForecastTopic): { score: number; notes: string[] } {
  const { day, month, all } = readyBranches(chart);
  let score = 0;
  const notes: string[] = [];

  if (day && COMBINE[branch] === day) {
    score += 3;
    notes.push("與日支六合");
  }
  if (month && COMBINE[branch] === month) {
    score += 2;
    notes.push("與月令六合");
  }
  if (day && CLASH[branch] === day) {
    score += topic === "travel" ? -1 : -3;
    notes.push(topic === "travel" ? "沖日支，動象強但較折騰" : "沖日支");
  }
  if (month && CLASH[branch] === month) {
    score += topic === "travel" ? -1 : -2;
    notes.push("沖月令");
  }
  if (all.some((zhi) => HARM[branch] === zhi)) {
    score -= 1;
    notes.push("有害象，細節較容易卡");
  }

  const sameCount = all.filter((zhi) => zhi === branch).length;
  if (sameCount >= 2) {
    score -= 1;
    notes.push("同支疊加，容易過量");
  }

  return { score, notes };
}

function scoreGanZhi(gz: string, chart: Chart, topic: ForecastTopic): { score: number; notes: string[] } {
  const strong = chart.strength.tendency.includes("旺");
  const god = tenGod(chart.dayMaster, gz[0]);
  const godPart = godScore(god, topic, strong);
  const rel = relationScore(gz[1], chart, topic);
  const notes = [`天干${god}${godPart > 0 ? "有助" : godPart < 0 ? "偏耗" : "中性"}`, ...rel.notes];
  return { score: godPart + rel.score, notes };
}

function targetDayun(chart: Chart, year: number): string | null {
  return chart.dayun.find((d) => year >= d.startYear && year <= d.endYear)?.ganZhi ?? null;
}

function monthDate(year: number, month: number): Date {
  return new Date(Date.UTC(year, month - 1, 15, 12, 0, 0));
}

function destinationStyleFrom(best: ForecastPeriod[]): string {
  if (!best.length) return "以休息感強、轉場少的目的地為主。";
  const element = BRANCH_ELEMENT[best[0].monthGanZhi[1]];
  switch (element) {
    case "水":
      return "優先海邊、島嶼、湖區或步調較鬆的濱水城市；行程不要排太滿。";
    case "木":
      return "優先綠意多、可步行、山林或溫和小城型目的地，比純購物趕場更合適。";
    case "火":
      return "優先日照足、文化活動多、能真正放鬆但不悶的城市或海島。";
    case "金":
      return "優先乾爽、秩序清楚、交通好、節奏俐落的城市型目的地。";
    case "土":
    default:
      return "優先溫泉、古城、慢節奏內陸或一地住久一點的行程，少做高密度轉場。";
  }
}

export type TravelPlace = {
  name: string;
  why: string;
  element: string;
};

const TRAVEL_PLACES: Record<string, { name: string; why: string }[]> = {
  水: [
    { name: "沖繩", why: "海島步調鬆、水氣足" },
    { name: "杭州西湖", why: "濱水可步行、轉場少" },
    { name: "釜山", why: "海岸城市、行程可鬆可緊" },
    { name: "峇里島", why: "湖海與休息感並存" },
  ],
  木: [
    { name: "京都", why: "綠意古寺、適合步行深遊" },
    { name: "清邁", why: "山林小城、節奏溫和" },
    { name: "南投日月潭", why: "山湖、少趕場" },
    { name: "奈良", why: "綠意古都、一地住久" },
  ],
  火: [
    { name: "墾丁", why: "日照足、真正放假" },
    { name: "雪梨", why: "陽光海岸、活動多但不逼促" },
    { name: "沖繩本島", why: "暖陽海島型" },
    { name: "黃金海岸", why: "日照長、節奏可自己控" },
  ],
  金: [
    { name: "東京", why: "秩序清楚、交通好、節奏俐落" },
    { name: "新加坡", why: "乾爽好走、行程可控" },
    { name: "首爾", why: "城市機能強、轉場成本低" },
    { name: "維也納", why: "城市節奏清楚、好規劃" },
  ],
  土: [
    { name: "台南", why: "古城慢遊、一地住久" },
    { name: "西安", why: "厚土古城、適合深遊" },
    { name: "清邁舊城", why: "內陸慢城" },
    { name: "京都", why: "古城、少轉場" },
  ],
};

const KNOWN_TRAVEL_NAMES = [
  "沖繩", "冲绳", "京都", "東京", "东京", "大阪", "北海道", "奈良",
  "首爾", "首尔", "釜山", "新加坡", "峇里島", "巴厘岛", "清邁", "清迈",
  "杭州西湖", "西湖", "杭州", "墾丁", "垦丁", "台南", "臺南", "台北", "臺北",
  "高雄", "花蓮", "花莲", "澎湖", "阿里山", "日月潭", "南投",
  "雪梨", "悉尼", "墨爾本", "墨尔本", "黃金海岸", "黄金海岸",
  "西安", "麗江", "丽江", "桂林", "陽朔", "阳朔", "成都", "敦煌", "九寨溝", "九寨沟",
  "三亞", "三亚", "香港", "澳門", "澳门", "吉隆坡", "普吉", "蘇梅", "苏梅",
  "長灘島", "长滩岛", "暹粒", "吳哥", "吴哥", "維也納", "维也纳",
  "倫敦", "伦敦", "巴黎", "紐約", "纽约", "洛杉磯", "洛杉矶", "溫哥華", "温哥华",
];

function hashSeed(value: string) {
  let hash = 2166136261;
  for (let i = 0; i < value.length; i += 1) {
    hash ^= value.charCodeAt(i);
    hash = Math.imul(hash, 16777619);
  }
  return hash >>> 0;
}

export function extractNamedPlaces(question: string): string[] {
  const hits: string[] = [];
  for (const name of KNOWN_TRAVEL_NAMES) {
    if (question.includes(name) && !hits.some((hit) => hit.includes(name) || name.includes(hit))) {
      hits.push(name);
    }
  }
  return hits.slice(0, 4);
}

export function pickTravelDestinations(
  chart: Chart,
  year?: number,
  months?: number[],
): TravelPlace[] {
  const targetYear = year ?? new Date().getFullYear();
  const f = analyzeForecastYear(chart, targetYear, "travel");
  const ranked = rankWithin(f, months);
  const best = ranked.best[0] ?? f.best[0];
  const element = (best ? BRANCH_ELEMENT[best.monthGanZhi[1]] : chart.dayMasterElement) || "土";
  const pool = TRAVEL_PLACES[element] ?? TRAVEL_PLACES.土;
  const start = hashSeed(`${chart.dayMaster}${chart.monthBranch}${chart.civilStamp}${element}${targetYear}`) % pool.length;
  return [0, 1, 2].map((offset) => {
    const item = pool[(start + offset) % pool.length];
    return { ...item, element };
  });
}


export function analyzeForecastYear(chart: Chart, year: number, topic: ForecastTopic): ForecastYear {
  const yearGz = yearMonthPillars(new Date(Date.UTC(year, 6, 1, 12))).year;
  const yearBase = scoreGanZhi(yearGz, chart, topic);
  const dayunGz = targetDayun(chart, year);
  const dayunBase = dayunGz ? scoreGanZhi(dayunGz, chart, topic).score : 0;

  const months: ForecastPeriod[] = [];
  for (let month = 1; month <= 12; month++) {
    const at = monthDate(year, month);
    const ym = yearMonthPillars(at);
    const jie = jieqiAround(at);
    const monthPart = scoreGanZhi(ym.month, chart, topic);
    const score = Math.round((monthPart.score * 2 + yearBase.score + dayunBase) * 10) / 10;
    months.push({
      year,
      month,
      yearGanZhi: yearGz,
      monthGanZhi: ym.month,
      jieStart: jie.prev.name,
      jieEnd: jie.next.name,
      score,
      notes: [...monthPart.notes, ...(dayunGz ? [`大運${dayunGz}`] : [])],
    });
  }

  const ranked = [...months].sort((a, b) => b.score - a.score || a.month - b.month);
  const cautionRanked = [...months].sort((a, b) => a.score - b.score || a.month - b.month);
  const yearScore = Math.round((yearBase.score + dayunBase) * 10) / 10;
  const best = ranked.slice(0, 3);
  const caution = cautionRanked.slice(0, 2);

  return {
    year,
    yearGanZhi: yearGz,
    score: yearScore,
    best,
    caution,
    months,
    destinationStyle: destinationStyleFrom(best),
  };
}

function monthList(items: ForecastPeriod[]): string {
  return items
    .map((x) => `${x.month}月（${x.monthGanZhi}；${x.jieStart}→${x.jieEnd}）`)
    .join("、");
}

function yearVerdict(topic: ForecastTopic, f: ForecastYear): string {
  if (topic === "travel") {
    if (f.score <= -3) return `${f.year} 並不是「完全不能出行」，但整體不適合排高密度、連續轉場的旅行。`;
    if (f.score >= 3) return `${f.year} 整體可以出行，而且比平均年份更容易把旅行安排得順。`;
    return `${f.year} 不是整年不適合出行；重點是挑月份，不要把整年一刀切掉。`;
  }
  if (f.score >= 3) return `${f.year} 整體偏順，適合主動推進。`;
  if (f.score <= -3) return `${f.year} 整體壓力較重，適合挑窗口而不是硬衝整年。`;
  return `${f.year} 屬於可做、但要挑月份的年份。`;
}

function normalizedMonths(months?: number[]): number[] {
  if (!months?.length) return [];
  return [...new Set(months.map(Number).filter((m) => Number.isInteger(m) && m >= 1 && m <= 12))].sort((a, b) => a - b);
}

function rankWithin(f: ForecastYear, months?: number[]): { best: ForecastPeriod[]; caution: ForecastPeriod[] } {
  const scope = normalizedMonths(months);
  const source = scope.length ? f.months.filter((m) => scope.includes(m.month)) : f.months;
  const ranked = [...source].sort((a, b) => b.score - a.score || a.month - b.month);
  const caution = [...source].sort((a, b) => a.score - b.score || a.month - b.month);
  return {
    best: ranked.slice(0, Math.min(3, ranked.length)),
    caution: caution.slice(0, Math.min(2, caution.length)),
  };
}

function evidence(items: ForecastPeriod[]): string {
  const first = items[0];
  if (!first) return "";
  const why = first.notes.filter(Boolean).slice(0, 3).join("、");
  return why ? `排序依據：${first.month}月窗口以${first.jieStart}→${first.jieEnd}為節氣邊界，主要見${why}。` : "";
}

function uncertainty(chart: Chart): string {
  if (chart.timeUnknown) {
    return "出生時間未確定，這次不使用時柱與大運做滿格推斷，月份排序只按已知盤面，精度會低一級。";
  }
  return "月份名稱只是方便閱讀；命理月以節氣交接為邊界，不等於公曆每月 1 日到月底。月份排序是已接入的歲運關係排序，不把它包裝成必然事件或保證日期。";
}

function singleMonthFocus(topic: ForecastTopic, score: number): string {
  const restrained = score <= 0;
  switch (topic) {
    case "career":
      return restrained
        ? "工作上先把现有任务做稳，重要决定多留一次复核，不宜同时开启多条新线。"
        : "工作上适合收口、交付和推动已经谈清楚的事项，再决定是否扩张。";
    case "money":
      return restrained
        ? "财务上先守现金流和风险上限，暂缓高成本、难退出的决定。"
        : "财务上可以推进已有计划，但先写清预算、风险上限和退出条件。";
    case "love":
      return restrained
        ? "关系里先看持续回应和实际行动，不要用一次热度替代长期判断。"
        : "关系里适合把话说清楚，并用持续联系和实际安排来判断进展。";
    case "health":
      return "这个月优先稳住睡眠、作息和身体负荷；若不适持续或加重，请及时就医。";
    case "home":
      return "居住决定要同时核对预算、通勤、采光和实际居住感受，不凭一个时间点仓促落定。";
    case "travel":
      return restrained
        ? "行程宜少转场、留余量，并预先确认预算与体力负荷。"
        : "可以安排出行，但仍以少转场、留余量的行程更稳。";
    case "self":
    default:
      return restrained
        ? "先收口手上的事，减少同时推进的目标，再观察下一步。"
        : "适合先收口和交付，再决定是否扩张；不要同时开启太多新线。";
  }
}

function singleMonthAnswer(chart: Chart, topic: ForecastTopic, period: ForecastPeriod): string {
  const tone = period.score >= 5
    ? "推进力较强"
    : period.score >= 1
      ? "整体可用"
      : period.score <= -3
        ? "阻力偏高"
        : "起伏较多";
  const precision = chart.timeUnknown
    ? "出生时间尚未确定，因此这里只按已知盘面判断，精度会低一级。"
    : "把它当作安排节奏的参考，不当作结果保证。";
  return `${period.year}年${period.month}月（${period.monthGanZhi}，${period.jieStart}至${period.jieEnd}）${tone}。${singleMonthFocus(topic, period.score)}${precision}`;
}

export function buildTimingAnswer(
  chart: Chart,
  topic: ForecastTopic,
  targetYears: number[],
  options: ForecastOptions = {},
): string {
  const now = new Date().getFullYear();
  const years = targetYears.length ? targetYears.slice(0, 3) : [now, now + 1];
  const forecasts = years.map((year) => analyzeForecastYear(chart, year, topic));
  const scope = normalizedMonths(options.months);
  if (forecasts.length === 1 && scope.length === 1) {
    const period = forecasts[0].months.find((month) => month.month === scope[0]);
    if (period) return singleMonthAnswer(chart, topic, period);
  }
  const parts = forecasts.map((f) => {
    const ranked = rankWithin(f, scope);
    const best = monthList(ranked.best);
    const caution = monthList(ranked.caution);
    const scopeText = scope.length ? `你指定的月份範圍內，` : "";
    const why = options.explain === false ? "" : evidence(ranked.best);
    return `${yearVerdict(topic, f)}${scopeText}較順的窗口：${best || "—"}。較容易折騰或阻力偏高：${caution || "—"}。${why}`;
  });
  return `${parts.join(" ")} ${uncertainty(chart)}`.trim();
}

export function buildTravelDestinationAnswer(
  chart: Chart,
  targetYears: number[],
  options: ForecastOptions & { question?: string } = {},
): string {
  const year = targetYears[0] ?? new Date().getFullYear();
  const named = extractNamedPlaces(options.question ?? "");
  if (named.length >= 2) {
    return `你提到的地方裡，先這樣排：主選 ${named[0]}，備選 ${named.slice(1).join("、")}。都按較順月份走，行程少轉場；不是再問你補城市。`;
  }
  if (named.length === 1) {
    const alts = pickTravelDestinations(chart, year, options.months)
      .map((place) => place.name)
      .filter((name) => name !== named[0])
      .slice(0, 2);
    return `${named[0]}可以去，適合排在較順月份。同類型也可看 ${alts.join("、")}。直接定一處主行程即可。`;
  }
  const picks = pickTravelDestinations(chart, year, options.months);
  return `這次直接給你三個目的地：${picks.map((place) => `${place.name}（${place.why}）`).join("、")}。先定第一處做主行程，另外兩處作備選，不用再補城市。`;
}

