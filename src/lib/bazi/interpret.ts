import { COLOR_OF_ELEMENT, DIRECTION_OF_ELEMENT, HOUR_OF_ELEMENT } from "./constants";
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

const GOD_WORK: Record<string, string> = {
  比肩: "適合擁有明確責任邊界、可獨立交付與可署名的工作",
  劫財: "適合協作與資源整合，但合作規則、收益與退出機制必須先寫清楚",
  食神: "適合把知識、技術或想法轉成穩定可交付的產品、服務或流程",
  傷官: "適合改進、表達、設計、優化與需要自主判斷的崗位",
  正財: "適合穩定變現、專業服務、可重複計價與長期客戶關係",
  偏財: "適合機會型收入與資源連接，但必須控制風險與退出成本",
  正官: "適合責任、資格、公開標準明確的職業結構",
  七殺: "適合高壓、快速決策、結果導向且權責清楚的工作環境",
  正印: "適合研究、教學、知識管理與專業支撐，但要設交付截止點",
  偏印: "適合冷門專業、複雜判斷與高專門化任務，但不宜同時開啟過多方向",
};

/**
 * 用月令主氣功能作「工作功能入口」，不再用十神出現次數選 top god。
 * 這只是現實映射入口，不能取代格局、病藥、承載與流通。
 */
function structuralFocusGod(chart: Chart): string {
  const month = p(chart, "month");
  const mainQiGod = month.hide[0]?.shiShen;
  if (mainQiGod && mainQiGod !== "日主") return mainQiGod;
  if (month.shiShenGan && month.shiShenGan !== "日主" && month.shiShenGan !== "—") return month.shiShenGan;
  const day = p(chart, "day");
  return day.hide[0]?.shiShen ?? "食神";
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
        ? "偏互動型的貓或小型犬可作象徵參考；現實仍以空間、時間與照護能力為準。"
        : favorEl === "水"
          ? "偏安靜陪伴型的動物可作象徵參考；現實仍以空間、時間與照護能力為準。"
          : favorEl === "木"
            ? "活動量適中的動物可作象徵參考；現實仍以空間、時間與照護能力為準。"
            : favorEl === "金"
              ? "照護節奏穩定、邊界清楚的動物可作象徵參考；現實條件優先。"
              : "作息穩定、照護需求明確的動物可作象徵參考；現實條件優先。",
  };
}

function weather(chart: Chart): string {
  if (chart.currentDayun) {
    const d = chart.currentDayun;
    return `當前為${d.ganZhi}大運（${d.startYear}–${d.endYear}），流年${chart.currentYear}在此基礎上觸發原局。`;
  }
  if (chart.timeUnknown) {
    return `當前流年為${chart.currentYear}。時辰未定，大運與時柱相關判斷降級。`;
  }
  return `當前流年為${chart.currentYear}。`;
}

function moveScore(text: string): number {
  const move = ["轉", "转", "離", "离", "走", "換", "换", "創", "创", "出國", "出国", "分手", "結束", "结束", "辭", "辞", "跳", "搬", "開", "开"];
  const stay = ["留", "穩", "稳", "等", "維持", "维持", "繼續", "继续", "復合", "复合", "保留"];
  let n = 0;
  for (const k of move) if (text.includes(k)) n += 1;
  for (const k of stay) if (text.includes(k)) n -= 1;
  return n;
}

function decisionBias(chart: Chart): "move" | "hold" | "unknown" {
  const disease = analyzeStructure(chart).remedy.disease;
  if (/壅滯|出口不足|需要出口/.test(disease)) return "move";
  if (/承載不足|壓身|耗身|洩身|根援不足/.test(disease)) return "hold";
  return "unknown";
}

function leanChoice(q: string, chart: Chart): string {
  const parts = q.split(/還是|还是|或者/).map((x) => x.trim()).filter(Boolean);
  const bias = decisionBias(chart);
  if (parts.length >= 2) {
    const a = parts[0]
      .replace(/^(?:我)?(?:應該|应该)?/, "")
      .replace(/^.*[，,、：:]/, "")
      .trim();
    const b = parts[1].replace(/[？?。！!].*$/, "").trim();
    const aMove = moveScore(a);
    const bMove = moveScore(b);

    if (a && b && aMove !== bMove && bias !== "unknown") {
      const moveChoice = aMove > bMove ? a : b;
      const stayChoice = moveChoice === a ? b : a;
      const picked = bias === "move" ? moveChoice : stayChoice;
      const why = bias === "move"
        ? "目前結構病位更偏向壅滯／出口不足，需要的是有效輸出或轉場，而不是單純因為『身旺』就動。"
        : "目前結構病位更偏向承載不足，先保住穩定資源與退出空間，而不是單純因為『身弱』就守。";
      return `僅從已成立的結構病位比較，偏向「${picked}」。${why}最後仍要用收入、責任、地點、時間與退出成本復核。`;
    }

    return `這是二選一比較要求，但目前命盤結構沒有足夠證據只靠「動／不動」分出勝負。請把「${a || "選項 A"}」與「${b || "選項 B"}」的收入、責任、地點、時間投入、穩定性和退出成本放在同一組條件下，再做同盤比較。`;
  }

  if (q.includes("該不該") || q.includes("该不该") || q.includes("要不要")) {
    if (bias === "move") return "目前結構較需要形成有效出口，可以動，但先用小規模試行控制退出成本，不作一次性全押。";
    if (bias === "hold") return "目前結構先處理承載，暫不建議一次性全押；先補穩定資源，再用小規模試行驗證。";
    return "目前結構不足以只靠命盤判定『該／不該』，不強行選邊；先補現實條件再比較。";
  }

  return "目前問題缺少可比較的兩個明確選項，不作強行二選一。";
}

function loveLens(chart: Chart, relation: RelationPref): string {
  const day = p(chart, "day");
  if (relation === "same") {
    return `同性／非傳統關係不硬套異性婚配公式；本題以日支${day.zhi}的關係承載、互動連續性與現實投入為主。`;
  }
  if (chart.gender === "female") {
    return `傳統女命官殺只作伴侶功能候選，實際仍要結合日支${day.zhi}、關係連續性與現實投入。`;
  }
  if (chart.gender === "male") {
    return `傳統男命財星只作伴侶功能候選，實際仍要結合日支${day.zhi}、關係連續性與現實投入。`;
  }
  return `關係判斷以日支${day.zhi}、互動連續性、邊界與現實投入為主。`;
}

function capacityAdvice(disease: string): string {
  if (/壅滯|出口不足/.test(disease)) return "優先建立可驗證輸出與清楚退出路徑，減少無效囤積。";
  if (/承載不足|壓身|耗身|洩身|根援不足/.test(disease)) return "優先選擇資源、規則和支持條件完整的環境，避免超額承擔。";
  return "先保持責任、資源與退出成本可控，再用實際成果驗證是否適配。";
}

export function interpret(question: string, chart: Chart, relation: RelationPref = "unset", palm: PalmReading | null = null): Reading {
  const kind = classifyQuestion(question);
  const dayP = p(chart, "day");
  const monthP = p(chart, "month");
  const timeP = p(chart, "time");
  const useful = joinEl(chart.useful);
  const usefulLine = useful ? `當前僅有流通／調候候選：${useful}；在完整病藥與格局鏈未完成前，不直接等同喜用神。` : "當前正式取用仍未定。";
  const timeLine = isReady(timeP) ? `時柱${timeP.ganZhi}可用於觀察輸出與結果層。` : "時柱未定，涉及輸出方式與晚期結果的判斷降級。";
  const guide = guideFrom(chart);
  const guideLine = chart.usefulProvisional
    ? "顏色、方位、時段與寵物取象暫不下定論。"
    : `生活取象可參考${guide.colors[0]}這一系，但只作輔助。`;
  const structure = analyzeStructure(chart);
  const god = structuralFocusGod(chart);
  const now = weather(chart);
  const advice = capacityAdvice(structure.remedy.disease);

  let directAnswer = "";
  switch (kind) {
    case "past":
      if (palm) {
        const lives = palm.palaces.map((x) => `${x.lifeLabel}：${x.zhi}・${x.star}｜${x.dao}`).join("；");
        directAnswer = [
          palm.firstSentence,
          lives ? `四宮：${lives}。` : "",
          palm.minggongNote,
          palm.cause,
          palm.fruit,
          palm.seed,
          palm.boundary,
        ].filter(Boolean).join(" ");
      } else {
        directAnswer = "這題需要按一掌經四宮獨立排，不用子平反推六道。當前資料不足時直接不作判定。";
      }
      break;
    case "home":
      directAnswer = `結論：現有出生盤只能判斷個人承載與環境偏好，不能代替具體住宅的坐向、採光、道路與動線。若你問的是某套房或店面是否適合，必須補該空間資料；在此之前不硬定方位。${guideLine}`;
      break;
    case "health":
      directAnswer = `結論：命盤不能診斷疾病。當前只能從承載層看，日主${chart.dayMaster}${chart.dayMasterElement}在${monthP.zhi}月令下為「${chart.strength.tendency}」。${now}若現實已出現持續疼痛、失眠、明顯乏力或其他症狀，先按醫療路徑處理；命理只補充作息與壓力管理。`;
      break;
    case "love":
      directAnswer = `結論：這段關係是否值得推進，不看「桃花詞」本身，先看對方是否持續回應、是否有現實投入、是否願意明確下一步。${loveLens(chart, relation)}${now}若連續性與投入不足，就不把短期情緒升格為穩定關係。`;
      break;
    case "career":
      directAnswer = `結論：職業判斷以「能否形成穩定做功與承載」為核心。當前主格為${structure.label}${structure.established ? "" : "方向"}，結構完成度為${structure.completion.label}；月令主氣功能落在${god}，可參考「${GOD_WORK[god] ?? "把判斷轉成可驗證成果"}」。${advice} ${now}`;
      break;
    case "money":
      directAnswer = `結論：財務不能只看「財星多不多」，先看日主能否承財、是否有穩定輸出和可重複變現路徑。當前主格為${structure.label}${structure.established ? "" : "方向"}，${structure.remedy.disease}；因此先處理結構上的承載與流通，再談擴張。${usefulLine}`;
      break;
    case "choice":
      directAnswer = leanChoice(question, chart);
      break;
    case "timing":
      directAnswer = `結論：時間題必須用原局 + 大運 + 流年判斷，不能單憑一個流年字直接定「必成日期」。${now}${chart.currentDayun ? ` 當前大運提供的是${chart.currentDayun.ganZhi}這一階段背景；具體到月份，需要再看該問題所屬領域與流月是否形成同向觸發。` : " 大運資料不足時，時間結論降級。"}`;
      break;
    default:
      directAnswer = `結論：這張盤當前以${structure.label}${structure.established ? "" : "方向"}為主，結構完成度為${structure.completion.label}，日主${chart.dayMaster}${chart.dayMasterElement}的承載基線為「${chart.strength.tendency}」。核心不是羅列更多術語，而是看格局、病藥、流通與承載是否形成同一條有效鏈。`;
  }

  const rhythm = `結構摘要：日主${chart.dayMaster}${chart.dayMasterElement}，月令${monthP.zhi}，主格${structure.label}${structure.established ? "" : "方向"}，完成度${structure.completion.label}。${structure.remedy.disease}；${structure.remedy.medicine}${timeLine}`;
  const work = `${GOD_WORK[god] ?? "把判斷轉成可驗證成果"}。職業選擇優先比較：責任是否清楚、成果是否可衡量、資源是否足夠、退出成本是否可控。`;
  const love = `${loveLens(chart, relation)}關係只看可驗證行為：聯繫是否連續、投入是否對等、邊界是否清楚、下一步是否明確。`;
  const money = "財務優先看承載、現金流與退出成本。命盤只提供結構節奏，不替代真實收入、成本和風險數據。";
  const body = "身體層只談承載與生活節奏，不下疾病診斷。現實症狀持續或加重時，以醫療評估優先。";
  const home = chart.usefulProvisional
    ? "空間建議暫不指定顏色或方位。具體住宅必須結合坐向、採光、道路、動線與實際居住感受。"
    : `空間取象可參考${guide.colors[0]}這一系，但具體住宅仍以坐向、採光、道路、動線與實際居住感受為準。`;
  const action = kind === "choice"
    ? "把兩個選項放進同一張比較表：收入／資源、責任、時間、地點、穩定性、退出成本；命盤傾向只作其中一列。"
    : kind === "career"
      ? "把當前工作或候選崗位寫成四項：責任、可交付成果、資源支持、退出成本；優先處理最明顯的結構短板。"
      : kind === "money"
        ? "先列主收入、固定支出、可承受風險與退出成本，再決定是否擴張。"
        : kind === "love"
          ? "只核對對方連續三次實際行為，不用宣言代替投入。"
          : kind === "health"
            ? "記錄睡眠、症狀與負荷變化；持續或加重時優先就醫。"
            : "把本題最核心的一個結論轉成一個可驗證動作，執行後再用現實反饋復核。";
  const decree = "命理結論只用於識別結構、條件與風險；真正能改變結果的，是資源配置、邊界、技能、行動與現實反饋。";
  const lastLine = kind === "choice"
    ? "若兩個選項缺少可比較條件，寧可不強選，也不製造一個看似確定的答案。"
    : kind === "timing"
      ? "時間結論必須等結構與歲運同向觸發，不能把單一流年當保證。"
      : `本題以${structure.label}${structure.established ? "" : "方向"}、${structure.remedy.disease}與實際承載作為主要判斷軸。`;

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
    "昭梧｜白話完整報告",
    "",
    "一、直接回答",
    reading.directAnswer,
    "",
    "二、排盤資料",
    chart.provenance,
    `農曆：${chart.lunarDate}`,
    `出生地：${chart.cityLabel}`,
    chart.liveCityLabel ? `現居地：${chart.liveCityLabel}（只作環境層參考，不改四柱）` : null,
    chart.hemisphere === "S" ? "南半球季相只作環境校正，不反轉月令與四柱。" : null,
    "",
    pillars,
    `日主 ${chart.dayMaster}${chart.dayMasterElement}　月令 ${chart.monthBranch}　胎元 ${chart.taiyuan}　命宮 ${chart.minggong}`,
    chart.strength.summary,
    "",
    "三、核心結構",
    reading.rhythm,
    "",
    "四、與本題直接相關的現實解釋",
    reading.kind === "career" ? `工作｜${reading.work}` : null,
    reading.kind === "love" ? `感情｜${reading.love}` : null,
    reading.kind === "money" ? `財務｜${reading.money}` : null,
    reading.kind === "health" ? `身心｜${reading.body}` : null,
    reading.kind === "home" ? `家宅｜${reading.home}` : null,
    "",
    "五、一個優先行動",
    reading.action,
    "",
    "六、限制",
    usefulLimit,
    reading.lastLine,
  ]
    .filter((line): line is string => line !== null)
    .join("\n");
}
