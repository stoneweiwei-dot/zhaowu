import type { AppLocale, Chart, Element, Reading } from "@/lib/bazi/types";

export const TEN_GOD_FIVE_ELEMENT_INSTRUCTION = {
  id: "ZW-BAZI-TEN-GOD-FIVE-ELEMENT-1.0",
  title: "十神 × 五行行為氣質交叉分析協議",
  status: "production",
  layer: "bazi",
  priority: 6,
  purpose:
    "十神先定功能，五行再定表現氣質；以正偏、喜忌旺衰、透藏、根氣與坐支校正，只作行為模式切片，不以單格替代完整命局。",
} as const;

type Family = "比劫" | "食傷" | "財星" | "官殺" | "印星";
type Style = { positive: string; excess: string; enPositive: string; enExcess: string };
type Profile = {
  god: string;
  family: Family;
  element: Element;
  score: number;
  visible: number;
  hidden: number;
  daySeat: boolean;
};

const GOD_FAMILY: Record<string, Family> = {
  比肩: "比劫",
  劫財: "比劫",
  劫财: "比劫",
  食神: "食傷",
  傷官: "食傷",
  伤官: "食傷",
  正財: "財星",
  正财: "財星",
  偏財: "財星",
  偏财: "財星",
  正官: "官殺",
  七殺: "官殺",
  七杀: "官殺",
  正印: "印星",
  偏印: "印星",
};

const GOD_EN: Record<string, string> = {
  比肩: "Peer",
  劫財: "Rob Wealth",
  劫财: "Rob Wealth",
  食神: "Eating God",
  傷官: "Hurting Officer",
  伤官: "Hurting Officer",
  正財: "Direct Wealth",
  正财: "Direct Wealth",
  偏財: "Indirect Wealth",
  偏财: "Indirect Wealth",
  正官: "Direct Officer",
  七殺: "Seven Killings",
  七杀: "Seven Killings",
  正印: "Direct Resource",
  偏印: "Indirect Resource",
};

const ELEMENT_EN: Record<Element, string> = {
  木: "Wood",
  火: "Fire",
  土: "Earth",
  金: "Metal",
  水: "Water",
};

const STYLE: Record<Family, Record<Element, Style>> = {
  比劫: {
    木: { positive: "直立不彎，有擔當、重原則，競爭時講道義", excess: "過則一根筋、不肯退讓", enPositive: "principled, responsible and direct, with a strong sense of fairness in competition", enExcess: "can become rigid and unwilling to yield" },
    火: { positive: "熱情外擴，主動站台、容易帶動群體", excess: "過則急躁衝動、三分鐘熱度，幫人幫到燒自己", enPositive: "outgoing, supportive and able to mobilise a group", enExcess: "can become impulsive, short-lived in effort, or overextend for others" },
    土: { positive: "穩重守攤，靠得住、慢熱", excess: "過則固執己見、不願變，穩得住但難推動", enPositive: "steady, dependable and slow to commit", enExcess: "can become stubborn and resistant to change" },
    金: { positive: "硬碰硬，乾脆、講邊界、重義氣", excess: "過則冷峻好勝、說話刮人，競爭意識過強", enPositive: "decisive, boundary-conscious and loyal", enExcess: "can become combative, cold or verbally cutting" },
    水: { positive: "流動善變，圓滑合群、適應快", excess: "過則自我中心、情緒化，立場容易漂移", enPositive: "adaptive, socially fluid and quick to adjust", enExcess: "can become self-focused, emotionally changeable or inconsistent" },
  },
  食傷: {
    木: { positive: "舒展有條理，做內容像生長，適合長線輸出", excess: "過則空談理想、光說不落地", enPositive: "structured, developmental expression suited to sustained output", enExcess: "can stay at the level of ideals without execution" },
    火: { positive: "現場感強，能講能演、感染力強", excess: "過則浮躁、嘴比腦快；傷官偏火時更要防尖刻招是非", enPositive: "strong presence, presentation ability and emotional reach", enExcess: "can become hasty, speak before thinking, or turn overly sharp" },
    土: { positive: "踏實手藝型，作品能承重、能做實事", excess: "過則慢、散、懶，食神偏土時尤其要防拖延享樂", enPositive: "practical, craft-oriented output that can carry real weight", enExcess: "can become slow, diffuse, complacent or procrastinating" },
    金: { positive: "鋒利精準，口才像刀，偏技術、主持、銷售型", excess: "過則言語傷人、挑刺成癖", enPositive: "precise, technical and verbally sharp, useful in presenting or selling", enExcess: "can become overly critical or hurtful in speech" },
    水: { positive: "靈動多變，偏策劃、寫作與人際表達", excess: "過則浮蕩多情、想得多做得少，情緒容易進入表達", enPositive: "fluid, imaginative and suited to planning, writing and interpersonal expression", enExcess: "can become scattered, over-ideational or emotionally reactive in expression" },
  },
  財星: {
    木: { positive: "偏長期客戶、內容流量與培育型業務", excess: "過則帳面好看手裡空，重情面而漏財", enPositive: "favours long-cycle clients, audience growth and cultivation-based business", enExcess: "can look strong on paper while cash leaks through relationships or over-nurturing" },
    火: { positive: "偏曝光、品牌、培訓等可見度變現，願意為場面投入", excess: "過則面子財、燒錢賺吆喝", enPositive: "favours monetising visibility, branding, training and public presence", enExcess: "can overspend for image, attention or spectacle" },
    土: { positive: "偏房產、實體、穩定積累與可承載資源", excess: "過則只敢壓死資產，錯過流動機會", enPositive: "favours tangible assets, property, stable accumulation and durable resources", enExcess: "can over-concentrate in illiquid assets and miss flexible opportunities" },
    金: { positive: "偏金融、機械、標準化行業，算帳快、取捨明確", excess: "過則把關係也計價；偏財偏金時要特別設風險邊界", enPositive: "favours finance, machinery, standards, fast accounting and clear trade-offs", enExcess: "can over-price relationships or take excessive opportunity risk" },
    水: { positive: "偏信息差、渠道與高流動性的資源交換", excess: "過則容易變成流水財或高風險機會追逐；來源中的橫財／博彩等詞只作風險提示，不作行為定論", enPositive: "favours information advantages, channels and highly mobile resource exchange", enExcess: "can become unstable cash flow or repeated pursuit of high-risk opportunities; gambling language is a risk flag, not a behavioural verdict" },
  },
  官殺: {
    木: { positive: "偏成長指標、培養要求與以成材為目標的約束", excess: "過則把規矩掛在『你應該成才』上，逼人伸展", enPositive: "uses growth targets and developmental standards as pressure or structure", enExcess: "can turn development into constant pressure to improve" },
    火: { positive: "偏名分、場面、急令與被看見的責任", excess: "過則精神繃緊，把被看見誤當被認可", enPositive: "works through status, visibility, urgency and public responsibility", enExcess: "can create mental overdrive or confuse visibility with recognition" },
    土: { positive: "偏沉重但可承擔的責任、創業擔子與層級壓力", excess: "過則把責任全扛自己身上，形成長期積壓", enPositive: "works through sustained responsibility, business burden and hierarchical pressure", enExcess: "can lead to carrying too much alone and accumulating pressure" },
    金: { positive: "偏制度、標準、軍警司法式的清楚邊界", excess: "過則嚴苛冷酷；七殺偏金時尤其要看是否有制化與承載", enPositive: "works through explicit standards, rules, enforcement and sharp boundaries", enExcess: "can become severe or unforgiving; strong Seven Killings still requires control and capacity" },
    水: { positive: "偏政治、謀略、暗規則與資訊環境中的壓力", excess: "過則容易對暗規則與人際風險過度警覺；所謂『小人』只作待驗證情境，不直接指認他人", enPositive: "works through strategy, politics, hidden rules and information-sensitive pressure", enExcess: "can become hyper-alert to hidden motives or interpersonal risk; it does not identify a real enemy" },
  },
  印星: {
    木: { positive: "偏書本、證書、師承與包裹式支持", excess: "過則靠長輩靠老本，正印偏木時容易只讀不做", enPositive: "favours books, credentials, mentors and protective support", enExcess: "can over-rely on inherited support or remain in study without application" },
    火: { positive: "偏學校、文化、奉獻與精神信念", excess: "過則空想、躁而散；得用時可轉成思想與傳播能力", enPositive: "favours education, culture, service and meaning-based belief", enExcess: "can become idealistic, restless or diffuse; when useful it can support thought leadership" },
    土: { positive: "偏房子、後台、教師與穩定庇護", excess: "過則戀窩、少動腦，容易習慣被投餵", enPositive: "favours stable backing, shelter, teaching and institutional support", enExcess: "can become overly comfortable, passive or dependent on support" },
    金: { positive: "偏契約、硬知識、法律文本與可驗證依據", excess: "過則保護方式偏冷，偏印偏金時容易孤高自封", enPositive: "favours contracts, hard knowledge, legal text and verifiable evidence", enExcess: "can become emotionally cool, isolated or over-confident in specialised knowledge" },
    水: { positive: "偏醫藥、謀略、聰敏與玄學悟性", excess: "過則多疑、內收；偏印偏水時尤其要防封閉孤僻", enPositive: "favours medicine, strategy, quick understanding and metaphysical intuition", enExcess: "can become suspicious, inward or isolated, especially with strong Indirect Resource" },
  },
};

function normaliseGod(god: string, hiddenStem: string | null, dayMaster: string): string {
  if (god === "日主" && hiddenStem === dayMaster) return "比肩";
  return god;
}

function familyOf(god: string): Family | null {
  return GOD_FAMILY[god] ?? null;
}

function collectProfiles(chart: Chart): Profile[] {
  const bag = new Map<string, Profile>();
  const add = (godRaw: string, element: Element, weight: number, visible: boolean, daySeat: boolean, hiddenStem: string | null) => {
    const god = normaliseGod(godRaw, hiddenStem, chart.dayMaster);
    const family = familyOf(god);
    if (!family) return;
    const key = `${god}:${element}`;
    const found = bag.get(key) ?? { god, family, element, score: 0, visible: 0, hidden: 0, daySeat: false };
    found.score += weight;
    if (visible) found.visible += 1;
    else found.hidden += 1;
    found.daySeat ||= daySeat;
    bag.set(key, found);
  };

  for (const pillar of chart.pillars) {
    if (pillar.ready === false || !pillar.gan) continue;
    if (pillar.key !== "day") add(pillar.shiShenGan, pillar.ganElement, 2, true, false, null);
    for (const hidden of pillar.hide ?? []) {
      add(hidden.shiShen, hidden.element, pillar.key === "day" ? 2 : 1, false, pillar.key === "day", hidden.gan);
    }
  }

  return [...bag.values()]
    .sort((a, b) => b.score - a.score || b.visible - a.visible || Number(b.daySeat) - Number(a.daySeat))
    .slice(0, 2);
}

function calibration(chart: Chart, element: Element, locale: AppLocale): string {
  if (chart.usefulProvisional) {
    if (locale === "en") return "favourability is still provisional, so keep both the constructive and excess expressions open";
    return locale === "zh-Hant"
      ? "喜忌仍屬暫定，正反兩面都保留，不先定性"
      : "喜忌仍属暂定，正反两面都保留，不先定性";
  }
  if (chart.useful.includes(element)) {
    if (locale === "en") return "this element is currently usable, so test the constructive expression first";
    return locale === "zh-Hant" ? "此五行目前偏可用，先驗證正向表現" : "此五行目前偏可用，先验证正向表现";
  }
  if (chart.drain.includes(element)) {
    if (locale === "en") return "this element currently needs restraint, so watch the excess expression first";
    return locale === "zh-Hant" ? "此五行目前偏耗／需節制，先觀察過度面" : "此五行目前偏耗／需节制，先观察过度面";
  }
  if (locale === "en") return "this element is not decisively classified, so retain both sides and verify against real behaviour";
  return locale === "zh-Hant" ? "此五行未明確定喜忌，兩面並看並以現實驗證" : "此五行未明确定喜忌，两面并看并以现实验证";
}

function evidence(profile: Profile, locale: AppLocale): string {
  if (locale === "en") {
    return `visibility index ${profile.score} (visible stems ${profile.visible}, hidden stems ${profile.hidden}${profile.daySeat ? ", including the day branch" : ""}); this is not a formal strength score`;
  }
  if (locale === "zh-Hant") {
    return `顯著度索引 ${profile.score}（透干 ${profile.visible}、藏干 ${profile.hidden}${profile.daySeat ? "，含日支坐支" : ""}）；此索引只計可見度，不等於正式旺衰分數`;
  }
  return `显著度索引 ${profile.score}（透干 ${profile.visible}、藏干 ${profile.hidden}${profile.daySeat ? "，含日支坐支" : ""}）；此索引只计可见度，不等于正式旺衰分数`;
}

export function buildTenGodFiveElementRuntimeText(chart: Chart, locale: AppLocale = "zh-Hans"): string {
  const profiles = collectProfiles(chart);
  if (!profiles.length) return "";

  if (locale === "en") {
    const body = profiles.map((profile, index) => {
      const style = STYLE[profile.family][profile.element];
      return `${index + 1}. ${ELEMENT_EN[profile.element]} ${GOD_EN[profile.god] ?? profile.god}: ${evidence(profile, locale)}. Constructive expression: ${style.enPositive}. If excessive: ${style.enExcess}. Calibration: ${calibration(chart, profile.element, locale)}.`;
    }).join(" ");
    return `[Ten-God × Five-Element profile] Ten-God defines what the function does; Five Element describes the manner in which it tends to operate. ${body} This is a cross-sectional behavioural lens, not a personality verdict. Direct/indirect form, favourability, strength, visible/hidden roots and the day branch must still be checked. Labels such as “Wood Wealth” or “Water Officer” describe the element carried by an actually calculated Ten-God relation; an element is never inherently Wealth or Officer. Do not infer a career, wealth level, relationship outcome, health event or concrete incident from one cell alone.`;
  }

  const hant = locale === "zh-Hant";
  const body = profiles.map((profile, index) => {
    const style = STYLE[profile.family][profile.element];
    const god = hant ? profile.god.replaceAll("财", "財").replaceAll("伤", "傷").replaceAll("杀", "殺") : profile.god.replaceAll("財", "财").replaceAll("傷", "伤").replaceAll("殺", "杀");
    const positive = hant ? style.positive : style.positive
      .replaceAll("彎", "弯").replaceAll("擔", "担").replaceAll("則", "则").replaceAll("讓", "让")
      .replaceAll("熱", "热").replaceAll("動", "动").replaceAll("燒", "烧").replaceAll("穩", "稳")
      .replaceAll("願", "愿").replaceAll("變", "变").replaceAll("乾", "干").replaceAll("邊", "边")
      .replaceAll("義", "义").replaceAll("話", "话").replaceAll("圓", "圆").replaceAll("條", "条")
      .replaceAll("長", "长").replaceAll("實", "实").replaceAll("現", "现").replaceAll("強", "强")
      .replaceAll("術", "术").replaceAll("銷", "销").replaceAll("鋒", "锋").replaceAll("準", "准")
      .replaceAll("靈", "灵").replaceAll("變", "变").replaceAll("劃", "划").replaceAll("關", "关")
      .replaceAll("戶", "户").replaceAll("業", "业").replaceAll("願", "愿").replaceAll("為", "为")
      .replaceAll("產", "产").replaceAll("積", "积").replaceAll("標", "标").replaceAll("帳", "账")
      .replaceAll("確", "确").replaceAll("資訊", "信息").replaceAll("換", "换").replaceAll("壓", "压")
      .replaceAll("責", "责").replaceAll("創", "创").replaceAll("擔", "担").replaceAll("層", "层")
      .replaceAll("軍", "军").replaceAll("警", "警").replaceAll("謀", "谋").replaceAll("規", "规")
      .replaceAll("證", "证").replaceAll("書", "书").replaceAll("學", "学").replaceAll("獻", "献")
      .replaceAll("後", "后").replaceAll("師", "师").replaceAll("約", "约").replaceAll("識", "识")
      .replaceAll("療", "疗").replaceAll("聰", "聪").replaceAll("覺", "觉");
    const excess = hant ? style.excess : style.excess
      .replaceAll("則", "则").replaceAll("讓", "让").replaceAll("熱", "热").replaceAll("動", "动")
      .replaceAll("燒", "烧").replaceAll("穩", "稳").replaceAll("願", "愿").replaceAll("變", "变")
      .replaceAll("說", "说").replaceAll("話", "话").replaceAll("過", "过").replaceAll("傷", "伤")
      .replaceAll("帳", "账").replaceAll("裡", "里").replaceAll("財", "财").replaceAll("關", "关")
      .replaceAll("係", "系").replaceAll("價", "价").replaceAll("險", "险").replaceAll("邊", "边")
      .replaceAll("資訊", "信息").replaceAll("換", "换").replaceAll("為", "为").replaceAll("壓", "压")
      .replaceAll("責", "责").replaceAll("長", "长").replaceAll("積", "积").replaceAll("嚴", "严")
      .replaceAll("殺", "杀").replaceAll("謂", "谓").replaceAll("驗", "验").replaceAll("證", "证")
      .replaceAll("長", "长").replaceAll("舊", "旧").replaceAll("書", "书").replaceAll("學", "学")
      .replaceAll("動", "动").replaceAll("習", "习").replaceAll("餵", "喂").replaceAll("護", "护")
      .replaceAll("獨", "独").replaceAll("閉", "闭");
    return `${index + 1}. ${profile.element}${god}：${evidence(profile, locale)}。${hant ? "正向" : "正向"}：${positive}；${hant ? "過度" : "过度"}：${excess}；${hant ? "校正" : "校正"}：${calibration(chart, profile.element, locale)}。`;
  }).join(" ");

  if (hant) {
    return `【十神 × 五行交叉】十神決定「這股力在做什麼」，五行決定「以什麼氣質做」。${body} 這只是交叉切片，不是人格定論；仍須回到正／偏、喜忌旺衰、透藏根氣與坐支共同校正。「木財／水官殺」只表示已由日主生剋陰陽算出的十神落在哪種五行氣質，絕不是木固定等於財、水固定等於官殺。單格不得直接推出職業、財富、感情、健康或具體事件。`;
  }
  return `【十神 × 五行交叉】十神决定“这股力在做什么”，五行决定“以什么气质做”。${body} 这只是交叉切片，不是人格定论；仍须回到正／偏、喜忌旺衰、透藏根气与坐支共同校正。“木财／水官杀”只表示已由日主生克阴阳算出的十神落在哪种五行气质，绝不是木固定等于财、水固定等于官杀。单格不得直接推出职业、财富、感情、健康或具体事件。`;
}

export function applyTenGodFiveElementRuntimePolicy(
  chart: Chart,
  reading: Reading,
  locale: AppLocale = "zh-Hans",
): Reading {
  if (reading.rhythm.includes("【十神 × 五行交叉】") || reading.rhythm.includes("[Ten-God × Five-Element profile]")) return reading;
  const text = buildTenGodFiveElementRuntimeText(chart, locale);
  return text ? { ...reading, rhythm: [reading.rhythm, text].filter(Boolean).join(" ") } : reading;
}
