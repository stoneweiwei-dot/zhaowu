import { analyzeStructure } from "@/lib/bazi/structure";
import type { AppLocale, Chart, Reading } from "@/lib/bazi/types";

const STRUCTURE_RE = /(格局|成格|破格|格局大小|pattern|structure)/i;
const STRENGTH_RE = /(身強|身强|身弱|旺衰|日主.{0,8}(強|强|弱)|strong|weak|strength)/i;
const USEFUL_RE = /(用神|喜用|取用|useful god|favourable element|favorable element)/i;
const REMEDY_RE = /(病藥|病药|藥神|药神|主病|病在哪|remedy|structural disease)/i;
const D60_RE = /(D60|六十分盤|六十分盘|沙斯提安沙|shashtiamsa)/i;
const ZIWEI_RE = /(紫微|紫微斗數|紫微斗数|zi\s*wei)/i;
const UNKNOWN_TIME_RE = /(不知道.{0,8}(時辰|时辰|出生時間|出生时间)|時辰.{0,8}(不知|未知|不確定|不确定)|时辰.{0,8}(不知|未知|不确定)|unknown.{0,8}(birth\s*time|time of birth))/i;
const DECISION_RE = /(值不值得|要不要|該不該|该不该|能不能|有沒有必要|有没有必要|是否值得|是否應該|是否应该|繼續.{0,8}[嗎吗]|继续.{0,8}[嗎吗]|should\s+i|worth\s+(?:staying|continuing)|keep\s+(?:doing|working|seeing))/i;

function isEnglish(locale?: AppLocale) {
  return locale === "en";
}

function isHans(locale?: AppLocale) {
  return locale === "zh-Hans";
}

function zh(locale: AppLocale | undefined, hant: string, hans: string, en: string) {
  if (isEnglish(locale)) return en;
  return isHans(locale) ? hans : hant;
}

function guardStructure(chart: Chart, locale?: AppLocale): string {
  const structure = analyzeStructure(chart);
  const suffix = structure.established ? "" : zh(locale, "方向", "方向", " direction");
  return zh(
    locale,
    `直接回答：目前主格判為「${structure.label}${suffix}」，結構完成度為「${structure.completion.label}」。這裡的格局大小只指結構完成度與容量，不代表人的等級、財富或社會地位。`,
    `直接回答：目前主格判为「${structure.label}${suffix}」，结构完成度为「${structure.completion.label}」。这里的格局大小只指结构完成度与容量，不代表人的等级、财富或社会地位。`,
    `Direct answer: the current primary structure is ${structure.label}${suffix}, with completion assessed as ${structure.completion.label}. This describes structural completion and capacity, not human worth, guaranteed wealth, or social rank.`,
  );
}

function guardStrength(chart: Chart, locale?: AppLocale): string {
  return zh(
    locale,
    `直接回答：目前日主承載判為「${chart.strength.tendency}」。判斷依據必須回到月令、根氣、透藏與制化，不以五行數量或百分比代替旺衰。${chart.strength.summary}`,
    `直接回答：目前日主承载判为「${chart.strength.tendency}」。判断依据必须回到月令、根气、透藏与制化，不以五行数量或百分比代替旺衰。${chart.strength.summary}`,
    `Direct answer: the current day-master capacity is assessed as ${chart.strength.tendency}. This must be based on season, roots, exposure and control/flow rather than raw five-element counts or percentages. ${chart.strength.summary}`,
  );
}

function guardUseful(chart: Chart, locale?: AppLocale): string {
  const candidates = chart.useful.length ? chart.useful.join("、") : zh(locale, "尚無", "尚无", "none confirmed");
  if (chart.usefulProvisional) {
    return zh(
      locale,
      `直接回答：目前「正式取用未定」。現階段只有流通／調候候選「${candidates}」，不能把它直接升格成確定用神，更不能用「缺什麼補什麼」代替病藥、格局與承載判斷。`,
      `直接回答：目前「正式取用未定」。现阶段只有流通／调候候选「${candidates}」，不能把它直接升格成确定用神，更不能用“缺什么补什么”代替病药、格局与承载判断。`,
      `Direct answer: the formal useful-function judgement is not yet established. Current flow/climate candidates are ${candidates}; they must not be promoted to a confirmed useful god without the full structure, remedy and capacity chain.`,
    );
  }
  return zh(
    locale,
    `直接回答：目前可用候選為「${candidates}」。它仍需放回格局核心、病藥、調候、流通與承載的同一條作用鏈檢查；不以五行缺項直接定用神。`,
    `直接回答：目前可用候选为「${candidates}」。它仍需放回格局核心、病药、调候、流通与承载的同一条作用链检查；不以五行缺项直接定用神。`,
    `Direct answer: the current usable candidates are ${candidates}. They still need to survive the same structure, remedy, climate, flow and capacity chain; missing-element counting is not a valid substitute.`,
  );
}

function guardRemedy(chart: Chart, locale?: AppLocale): string {
  const structure = analyzeStructure(chart);
  return zh(
    locale,
    `直接回答：目前主病為「${structure.remedy.disease}」；對治方向為「${structure.remedy.medicine}」。這是病藥功能判斷，不等同於單貼一個五行標籤；若作用鏈條件不足，就維持條件性結論。`,
    `直接回答：目前主病为「${structure.remedy.disease}」；对治方向为「${structure.remedy.medicine}」。这是病药功能判断，不等同于单贴一个五行标签；若作用链条件不足，就维持条件性结论。`,
    `Direct answer: the current structural problem is “${structure.remedy.disease}”, with the remedy direction “${structure.remedy.medicine}”. This is a functional remedy judgement, not a one-element label, and remains conditional when the action chain is incomplete.`,
  );
}

function guardD60(chart: Chart, locale?: AppLocale): string {
  if (chart.timeUnknown) {
    return zh(
      locale,
      "直接回答：不能。出生時辰未確定，D60 對時間精度高度敏感，本題【不作判定】。D60 只能作旁證，不能反過來改寫子平主判。",
      "直接回答：不能。出生时辰未确定，D60 对时间精度高度敏感，本题【不作判定】。D60 只能作旁证，不能反过来改写子平主判。",
      "Direct answer: no. With an unknown birth time, D60 is too time-sensitive to judge reliably, so no D60 determination is made. It may only corroborate, never override, the Ziping primary judgement.",
    );
  }
  return zh(
    locale,
    "直接回答：可以作旁證，但不能作主判。只有出生時間可靠到足以通過 D60 時間閘門時才執行；D60 的結果只能補充／印證／細化，不能改寫子平結論。",
    "直接回答：可以作旁证，但不能作主判。只有出生时间可靠到足以通过 D60 时间闸门时才执行；D60 的结果只能补充／印证／细化，不能改写子平结论。",
    "Direct answer: yes, but only as corroboration. D60 should run only when birth-time precision passes its timing gate, and it may supplement, corroborate or refine rather than override the Ziping conclusion.",
  );
}

function guardZiwei(chart: Chart, locale?: AppLocale): string {
  if (chart.timeUnknown) {
    return zh(
      locale,
      "直接回答：目前不能用紫微做可靠驗證。時辰未確定時，紫微【不作判定】；子平可判的部分仍照子平主鏈處理。",
      "直接回答：目前不能用紫微做可靠验证。时辰未确定时，紫微【不作判定】；子平可判的部分仍照子平主链处理。",
      "Direct answer: not reliably at present. With an unknown birth time, Zi Wei should not be judged; the portions that remain valid under Ziping can still be analysed there.",
    );
  }
  return zh(
    locale,
    "直接回答：可以，但紫微只做獨立的現象／場景驗證，不與子平平權混算，也不能因紫微出現不同訊號就直接改寫子平主判。",
    "直接回答：可以，但紫微只做独立的现象／场景验证，不与子平平权混算，也不能因紫微出现不同信号就直接改写子平主判。",
    "Direct answer: yes, but Zi Wei is an independent scene/phenomenon validation layer. It is not co-equal with Ziping and cannot directly overwrite the primary Ziping judgement.",
  );
}

function guardUnknownTime(chart: Chart, locale?: AppLocale): string {
  const unknown = chart.timeUnknown;
  return zh(
    locale,
    unknown
      ? "直接回答：可以判一部分，但不能假裝完整。月令、日主、已確定三柱與不依賴時柱的主結構可以先判；凡直接依賴時柱或精確出生時刻的模組一律降級或【不作判定】。"
      : "直接回答：可以。現在已有出生時辰，因此先按已確認資料判；若時辰可靠性之後被推翻，所有直接依賴時柱或精確時刻的結論都必須同步降級。",
    unknown
      ? "直接回答：可以判一部分，但不能假装完整。月令、日主、已确定三柱与不依赖时柱的主结构可以先判；凡直接依赖时柱或精确出生时刻的模块一律降级或【不作判定】。"
      : "直接回答：可以。现在已有出生时辰，因此先按已确认资料判；若时辰可靠性之后被推翻，所有直接依赖时柱或精确时刻的结论都必须同步降级。",
    unknown
      ? "Direct answer: partly. The confirmed pillars and structures that do not depend on the hour can still be judged, while hour-dependent or precision-time modules must be downgraded or left undetermined."
      : "Direct answer: yes. A birth time is currently available; if its reliability is later overturned, every hour- or precision-time-dependent conclusion must be downgraded as well.",
  );
}

function guardDecision(question: string, chart: Chart, reading: Reading, locale?: AppLocale): string | null {
  if (!DECISION_RE.test(question)) return null;
  const strong = chart.strength.tendency.includes("旺") || chart.strength.tendency.includes("強") || chart.strength.tendency.includes("强");

  if (reading.kind === "career") {
    return zh(
      locale,
      `直接回答：目前不能可靠地把這份工作直接判成「值得繼續」或「不值得繼續」，因為命盤沒有包含這份工作的收入、責任、資源支持與退出成本。就命盤承載方向看，${strong ? "如果現職能讓你有自主輸出、成果可衡量，而且無效負荷可控，才偏向續留；若長期壓住輸出又增加負荷，偏向離開。" : "如果現職能提供穩定資源、清楚規則和可持續支持，才偏向續留；若長期資源不足又要求高負荷承擔，偏向離開。"}`,
      `直接回答：目前不能可靠地把这份工作直接判成“值得继续”或“不值得继续”，因为命盘没有包含这份工作的收入、责任、资源支持与退出成本。就命盘承载方向看，${strong ? "如果现职能让你有自主输出、成果可衡量，而且无效负荷可控，才偏向续留；若长期压住输出又增加负荷，偏向离开。" : "如果现职能提供稳定资源、清楚规则和可持续支持，才偏向续留；若长期资源不足又要求高负荷承担，偏向离开。"}`,
      `Direct answer: the chart alone cannot reliably label this job “worth staying in” or “not worth staying in” because the actual pay, responsibility, support and exit cost are not part of the chart. ${strong ? "Stay only if the role gives enough autonomy, measurable output and manageable wasted load; otherwise the direction leans toward leaving." : "Stay only if the role provides stable resources, clear rules and sustainable support; otherwise the direction leans toward leaving."}`,
    );
  }

  if (reading.kind === "love") {
    return zh(
      locale,
      "直接回答：不能只憑命盤判這段關係「值得繼續」或「不值得繼續」。先看三件可驗證的事：聯繫是否持續、投入是否對等、是否願意說清下一步；三項中若長期缺兩項，偏向不要再加碼，若多數穩定成立才偏向繼續。",
      "直接回答：不能只凭命盘判这段关系“值得继续”或“不值得继续”。先看三件可验证的事：联系是否持续、投入是否对等、是否愿意说清下一步；三项中若长期缺两项，偏向不要再加码，若多数稳定成立才偏向继续。",
      "Direct answer: the chart alone cannot decide whether this relationship is worth continuing. Check three observable facts: consistent contact, reciprocal effort, and willingness to define the next step. If two stay absent, lean toward stopping further investment; if most remain stable, continuing is more defensible.",
    );
  }

  if (reading.kind === "money") {
    return zh(
      locale,
      "直接回答：不能只憑命盤判某個財務決定「值得」或「不值得」。至少要有實際收益、最大損失、期限、現金流與退出條件；缺這些資料時【不作投資選擇判定】。",
      "直接回答：不能只凭命盘判某个财务决定“值得”或“不值得”。至少要有实际收益、最大损失、期限、现金流与退出条件；缺这些资料时【不作投资选择判定】。",
      "Direct answer: the chart alone cannot decide whether a financial decision is worth taking. Expected return, maximum loss, time horizon, cash flow and exit conditions are required; without them, no investment-choice determination is made.",
    );
  }

  return null;
}

export function enforceDirectAnswerGuard(
  question: string,
  chart: Chart,
  reading: Reading,
  locale?: AppLocale,
): Reading {
  let directAnswer: string | null = null;
  if (D60_RE.test(question)) directAnswer = guardD60(chart, locale);
  else if (ZIWEI_RE.test(question)) directAnswer = guardZiwei(chart, locale);
  else if (UNKNOWN_TIME_RE.test(question)) directAnswer = guardUnknownTime(chart, locale);
  else if (STRUCTURE_RE.test(question)) directAnswer = guardStructure(chart, locale);
  else if (STRENGTH_RE.test(question)) directAnswer = guardStrength(chart, locale);
  else if (REMEDY_RE.test(question)) directAnswer = guardRemedy(chart, locale);
  else if (USEFUL_RE.test(question)) directAnswer = guardUseful(chart, locale);
  else directAnswer = guardDecision(question, chart, reading, locale);

  return directAnswer ? { ...reading, directAnswer } : reading;
}
