import { HIDDEN, tenGod } from "@/lib/bazi/calendar";
import type { Chart, Reading } from "@/lib/bazi/types";

export const MONTH_STAGE_FEEDBACK_POLICY = {
  id: "ZW-MONTH-STAGE-FEEDBACK-1.0",
  title: "月令舞台 × 現實反饋校驗",
  status: "production",
  priority: 8,
  rules: [
    "從化真假是前置閘門；普通格局進入標準路徑後，月令是第一入口。",
    "月令用來判斷季節、主氣、資源環境與人生舞台，但不得宣稱固定佔八成或任何百分比。",
    "月令主氣必須連同是否透干、有根、被合沖刑害與全局調候一起判斷，不得只見月支就定全局。",
    "月令之後仍須依次完成調候、根氣透藏、格局體用、病藥、流通制化與承載旺衰，才可正式取用。",
    "神煞只作輔助象意；不得把某一月支固定等同某一神煞，例如不得寫成『酉就是驛馬』。",
    "現實映射必須由命局能力機制、病藥功能、具體工作內容與現實條件共同建立；單一生克象不得直接推出職業。",
    "使用者要求校準、定盤或驗證時，請收集3至5件可核對的重大事件，優先採用年份明確、影響長期結構的事件。",
    "反饋不吻合不得強行圓解釋；固定回溯順序為：校時→校主氣→校從化→校調候→校病藥→校現實映射。",
    "同一環節修正兩輪仍不吻合，停止擴張敘事並標記系統解釋限度。",
    "未來歲運只負責觸發原局結構；不得為迎合反饋而事後改寫原局。",
  ],
  guards: [
    "禁止月令固定八成／80%權重。",
    "禁止月支直接固定對應十二神煞。",
    "禁止用單一五行生克象直接斷具體職業。",
    "禁止用客戶反饋反向迎合、無限修改喜忌。",
  ],
} as const;

const SEASON: Record<string, string> = {
  寅: "初春生發", 卯: "仲春生發", 辰: "季春轉化",
  巳: "初夏升溫", 午: "仲夏炎盛", 未: "季夏承化",
  申: "初秋收斂", 酉: "仲秋收斂", 戌: "季秋收束",
  亥: "初冬收藏", 子: "仲冬寒藏", 丑: "季冬蓄藏",
};

const STAGE_BY_GOD: Record<string, string> = {
  比肩: "同類競合、自主承擔與自我定位",
  劫財: "同輩競爭、資源分流與合作邊界",
  食神: "輸出、作品、技術轉化與穩定表達",
  傷官: "改進、辨錯、創新與對規則的重新設計",
  正財: "穩定交換、可量化成果與現實責任",
  偏財: "機會、資源整合、流動收入與外部市場",
  正官: "規則、責任、名位與可被評價的結構",
  七殺: "壓力、效率、決斷與風險承擔",
  正印: "學習、資質、保護、知識與制度支撐",
  偏印: "專門知識、非標準解法、研究與內在判斷",
};

const CALIBRATION_RE = /(校準|校准|驗證|验证|定盤|定盘|時辰|时辰|準不準|准不准|核對|核对|反推|反馈|反饋)/;

function monthPillar(chart: Chart) {
  return chart.pillars.find((pillar) => pillar.key === "month");
}

function visibleMonthMainQi(chart: Chart, mainStem: string): boolean {
  return chart.pillars.some(
    (pillar) => pillar.ready !== false && pillar.key !== "day" && Boolean(pillar.gan) && pillar.gan === mainStem,
  );
}

export function buildMonthStageText(chart: Chart): string {
  const month = monthPillar(chart);
  const branch = chart.monthBranch || month?.zhi || "未定";
  const mainStem = HIDDEN[branch]?.[0] ?? "未定";
  const god = mainStem === "未定" ? "未定" : tenGod(chart.dayMaster, mainStem);
  const seasonal = SEASON[branch] ?? "季節狀態待核";
  const exposed = mainStem !== "未定" && visibleMonthMainQi(chart, mainStem);
  const stage = STAGE_BY_GOD[god] ?? "外部資源、生活環境與現實舞台";

  return [
    `【月令舞台】月令${branch}，主氣${mainStem}${god}，處於${seasonal}；它先規定命局的季節背景與資源舞台，現實上優先看${stage}。`,
    exposed
      ? `主氣${mainStem}已透到天干，舞台力量較容易直接顯化。`
      : `主氣${mainStem}未直接透干，不能只憑月支把它當成全部人生結論。`,
    "月令是提綱，不使用固定八成或80%權重；正式結論仍須經調候、根氣透藏、格局體用、病藥、流通制化與承載旺衰共同收束。",
  ].join("");
}

export function buildFeedbackCalibrationText(question: string): string {
  if (!CALIBRATION_RE.test(question)) return "";
  return "【現實反饋校驗】請提供3至5件年份可核對的重大事件（例如升學、婚戀、工作轉折、出國、手術或重大家庭變動）。若反饋不吻合，按校時→校主氣→校從化→校調候→校病藥→校現實映射回溯；同一環節兩輪仍不吻合，停止硬湊並標記【系統解釋限度】。";
}

export function applyMonthStageFeedbackPolicy(question: string, chart: Chart, reading: Reading): Reading {
  const monthStage = buildMonthStageText(chart);
  const feedback = buildFeedbackCalibrationText(question);
  const rhythm = [reading.rhythm, monthStage, feedback].filter(Boolean).join(" ");
  return { ...reading, rhythm };
}

export function monthStagePolicyViolations(text: string): string[] {
  const violations: string[] = [];
  if (/(月令).{0,12}(八成|80\s*%)/i.test(text)) violations.push("MONTH_FIXED_80_PERCENT");
  if (/[子丑寅卯辰巳午未申酉戌亥].{0,6}(就是|等於|等于|固定對應|固定对应).{0,8}(劫煞|災煞|灾煞|天煞|地煞|年煞|月煞|亡神|將星|将星|攀鞍|驛馬|驿马|六害|華蓋|华盖)/.test(text)) {
    violations.push("FIXED_MONTH_BRANCH_SHENSHA");
  }
  return violations;
}
