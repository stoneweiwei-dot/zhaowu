import { analyzeStructure } from "@/lib/bazi/structure";
import type { AppLocale, Chart } from "@/lib/bazi/types";

export type FiveElement = "wood" | "fire" | "earth" | "metal" | "water";
export type FunctionalElementState =
  | "beneficial_but_insufficient"
  | "beneficial_but_blocked"
  | "already_sufficient"
  | "overactive"
  | "apparently_missing_but_not_to_add"
  | "needs_mother_qi_or_bridging";
export type AnalysisConfidence = "confirmed" | "provisional" | "insufficient_data";

export type FunctionalTrainingResult = {
  version: "ZW-FIVE-ELEMENT-FUNCTION-1.0";
  locale: AppLocale;
  analysisStatus: AnalysisConfidence;
  selectedElement: FiveElement | null;
  selectedState: FunctionalElementState | null;
  functionalTheme: string;
  whySelected: string;
  howToUse: string[];
  observationMarker: string;
  observationWindow: { minDays: number; maxDays: number };
  excessWarning: string;
  supportingElement?: FiveElement | null;
  balancingElement?: FiveElement | null;
  freeTextSummary: string;
  evidence: {
    monthCommand?: string;
    climate?: string;
    dayMasterCapacity?: string;
    structuralIssue?: string;
    rootAndStem?: string;
    interactions?: string[];
    circulation?: string;
    luckCycle?: string;
    annualTrigger?: string;
  };
  warnings: string[];
};

type ElementCopy = {
  name: string;
  keywords: string[];
  shortTheme: string;
  excess: string;
  actions: string[];
  observation: string;
};

export const FIVE_ELEMENT_FUNCTIONS: Record<FiveElement, Record<AppLocale, ElementCopy>> = {
  wood: {
    "zh-Hant": { name: "木", keywords: ["生發", "規劃", "條達", "成長", "疏通"], shortTheme: "生長與方向", excess: "木用過頭，容易變成同時開太多方向、硬衝，或急著成長而忽略現實承載。", actions: ["只選一個接下來四週真正要推進的方向。", "把模糊目標拆成下一個可開始的小步驟。", "每天留一段步行、伸展或整理思路的時間。", "遇到卡點時先說清需求，不用一次打開更多新項目。"], observation: "一至四週內，方向是否更清楚、卡住的事項是否開始向前，而且沒有同時新增更多未完成項目。" },
    "zh-Hans": { name: "木", keywords: ["生发", "规划", "条达", "成长", "疏通"], shortTheme: "生长与方向", excess: "木用过头，容易变成同时开太多方向、硬冲，或急着成长而忽略现实承载。", actions: ["只选一个接下来四周真正要推进的方向。", "把模糊目标拆成下一个可开始的小步骤。", "每天留一段步行、伸展或整理思路的时间。", "遇到卡点时先说清需求，不用一次打开更多新项目。"], observation: "一至四周内，方向是否更清楚、卡住的事项是否开始向前，而且没有同时新增更多未完成项目。" },
    en: { name: "Wood", keywords: ["growth", "direction", "planning", "flexibility", "unblocking"], shortTheme: "Growth and direction", excess: "Too much Wood can become scattered expansion, forced progress or too many directions at once.", actions: ["Choose one direction that genuinely matters for the next four weeks.", "Turn a vague goal into the next small action you can actually start.", "Keep a short daily block for walking, stretching or sorting your thoughts.", "When something is stuck, state the need clearly instead of opening another project."], observation: "Over the next one to four weeks, check whether your direction is clearer and stuck work is moving without creating a larger pile of unfinished projects." },
  },
  fire: {
    "zh-Hant": { name: "火", keywords: ["啟動", "表達", "顯化", "溫度", "影響力"], shortTheme: "表達與啟動", excess: "火用過頭，容易變成躁進、過度曝光、情緒過熱或只顧速度不顧承載。", actions: ["把已經準備好的成果公開一次，不再無限延後。", "每天完成一個明確的啟動動作，例如聯絡、提交或展示。", "用短而清楚的方式說出立場與需求。", "把行動量控制在可持續範圍，不用靠情緒衝刺。"], observation: "一至四週內，是否更容易開始、表達和交付，同時睡眠、情緒與日程沒有因過度加速而變亂。" },
    "zh-Hans": { name: "火", keywords: ["启动", "表达", "显化", "温度", "影响力"], shortTheme: "表达与启动", excess: "火用过头，容易变成躁进、过度曝光、情绪过热或只顾速度不顾承载。", actions: ["把已经准备好的成果公开一次，不再无限延后。", "每天完成一个明确的启动动作，例如联络、提交或展示。", "用短而清楚的方式说出立场与需求。", "把行动量控制在可持续范围，不用靠情绪冲刺。"], observation: "一至四周内，是否更容易开始、表达和交付，同时睡眠、情绪与日程没有因过度加速而变乱。" },
    en: { name: "Fire", keywords: ["activation", "expression", "visibility", "warmth", "influence"], shortTheme: "Expression and activation", excess: "Too much Fire can become overexposure, impulsive action, emotional overheating or constant urgency.", actions: ["Publish or show one piece of work that is already ready enough.", "Complete one clear activation step each day: contact, submit, present or begin.", "State your position and needs briefly and clearly.", "Keep the pace sustainable rather than relying on bursts of urgency."], observation: "Over one to four weeks, check whether starting, expressing and delivering becomes easier without your sleep, mood or schedule becoming more chaotic." },
  },
  earth: {
    "zh-Hant": { name: "土", keywords: ["承載", "穩定", "落地", "轉化", "完成"], shortTheme: "承載與落地", excess: "土用過頭，容易變成停滯、包袱太多、過度穩定或什麼都自己扛。", actions: ["固定一個每天都能維持的作息錨點。", "把手上的事項分成必做、可延後、應停止三組。", "每天先收尾一件已開始的事，再新增任務。", "把金錢、時間或工作流程整理成看得見的簡單系統。"], observation: "一至四週內，是否更容易完成事情、日程更穩、未完成項目減少，而且負擔沒有繼續向自己身上堆。" },
    "zh-Hans": { name: "土", keywords: ["承载", "稳定", "落地", "转化", "完成"], shortTheme: "承载与落地", excess: "土用过头，容易变成停滞、包袱太多、过度稳定或什么都自己扛。", actions: ["固定一个每天都能维持的作息锚点。", "把手上的事项分成必做、可延后、应停止三组。", "每天先收尾一件已开始的事，再新增任务。", "把金钱、时间或工作流程整理成看得见的简单系统。"], observation: "一至四周内，是否更容易完成事情、日程更稳、未完成项目减少，而且负担没有继续向自己身上堆。" },
    en: { name: "Earth", keywords: ["stability", "capacity", "implementation", "integration", "completion"], shortTheme: "Stability and implementation", excess: "Too much Earth can become stagnation, excessive responsibility or staying with something only because it feels safe.", actions: ["Set one daily routine anchor you can realistically keep.", "Sort current commitments into must do, can wait and should stop.", "Finish one thing already in progress before adding another task.", "Put money, time or work steps into one simple visible system."], observation: "Over one to four weeks, check whether completion is easier, your schedule is steadier and unfinished work is shrinking without more responsibility piling onto you." },
  },
  metal: {
    "zh-Hant": { name: "金", keywords: ["結構", "取捨", "邊界", "收斂", "標準"], shortTheme: "邊界與結構", excess: "金用過頭，容易變成過度苛刻、僵硬、切割太快或用標準壓死彈性。", actions: ["刪掉一項已經證明無效或重複的安排。", "為一件反覆消耗你的事寫出清楚邊界。", "把文件、工作或資訊按一套簡單標準分類。", "做選擇時先定三個必要條件，不讓枝節一直擴張。"], observation: "一至四週內，是否更容易拒絕無效消耗、做出取捨，並把注意力留給真正重要的事。" },
    "zh-Hans": { name: "金", keywords: ["结构", "取舍", "边界", "收敛", "标准"], shortTheme: "边界与结构", excess: "金用过头，容易变成过度苛刻、僵硬、切割太快或用标准压死弹性。", actions: ["删掉一项已经证明无效或重复的安排。", "为一件反复消耗你的事写出清楚边界。", "把文件、工作或信息按一套简单标准分类。", "做选择时先定三个必要条件，不让枝节一直扩张。"], observation: "一至四周内，是否更容易拒绝无效消耗、做出取舍，并把注意力留给真正重要的事。" },
    en: { name: "Metal", keywords: ["structure", "selection", "boundaries", "refinement", "standards"], shortTheme: "Structure and boundaries", excess: "Too much Metal can become rigid standards, premature cutting-off or excessive control.", actions: ["Remove one commitment that has already proved redundant or ineffective.", "Write a clear boundary for one situation that repeatedly drains you.", "Use one simple system to organise files, work or information.", "Before choosing, define three non-negotiable criteria so side issues stop expanding."], observation: "Over one to four weeks, check whether it is easier to refuse unhelpful drain, make decisions and keep your attention for what actually matters." },
  },
  water: {
    "zh-Hant": { name: "水", keywords: ["儲備", "觀察", "流動", "恢復", "深思"], shortTheme: "恢復與觀察", excess: "水用過頭，容易變成拖延、退縮、一直分析卻遲遲不行動。", actions: ["先把睡眠與真正的休息留出固定位置。", "重大決定前安排一段不輸入新資訊的留白。", "把研究與資料收集設一個截止時間，之後就做決定。", "用低負荷活動恢復，而不是把休息變成另一項任務。"], observation: "一至四週內，是否恢復得更快、決策更穩，而且休息沒有演變成長期拖延或退縮。" },
    "zh-Hans": { name: "水", keywords: ["储备", "观察", "流动", "恢复", "深思"], shortTheme: "恢复与观察", excess: "水用过头，容易变成拖延、退缩、一直分析却迟迟不行动。", actions: ["先把睡眠与真正的休息留出固定位置。", "重大决定前安排一段不输入新信息的留白。", "把研究与资料收集设一个截止时间，之后就做决定。", "用低负荷活动恢复，而不是把休息变成另一项任务。"], observation: "一至四周内，是否恢复得更快、决策更稳，而且休息没有演变成长久拖延或退缩。" },
    en: { name: "Water", keywords: ["recovery", "observation", "adaptability", "reserves", "reflection"], shortTheme: "Recovery and observation", excess: "Too much Water can become withdrawal, delay or endless analysis without action.", actions: ["Protect a regular place for sleep and genuine rest first.", "Before a major decision, leave a short period with no new information coming in.", "Give research a deadline, then make the decision with what you have.", "Use low-load recovery rather than turning rest into another performance task."], observation: "Over one to four weeks, check whether you recover faster and decide more steadily without rest turning into prolonged delay or withdrawal." },
  },
};

export const ELEMENT_STATE_RULES: Record<FunctionalElementState, { allowTraining: boolean; action: string }> = {
  beneficial_but_insufficient: { allowTraining: true, action: "strengthen_function" },
  beneficial_but_blocked: { allowTraining: true, action: "clear_blockage_then_train" },
  already_sufficient: { allowTraining: false, action: "maintain" },
  overactive: { allowTraining: false, action: "drain_or_balance" },
  apparently_missing_but_not_to_add: { allowTraining: false, action: "do_not_supplement" },
  needs_mother_qi_or_bridging: { allowTraining: false, action: "support_or_bridge_first" },
};

export function mayActivelyTrainElement(state: FunctionalElementState): boolean {
  return ELEMENT_STATE_RULES[state].allowTraining;
}

function stateLabel(state: FunctionalElementState | null, locale: AppLocale): string {
  if (!state) return locale === "en" ? "Not assigned" : locale === "zh-Hant" ? "暫不指定" : "暂不指定";
  const labels: Record<FunctionalElementState, Record<AppLocale, string>> = {
    beneficial_but_insufficient: { "zh-Hant": "有利但不足", "zh-Hans": "有利但不足", en: "Useful but under-developed" },
    beneficial_but_blocked: { "zh-Hant": "有利但受阻", "zh-Hans": "有利但受阻", en: "Useful but blocked" },
    already_sufficient: { "zh-Hant": "已足夠，維持即可", "zh-Hans": "已足够，维持即可", en: "Already sufficient" },
    overactive: { "zh-Hant": "過度，不再加碼", "zh-Hans": "过度，不再加码", en: "Overactive — do not add more" },
    apparently_missing_but_not_to_add: { "zh-Hant": "表面少，但不宜補", "zh-Hans": "表面少，但不宜补", en: "Looks sparse but should not be added" },
    needs_mother_qi_or_bridging: { "zh-Hant": "先建支持／通關條件", "zh-Hans": "先建支持／通关条件", en: "Support or bridging first" },
  };
  return labels[state][locale];
}

export function functionalStateLabel(state: FunctionalElementState | null, locale: AppLocale): string {
  return stateLabel(state, locale);
}

function selectedNeed(disease: string): { element: FiveElement; supporting: FiveElement; balancing: FiveElement } | null {
  if (/官殺壓身|官杀压身|承載不足|承载不足|財星耗身|财星耗身/.test(disease)) {
    return { element: "earth", supporting: "water", balancing: "metal" };
  }
  if (/食傷洩身|食伤泄身/.test(disease)) {
    return { element: "metal", supporting: "water", balancing: "earth" };
  }
  if (/印比偏聚|壅滯|壅滞/.test(disease)) {
    return { element: "wood", supporting: "fire", balancing: "metal" };
  }
  if (/七殺|七杀|官殺|官杀/.test(disease)) {
    return { element: "metal", supporting: "earth", balancing: "water" };
  }
  return null;
}

function confidenceOf(chart: Chart, structure: ReturnType<typeof analyzeStructure>): AnalysisConfidence {
  if (structure.remedy.status === "insufficient") return "insufficient_data";
  if (chart.usefulProvisional || chart.timeUnknown || structure.completion.grade === "G1" || structure.completion.grade === "G2" || structure.remedy.status === "provisional") return "provisional";
  return "confirmed";
}

function stateOf(chart: Chart, structure: ReturnType<typeof analyzeStructure>, confidence: AnalysisConfidence): FunctionalElementState | null {
  if (confidence === "insufficient_data") return null;
  if (structure.remedy.status === "provisional" && !structure.remedy.bridge) return "needs_mother_qi_or_bridging";
  if (confidence === "provisional") return "beneficial_but_blocked";
  return "beneficial_but_insufficient";
}

function whyFor(element: FiveElement, locale: AppLocale, state: FunctionalElementState, issue: string): string {
  const blocked = state === "beneficial_but_blocked" || state === "needs_mother_qi_or_bridging";
  const zhHant: Record<FiveElement, string> = {
    wood: "目前較需要的是把壅住的方向重新疏通，只留一條能持續生長的主線。",
    fire: "目前較需要把已經具備的內容真正啟動、表達並交付，而不是繼續停在準備階段。",
    earth: "目前結構更需要承載與落地：先把負荷、作息與未完成事項穩住，才有空間接住後續變化。",
    metal: "目前更需要邊界、取捨與結構，先減少無效消耗，再讓真正重要的事情集中。",
    water: "目前更需要恢復、觀察與儲備，先降低長期消耗，再決定下一步。",
  };
  const zhHans: Record<FiveElement, string> = {
    wood: "目前较需要的是把壅住的方向重新疏通，只留一条能持续生长的主线。",
    fire: "目前较需要把已经具备的内容真正启动、表达并交付，而不是继续停在准备阶段。",
    earth: "目前结构更需要承载与落地：先把负荷、作息与未完成事项稳住，才有空间接住后续变化。",
    metal: "目前更需要边界、取舍与结构，先减少无效消耗，再让真正重要的事情集中。",
    water: "目前更需要恢复、观察与储备，先降低长期消耗，再决定下一步。",
  };
  const en: Record<FiveElement, string> = {
    wood: "The current pattern calls for clearing a stuck direction and keeping one line of growth that can actually continue.",
    fire: "The current pattern calls for starting, expressing and delivering what is already there instead of remaining in preparation mode.",
    earth: "The current pattern needs more practical capacity and follow-through: stabilise load, routine and unfinished work before taking on more.",
    metal: "The current pattern needs clearer boundaries, selection and structure so unnecessary drain is reduced and attention can concentrate.",
    water: "The current pattern needs recovery, observation and reserves before the next decision is pushed forward.",
  };
  const base = locale === "en" ? en[element] : locale === "zh-Hant" ? zhHant[element] : zhHans[element];
  if (!blocked) return base;
  if (locale === "en") return `${base} The upstream structure is not fully settled, so treat this as a low-intensity working direction, not a fixed favourable-element verdict.`;
  return `${base}${locale === "zh-Hant" ? "上游結構仍有待覆核，因此只作低強度功能訓練，不把它寫成確定喜用神。" : "上游结构仍有待覆核，因此只作低强度功能训练，不把它写成确定喜用神。"}`;
}

function noSelectionCopy(locale: AppLocale): Pick<FunctionalTrainingResult, "functionalTheme" | "whySelected" | "observationMarker" | "excessWarning" | "freeTextSummary"> {
  if (locale === "en") return {
    functionalTheme: "Hold the prescription",
    whySelected: "The current structured evidence is not strong enough to name one main function without inventing certainty.",
    observationMarker: "Wait for a clearer structural or timing trigger rather than adding a five-element remedy because one element looks sparse.",
    excessWarning: "Do not turn element counts, colours or apparent absence into a self-prescribed remedy.",
    freeTextSummary: "No main training element is assigned yet. This is a deliberate fail-closed result, not a missing report.",
  };
  if (locale === "zh-Hant") return {
    functionalTheme: "先不硬指定",
    whySelected: "目前結構證據還不足以可靠指定一個主訓練功能，繼續硬選只會製造假確定。",
    observationMarker: "先等更清楚的結構或歲運觸發，不因某個五行表面偏少就自行加碼。",
    excessWarning: "不要把五行數量、顏色或表面缺失直接當成補法。",
    freeTextSummary: "本次暫不指定主訓練元素；這是刻意保留不確定性，不是報告漏算。",
  };
  return {
    functionalTheme: "先不硬指定",
    whySelected: "目前结构证据还不足以可靠指定一个主训练功能，继续硬选只会制造假确定。",
    observationMarker: "先等更清楚的结构或岁运触发，不因某个五行表面偏少就自行加码。",
    excessWarning: "不要把五行数量、颜色或表面缺失直接当成补法。",
    freeTextSummary: "本次暂不指定主训练元素；这是刻意保留不确定性，不是报告漏算。",
  };
}

export function buildFunctionalTraining(chart: Chart, locale: AppLocale): FunctionalTrainingResult {
  const structure = analyzeStructure(chart);
  const confidence = confidenceOf(chart, structure);
  const need = selectedNeed(structure.remedy.disease);
  const state = need ? stateOf(chart, structure, confidence) : null;
  const warnings = locale === "en"
    ? ["This is behavioural function training, not a favourable-element prescription.", "Element percentages and apparent absence are not used as the deciding rule."]
    : locale === "zh-Hant"
      ? ["這是現實功能訓練，不等同確定喜用神。", "不以五行百分比或表面缺失作決定規則。"]
      : ["这是现实功能训练，不等同确定喜用神。", "不以五行百分比或表面缺失作决定规则。"];

  const baseEvidence: FunctionalTrainingResult["evidence"] = {
    monthCommand: `${chart.monthBranch}${locale === "en" ? " month branch" : locale === "zh-Hant" ? "月令" : "月令"}`,
    dayMasterCapacity: chart.strength?.tendency ?? undefined,
    structuralIssue: structure.remedy.disease,
    rootAndStem: structure.established
      ? (locale === "en" ? "The month-command main qi is visibly exposed in the stems." : locale === "zh-Hant" ? "月令主氣已有透干依據。" : "月令主气已有透干依据。")
      : (locale === "en" ? "The month-command main qi is not directly exposed; structure remains conditional." : locale === "zh-Hant" ? "月令主氣未直接透干，結構保留條件性。" : "月令主气未直接透干，结构保留条件性。"),
    interactions: structure.branchRelations.length ? structure.evidenceLines.filter((line) => /地支作用|合、三合、三會/.test(line)).slice(0, 2) : [],
    circulation: structure.remedy.bridge ?? structure.remedy.medicine,
    luckCycle: chart.currentDayun && !chart.timeUnknown ? `${chart.currentDayun.ganZhi} ${chart.currentDayun.startYear}–${chart.currentDayun.endYear}` : undefined,
  };

  if (!need || !state) {
    const empty = noSelectionCopy(locale);
    return {
      version: "ZW-FIVE-ELEMENT-FUNCTION-1.0",
      locale,
      analysisStatus: "insufficient_data",
      selectedElement: null,
      selectedState: null,
      ...empty,
      howToUse: [],
      observationWindow: { minDays: 7, maxDays: 28 },
      supportingElement: null,
      balancingElement: null,
      evidence: baseEvidence,
      warnings,
    };
  }

  const copy = FIVE_ELEMENT_FUNCTIONS[need.element][locale];
  const activelyTrain = mayActivelyTrainElement(state);
  const supportFirst = state === "needs_mother_qi_or_bridging";
  const howToUse = supportFirst
    ? [
        locale === "en" ? "Do not add more intensity yet. First reduce the load or blockage named in the report." : locale === "zh-Hant" ? "暫時不要加碼；先處理報告中已指出的負荷或阻塞。" : "暂时不要加码；先处理报告中已指出的负荷或阻塞。",
        ...copy.actions.slice(0, 2),
      ]
    : copy.actions;
  const themeSuffix = supportFirst
    ? (locale === "en" ? " · support first" : locale === "zh-Hant" ? "｜先建支持條件" : "｜先建支持条件")
    : "";
  const summary = locale === "en"
    ? `Current training focus: ${copy.name} — ${copy.shortTheme}. ${activelyTrain ? "Use it as a practical behaviour theme for the next one to four weeks." : "Build the support conditions first; do not treat this as a command to add more of the element."}`
    : locale === "zh-Hant"
      ? `目前主訓練功能：${copy.name}｜${copy.shortTheme}。${activelyTrain ? "接下來一至四週只練這一條，不同時加五個方向。" : "先建支持／通關條件，不把它理解成直接補元素。"}`
      : `目前主训练功能：${copy.name}｜${copy.shortTheme}。${activelyTrain ? "接下来一至四周只练这一条，不同时加五个方向。" : "先建支持／通关条件，不把它理解成直接补元素。"}`;

  return {
    version: "ZW-FIVE-ELEMENT-FUNCTION-1.0",
    locale,
    analysisStatus: confidence,
    selectedElement: need.element,
    selectedState: state,
    functionalTheme: `${copy.shortTheme}${themeSuffix}`,
    whySelected: whyFor(need.element, locale, state, structure.remedy.disease),
    howToUse,
    observationMarker: copy.observation,
    observationWindow: { minDays: 7, maxDays: 28 },
    excessWarning: copy.excess,
    supportingElement: need.supporting,
    balancingElement: need.balancing,
    freeTextSummary: summary,
    evidence: baseEvidence,
    warnings,
  };
}
