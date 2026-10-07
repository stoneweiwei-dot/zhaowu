import { COLOR_OF_ELEMENT, DIRECTION_OF_ELEMENT, HOUR_OF_ELEMENT } from "./constants";
import type { Chart, Element, LifeGuide, Pillar, QuestionKind, Reading, RelationPref } from "./types";
import type { PalmReading } from "@/lib/core/types";
import { composePalmReport } from "@/lib/palm/engine";
import { analyzeStructure, completionPhrase } from "@/lib/bazi/structure";

const PAST_KEYS = ["前世", "前三世", "六道", "輪迴", "哪一道", "一掌經", "三世因果", "前世今生"];
const HOME_KEYS = ["家宅", "搬家", "店面", "風水", "住哪", "買屋方位"];
const LOVE_KEYS = ["感情", "戀", "愛", "對象", "結婚", "伴侶", "桃花", "復合", "分手", "緣分", "喜歡", "男友", "女友", "暧昧", "曖昧"];
const WORK_KEYS = ["工作", "職業", "轉職", "升遷", "事業", "面試", "創業", "老闆", "職場", "出國工作", "離職", "跳槽", "考", "升官"];
const MONEY_KEYS = ["財", "錢", "收入", "投資", "買房", "買屋", "理財", "債務", "存錢", "虧", "賺"];
const HEALTH_KEYS = ["健康", "病", "痛", "醫療", "手術", "失眠", "身體", "復原", "累", "睡不著"];
const CHOICE_KEYS = ["還是", "或者", "該不該", "要不要", "兩個選項", "A還是B", "選哪", "選A或B", "选A或B"];
const TIME_KEYS = ["什麼時候", "何時", "哪年", "哪月", "時間", "窗口", "時機", "等到"];
const PURPOSE_KEYS = ["為何而生", "为何而生", "為什麼而生", "为什么而生", "使命", "人生角色", "宿命", "珍貴", "珍贵", "潛意識", "潜意识", "真實的自己", "真实的自己", "幸福生活", "抉擇方式", "抉择方式", "人生方向", "前往何方", "人生去向"];

export function classifyQuestion(q: string): QuestionKind {
  if (PAST_KEYS.some((k) => q.includes(k))) return "past";
  if (/A\s*[：:].+?B\s*[：:]/is.test(q)) return "choice";
  if (CHOICE_KEYS.some((k) => q.includes(k))) return "choice";
  if (HOME_KEYS.some((k) => q.includes(k))) return "home";
  if (HEALTH_KEYS.some((k) => q.includes(k))) return "health";
  if (LOVE_KEYS.some((k) => q.includes(k))) return "love";
  if (WORK_KEYS.some((k) => q.includes(k))) return "career";
  if (MONEY_KEYS.some((k) => q.includes(k))) return "money";
  if (TIME_KEYS.some((k) => q.includes(k))) return "timing";
  return "self";
}

function isReady(col: Pillar): boolean {
  return col.ready !== false && col.ganZhi !== "未定" && Boolean(col.gan);
}

function p(chart: Chart, key: Pillar["key"]): Pillar {
  return chart.pillars.find((x) => x.key === key) ?? chart.pillars[0];
}

export const BRANCH_TELL: Record<string, string> = {
  子: "信息与情绪更容易在安静环境中继续加工，决策需要明确截止点",
  丑: "倾向先承接再表达，容易把问题留到负荷已经累积之后才处理",
  寅: "行动一旦启动会比较直接，适合先确认方向再集中推进",
  卯: "对环境与关系变化较敏感，适合保留弹性但避免长期含糊",
  辰: "信息容易反复归纳，适合把复杂问题写成结构后再决策",
  巳: "判断速度快但容易持续高负荷，重要事项需要预留恢复时间",
  午: "外部反馈会明显影响行动速度，适合把目标与边界公开说清楚",
  未: "容易优先处理他人或环境需求，需要主动保留自己的资源位置",
  申: "擅长拆解问题，沟通时需要补上对关系与执行成本的考虑",
  酉: "标准与筛选能力强，适合明确最低接受条件，避免过度精细化",
  戌: "重视承诺与一致性，关系和合作中需要把责任边界写清楚",
  亥: "内在处理量较大，适合减少噪音并保留稳定的独处恢复时段",
};

export const STEM_TELL: Record<string, string> = {
  甲: "处理问题时倾向先建立框架，再持续推进；风险是长期承担过多",
  乙: "适应与协调能力较强，优势在迂回解决问题；风险是边界表达过晚",
  丙: "外显推动力较强，适合需要表达与带动的任务；风险是持续过热",
  丁: "适合连续、精细、需要耐心的推进方式；风险是长期被拖延与含糊消耗",
  戊: "稳定与承载能力是主要优势；风险是调整速度偏慢、过度固守旧结构",
  己: "擅长整理与整合资源；风险是杂务和他人责任不断堆积到自己身上",
  庚: "切分问题与做决定的能力较强；风险是处理过快时忽略关系与后续成本",
  辛: "辨别细节与质量的能力较强；风险是标准过高导致推进速度下降",
  壬: "信息吸收与连接能力较强；风险是输入过多、输出不足造成内耗",
  癸: "观察、归纳与长期酝酿能力较强；风险是等待确定性过久而延迟行动",
};

const GOD_WORK: Record<string, string> = {
  比肩: "适合拥有明确责任边界、可独立交付与可署名的工作",
  劫財: "适合协作与资源整合，但合作规则、收益与退出机制必须先写清楚",
  食神: "适合把知识、技术或想法转成稳定可交付的产品、服务或流程",
  傷官: "适合改进、表达、设计、优化与需要自主判断的岗位",
  正財: "适合稳定变现、专业服务、可重复计价与长期客户关系",
  偏財: "适合机会型收入与资源连接，但必须控制风险与退出成本",
  正官: "适合责任、资格、公开标准明确的职业结构",
  七殺: "适合高压、快速决策、结果导向且权责清楚的工作环境",
  正印: "适合研究、教学、知识管理与专业支撑，但要设交付截止点",
  偏印: "适合冷门专业、复杂判断与高专门化任务，但不宜同时开启过多方向",
};

const GOD_LIFE_FUNCTION: Record<string, string> = {
  比肩: "建立边界、独立承担，并形成自己的判断标准",
  劫財: "在协作、竞争与资源分配中学会明确规则和边界",
  食神: "把经验、知识、审美或技术转成稳定、可被他人接住的输出",
  傷官: "发现旧结构的问题，再用表达、设计或方法提出新方案",
  正財: "把能力转成稳定交换、长期责任与可持续积累",
  偏財: "辨识机会、连接资源，同时为风险与退出保留边界",
  正官: "建立秩序、承担责任，并维护可以长期执行的标准",
  七殺: "在压力中判断、执行与守住边界，而不是被压力牵着走",
  正印: "吸收、整理、传承知识，并把零散经验建立成方法",
  偏印: "处理复杂、冷门或非常规问题，并把洞见转成可验证的结构",
};

function isPurposeQuestion(question: string): boolean {
  return PURPOSE_KEYS.some((key) => question.includes(key));
}

function guideFrom(chart: Chart): LifeGuide {
  if (chart.usefulProvisional) {
    return {
      colors: [],
      avoidColors: [],
      directions: { favor: [], rest: [] },
      hours: { favor: [], drain: [] },
      pet: "",
    };
  }

  const favorEl = chart.useful[0] ?? chart.dayMasterElement;
  const restEl = chart.drain[0] ?? "土";
  return {
    colors: COLOR_OF_ELEMENT[favorEl],
    avoidColors: COLOR_OF_ELEMENT[restEl],
    directions: {
      favor: chart.useful.map((e) => DIRECTION_OF_ELEMENT[e]),
      rest: chart.drain.map((e) => DIRECTION_OF_ELEMENT[e]),
    },
    hours: {
      favor: HOUR_OF_ELEMENT[favorEl],
      drain: HOUR_OF_ELEMENT[restEl],
    },
    pet:
      favorEl === "火"
        ? "偏互动型的猫或小型犬可作象征参考；现实仍以空间、时间与照护能力为准。"
        : favorEl === "水"
          ? "偏安静陪伴型的动物可作象征参考；现实仍以空间、时间与照护能力为准。"
          : favorEl === "木"
            ? "活动量适中的动物可作象征参考；现实仍以空间、时间与照护能力为准。"
            : favorEl === "金"
              ? "照护节奏稳定、边界清楚的动物可作象征参考；现实条件优先。"
              : "作息稳定、照护需求明确的动物可作象征参考；现实条件优先。",
  };
}

function weather(chart: Chart): string {
  if (chart.currentDayun) {
    const d = chart.currentDayun;
    return `当前为${d.ganZhi}大运（${d.startYear}–${d.endYear}），流年${chart.currentYear}在此基础上触发原局。`;
  }
  if (chart.timeUnknown) {
    return `当前流年为${chart.currentYear}。时辰未定，大运与时柱相关判断降级。`;
  }
  return `当前流年为${chart.currentYear}。`;
}

function moveScore(text: string): number {
  const move = ["轉", "转", "離", "离", "走", "換", "换", "創", "创", "出國", "出国", "分手", "結束", "结束", "辭", "辞", "跳", "搬", "開", "开", "新工作", "新公司", "新職位", "新职位", "升遷", "升迁", "成長", "成长", "薪資高", "薪资高", "收入高"];
  const stay = ["留", "穩", "稳", "等", "維持", "维持", "繼續", "继续", "復合", "复合", "保留"];
  let n = 0;
  for (const k of move) if (text.includes(k)) n += 1;
  for (const k of stay) if (text.includes(k)) n -= 1;
  return n;
}

type ChoicePart = { label: "A" | "B" | null; text: string };

function choiceParts(question: string): ChoicePart[] {
  const labelled = question.match(/(?:^|[\s，,；;])A\s*[：:]\s*([\s\S]*?)(?:[；;\n]\s*|\s+)B\s*[：:]\s*([\s\S]*?)(?:[。！？!?]|$)/i);
  if (labelled) {
    return [
      { label: "A", text: labelled[1].trim() },
      { label: "B", text: labelled[2].trim() },
    ];
  }

  return question
    .split(/還是|还是|或者/)
    .map((text, index) => ({ label: null, text: text.trim(), index }))
    .filter((part) => Boolean(part.text))
    .slice(0, 2)
    .map(({ label, text }) => ({ label, text }));
}

function choiceName(part: ChoicePart): string {
  const text = part.text.length > 34 ? `${part.text.slice(0, 34)}…` : part.text;
  return part.label ? `${part.label}（${text}）` : `「${text}」`;
}

function leanChoice(q: string, chart: Chart): string {
  const parts = choiceParts(q);
  const strong = chart.strength.tendency.includes("旺");
  if (parts.length >= 2) {
    const aPart = parts[0];
    const bPart = parts[1];
    const a = aPart.text
      .replace(/^(?:我)?(?:應該|应该)?/, "")
      .replace(/^[^：:]{0,24}[：:]/, "")
      .replace(/[，,、]$/, "")
      .trim();
    const b = bPart.text.replace(/[？?。！!].*$/, "").trim();
    const aMove = moveScore(a);
    const bMove = moveScore(b);

    if (a && b && aMove !== bMove) {
      const moveChoice = aMove > bMove ? { ...aPart, text: a } : { ...bPart, text: b };
      const stayChoice = aMove > bMove ? { ...bPart, text: b } : { ...aPart, text: a };
      return strong
        ? `直接回答：偏向 ${choiceName(moveChoice)}。原局偏滿時，更需要把能量轉成可衡量的成果與有效轉場；但要先確認新增責任、時間成本與退出條款仍在可承受範圍。`
        : `直接回答：偏向 ${choiceName(stayChoice)}。原局承載偏弱時，應先保住穩定資源與可持續節奏；除非另一選項的支援、規則與退出條款明顯更完整。`;
    }

    return `直接回答：目前不能可靠強選。你已提出 ${choiceName(aPart)} 與 ${choiceName(bPart)}，但兩邊還缺少能拉開差異的現實條件；請至少用同一標準補上收益、責任、時間投入、穩定性與退出成本。`;
  }

  if (q.includes("該不該") || q.includes("该不该") || q.includes("要不要")) {
    return strong
      ? "盤面偏滿，原則上可以動，但先控制退出成本，用小規模試行代替一次性全押。"
      : "盤面承載優先，暫不建議一次性全押；先補穩定資源，再用小規模試行驗證。";
  }

  return "目前問題缺少可比較的兩個明確選項，不作強行二選一。";
}

// 面向客户的白話版：不把「日支／財星／官殺」這類術語直接丟給讀者。
// 判斷依據沒有改（仍是關係連續性、現實投入、邊界），只是換成一般人聽得懂的講法。
function loveLens(chart: Chart, relation: RelationPref): string {
  if (relation === "same") {
    return "你们这段关系不用去套异性婚配的老公式，看的是两个人相处够不够持续、投入对不对等。";
  }
  if (chart.gender === "female" || chart.gender === "male") {
    return "命理上是有一套看另一半的说法，但那只是参考线索，真正说了算的，还是你们相处有没有持续、投入对不对等。";
  }
  return "关系好不好，看的是相处连不连续、投入对不对等、边界清不清楚。";
}

function fiveElementWealthBehaviorHint(element: Element): string {
  switch (element) {
    case "木":
      return "木日主重誠信：少承諾、多兌現，維持條件一致，以信用承接資源與訂單";
    case "火":
      return "火日主重情義與使命感：重視送往迎來、關係溫度與帶動力，以人際熱度承接結果與資源";
    case "土":
      return "土日主重不抱怨、流動與多元策略：安全感建立在備案，不因怕變而鎖死財路；保留多客戶、多渠道與多收入來源";
    case "金":
      return "金日主重保有初衷：可以重效率與利益，但不要為短利犧牲產品、專業、承諾與長期成長本體";
    case "水":
      return "水日主重熱情與交際：讓資訊、交易與判斷能力接上互動、曝光與實際連結，避免只分析而不輸出、不露面";
    default:
      return "五行取財提示需回到完整命盤校正";
  }
}

export function interpret(question: string, chart: Chart, relation: RelationPref = "unset", palm: PalmReading | null = null): Reading {
  const kind = classifyQuestion(question);
  const monthP = p(chart, "month");
  const timeP = p(chart, "time");
  const timeLine = isReady(timeP) ? `时柱${timeP.ganZhi}可用于观察输出与结果层。` : "时柱未定，涉及输出方式与晚期结果的判断降级。";
  const guide = guideFrom(chart);
  const guideLine = chart.usefulProvisional
    ? "颜色、方位、时段与宠物取象暂不下定论。"
    : `生活取象可参考${guide.colors[0]}这一系，但只作辅助。`;
  const now = weather(chart);
  const strong = chart.strength.tendency.includes("旺");
  const structure = analyzeStructure(chart);
  // R6.1/R6.2.1 guard（scripts/r621-runtime-contract.test.mjs）：月令主气功能为
  // structure.monthTenGod，職業／人生功能傾向不得改用十神計數排名決定。
  const monthFunctionGod = structure.monthTenGod !== "未定" ? structure.monthTenGod : "食神";

  let directAnswer = "";
  switch (kind) {
    case "past":
      if (palm) {
        const lives = palm.palaces.map((x) => `${x.lifeLabel}：${x.zhi}・${x.star}｜${x.dao}`).join("；");
        directAnswer = [
          palm.firstSentence,
          lives ? `四宫：${lives}。` : "",
          palm.minggongNote,
          palm.cause,
          palm.fruit,
          palm.seed,
          palm.boundary,
        ].filter(Boolean).join(" ");
      } else {
        directAnswer = `这题需要按一掌经四宫独立排，不用子平反推六道。当前资料不足时直接不作判定。`;
      }
      break;
    case "home":
      directAnswer = `结论：出生盘只能看你个人适合什么样的环境，没办法代替一间具体房子的坐向、采光、道路和动线。你要问的是某套房或某个店面适不适合，得把那个地方的实际情况给我，在那之前我不硬指方位。${guideLine}`;
      break;
    case "health":
      directAnswer = `结论：命盘看不出具体的病，只能看你的底子和消耗节奏。你这张盘目前${chart.strength.tendency}，${now}如果现实里已经持续疼痛、睡不好或明显没力气，那是身体在提醒你，先去看医生；命理这边能帮上的，是作息和压力怎么调整。`;
      break;
    case "love":
      directAnswer = `结论：这段关系值不值得往下走，不是看“桃花”两个字，而是看对方有没有持续回应你、有没有实际投入、愿不愿意把下一步讲清楚。${loveLens(chart, relation)}${now}如果连续性和投入都不够，就别把一时的心动当成稳定的关系。`;
      break;
    case "career":
      directAnswer = `结论：工作合不合适，关键看你撑不撑得住、做出来的东西稳不稳定。你这张盘目前偏向${structure.label}${structure.established ? "" : "方向"}，${GOD_WORK[monthFunctionGod] ?? "把判断转成可验证成果"}。${strong ? "你现在盘面偏满，优先想办法多产出、少背不必要的负担。" : "你现在盘面承载偏弱，优先挑资源、规则、支持都比较到位的岗位。"}${now}`;
      break;
    case "money":
      directAnswer = `结论：钱的事不能只看“财星多不多”，要看你撑不撑得住财、有没有稳定的产出和能重复变现的路子。你这张盘目前偏向${structure.label}${structure.established ? "" : "方向"}，${structure.remedy.disease}；所以先把底子和流通理顺，再谈扩张。${fiveElementWealthBehaviorHint(chart.dayMasterElement)}。这只是辅助参考，不能单靠它断定你会不会发财、什么时候发财，或哪一笔投资稳赚。`;
      break;
    case "choice":
      directAnswer = leanChoice(question, chart);
      break;
    case "timing":
      directAnswer = `结论：时间题必须用原局 + 大运 + 流年判断，不能单凭一个流年字直接定“必成日期”。${now}${chart.currentDayun ? ` 当前大运提供的是${chart.currentDayun.ganZhi}这一阶段背景；具体到月份，需要再看该问题所属领域与流月是否形成同向触发。` : " 大运资料不足时，时间结论降级。"}`;
      break;
    default:
      directAnswer = isPurposeQuestion(question)
        ? `结论：八字不能证明“为什么被安排出生”，也不能把“使命”写成上天指令。若把问题改成“这张盘最自然的结构功能与反复课题是什么”，当前以${structure.label}${structure.established ? "" : "方向"}为主，月令主气功能为${monthFunctionGod}；较稳定的功能方向是：${GOD_LIFE_FUNCTION[monthFunctionGod] ?? "把复杂经验整理成可以验证、可以执行的现实方法"}。调整重点是处理真实出现的阻塞与代价，不是把五行补齐或强行凑平均。`
        : `结论：这张盘目前以${structure.label}${structure.established ? "" : "方向"}为主，日主${chart.dayMaster}${chart.dayMasterElement}的底子${chart.strength.tendency}。${structure.remedy.disease}；重点不在多懂几个术语，而在把这个卡点处理掉，让你的力气用得顺。`;
  }

  const rhythm = `结构摘要：日主${chart.dayMaster}${chart.dayMasterElement}，月令${monthP.zhi}，主格${structure.label}${structure.established ? "" : "方向"}，完成度${completionPhrase(structure.completion.label)}。${structure.remedy.disease}；${structure.remedy.medicine}${timeLine}`;

  const work = `${GOD_WORK[monthFunctionGod] ?? "把判断转成可验证成果"}。选工作时优先比较四件事：责任是否清楚、成果看不看得出来、资源够不够、万一不做了退路好不好走。`;
  const love = `${loveLens(chart, relation)}关系只看实际表现：联系有没有持续、投入对不对等、边界清不清楚、下一步明不明确。`;
  const money = `钱的事优先看你扛不扛得住、现金流顺不顺、退路好不好走。命盘只能给你一个大致的节奏，取代不了真实的收入、成本和风险数字。${kind === "money" ? ` ${fiveElementWealthBehaviorHint(chart.dayMasterElement)}。` : ""}`;
  const body = `身体这块只谈你的底子和生活节奏，不下疾病诊断。症状持续或加重，就以医生的判断为准。`;
  const home = chart.usefulProvisional
    ? "颜色和方位先不下定论。真要选房子，还是要看坐向、采光、道路、动线，以及你住进去实际的感受。"
    : `空间上可以参考${guide.colors[0]}这一系的感觉，但真要选房子，还是以坐向、采光、道路、动线和你住进去实际的感受为准。`;
  const action = kind === "choice"
    ? "把两个选项放进同一张比较表：收入／资源、责任、时间、地点、稳定性、退出成本；命盘倾向只作为其中一列。"
    : kind === "career"
      ? "把当前工作或候选岗位写成四项：责任、可交付成果、资源支持、退出成本；优先处理最明显的结构短板。"
      : kind === "money"
        ? "先列主收入、固定支出、可承受风险与退出成本，再决定是否扩张。"
        : kind === "love"
          ? "只核对对方连续三次实际行为，不用宣言代替投入。"
          : kind === "health"
            ? "记录睡眠、症状与负荷变化；持续或加重时优先就医。"
            : "把本题最核心的一个结论转成一个可验证动作，执行后再用现实反馈复核。";
  const decree = `命理结论只用于识别结构、条件与风险；真正能改变结果的，是资源配置、边界、技能、行动与现实反馈。`;
  const lastLine = kind === "choice"
    ? "若两个选项缺少可比较条件，宁可不强选，也不制造一个看似确定的答案。"
    : kind === "timing"
      ? "时间结论必须等结构与岁运同向触发，不能把单一流年当保证。"
      : `本题以${structure.label}${structure.established ? "" : "方向"}、${structure.remedy.disease}与实际承载作为主要判断轴。`;

  return {
    kind,
    directAnswer,
    rhythm,
    work,
    love,
    money,
    body,
    home,
    action,
    decree,
    lastLine,
    guide,
  };
}

export function composeFullReport(question: string, chart: Chart, reading: Reading, palm: PalmReading | null = null): string {
  if (reading.kind === "past" && palm) {
    return composePalmReport(
      question,
      palm,
      `日主${chart.dayMaster}${chart.dayMasterElement}　月令${chart.monthBranch}　四柱 ${chart.pillars.map((col) => col.ganZhi).join("　")}`,
    );
  }
  const pillars = chart.pillars
    .map((col) => `${col.label} ${col.ganZhi}（${col.nayin}／${col.shiShenGan}／十二長生${col.diShi}）`)
    .join("\n");
  const usefulLimit = chart.usefulProvisional
    ? "正式取用尚未完成，因此不由流通候選派生顏色、方位、時段或寵物結論。"
    : null;
  return [
    "昭梧｜白话完整报告",
    "",
    "一、直接回答",
    reading.directAnswer,
    "",
    "二、排盘资料",
    chart.provenance,
    `农历：${chart.lunarDate}`,
    `出生地：${chart.cityLabel}`,
    chart.liveCityLabel ? `现居地：${chart.liveCityLabel}（只作环境层参考，不改四柱）` : null,
    chart.hemisphere === "S" ? "南半球季相只作环境校正，不反转月令与四柱。" : null,
    "",
    pillars,
    `日主 ${chart.dayMaster}${chart.dayMasterElement}　月令 ${chart.monthBranch}　胎元 ${chart.taiyuan}　命宫 ${chart.minggong}`,
    chart.strength.summary,
    "",
    "三、核心结构",
    reading.rhythm,
    "",
    "四、与本题直接相关的现实解释",
    reading.kind === "career" ? `工作｜${reading.work}` : null,
    reading.kind === "love" ? `感情｜${reading.love}` : null,
    reading.kind === "money" ? `财务｜${reading.money}` : null,
    reading.kind === "health" ? `身心｜${reading.body}` : null,
    reading.kind === "home" ? `家宅｜${reading.home}` : null,
    "",
    "五、一个优先行动",
    reading.action,
    "",
    "六、限制",
    usefulLimit,
    reading.lastLine,
  ]
    .filter((line): line is string => line !== null)
    .join("\n");
}
