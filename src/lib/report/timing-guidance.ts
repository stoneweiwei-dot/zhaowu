/**
 * Timing guidance (流年 / 流月 / 日運 / 大運分段) — deterministic, rule-based rhythm hints.
 *
 * Scope contract:
 *  - Reads the finished Chart (day master, 用神 / 洩耗 elements, current Dayun) and the existing calendar helpers.
 *  - Does NOT recompute the chart, does NOT touch 月令 / 格局 / 用神 judgement, does NOT call any provider.
 *  - Every sentence is a fixed template selected by (ten-god group × favour direction). Same chart + same date => same output.
 *  - It is a reference layer for "when to push / when to hold", not an event prediction and not a verdict.
 */
import type { Chart, Element } from "@/lib/bazi/types";
import { BRANCH_ELEMENT, STEM_ELEMENT } from "@/lib/bazi/constants";
import { HIDDEN, dayGanzhi, ganzhiOf, jieqiAround, solarTermUtc, tenGod, yearMonthPillars } from "@/lib/bazi/calendar";

export type TimingLang = "zh" | "en";
export type GodGroup = "peer" | "output" | "wealth" | "power" | "resource";
export type Favor = "favor" | "neutral" | "drain";
export type Localize = (text: string) => string;

export type HalfBlock = {
  /** "stem" = 前半年看天干；"branch" = 後半年看地支（主氣）。 */
  basis: "stem" | "branch";
  ganZhiPart: string;
  god: string;
  group: GodGroup;
  favor: Favor;
  rangeLabel: string;
  theme: string;
  doOne: string;
  avoidOne: string;
};

export type YearGuide = {
  year: number;
  ganZhi: string;
  current: boolean;
  first: HalfBlock;
  second: HalfBlock;
  work: string;
  money: string;
};

export type MonthGuide = {
  order: number;
  ganZhi: string;
  termName: string;
  startsOn: string;
  endsOn: string;
  stemGod: string;
  branchGod: string;
  favor: Favor;
  mood: string;
  doOne: string;
  avoidOne: string;
  current: boolean;
};

export type DayGuide = {
  date: string;
  ganZhi: string;
  god: string;
  group: GodGroup;
  favor: Favor;
  weather: string;
  tone: string;
  doList: string[];
  avoidList: string[];
  work: string;
  money: string;
};

export type DayunHalf = {
  basis: "stem" | "branch";
  ganZhiPart: string;
  god: string;
  favor: Favor;
  yearsLabel: string;
  current: boolean;
  career: string;
  guard: string;
  tone: string;
};

export type DayunGuide = {
  ganZhi: string;
  startYear: number;
  endYear: number;
  first: DayunHalf;
  second: DayunHalf;
};

export type TimingGuide = {
  lang: TimingLang;
  dayMaster: string;
  provisional: boolean;
  timeUnknown: boolean;
  dayun: DayunGuide | null;
  years: YearGuide[];
  months: MonthGuide[];
  monthsYear: string;
  today: DayGuide;
  boundary: string;
  segmentNote: string;
};

type GroupCopy = {
  label: string;
  theme: string;
  work: string;
  money: string;
  doBy: Record<Favor, string>;
  avoidBy: Record<Favor, string>;
  dayDo: [string, string];
  dayAvoid: [string, string];
};

const GROUP_OF_GOD: Record<string, GodGroup> = {
  比肩: "peer",
  劫財: "peer",
  食神: "output",
  傷官: "output",
  正財: "wealth",
  偏財: "wealth",
  正官: "power",
  七殺: "power",
  正印: "resource",
  偏印: "resource",
};

const ZH: Record<GodGroup, GroupCopy> = {
  peer: {
    label: "比劫",
    theme: "同類與自我意識升溫，合作與競爭並存",
    work: "適合結盟、合夥與團隊協作；同時容易遇到平級競爭與功勞被分走",
    money: "財易被分流，合夥、借貸、代墊一律先把條件寫成書面",
    doBy: {
      favor: "主動牽頭合作，把分工與利益分配先談清楚",
      neutral: "把合作條件寫成書面，再談分工",
      drain: "先守住自己的份額與底線，合作寧缺勿濫",
    },
    avoidBy: {
      favor: "不要只靠口頭默契就開始大額合夥",
      neutral: "不替人擔保，不做沒有書面的口頭承諾",
      drain: "不借錢給人、不替人擔保，也不為爭面子加碼",
    },
    dayDo: ["復盤近期人脈與合作條件", "與夥伴對齊分工與期限"],
    dayAvoid: ["衝動開銷與跟風消費", "為爭面子而情緒對抗"],
  },
  output: {
    label: "食傷",
    theme: "表達、創作與輸出的能量增強",
    work: "適合提案、發表、技術輸出與作品曝光；言語鋒芒過盛容易招是非（傷官層尤須留意）",
    money: "收入偏向以才華、作品或服務變現，不宜把希望放在投機",
    doBy: {
      favor: "把想法做成可交付的作品並公開出去",
      neutral: "選一件作品或提案，完成並對外交付",
      drain: "輸出放慢、量力而行，先保留體力與睡眠",
    },
    avoidBy: {
      favor: "不要在情緒上頭時公開批評上司或客戶",
      neutral: "不口無遮攔，重要意見先寫下來再發",
      drain: "不熬夜硬撐輸出，也不在爭執中連續發言",
    },
    dayDo: ["寫作、提案或整理要發表的內容", "把完成度七成的作品推進到可交付"],
    dayAvoid: ["口無遮攔與情緒化發言", "熬夜過度輸出"],
  },
  wealth: {
    label: "財星",
    theme: "機會與金流增加，責任與支出也同步變重",
    work: "適合擴大客戶、談價、推進交易與收款，用成果換資源",
    money: "進項增加但支出也容易放大，先做預算與現金流表再談擴張",
    doBy: {
      favor: "優先簽下有付款條件與期限的案子，並盯緊收款",
      neutral: "先盤點現金流與應收，再決定是否擴張",
      drain: "守住現金流，把擴張與新增固定支出往後排",
    },
    avoidBy: {
      favor: "不因順風就擴大槓桿或借貸擴張",
      neutral: "不憑感覺大額投入，也不忽略合約付款條款",
      drain: "不借貸擴張、不追高、不為趕進度而放寬付款條件",
    },
    dayDo: ["談價、收款與對帳", "處理現金流與帳務事項"],
    dayAvoid: ["衝動消費與臨時加碼", "只求快而忽略合約條款"],
  },
  power: {
    label: "官殺",
    theme: "外部規範、考核與壓力上升，責任感被放大",
    work: "適合爭取職責、通過審核、承擔明確任務；壓力與是非同步增加（官殺層壓力偏重，七殺尤須留意節奏）",
    money: "收入與職責、合約條款綁定，簽約與合規要逐條看清楚",
    doBy: {
      favor: "把握被看見的機會，主動承擔並把成果量化",
      neutral: "問清楚責任範圍與考核標準，並以書面確認",
      drain: "先降低承諾量，把已承接的事情做完做穩",
    },
    avoidBy: {
      favor: "不要因為順利而接下超出能力的責任",
      neutral: "不與權威正面硬碰，不在沒讀完條款時簽字",
      drain: "不硬接高壓任務、不頂撞上位者，也不拖延期限",
    },
    dayDo: ["簽約前逐條審閱條款", "完成被考核或有期限的事項"],
    dayAvoid: ["與上司或權威硬碰硬", "拖延期限與忽略規範"],
  },
  resource: {
    label: "印星",
    theme: "貴人、學習與休整的階段，行動節奏偏慢而穩",
    work: "適合進修、考證、沉澱與借力；急著衝刺反而事倍功半",
    money: "進財偏穩而不躁，不適合追高與短線冒進",
    doBy: {
      favor: "安排學習或證照，並主動向前輩請益借力",
      neutral: "留出固定時間學習與整理，再決定行動",
      drain: "別只停在準備，設定一個小而具體的行動期限",
    },
    avoidBy: {
      favor: "不要把準備當成不行動的理由",
      neutral: "不因猶豫而錯過窗口，也不全靠他人拍板",
      drain: "不過度依賴他人與拖延，避免用休息取代決策",
    },
    dayDo: ["閱讀、學習與整理資料", "向前輩或專業者請教"],
    dayAvoid: ["猶豫不決而錯過時機", "過度依賴他人拍板"],
  },
};

const EN: Record<GodGroup, GroupCopy> = {
  peer: {
    label: "Peer",
    theme: "Self-assertion and peer energy rise; cooperation and competition coexist",
    work: "Good for alliances and teamwork; expect peer competition and shared credit",
    money: "Money tends to get split; put any partnership, loan or advance in writing first",
    doBy: {
      favor: "Take the lead on cooperation and settle roles and shares up front",
      neutral: "Write down the terms of any cooperation before assigning roles",
      drain: "Protect your own share and limits; keep partnerships selective",
    },
    avoidBy: {
      favor: "Do not start a large partnership on verbal understanding alone",
      neutral: "Do not guarantee others' debts or make unwritten promises",
      drain: "Do not lend money or co-sign, and do not escalate to save face",
    },
    dayDo: ["Review recent contacts and cooperation terms", "Align roles and deadlines with partners"],
    dayAvoid: ["Impulse spending and following the crowd", "Ego-driven confrontation"],
  },
  output: {
    label: "Output",
    theme: "Expression, creation and output are amplified",
    work: "Good for pitches, publishing, technical output and visibility; sharp words can create friction",
    money: "Income leans on talent, work and services rather than speculation",
    doBy: {
      favor: "Turn an idea into a deliverable and put it out publicly",
      neutral: "Pick one piece of work or proposal and deliver it",
      drain: "Slow the output down, work within capacity and protect sleep",
    },
    avoidBy: {
      favor: "Do not criticise a boss or client publicly while emotional",
      neutral: "Do not speak carelessly; write important opinions down first",
      drain: "Do not push through on late nights or keep talking in a dispute",
    },
    dayDo: ["Write, draft a proposal or prepare something to publish", "Move a 70%-done piece to deliverable"],
    dayAvoid: ["Careless or emotional remarks", "Over-producing late at night"],
  },
  wealth: {
    label: "Wealth",
    theme: "Opportunity and cash flow increase, and so do responsibilities and spending",
    work: "Good for growing clients, negotiating price, closing deals and collecting payment",
    money: "Income rises but spending tends to rise with it; build a budget and cash-flow sheet before expanding",
    doBy: {
      favor: "Prioritise deals with clear payment terms and deadlines, and chase collection",
      neutral: "Review cash flow and receivables before deciding to expand",
      drain: "Protect cash flow and postpone expansion and new fixed costs",
    },
    avoidBy: {
      favor: "Do not add leverage or borrow to expand just because things are going well",
      neutral: "Do not commit large sums on instinct or skip payment clauses",
      drain: "Do not borrow to expand, chase highs or loosen payment terms to hit a deadline",
    },
    dayDo: ["Negotiate price, collect payment and reconcile accounts", "Handle cash-flow and bookkeeping tasks"],
    dayAvoid: ["Impulse purchases and last-minute add-ons", "Rushing and ignoring contract terms"],
  },
  power: {
    label: "Authority",
    theme: "External rules, evaluation and pressure rise; sense of duty is amplified",
    work: "Good for taking responsibility, passing reviews and owning clear tasks; pressure and friction rise together",
    money: "Income is tied to duties and contract terms; read signing and compliance clauses line by line",
    doBy: {
      favor: "Take visible responsibility and quantify the results",
      neutral: "Clarify scope and evaluation criteria and confirm them in writing",
      drain: "Reduce commitments and finish what you already took on",
    },
    avoidBy: {
      favor: "Do not take on responsibility beyond your capacity because things are going smoothly",
      neutral: "Do not confront authority head-on or sign before reading the terms",
      drain: "Do not take on high-pressure tasks, defy superiors or miss deadlines",
    },
    dayDo: ["Read contract terms line by line before signing", "Finish items that are evaluated or have deadlines"],
    dayAvoid: ["Head-on conflict with superiors or authority", "Missing deadlines and ignoring rules"],
  },
  resource: {
    label: "Resource",
    theme: "A phase of mentors, learning and recovery; a slower but steadier pace",
    work: "Good for study, certification, consolidation and borrowing strength; rushing tends to backfire",
    money: "Income is steady rather than urgent; poor time for chasing highs or short-term bets",
    doBy: {
      favor: "Schedule study or certification and ask mentors for support",
      neutral: "Set fixed time for study and organising before you act",
      drain: "Do not stay stuck in preparation; set one small, dated action",
    },
    avoidBy: {
      favor: "Do not use preparation as a reason not to act",
      neutral: "Do not miss a window through hesitation or leave every decision to others",
      drain: "Do not over-rely on others or procrastinate; avoid replacing decisions with rest",
    },
    dayDo: ["Read, study and organise materials", "Ask a mentor or specialist"],
    dayAvoid: ["Hesitating until the moment passes", "Leaning too much on others' decisions"],
  },
};

const TONE: Record<TimingLang, Record<Favor, string>> = {
  zh: {
    favor: "此層五行落在你的用神方向：順勢，可適度放大行動。",
    neutral: "此層五行對原局偏中性：以現實條件與時機為準。",
    drain: "此層五行落在洩耗方向：守成為主，量力而為。",
  },
  en: {
    favor: "This layer falls in your favourable element direction: go with it and scale up moderately.",
    neutral: "This layer is neutral to your chart: let real-world conditions and timing decide.",
    drain: "This layer falls in a draining direction: hold position and act within capacity.",
  },
};

const MOOD: Record<TimingLang, Record<Favor, string>> = {
  zh: { favor: "偏順", neutral: "持平", drain: "偏緊" },
  en: { favor: "Tailwind", neutral: "Level", drain: "Tight" },
};

const BOUNDARY: Record<TimingLang, string> = {
  zh: "以下是依日主與流年、流月、流日干支的十神關係，再加上用神／洩耗方向所產生的規則化節奏提示：固定規則、同一命盤同一日期結果一致。它是行動時機的參考，不是事件預測，也不取代完整命書對原局的整體判斷。涉及法律、醫療、投資等重大決策，請以現實專業意見與實際條件為準。",
  en: "These are rule-based rhythm hints derived from the ten-god relation between your day master and the year, month and day stems and branches, adjusted by your favourable / draining element direction. The rules are fixed, so the same chart and date always give the same result. They are a timing reference, not event predictions, and do not replace the full reading of your natal chart. For legal, medical or investment decisions, rely on professional advice and real-world conditions.",
};

const SEGMENT_NOTE: Record<TimingLang, string> = {
  zh: "年內分段採常見的參考法：立春至立秋之間以天干為主，立秋至次年立春之間以地支主氣為主。這是一種分段參考，並非唯一標準。",
  en: "Within-year segmentation uses a common reference method: the stem leads from Start of Spring to Start of Autumn, and the branch main qi leads from Start of Autumn to the next Start of Spring. It is a reference split, not the only standard.",
};

const PROVISIONAL_NOTE: Record<TimingLang, string> = {
  zh: "（出生時辰不確定或用神仍屬暫定，下列喜忌方向僅供參考。）",
  en: " (Birth time is uncertain or the favourable elements are provisional, so the favour direction below is indicative only.)",
};

export function godGroup(god: string): GodGroup {
  return GROUP_OF_GOD[god] ?? "peer";
}

export function favorOfElement(chart: Pick<Chart, "useful" | "drain">, element: Element | undefined): Favor {
  if (!element) return "neutral";
  if (chart.useful.includes(element)) return "favor";
  if (chart.drain.includes(element)) return "drain";
  return "neutral";
}

function mainQi(branch: string): string {
  return HIDDEN[branch]?.[0] ?? branch;
}

function combineFavor(a: Favor, b: Favor): Favor {
  const score = (f: Favor) => (f === "favor" ? 1 : f === "drain" ? -1 : 0);
  const sum = score(a) + score(b);
  return sum >= 1 ? "favor" : sum <= -1 ? "drain" : "neutral";
}

function pad2(value: number): string {
  return String(value).padStart(2, "0");
}

function md(date: Date): string {
  return `${date.getMonth() + 1}/${date.getDate()}`;
}

function ymd(date: Date): string {
  return `${date.getFullYear()}-${pad2(date.getMonth() + 1)}-${pad2(date.getDate())}`;
}

function yearNumberOf(at: Date): number {
  const y = at.getUTCFullYear();
  return at.getTime() >= solarTermUtc(y, 315).getTime() ? y : y - 1;
}

function godsOf(dayMaster: string, ganZhi: string) {
  const stem = ganZhi[0];
  const branch = ganZhi[1];
  const branchQi = mainQi(branch);
  return {
    stem,
    branch,
    branchQi,
    stemGod: tenGod(dayMaster, stem),
    branchGod: tenGod(dayMaster, branchQi),
  };
}

function buildHalf(
  chart: Chart,
  copy: Record<GodGroup, GroupCopy>,
  lang: TimingLang,
  basis: "stem" | "branch",
  ganZhi: string,
  rangeLabel: string,
  loc: Localize,
): HalfBlock {
  const g = godsOf(chart.dayMaster, ganZhi);
  const part = basis === "stem" ? g.stem : g.branchQi;
  const god = basis === "stem" ? g.stemGod : g.branchGod;
  const group = godGroup(god);
  const element = basis === "stem" ? STEM_ELEMENT[part] : BRANCH_ELEMENT[g.branch];
  const favor = favorOfElement(chart, element);
  const c = copy[group];
  return {
    basis,
    ganZhiPart: part,
    god,
    group,
    favor,
    rangeLabel,
    theme: loc(`${c.theme}。${TONE[lang][favor]}`),
    doOne: loc(c.doBy[favor]),
    avoidOne: loc(c.avoidBy[favor]),
  };
}

function buildDayun(
  chart: Chart,
  copy: Record<GodGroup, GroupCopy>,
  lang: TimingLang,
  nowYear: number,
  loc: Localize,
): DayunGuide | null {
  const period = chart.currentDayun;
  if (!period || chart.timeUnknown) return null;
  const mid = period.startYear + 4;
  const make = (basis: "stem" | "branch", from: number, to: number): DayunHalf => {
    const g = godsOf(chart.dayMaster, period.ganZhi);
    const part = basis === "stem" ? g.stem : g.branchQi;
    const god = basis === "stem" ? g.stemGod : g.branchGod;
    const group = godGroup(god);
    const element = basis === "stem" ? STEM_ELEMENT[part] : BRANCH_ELEMENT[g.branch];
    const favor = favorOfElement(chart, element);
    const c = copy[group];
    return {
      basis,
      ganZhiPart: part,
      god,
      favor,
      yearsLabel: `${from}–${to}`,
      current: nowYear >= from && nowYear <= to,
      career: loc(`${c.work}。`),
      guard: loc(`${c.money}。`),
      tone: loc(TONE[lang][favor]),
    };
  };
  return {
    ganZhi: period.ganZhi,
    startYear: period.startYear,
    endYear: period.endYear,
    first: make("stem", period.startYear, mid),
    second: make("branch", mid + 1, period.endYear),
  };
}

export function buildTimingGuide(chart: Chart, now: Date, lang: TimingLang, localize?: Localize): TimingGuide {
  const loc: Localize = localize ?? ((text) => text);
  const copy = lang === "en" ? EN : ZH;
  const baseYear = yearNumberOf(now);
  const currentYearName = ganzhiOf(((baseYear - 1984) % 60 + 60) % 60);
  const provisional = Boolean(chart.usefulProvisional || chart.timeUnknown);

  // ── 流年：當前干支年起算三年；前半年看天干、後半年看地支主氣 ──
  const years: YearGuide[] = [0, 1, 2].map((offset) => {
    const year = baseYear + offset;
    const ganZhi = ganzhiOf(((year - 1984) % 60 + 60) % 60);
    const lichun = solarTermUtc(year, 315);
    const liqiu = solarTermUtc(year, 135);
    const nextLichun = solarTermUtc(year + 1, 315);
    const first = buildHalf(chart, copy, lang, "stem", ganZhi, `${md(lichun)}–${md(new Date(liqiu.getTime() - 86400000))}`, loc);
    const second = buildHalf(chart, copy, lang, "branch", ganZhi, `${md(liqiu)}–${md(new Date(nextLichun.getTime() - 86400000))}`, loc);
    const dominant = first.favor === "drain" && second.favor !== "drain" ? second : first;
    const c = copy[dominant.group];
    return {
      year,
      ganZhi,
      current: offset === 0,
      first,
      second,
      work: loc(`${c.work}。`),
      money: loc(`${c.money}。`),
    };
  });

  // ── 流月：當前干支年的 12 個節月（寅月起） ──
  const months: MonthGuide[] = [];
  let cursor = solarTermUtc(baseYear, 315);
  for (let i = 0; i < 12; i += 1) {
    const probe = new Date(cursor.getTime() + 60_000);
    const around = jieqiAround(probe);
    const startAt = cursor;
    const endAt = around.next.at;
    const mid = new Date((startAt.getTime() + endAt.getTime()) / 2);
    const pillar = yearMonthPillars(mid).month;
    const g = godsOf(chart.dayMaster, pillar);
    const stemFavor = favorOfElement(chart, STEM_ELEMENT[g.stem]);
    const branchFavor = favorOfElement(chart, BRANCH_ELEMENT[g.branch]);
    const favor = combineFavor(stemFavor, branchFavor);
    const group = godGroup(g.stemGod);
    const c = copy[group];
    months.push({
      order: i + 1,
      ganZhi: pillar,
      termName: around.prev.name,
      startsOn: md(startAt),
      endsOn: md(new Date(endAt.getTime() - 86400000)),
      stemGod: g.stemGod,
      branchGod: g.branchGod,
      favor,
      mood: MOOD[lang][favor],
      doOne: loc(c.doBy[favor]),
      avoidOne: loc(c.avoidBy[favor]),
      current: now.getTime() >= startAt.getTime() && now.getTime() < endAt.getTime(),
    });
    cursor = endAt;
  }

  // ── 日運：以使用者所在地的民用日期 ──
  const dayGz = dayGanzhi(now.getFullYear(), now.getMonth() + 1, now.getDate());
  const dg = godsOf(chart.dayMaster, dayGz);
  const dayFavor = combineFavor(
    favorOfElement(chart, STEM_ELEMENT[dg.stem]),
    favorOfElement(chart, STEM_ELEMENT[dg.stem]),
  );
  const dayGroup = godGroup(dg.stemGod);
  const dc = copy[dayGroup];
  const today: DayGuide = {
    date: ymd(now),
    ganZhi: dayGz,
    god: dg.stemGod,
    group: dayGroup,
    favor: dayFavor,
    weather: loc(lang === "en" ? `${dc.label} day · ${MOOD.en[dayFavor]}` : `${dc.label}日 · ${MOOD.zh[dayFavor]}`),
    tone: loc(TONE[lang][dayFavor]),
    doList: dc.dayDo.map((s) => loc(s)),
    avoidList: dc.dayAvoid.map((s) => loc(s)),
    work: loc(`${dc.work}。`),
    money: loc(`${dc.money}。`),
  };

  return {
    lang,
    dayMaster: chart.dayMaster,
    provisional,
    timeUnknown: chart.timeUnknown,
    dayun: buildDayun(chart, copy, lang, now.getFullYear(), loc),
    years,
    months,
    monthsYear: currentYearName,
    today,
    boundary: loc(BOUNDARY[lang] + (provisional ? PROVISIONAL_NOTE[lang] : "")),
    segmentNote: loc(SEGMENT_NOTE[lang]),
  };
}
