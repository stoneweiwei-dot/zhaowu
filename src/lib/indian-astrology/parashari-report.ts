import type { Locale } from "@/lib/i18n";
import {
  type JyotishChartResult, type Graha, type ZodiacSign,
  SIGNS, GRAHAS,
} from "./parashari-engine";

const enGraha: Record<Graha, string> = {
  Sun: "Sun", Moon: "Moon", Mars: "Mars", Mercury: "Mercury",
  Jupiter: "Jupiter", Venus: "Venus", Saturn: "Saturn",
  Rahu: "Rahu", Ketu: "Ketu",
};
const zhGraha: Record<Graha, string> = {
  Sun: "太陽", Moon: "月亮", Mars: "火星", Mercury: "水星",
  Jupiter: "木星", Venus: "金星", Saturn: "土星",
  Rahu: "羅睺", Ketu: "計都",
};
const zhSigns = ["牡羊", "金牛", "雙子", "巨蟹", "獅子", "處女", "天秤", "天蠍", "射手", "摩羯", "水瓶", "雙魚"];
const cnSigns = ["白羊", "金牛", "双子", "巨蟹", "狮子", "处女", "天秤", "天蝎", "射手", "摩羯", "水瓶", "双鱼"];

export const indianGraha = (g: Graha, locale: Locale) => locale === "en" ? enGraha[g] : zhGraha[g];
export const indianSign = (s: ZodiacSign | null | undefined, locale: Locale) => s == null
  ? "—" : locale === "en" ? SIGNS[s] : locale === "zh-Hans" ? cnSigns[s] : zhSigns[s];

const text = (locale: Locale, hant: string, hans: string, en: string) =>
  locale === "en" ? en : locale === "zh-Hans" ? hans : hant;

export type ReadingUnit = {
  title: string;
  evidence: string;
  meaning: string;
  benefit: string;
  imbalance: string;
  action: string;
};

const vyayaThemes = [
  ["自我界線與精力配置", "自我边界与精力配置", "Personal boundaries and energy"],
  ["資源與家庭支出", "资源与家庭支出", "Resources and family spending"],
  ["幕後學習與溝通", "幕后学习与沟通", "Private learning and communication"],
  ["居所、遷移與內心安定", "居所、迁移与内心安定", "Home, relocation and inner rest"],
  ["研究、創作與投入", "研究、创作与投入", "Research, creativity and investment"],
  ["日常勞務與壓力消化", "日常劳务与压力消化", "Daily duties and managing pressure"],
  ["伴侶關係與個人空間", "伴侣关系与个人空间", "Partnership and privacy"],
  ["共同資源與深層轉化", "共同资源与深层转化", "Shared resources and transition"],
  ["信仰、遠行與師長", "信仰、远行与师长", "Beliefs, travel and mentors"],
  ["職業幕後角色與海外發展", "职业幕后角色与海外发展", "Behind-the-scenes or international career"],
  ["社群、長期願望與付出", "社群、长期愿望与付出", "Networks, aspirations and contribution"],
  ["獨處、慈善與精神生活", "独处、慈善与精神生活", "Retreat, giving and inner life"],
] as const;

const houseSign = (lagna: ZodiacSign, house: number) => ((lagna + house - 1) % 12) as ZodiacSign;

export function createParashariReading(result: JyotishChartResult, locale: Locale): {
  directAnswer: string;
  nextStep: string;
  scriptTone: string;
  units: ReadingUnit[];
  childhoodWindows: string[];
} {
  const chart = result.d1;
  const lagna = chart?.lagna.sign ?? null;
  const moon = chart?.planets.Moon;
  const sun = chart?.planets.Sun;
  const twelve = result.twelfthLord;
  const units: ReadingUnit[] = [];

  const layer = (title: string, evidence: string, meaning: string, benefit: string, imbalance: string, action: string) => {
    units.push({ title, evidence, meaning, benefit, imbalance, action });
  };
  if (lagna !== null) {
    layer(
      text(locale, "一｜本命盤與承載", "一｜本命盘与承载", "I · Natal chart and capacity"),
      `Lagna ${indianSign(lagna, locale)}; Moon ${indianSign(moon?.sign, locale)} / H${moon?.house ?? "?"}; Sun ${indianSign(sun?.sign, locale)} / H${sun?.house ?? "?"}`,
      text(locale, "上升界定現實情境，月亮呈現感受與適應，太陽呈現自我定位。三者需連同宮主、照會及歲運分析，不可單星定性。", "上升界定现实情境，月亮呈现感受与适应，太阳呈现自我定位。必须连同宫主、照会和岁运分析，不能单星定性。", "Ascendant locates life topics, Moon describes felt adaptation, and Sun describes agency; none works as a stand-alone verdict."),
      text(locale, "可比較外在角色與內在需要是否協調。", "可比较外在角色与内在需要是否协调。", "Compare public roles with private needs."),
      text(locale, "目前不含完整尊貴度、燃燒、相位與六力驗證，不能判定強弱高低。", "尚无完整尊贵度、燃烧、相位和六力验证，不能判定强弱高低。", "Full dignity, combustion, aspects and Shadbala are not verified."),
      text(locale, "核對你在工作、家庭與獨處時的真實狀態。", "核对工作、家庭和独处时的真实状态。", "Validate against everyday experience."),
    );
    layer(
      text(locale, "二｜原生家庭三個觀察點", "二｜原生家庭三个观察点", "II · Three family indicators"),
      `H2 ${indianSign(houseSign(lagna, 2), locale)}; H4 ${indianSign(houseSign(lagna, 4), locale)}; H9 ${indianSign(houseSign(lagna, 9), locale)}; Moon H${moon?.house ?? "?"}; Sun H${sun?.house ?? "?"}`,
      text(locale, "二宮代表早年資源、價值與言語環境；四宮代表家庭安全感、照料與母系經驗；九宮與太陽代表父系觀念、師長及傳承。這些是傳統觀察場景，不是父母真實行為紀錄。", "二宫看早年资源与价值，四宫看家庭安全感与照料，九宫和太阳看父系观念与传承。它们不是父母真实行为记录。", "House 2 symbolizes early resources, House 4 care and belonging, House 9/Sun inherited beliefs; these are not records of your parents' actions."),
      text(locale, "有助於整理自己接受過的支持與價值觀。", "有助于整理接受过的支持和价值观。", "Can structure reflection on inherited resources."),
      text(locale, "不可由落宮推斷父母必定冷漠、強勢或曾有特定創傷。", "不可由落宫推断父母必定冷漠、强势或有特定创伤。", "Do not infer abuse, dominance or trauma from placements."),
      text(locale, "以實際童年記憶和家庭互動作獨立驗證。", "以真实童年记忆和家庭互动独立验证。", "Validate independently with remembered events."),
    );
  }
  if (result.d12 && lagna !== null) {
    const d12 = result.d12;
    layer(
      text(locale, "三｜D-12 父母與祖輩分盤", "三｜D-12 父母与祖辈分盘", "III · D12 parents and ancestry"),
      `D12 Lagna ${indianSign(d12.lagna, locale)} · Moon ${indianSign(d12.planets.Moon, locale)} · Sun ${indianSign(d12.planets.Sun, locale)} · Jupiter ${indianSign(d12.planets.Jupiter, locale)}`,
      text(locale, "D-12 專看家族與祖輩象意，必須服從 D-1 的主要方向。不能單憑某顆星的 D-12 落位改寫主盤。", "D-12 用于家族与祖辈象意，不能仅凭分盘落位推翻 D-1。", "D12 is an ancestry lens subordinate to D1; its placements do not overturn the natal chart."),
      text(locale, "可進一步比對親情、傳承與家中不同角色的記憶。", "可比较亲情、传承和不同家庭角色的记忆。", "Compare observed family patterns."),
      text(locale, "分盤對出生分鐘較敏感，不用作客觀家族業力或血緣事件證明。", "分盘对出生分钟敏感，不能证明家族业力或血缘事件。", "Sensitive to time; cannot prove literal inherited karma."),
      text(locale, "先以本命盤確認主題，再用分盤提出可反證的問題。", "先用本命盘确认主题，再用分盘提出可反证的问题。", "Use D12 to ask testable questions, not assert events."),
    );
  }
  if (twelve) {
    const theme = vyayaThemes[twelve.placedInHouse - 1];
    layer(
      text(locale, "四｜12 宮主的流向", "四｜12 宫主的流向", "IV · Lord of the twelfth"),
      `Vyaya lord ${indianGraha(twelve.lord, locale)} → H${twelve.placedInHouse} (${indianSign(twelve.placedInSign, locale)})`,
      text(locale, `12 宮主飛入第 ${twelve.placedInHouse} 宮，傳統上表示消耗、獨處、海外或奉獻的議題流向「${theme[0]}」；是研究方向，不等於確定損失。`,
        `12 宫主飞入第 ${twelve.placedInHouse} 宫，传统上表示消耗、独处、海外或奉献的议题转向「${theme[1]}」；不是必定损失。`,
        `The twelfth lord enters H${twelve.placedInHouse}, connecting expenditure, retreat or service with ${theme[2]}; loss is not predetermined.`),
      text(locale, "可轉成長期投入、研究或善用私人空間。", "可转化为长期投入、研究或独处。", "May channel resources into reflection or service."),
      text(locale, "吉凶還須看功能吉凶、尊貴度、照會、瑜伽及大運；此處未全數驗證。", "仍须结合功能吉凶、尊贵度、照会、瑜伽和大运；此处未全部验证。", "Strength, aspects, yogas and timing are required before outcome claims."),
      text(locale, "列出這個生活領域的真實投入與消耗，檢查是否值得調整。", "记录这个领域的真实投入和消耗。", "Audit real costs and meaningful investments."),
    );
  }
  if (result.d6) {
    layer(
      text(locale, "五｜D-6 日常摩擦", "五｜D-6 日常摩擦", "V · D6 daily friction"),
      `D6 Lagna ${indianSign(result.d6.lagna, locale)}, Mars ${indianSign(result.d6.planets.Mars, locale)}, Saturn ${indianSign(result.d6.planets.Saturn, locale)}`,
      text(locale, "六分盤是疾病、責任、競爭和日常摩擦的傳統象徵層，不能直接推斷器官疾病。", "六分盘是疾病、责任、竞争和日常摩擦的传统象征层，不作医学诊断。", "D6 is a symbolic layer for daily burdens, illness themes and competition, never a medical diagnosis."),
      text(locale, "適合觀察工作節奏、分工及壓力處理方式。", "可观察工作节奏、分工及压力管理。", "Reflect on routine and workload."),
      text(locale, "未計算完整受克、廟旺與歲運，不輸出疾病預測。", "未核完整受克、庙旺与岁运，不输出疾病预测。", "No condition predictions without further verified structure."),
      text(locale, "檢查作息與現實工作條件，有症狀時尋求醫療意見。", "核对作息与工作条件，有症状时咨询医生。", "Use medical care for symptoms, not astrology."),
    );
  }
  const periods = result.dasha?.periods ?? [];
  const childhoodWindows = periods.filter(p => p.endsAtAgeYears > 0 && p.startsAtAgeYears < 18)
    .slice(0, 3).map(p => {
      const a = Math.max(0, p.startsAtAgeYears).toFixed(1);
      const b = Math.min(18, p.endsAtAgeYears).toFixed(1);
      return `${indianGraha(p.lord, locale)} · ${a}–${b} ${text(locale,"歲","岁","years")} · ${p.startMonth ?? "?"} → ${p.endMonth ?? "?"}`;
    });
  if (periods.length) {
    layer(
      text(locale, "六｜原生家庭與歲運驗證", "六｜原生家庭与岁运验证", "VI · Family timing verification"),
      childhoodWindows.join(" / "),
      text(locale, "以上只列童年 Maha Dasha 背景窗口。事件必須有本命、分盤與子運支持，再經本人確認；不會直接編出兩三件童年往事。", "仅列童年大运背景窗口。必须有本命、分盘和子运的依据，再由本人确认；不虚构童年事件。", "These are childhood Maha-Dasha windows, not invented events. Each proposed event needs corroboration and personal verification."),
      text(locale, "可用來按年份整理搬家、求學、親子互動等記憶。", "可按年份整理搬家、求学与亲子互动等经历。", "Build a dated, evidence-based personal timeline."),
      text(locale, "年月範圍受生時誤差與 365.25 日大運年制影響。", "年月范围受生时误差与 365.25 日大运年制影响。", "Dates follow the declared 365.25-day convention and time uncertainty."),
      text(locale, "先驗證年月，再考慮具體事件解讀。", "先验证年月，再讨论具体事件。", "Verify dates before interpreting experiences."),
    );
  }
  layer(
    text(locale, "七｜家族象意的安全界線", "七｜家族象意的安全边界", "VII · Ancestral-symbol limits"),
    text(locale, "Pitra Dosha / Matru Dosha / Balarishta：未完成逐項古法成立條件查核。Shadbala：", "Pitra Dosha / Matru Dosha / Balarishta：未完成逐项古法条件核对。Shadbala：", "Pitra / Matru / Balarishta conditions are not fully audited. Shadbala: ") +
      (result.shadbala ? text(locale,"有完整資料","有完整数据","available") : text(locale,"尚未提供","尚未提供","unavailable")),
    text(locale, "這些是文化術語，不是已證實的父系詛咒、母系創傷或孩童生存風險。亦不可由命盤指定誰是「絕對掌控者」。", "这些是文化术语，不是已证实的父系诅咒、母系创伤或儿童风险，也不能判断谁是绝对掌控者。", "These are cultural terms, not proof of curses, trauma, childhood harm or an absolutely dominant parent."),
    text(locale, "可以有意識地辨認家庭傳承中值得保留的價值。", "可以整理值得保留的家族价值。", "Preserve inherited strengths consciously."),
    text(locale, "無完整六力與父母現實資料時，拒絕下強制性的父母人格判決。", "缺少完整六力与现实资料时，不判断父母人格。", "No parental diagnosis without real evidence."),
    text(locale, "以當事人的真實經驗、尊重與界線作最後依據。", "以真实经验、尊重和边界为准。", "Prioritize lived evidence and boundaries."),
  );
  const directAnswer = lagna === null
    ? text(locale, "出生時間不足以確定上升與原生家庭宮位，目前只展示可保持穩定的行星星座；沒有足夠依據判定家族模式。", "出生时间不足以确定上升和原生家庭宫位，只展示稳定的行星星座；不判断家族模式。", "Birth time does not resolve the ascendant or family houses. Stable planetary signs only; no family verdict.")
    : text(locale,
      `你的 D-1 上升為${indianSign(lagna, locale)}，月亮位於第 ${moon?.house ?? "?"} 宮，太陽位於第 ${sun?.house ?? "?"} 宮。原生家庭分析須同時檢查二、四、九宮與 D-12，不能僅憑一個落宮就判定父母。`,
      `你的 D-1 上升为${indianSign(lagna, locale)}，月亮在第 ${moon?.house ?? "?"} 宫，太阳在第 ${sun?.house ?? "?"} 宫。家庭分析需要二、四、九宫和 D-12 共同核对。`,
      `D1 rises in ${indianSign(lagna, locale)}; Moon is in H${moon?.house ?? "?"} and Sun in H${sun?.house ?? "?"}. Family analysis requires H2/H4/H9 and D12 together.`);
  return {
    directAnswer,
    nextStep: text(locale, "請先核對出生時間來源，再用真實家庭經驗驗證盤面。", "请先核对出生时间来源，再用真实家庭经历验证盘面。", "Confirm the birth-time source, then test chart themes against actual family history."),
    scriptTone: text(locale, "本命盤描繪個人如何體會家庭資源、情緒照顧與傳承期望。它是可反證的文化解讀，不是未經訪談的家庭紀錄。", "本命盘描绘个人如何感受家庭资源、情绪照顾和传承期待。它是可检验的文化解读，不是家庭事实记录。", "The natal chart offers a symbolic framework for resources, care and inherited expectations, not a record of events."),
    units,
    childhoodWindows,
  };
}

export function findActivePeriods(result: JyotishChartResult, nowMs = Date.now()) {
  const periods = result.dasha?.periods ?? [];
  const top = periods.find(p => Date.parse(p.startsAtUtc) <= nowMs && Date.parse(p.endsAtUtc) > nowMs);
  const antar = top?.children?.find(p => Date.parse(p.startsAtUtc) <= nowMs && Date.parse(p.endsAtUtc) > nowMs);
  const pratyantar = antar?.children?.find(p => Date.parse(p.startsAtUtc) <= nowMs && Date.parse(p.endsAtUtc) > nowMs);
  return [top, antar, pratyantar].filter((x): x is NonNullable<typeof x> => !!x);
}

export const indianPlanets = GRAHAS;
