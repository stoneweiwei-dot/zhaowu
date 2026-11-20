import type { AnalysisResult, AppLocale } from "@/lib/bazi/types";
import type { ReportSection } from "@/lib/report/focused-report";

const PET_RE = /(寵物|宠物|養貓|养猫|養狗|养狗|適合養|适合养|養什麼|养什么|貓咪|猫咪|狗狗|pet|cat|dog)/i;
const SYDNEY_RE = /(悉尼|雪梨|sydney|澳洲|澳大利亞|澳大利亚|australia)/i;

export function isPetDecisionQuestion(question: string): boolean {
  return PET_RE.test(question);
}

type PetProfile = {
  primaryHant: string;
  primaryHans: string;
  primaryEn: string;
  secondaryHant: string;
  secondaryHans: string;
  secondaryEn: string;
  avoidHant: string;
  avoidHans: string;
  avoidEn: string;
};

const BY_ELEMENT: Record<string, PetProfile> = {
  水: {
    primaryHant: "性格穩定、獨立度高的成貓",
    primaryHans: "性格稳定、独立度高的成猫",
    primaryEn: "a calm adult cat that is comfortable spending time independently",
    secondaryHant: "安靜、活動量中低的小型伴侶動物",
    secondaryHans: "安静、活动量中低的小型伴侣动物",
    secondaryEn: "a quiet small companion animal with low-to-moderate activity needs",
    avoidHant: "高噪音、高運動量、長時間需要人陪的大型犬",
    avoidHans: "高噪音、高运动量、长时间需要人陪的大型犬",
    avoidEn: "a high-drive, noisy large dog that needs long periods of active company",
  },
  金: {
    primaryHant: "邊界感清楚、作息穩定的成貓",
    primaryHans: "边界感清楚、作息稳定的成猫",
    primaryEn: "an adult cat with a stable routine and clear boundaries",
    secondaryHant: "安靜、訓練需求明確的小型犬",
    secondaryHans: "安静、训练需求明确的小型犬",
    secondaryEn: "a quiet small dog with predictable training and exercise needs",
    avoidHant: "極度黏人、情緒與活動需求都很高的動物",
    avoidHans: "极度黏人、情绪与活动需求都很高的动物",
    avoidEn: "an extremely clingy pet with both high arousal and high activity needs",
  },
  木: {
    primaryHant: "活動量中等、可固定散步與互動的中小型犬",
    primaryHans: "活动量中等、可固定散步与互动的中小型犬",
    primaryEn: "a small-to-medium dog with moderate exercise needs and a predictable walk routine",
    secondaryHant: "好奇、互動性高但能自己休息的成貓",
    secondaryHans: "好奇、互动性高但能自己休息的成猫",
    secondaryEn: "a curious, social adult cat that can also settle independently",
    avoidHant: "長期缺乏活動與環境刺激的飼養方式",
    avoidHans: "长期缺乏活动与环境刺激的饲养方式",
    avoidEn: "a setup that cannot provide regular movement or environmental enrichment",
  },
  火: {
    primaryHant: "親人、互動性好但情緒穩定的成貓",
    primaryHans: "亲人、互动性好但情绪稳定的成猫",
    primaryEn: "a sociable adult cat with steady temperament rather than constant high arousal",
    secondaryHant: "體型較小、可規律互動的小型犬",
    secondaryHans: "体型较小、可规律互动的小型犬",
    secondaryEn: "a small dog that fits a regular interaction and exercise routine",
    avoidHant: "本身就高度興奮、需要全天刺激的高驅動型犬",
    avoidHans: "本身就高度兴奋、需要全天刺激的高驱动型犬",
    avoidEn: "a very high-drive dog that needs stimulation throughout the day",
  },
  土: {
    primaryHant: "性情平穩、作息規律的成貓",
    primaryHans: "性情平稳、作息规律的成猫",
    primaryEn: "a calm adult cat with a predictable routine",
    secondaryHant: "性格溫和、活動量中低的小型犬",
    secondaryHans: "性格温和、活动量中低的小型犬",
    secondaryEn: "a gentle small dog with low-to-moderate exercise needs",
    avoidHant: "照護程序複雜、環境要求很高又難以臨時託管的動物",
    avoidHans: "照护程序复杂、环境要求很高又难以临时托管的动物",
    avoidEn: "a pet with complex care and habitat requirements that are difficult to hand over",
  },
};

function localeText(locale: AppLocale, profile: PetProfile, key: "primary" | "secondary" | "avoid") {
  if (locale === "en") return profile[`${key}En` as keyof PetProfile];
  if (locale === "zh-Hans") return profile[`${key}Hans` as keyof PetProfile];
  return profile[`${key}Hant` as keyof PetProfile];
}

function practicalLine(question: string, locale: AppLocale) {
  const sydney = SYDNEY_RE.test(question);
  if (locale === "en") {
    return sydney
      ? "For Sydney, finish the decision with four real checks: rental/building rules, indoor space and noise tolerance, how long the pet will be alone on workdays, and the ongoing care/vet budget."
      : "Finish the decision with four real checks: housing rules, usable space, time alone on workdays, and the ongoing care/vet budget.";
  }
  if (locale === "zh-Hans") {
    return sydney
      ? "你在悉尼的话，最后用四项现实条件筛一次：租约／楼宇规则、室内活动空间与噪音、工作日独处时长、长期照护与兽医预算。"
      : "最后用四项现实条件筛一次：居住规则、可用空间、工作日独处时长、长期照护与兽医预算。";
  }
  return sydney
    ? "你在悉尼的話，最後用四項現實條件篩一次：租約／樓宇規則、室內活動空間與噪音、工作日獨處時長、長期照護與獸醫預算。"
    : "最後用四項現實條件篩一次：居住規則、可用空間、工作日獨處時長、長期照護與獸醫預算。";
}

export function buildPetDecision(result: AnalysisResult, locale: AppLocale = result.locale ?? "zh-Hant") {
  const profile = BY_ELEMENT[result.chart.dayMasterElement] ?? BY_ELEMENT.土;
  const primary = localeText(locale, profile, "primary");
  const secondary = localeText(locale, profile, "secondary");
  const avoid = localeText(locale, profile, "avoid");
  const practical = practicalLine(result.question, locale);
  const highLoad = result.chart.strength.tendency.includes("旺");

  const directAnswer = locale === "en"
    ? `Direct answer: first choice is ${primary}; second choice is ${secondary}. I would not put ${avoid} at the top of your list. This recommendation uses the chart's already-established temperament/load pattern, not an unfinished useful-element claim. ${practical}`
    : locale === "zh-Hans"
      ? `直接回答：首选「${primary}」；次选「${secondary}」。不建议把「${avoid}」放在第一顺位。这里用的是目前已经成立的命盘性情与承载结构，不拿尚未完成的喜用神硬凑答案。${practical}`
      : `直接回答：首選「${primary}」；次選「${secondary}」。不建議把「${avoid}」放在第一順位。這裡用的是目前已經成立的命盤性情與承載結構，不拿尚未完成的喜用神硬湊答案。${practical}`;

  const why = locale === "en"
    ? [
        `Your Day Master is ${result.chart.dayMaster}${result.chart.dayMasterElement}; the current base-load judgement is ${result.chart.strength.tendency}.`,
        highLoad
          ? "The practical preference is therefore for companionship without adding another high-demand schedule."
          : "The practical preference is for steady companionship that does not require unpredictable bursts of care.",
      ]
    : locale === "zh-Hans"
      ? [
          `命盘已确认的落点是：日主 ${result.chart.dayMaster}${result.chart.dayMasterElement}，原局承载目前判为${result.chart.strength.tendency}。`,
          highLoad ? "所以优先选能陪伴、但不会再制造一套高强度日程的动物。" : "所以优先选陪伴稳定、照护节奏可预测的动物。",
        ]
      : [
          `命盤已確認的落點是：日主 ${result.chart.dayMaster}${result.chart.dayMasterElement}，原局承載目前判為${result.chart.strength.tendency}。`,
          highLoad ? "所以優先選能陪伴、但不會再製造一套高強度日程的動物。" : "所以優先選陪伴穩定、照護節奏可預測的動物。",
        ];

  const checks = locale === "en"
    ? [practical, "Before choosing a breed, meet the individual animal. Temperament and care history matter more than a breed label."]
    : locale === "zh-Hans"
      ? [practical, "最后不要只按品种名选。真正领养／购买前，要看那一只动物本身的性格、健康与既往照护记录。"]
      : [practical, "最後不要只按品種名選。真正領養／購買前，要看那一隻動物本身的性格、健康與既往照護紀錄。"];

  const titles = locale === "en"
    ? ["Pet recommendation", "Why this fits", "Sydney / real-life checks"]
    : locale === "zh-Hans"
      ? ["宠物建议", "为什么这样选", "悉尼／现实筛选"]
      : ["寵物建議", "為什麼這樣選", "悉尼／現實篩選"];

  const sections: ReportSection[] = [
    {
      sectionNo: 1,
      pageNo: 1,
      key: "conclusion",
      title: titles[0],
      body: [directAnswer],
      evidence: { facts: ["day master element", "base strength tendency", "question location"], conditions: ["pet decision intent"], limits: ["symbolic preference only; not veterinary or legal advice"], checks: ["answers what kind of pet first"] },
    },
    {
      sectionNo: 2,
      pageNo: 2,
      key: "basis",
      title: titles[1],
      body: why,
      evidence: { facts: ["canonical chart output"], conditions: ["no useful-element overreach"], limits: ["does not infer animal temperament from breed alone"], checks: ["no unrelated career/love/money filler"] },
    },
    {
      sectionNo: 3,
      pageNo: 3,
      key: "action",
      title: titles[2],
      body: checks,
      evidence: { facts: ["housing", "schedule", "care budget", "individual animal temperament"], conditions: ["real-life adoption/purchase decision"], limits: ["verify local rules directly"], checks: ["location-aware practical screen"] },
    },
  ];

  return { directAnswer, sections };
}
