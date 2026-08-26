import { applyAnswerContract } from "@/lib/core/answer-contract";
import type { AppLocale, Chart, QuestionKind, Reading } from "@/lib/bazi/types";
import { applyCustomerAnswerHotfix } from "@/lib/report/customer-answer-hotfix";
import { customerDirectAnswer } from "@/lib/report/customer-copy";
import { applyCosmicSymbolicReading, isCosmicSymbolicQuestion } from "@/lib/symbolic/cosmic-profile";

const STEM_EN: Record<string, string> = {
  甲: "Jia", 乙: "Yi", 丙: "Bing", 丁: "Ding", 戊: "Wu",
  己: "Ji", 庚: "Geng", 辛: "Xin", 壬: "Ren", 癸: "Gui",
};

const BRANCH_EN: Record<string, string> = {
  子: "Zi", 丑: "Chou", 寅: "Yin", 卯: "Mao", 辰: "Chen", 巳: "Si",
  午: "Wu", 未: "Wei", 申: "Shen", 酉: "You", 戌: "Xu", 亥: "Hai",
};

const ELEMENT_EN: Record<string, string> = {
  木: "Wood", 火: "Fire", 土: "Earth", 金: "Metal", 水: "Water",
};

function englishStem(value: string): string {
  return STEM_EN[value] ?? "Unconfirmed";
}

function englishBranch(value: string): string {
  return BRANCH_EN[value] ?? "Unconfirmed";
}

function englishGanZhi(value: string): string {
  if (!value || value.length < 2) return "unconfirmed cycle";
  const stem = STEM_EN[value[0]];
  const branch = BRANCH_EN[value[1]];
  return stem && branch ? `${stem}-${branch}` : "unconfirmed cycle";
}

function englishQuestionKind(question: string, fallback: QuestionKind): QuestionKind {
  if (/\b(work|career|job|role|profession|business|project|study|school|exam)\b/i.test(question)) return "career";
  if (/\b(love|relationship|partner|dating|marriage|romance)\b/i.test(question)) return "love";
  if (/\b(money|finance|income|salary|investment|debt|budget)\b/i.test(question)) return "money";
  if (/\b(health|sleep|body|recovery|medical|treatment|pregnan(?:cy|t))\b/i.test(question)) return "health";
  if (/\b(home|house|apartment|move|moving|property|residence)\b/i.test(question)) return "home";
  if (/\b(choose|choice|compare|versus|\bvs\b|which option)\b/i.test(question)) return "choice";
  if (/\b(when|timing|what time|which month|which year|how soon)\b/i.test(question)) return "timing";
  return fallback;
}

function horizonPhrase(question: string): string {
  if (/\bthis\s+year\b/i.test(question)) return "this year";
  if (/next\s+six\s+months/i.test(question)) return "over the next six months";
  if (/next\s+(?:three|3)\s+months/i.test(question)) return "over the next three months";
  if (/next\s+(?:twelve|12)\s+months|next\s+year/i.test(question)) return "over the next year";
  return "in the period you are asking about";
}

type EnglishRegion = "au" | "nz" | "uk" | "us" | "ca" | "international";

function englishRegion(chart: Chart): EnglishRegion {
  const place = `${chart.liveCityLabel ?? ""} ${chart.cityLabel}`.toLowerCase();
  if (/australia|澳洲|澳大利/.test(place)) return "au";
  if (/new zealand|aotearoa|紐西蘭|新西兰/.test(place)) return "nz";
  if (/united kingdom|england|scotland|wales|northern ireland|英國|英国/.test(place)) return "uk";
  if (/united states|\bu\.s\.|\busa\b|美國|美国/.test(place)) return "us";
  if (/canada|加拿大/.test(place)) return "ca";
  return "international";
}

function prioritise(region: EnglishRegion): string {
  return region === "us" || region === "ca" ? "Prioritize" : "Prioritise";
}

function regionalJobCheck(question: string, region: EnglishRegion): string {
  if (!/\b(change jobs?|new job|offer|salary|pay|role)\b/i.test(question)) return "";
  switch (region) {
    case "au": return "Compare base pay, super, leave, hours and commute together.";
    case "nz": return "Compare base pay, KiwiSaver, leave, hours and commute together.";
    case "uk": return "Compare pay, pension, leave, hours and commute together.";
    case "us": return "Compare pay, health cover, paid leave, hours and commute together.";
    case "ca": return "Compare pay, benefits, paid leave, hours and commute together.";
    default: return "Compare pay, benefits, leave, hours and commute together.";
  }
}

function englishAction(kind: QuestionKind): string {
  switch (kind) {
    case "career":
      return "Write down one six-month outcome, its weekly proof of progress, and the work you will stop doing. Review those three items every Friday.";
    case "love":
      return "Track observable reciprocity: consistent contact, concrete plans, clear commitment, and respected boundaries.";
    case "money":
      return "Set the maximum acceptable loss, cash-flow requirement, and exit condition before considering upside.";
    case "health":
      return "Stabilize sleep, routine, and physical load first; seek qualified medical care for persistent, worsening, or activity-limiting symptoms.";
    case "home":
      return "Verify light, noise, commute, budget, layout, and how the space feels in person before deciding.";
    case "choice":
      return "Compare both options against the same five criteria: benefit, cost, responsibility, reversibility, and exit difficulty.";
    case "timing":
      return "Use the requested period as a preparation window, then confirm the decision against real deadlines and constraints.";
    case "past":
      return "Keep only the symbolic observations that match repeated, verifiable patterns in your real life.";
    default:
      return "Test this reading against three recent real events and keep only what remains useful.";
  }
}

function englishDirectAnswer(question: string, chart: Chart, kind: QuestionKind): string {
  const region = englishRegion(chart);
  const lead = prioritise(region);
  if (/\b(travel|trip|vacation)\b/i.test(question)) {
    return `${lead} a simple itinerary with fewer transfers. Leave time to rest each day and keep extra room in the budget for transport or weather changes.`;
  }
  switch (kind) {
    case "career":
      return `${lead} one main work goal ${horizonPhrase(question)}. Choose work where success is clear, your responsibility is defined, and the workload is realistic. Do not treat several priorities as equally urgent. ${regionalJobCheck(question, region)}`.trim();
    case "love":
      return "Look at what the other person actually does: do they stay in contact, make plans, speak clearly about commitment, and respect your boundaries?";
    case "money":
      return `${lead} steady cash flow. Before taking a financial risk, decide how much you can afford to lose and when you will stop.`;
    case "health":
      return `${lead} sleep, recovery, and a workload your body can handle. This report cannot diagnose a condition or replace medical care.`;
    case "home":
      return `${lead} the home that works in daily life. Check light, noise, commute, layout, and total cost in person before deciding.`;
    case "choice":
      return "Choose the option whose worst-case cost you can handle and which is easier to leave. Compare both choices using the same facts before deciding.";
    case "timing":
      return "Use the period you named to prepare, not as a promise that something will happen. Confirm the real deadline, requirements, and backup plan before acting.";
    case "past":
      return "Treat this as a way to notice repeated patterns in your present life, not as proof of a literal past life.";
    default:
      return `${lead} one decision you can test through action now. Review what actually happens before making a bigger commitment.`;
  }
}

const CHINESE_TECHNICAL_SENTENCE = /命盤|命盘|命理|八字|四柱|天干|地支|藏干|日主|月令|旺衰|身強|身强|身弱|喜用神|用神|格局|十神|大運|大运|流年|流月|干支|扶身|泄身|制身|扶泄|制化|調候|调候|病藥|病药|刑沖|刑冲|合害|節氣邊界|节气边界/;

function simplifyPlainChinese(value: string): string {
  return value
    .replaceAll("整體", "整体")
    .replaceAll("推進", "推进")
    .replaceAll("較", "较")
    .replaceAll("順", "顺")
    .replaceAll("這", "这")
    .replaceAll("時間", "时间")
    .replaceAll("行動", "行动")
    .replaceAll("先後", "先后")
    .replaceAll("保證", "保证")
    .replaceAll("選", "选")
    .replaceAll("國", "国")
    .replaceAll("臺", "台")
    .replaceAll("東京", "东京")
    .replaceAll("首爾", "首尔")
    .replaceAll("沖繩", "冲绳")
    .replaceAll("清邁", "清迈")
    .replaceAll("維也納", "维也纳")
    .replaceAll("黃金海岸", "黄金海岸")
    .replaceAll("峇里", "巴厘");
}

function stripChineseTechnicalDetail(question: string, answer: string, locale: AppLocale): string {
  const base = customerDirectAnswer(question, answer)
    .replace(/(\d{1,2}月)（[甲乙丙丁戊己庚辛壬癸][子丑寅卯辰巳午未申酉戌亥][；;][^）]+）/g, "$1")
    .replace(/(\d{4}年\d{1,2}月)（[甲乙丙丁戊己庚辛壬癸][子丑寅卯辰巳午未申酉戌亥][，,][^）]+）/g, "$1");
  const replacement = locale === "zh-Hant"
    ? "這些時間只代表行動先後順序，不保證結果。"
    : "这些时间只代表行动先后顺序，不保证结果。";
  const uncertainty = locale === "zh-Hant"
    ? "出生時間未確定，所以時間判斷會較寬。"
    : "出生时间未确定，所以时间判断会较宽。";
  const sentences = (base.match(/[^。！？!?]+[。！？!?]?/g) ?? [base])
    .map((part) => part.trim())
    .map((part) => /出生時間未確定|出生时间未确定/.test(part) ? uncertainty : part)
    .map((part) => /月份以節氣|月份以节气|命理月/.test(part) ? replacement : part)
    .filter((part) => part && !CHINESE_TECHNICAL_SENTENCE.test(part));
  const plain = sentences.join("") || replacement;
  return locale === "zh-Hans" ? simplifyPlainChinese(plain) : plain;
}

function chineseDirectAnswer(question: string, chart: Chart, reading: Reading, locale: AppLocale): string {
  const isHant = locale === "zh-Hant";
  const hasTiming = /(何時|何时|什麼時候|什么时候|哪一年|哪年|哪個月|哪个月|今年|明年|後年|后年|\d{4})/.test(question);
  const hasTravel = /(旅行|旅遊|旅游|度假|出行|去哪|國家|国家|城市|目的地)/.test(question);
  if (hasTiming || hasTravel) return stripChineseTechnicalDetail(question, reading.directAnswer, locale);

  switch (reading.kind) {
    case "career":
      return isHant
        ? "先集中在一個最重要、能完成的工作目標。選擇責任清楚、成果可見、工作量能承受的項目；不要同時把幾件事都當成最高優先。"
        : "先集中在一个最重要、能完成的工作目标。选择责任清楚、成果可见、工作量能承受的项目；不要同时把几件事都当成最高优先。";
    case "love":
      return isHant
        ? "不要靠猜測判斷關係，直接看對方是否持續聯繫、主動安排見面、願意說清承諾並尊重你的邊界。"
        : "不要靠猜测判断关系，直接看对方是否持续联系、主动安排见面、愿意说清承诺并尊重你的边界。";
    case "money":
      return isHant
        ? "先守住穩定現金流。做任何有風險的決定前，先寫清最多能承受多少損失，以及什麼情況必須停止。"
        : "先守住稳定现金流。做任何有风险的决定前，先写清最多能承受多少损失，以及什么情况必须停止。";
    case "health":
      return isHant
        ? "先保住睡眠、恢復時間和身體能承受的工作量。持續、加重或影響活動的不適，需要交給合格醫療人員判斷。"
        : "先保住睡眠、恢复时间和身体能承受的工作量。持续、加重或影响活动的不适，需要交给合格医疗人员判断。";
    case "home":
      return isHant
        ? "選真正適合日常生活的地方。決定前親自核對採光、噪音、通勤、空間配置和總成本。"
        : "选真正适合日常生活的地方。决定前亲自核对采光、噪音、通勤、布局和总成本。";
    case "choice":
      return isHant
        ? "先排除最壞結果無法承受的選項，再用同一組條件比較收益、成本、責任和退出難度。"
        : "先排除最坏结果无法承受的选项，再用同一组条件比较收益、成本、责任和退出难度。";
    case "past":
      return isHant
        ? "把它當成觀察今生重複習慣的線索，不當成真實歷史證明；只保留能和現實經歷互相印證的部分。"
        : "把它当成观察今生重复习惯的线索，不当成真实历史证明；只保留能和现实经历互相印证的部分。";
    default: {
      const highLoad = chart.strength.tendency.includes("旺");
      if (isHant) return highLoad
        ? "你現在更需要減少同時承擔的事情，把一個主要目標做完，再決定是否擴張。"
        : "你現在更需要保護精力，把事情排出先後，只保留一個最重要的下一步。";
      return highLoad
        ? "你现在更需要减少同时承担的事情，把一个主要目标做完，再决定是否扩张。"
        : "你现在更需要保护精力，把事情排出先后，只保留一个最重要的下一步。";
    }
  }
}

export function buildFreeDirectAnswer(
  question: string,
  chart: Chart,
  reading: Reading,
  locale: AppLocale,
): string {
  if (isCosmicSymbolicQuestion(question)) {
    return locale === "en"
      ? "Treat this as a symbolic way to notice how you handle pressure and make choices, not as proof of a literal origin. Keep only what matches repeated patterns in your real life."
      : locale === "zh-Hant"
        ? "把這份結果當成觀察自己如何承受壓力、如何做選擇的象徵線索，不當成真實來源證明；只保留能和現實反覆印證的部分。"
        : "把这份结果当成观察自己如何承受压力、如何做选择的象征线索，不当成真实来源证明；只保留能和现实反复印证的部分。";
  }
  if (locale === "en") return englishDirectAnswer(question, chart, englishQuestionKind(question, reading.kind));
  return chineseDirectAnswer(question, chart, reading, locale);
}

function buildEnglishReading(question: string, chart: Chart, source: Reading): Reading {
  const kind = englishQuestionKind(question, source.kind);
  const currentPhase = chart.currentDayun
    ? `Your current ten-year cycle is ${englishGanZhi(chart.currentDayun.ganZhi)} (${chart.currentDayun.startYear}–${chart.currentDayun.endYear}). Treat it as a pacing lens rather than a promise.`
    : "No reliable current ten-year cycle is available, so timing claims should remain provisional.";
  const primaryElement = chart.useful[0] ?? chart.dayMasterElement;
  const colorByElement: Record<string, string> = {
    木: "forest green", 火: "vermilion", 土: "ochre", 金: "soft white", 水: "deep navy",
  };
  const directionByElement: Record<string, string> = {
    木: "east", 火: "south", 土: "centre", 金: "west", 水: "north",
  };

  return {
    ...source,
    kind,
    directAnswer: englishDirectAnswer(question, chart, kind),
    rhythm: `${currentPhase} Keep fewer commitments active at once, protect recovery time, and review progress at a fixed weekly interval.`,
    work: "The useful work pattern is focused ownership, visible output, and a finishable scope. Favor roles where priorities and decision rights are explicit.",
    love: "Judge the relationship through reciprocity, actual time together, explicit commitment, and respected boundaries—not through explanation alone.",
    money: "Protect cash flow first. Define risk capacity, time horizon, and exit conditions before treating possible return as a decision.",
    body: "Use workload, sleep, and recovery as the practical signals. Persistent or worsening symptoms require qualified medical assessment.",
    home: "Treat light, noise, commute, layout, budget, and direct experience of the space as the decisive evidence.",
    action: englishAction(kind),
    decree: `Your chart is anchored by ${englishStem(chart.dayMaster)} as a ${ELEMENT_EN[chart.dayMasterElement] ?? "five-element"} Day Master under ${englishBranch(chart.monthBranch)} as Month Command. Its practical instruction is to preserve clear judgment while giving each important choice an exit, a boundary, and a review point. Move when the evidence is ready; stop when the load exceeds the purpose.`,
    lastLine: "Use this reading as a decision lens, then verify it against real conditions.",
    guide: {
      colors: [colorByElement[primaryElement] ?? "natural neutral tones"],
      avoidColors: ["over-saturated combinations that add visual load"],
      directions: {
        favor: [directionByElement[primaryElement] ?? "the most practical direction"],
        rest: ["the quietest available space"],
      },
      hours: {
        favor: ["your clearest two-hour focus block"],
        drain: ["late hours that reduce next-day recovery"],
      },
      pet: "Choose by space, schedule, health, and care capacity—not by chart symbolism alone.",
    },
  };
}

function dayBranch(chart: Chart): string {
  return chart.pillars.find((p) => p.key === "day")?.zhi || "—";
}

function readyPillars(chart: Chart): string {
  return chart.pillars
    .filter((col) => col.ready !== false && col.ganZhi !== "未定" && Boolean(col.gan))
    .map((col) => `${col.label}${col.ganZhi}`)
    .join("、");
}

function strengthLine(chart: Chart): string {
  const facts = [
    chart.strength.deLing ? "得令" : "不得令",
    chart.strength.deDi ? "得地" : "不得地",
    chart.strength.deShi ? "得势" : "不得势",
  ].join("、");
  return `旺衰表现为${chart.strength.tendency}（${facts}）。`;
}

function climateLine(chart: Chart): string {
  const zhi = chart.monthBranch;
  if (["亥", "子", "丑"].includes(zhi)) return "月令偏寒，先看能否把火气与出口接上，而不是继续把事闷在夜里。";
  if (["巳", "午", "未"].includes(zhi)) return "月令偏热，先看能否降温、收束，避免把每个机会都烧成过载。";
  if (["寅", "卯", "辰"].includes(zhi)) return "月令偏生发，适合把判断做成可交付的形状，而不是只停留在起势。";
  if (["申", "酉", "戌"].includes(zhi)) return "月令偏收敛，适合把边界与标准立清楚，避免为了完整而拖到过季。";
  return "调候先跟月令走，不另造一套与原局无关的寒暖故事。";
}

function flowLine(chart: Chart): string {
  if (!chart.usefulProvisional && chart.useful.length) {
    return `已成立的流通重点落在${chart.useful.join("、")}，需要避免让${chart.drain.join("、") || "耗泄端"}继续失衡。`;
  }
  if (chart.useful.length) {
    return `目前只确认到流通候选${chart.useful.join("、")}，尚不足以把它写成正式喜用神或病药定论。`;
  }
  return "目前不强行指定喜用神与病药通关，先以月令、旺衰与现实节奏作为落点。";
}

function relationLine(chart: Chart): string {
  const pillars = readyPillars(chart);
  if (!pillars) return "干支关系只按已排定的柱位理解，不补未确认的刑冲合害链。";
  return `已排定的干支为${pillars}；在完整刑冲合害库接入前，不把未计算的合冲刑害写成主判。`;
}

/** One final customer-facing Reading used by UI, persistence and reports. */
export function finalizeReading(
  question: string,
  chart: Chart,
  raw: Reading,
  locale: AppLocale = "zh-Hans",
): Reading {
  const contracted = applyAnswerContract(question, chart, raw);
  const reading = applyCustomerAnswerHotfix(question, chart, contracted);
  if (isCosmicSymbolicQuestion(question)) return applyCosmicSymbolicReading(question, chart, reading, locale);
  if (locale === "en") return buildEnglishReading(question, chart, reading);

  const dayZhi = dayBranch(chart);
  const dayun = chart.currentDayun
    ? `你现在行${chart.currentDayun.ganZhi}大运（${chart.currentDayun.startYear}–${chart.currentDayun.endYear}），所以命诰不能只讲原局，也要把当前阶段的承载方式算进去。`
    : "当前大运没有可靠结果时，不把未确认的岁运硬写进命诰。";

  const decree = [
    `命以${chart.dayMaster}${chart.dayMasterElement}为主，在${chart.monthBranch}月令中成形；日支${dayZhi}是你真正落到日常关系与选择里的位置。`,
    strengthLine(chart),
    climateLine(chart),
    relationLine(chart),
    flowLine(chart),
    dayun,
    `因此你的命诰不是“硬撑到底”，而是：保留${chart.dayMaster}${chart.dayMasterElement}的判断力，同时让重要选择有出口、有边界、能复盘；该收时收、该动时动，不用同一种方法扛所有阶段。`,
  ].join(" ");

  return { ...reading, decree };
}
