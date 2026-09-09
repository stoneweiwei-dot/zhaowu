import { COLOR_OF_ELEMENT, DAY_MASTER_NATURE, DIRECTION_OF_ELEMENT, ELEMENT_LABEL, HOUR_OF_ELEMENT } from "./constants";
import type { Chart, Element, LifeGuide, Pillar, QuestionKind, Reading, RelationPref } from "./types";
import type { PalmReading } from "@/lib/core/types";
import { composePalmReport } from "@/lib/palm/engine";
import { analyzeStructure } from "@/lib/bazi/structure";

const PAST_KEYS = ["前世", "前三世", "六道", "輪迴", "哪一道", "一掌經", "三世因果", "前世今生"];
const HOME_KEYS = ["家宅", "搬家", "店面", "風水", "住哪", "買屋方位"];
const LOVE_KEYS = ["感情", "戀", "愛", "對象", "結婚", "伴侶", "桃花", "復合", "分手", "緣分", "喜歡", "男友", "女友", "暧昧", "曖昧"];
const WORK_KEYS = ["工作", "職業", "轉職", "升遷", "事業", "面試", "創業", "老闆", "職場", "出國工作", "離職", "跳槽", "考", "升官"];
const MONEY_KEYS = ["財", "錢", "收入", "投資", "買房", "買屋", "理財", "債務", "存錢", "虧", "賺"];
const HEALTH_KEYS = ["健康", "病", "痛", "醫療", "手術", "失眠", "身體", "復原", "累", "睡不著"];
const CHOICE_KEYS = ["還是", "或者", "該不該", "要不要", "兩個選項", "A還是B", "選哪"];
const TIME_KEYS = ["什麼時候", "何時", "哪年", "哪月", "時間", "窗口", "時機", "等到"];

export function classifyQuestion(q: string): QuestionKind {
  if (PAST_KEYS.some((k) => q.includes(k))) return "past";
  if (CHOICE_KEYS.some((k) => q.includes(k))) return "choice";
  if (HOME_KEYS.some((k) => q.includes(k))) return "home";
  if (HEALTH_KEYS.some((k) => q.includes(k))) return "health";
  if (LOVE_KEYS.some((k) => q.includes(k))) return "love";
  if (WORK_KEYS.some((k) => q.includes(k))) return "career";
  if (MONEY_KEYS.some((k) => q.includes(k))) return "money";
  if (TIME_KEYS.some((k) => q.includes(k))) return "timing";
  return "self";
}

function joinEl(els: Element[]): string {
  return els.join("、");
}

function isReady(col: Pillar): boolean {
  return col.ready !== false && col.ganZhi !== "未定" && Boolean(col.gan);
}

function p(chart: Chart, key: Pillar["key"]): Pillar {
  return chart.pillars.find((x) => x.key === key) ?? chart.pillars[0];
}

const BRANCH_TELL: Record<string, string> = {
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

const STEM_TELL: Record<string, string> = {
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

function countGods(chart: Chart): Record<string, number> {
  const bag: Record<string, number> = {};
  for (const col of chart.pillars) {
    if (!isReady(col)) continue;
    if (col.key !== "day") {
      bag[col.shiShenGan] = (bag[col.shiShenGan] ?? 0) + 2;
    }
    for (const h of col.hide) {
      bag[h.shiShen] = (bag[h.shiShen] ?? 0) + 1;
    }
  }
  return bag;
}

function topGod(chart: Chart): string {
  const bag = countGods(chart);
  let best = "食神";
  let n = -1;
  for (const [k, v] of Object.entries(bag)) {
    if (k === "日主") continue;
    if (v > n) {
      best = k;
      n = v;
    }
  }
  return best;
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

function clipQuestion(q: string): string {
  const t = q.trim().replace(/[？?。！!]+$/g, "");
  return t.length > 52 ? `${t.slice(0, 52)}…` : t;
}

function moveScore(text: string): number {
  const move = ["轉", "转", "離", "离", "走", "換", "换", "創", "创", "出國", "出国", "分手", "結束", "结束", "辭", "辞", "跳", "搬", "開", "开"];
  const stay = ["留", "穩", "稳", "等", "維持", "维持", "繼續", "继续", "復合", "复合", "保留"];
  let n = 0;
  for (const k of move) if (text.includes(k)) n += 1;
  for (const k of stay) if (text.includes(k)) n -= 1;
  return n;
}

function leanChoice(q: string, chart: Chart): string {
  const parts = q.split(/還是|还是|或者/).map((x) => x.trim()).filter(Boolean);
  const strong = chart.strength.tendency.includes("旺");
  if (parts.length >= 2) {
    const a = parts[0].replace(/^.*[，,、：:]/, "").trim();
    const b = parts[1].replace(/[？?。！!].*$/, "").trim();
    const aMove = moveScore(a);
    const bMove = moveScore(b);

    if (a && b && aMove !== bMove) {
      const moveChoice = aMove > bMove ? a : b;
      const stayChoice = moveChoice === a ? b : a;
      return strong
        ? `仅从命盘承载角度，偏向「${moveChoice}」。原因是原局偏满时，更需要形成有效输出与转场；但最终仍要用收入、责任、地点、时间与退出成本复核。`
        : `仅从命盘承载角度，偏向「${stayChoice}」。原因是原局承载偏弱时，优先保住稳定资源与可持续节奏；但最终仍要用收入、责任、地点、时间与退出成本复核。`;
    }

    return `这两个选项仅凭名称无法可靠区分，暂不强选。请把「${a || "A"}」与「${b || "B"}」的收入、责任、地点、时间投入、稳定性和退出成本放在同一组条件下，我再按同一命盘结构比较。`;
  }

  if (q.includes("該不該") || q.includes("该不该") || q.includes("要不要")) {
    return strong
      ? "盘面偏满，原则上可以动，但先控制退出成本，用小规模试行代替一次性全押。"
      : "盘面承载优先，暂不建议一次性全押；先补稳定资源，再用小规模试行验证。";
  }

  return "当前问题缺少可比较的两个明确选项，不作强行二选一。";
}

function loveLens(chart: Chart, relation: RelationPref): string {
  const day = p(chart, "day");
  if (relation === "same") {
    return `同性／非传统关系不硬套异性婚配公式；本题以日支${day.zhi}的关系承载、互动连续性与现实投入为主。`;
  }
  if (chart.gender === "female") {
    return `传统女命官杀只作伴侣功能候选，实际仍要结合日支${day.zhi}、关系连续性与现实投入。`;
  }
  if (chart.gender === "male") {
    return `传统男命财星只作伴侣功能候选，实际仍要结合日支${day.zhi}、关系连续性与现实投入。`;
  }
  return `关系判断以日支${day.zhi}、互动连续性、边界与现实投入为主。`;
}

export function interpret(question: string, chart: Chart, relation: RelationPref = "unset", palm: PalmReading | null = null): Reading {
  const kind = classifyQuestion(question);
  const nature = DAY_MASTER_NATURE[chart.dayMaster] ?? "以日主功能为轴";
  const dayP = p(chart, "day");
  const monthP = p(chart, "month");
  const timeP = p(chart, "time");
  const useful = joinEl(chart.useful);
  const usefulLine = useful ? `当前仅有流通／调候候选：${useful}；在完整病药与格局链未完成前，不直接等同喜用神。` : "当前正式取用仍未定。";
  const timeLine = isReady(timeP) ? `时柱${timeP.ganZhi}可用于观察输出与结果层。` : "时柱未定，涉及输出方式与晚期结果的判断降级。";
  const guide = guideFrom(chart);
  const guideLine = chart.usefulProvisional
    ? "颜色、方位、时段与宠物取象暂不下定论。"
    : `生活取象可参考${guide.colors[0]}这一系，但只作辅助。`;
  const god = topGod(chart);
  const stemTell = STEM_TELL[chart.dayMaster] ?? nature;
  const branchTell = BRANCH_TELL[dayP.zhi] ?? "日支用于观察贴身关系与日常承载。";
  const q = clipQuestion(question);
  const now = weather(chart);
  const strong = chart.strength.tendency.includes("旺");
  const structure = analyzeStructure(chart);

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
      directAnswer = `结论：现有出生盘只能判断个人承载与环境偏好，不能代替具体住宅的坐向、采光、道路与动线。若你问的是某套房或店面是否适合，必须补该空间资料；在此之前不硬定方位。${guideLine}`;
      break;
    case "health":
      directAnswer = `结论：命盘不能诊断疾病。当前只能从承载层看，日主${chart.dayMaster}${chart.dayMasterElement}在${monthP.zhi}月令下的底盘为${chart.strength.tendency}，${now}若现实已经出现持续疼痛、失眠、明显乏力或其他症状，先按医疗路径处理；命理只补充作息与压力管理。`;
      break;
    case "love":
      directAnswer = `结论：这段关系是否值得推进，不看“桃花词”本身，先看对方是否持续回应、是否有现实投入、是否愿意明确下一步。${loveLens(chart, relation)}${now}若连续性与投入不足，就不把短期情绪升格为稳定关系。`;
      break;
    case "career":
      directAnswer = `结论：职业判断以“能否形成稳定做功与承载”为核心。当前主格为${structure.label}${structure.established ? "" : "方向"}，结构完成度为${structure.completion.label}；可见十神侧重${god}，对应${GOD_WORK[god] ?? "把判断转成可验证成果"}。${strong ? "原局偏满时优先增加有效输出与减少无效负荷。" : "原局承载偏弱时优先选择资源、规则和支持条件更完整的岗位。"} ${now}`;
      break;
    case "money":
      directAnswer = `结论：财务不能只看“财星多不多”，先看日主能否承财、有没有稳定输出和可重复变现路径。当前主格为${structure.label}${structure.established ? "" : "方向"}，${structure.remedy.disease}；因此先处理结构上的承载与流通，再谈扩张。${usefulLine}`;
      break;
    case "choice":
      directAnswer = leanChoice(question, chart);
      break;
    case "timing":
      directAnswer = `结论：时间题必须用原局 + 大运 + 流年判断，不能单凭一个流年字直接定“必成日期”。${now}${chart.currentDayun ? ` 当前大运提供的是${chart.currentDayun.ganZhi}这一阶段背景；具体到月份，需要再看该问题所属领域与流月是否形成同向触发。` : " 大运资料不足时，时间结论降级。"}`;
      break;
    default:
      directAnswer = `结论：这张盘当前以${structure.label}${structure.established ? "" : "方向"}为主，结构完成度为${structure.completion.label}，日主${chart.dayMaster}${chart.dayMasterElement}的承载底盘为${chart.strength.tendency}。核心不是罗列更多术语，而是看格局、病药、流通与承载是否能形成同一条有效链。`;
  }

  const rhythm = `结构摘要：日主${chart.dayMaster}${chart.dayMasterElement}，月令${monthP.zhi}，主格${structure.label}${structure.established ? "" : "方向"}，完成度${structure.completion.label}。${structure.remedy.disease}；${structure.remedy.medicine}${timeLine}`;

  const work = `${GOD_WORK[god] ?? "把判断转成可验证成果"}。职业选择优先比较：责任是否清楚、成果是否可衡量、资源是否足够、退出成本是否可控。`;
  const love = `${loveLens(chart, relation)}关系只看可验证行为：联系是否连续、投入是否对等、边界是否清楚、下一步是否明确。`;
  const money = `财务优先看承载、现金流与退出成本。命盘只提供结构节奏，不替代真实收入、成本和风险数据。`;
  const body = `身体层只谈承载与生活节奏，不下疾病诊断。现实症状持续或加重时，以医疗评估优先。`;
  const home = chart.usefulProvisional
    ? "空间建议暂不指定颜色或方位。具体住宅必须结合坐向、采光、道路、动线与实际居住感受。"
    : `空间取象可参考${guide.colors[0]}这一系，但具体住宅仍以坐向、采光、道路、动线与实际居住感受为准。`;
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
    reading.lastLine,
  ]
    .filter((line): line is string => line !== null)
    .join("\n");
}
