import type { AppLocale, Chart } from "@/lib/bazi/types";

type BodyCopy = {
  organs: string;
  spatial: string;
  signals: string;
};

type BranchBody = {
  "zh-Hans": BodyCopy;
  "zh-Hant": BodyCopy;
  en: BodyCopy;
};

const BODY_BRANCH_ORDER = ["子", "丑", "寅", "卯", "辰", "巳", "午", "未", "申", "酉", "戌", "亥"] as const;
type BodyBranch = (typeof BODY_BRANCH_ORDER)[number];

const BODY_BRANCH: Record<BodyBranch, BranchBody> = {
  子: {
    "zh-Hans": { organs: "肾、膀胱与水液代谢", spatial: "下阴与下焦", signals: "夜尿、下寒、耳鸣或津液不稳是否反复" },
    "zh-Hant": { organs: "腎、膀胱與水液代謝", spatial: "下陰與下焦", signals: "夜尿、下寒、耳鳴或津液不穩是否反覆" },
    en: { organs: "kidney/bladder and fluid-balance patterns", spatial: "lower pelvic area", signals: "night-time urination, feeling cold low in the body, ear symptoms or unstable hydration keep recurring" },
  },
  丑: {
    "zh-Hans": { organs: "脾胃、肌肉与寒湿", spatial: "右小腿", signals: "晨起沉重、腿肿、湿滞或胃口不开是否反复" },
    "zh-Hant": { organs: "脾胃、肌肉與寒濕", spatial: "右小腿", signals: "晨起沉重、腿腫、濕滯或胃口不開是否反覆" },
    en: { organs: "digestion, muscle tone and cold-damp patterns", spatial: "right lower leg", signals: "morning heaviness, leg swelling, sluggish digestion or poor appetite keep recurring" },
  },
  寅: {
    "zh-Hans": { organs: "胆、筋与生发", spatial: "右大腿", signals: "筋紧、抽动、伸展不开或风痛是否反复" },
    "zh-Hant": { organs: "膽、筋與生發", spatial: "右大腿", signals: "筋緊、抽動、伸展不開或風痛是否反覆" },
    en: { organs: "tendon, mobility and gallbladder-related traditional patterns", spatial: "right thigh", signals: "tight tendons, cramping, restricted extension or shifting aches keep recurring" },
  },
  卯: {
    "zh-Hans": { organs: "肝、目、筋与疏泄", spatial: "右腰", signals: "右腰紧、眼干、肋胁紧或手指麻是否反复" },
    "zh-Hant": { organs: "肝、目、筋與疏泄", spatial: "右腰", signals: "右腰緊、眼乾、肋脅緊或手指麻是否反覆" },
    en: { organs: "eye, tendon and liver-related traditional patterns", spatial: "right waist", signals: "right-waist tightness, dry eyes, rib-side tension or finger numbness keep recurring" },
  },
  辰: {
    "zh-Hans": { organs: "脾胃、肠、皮肤与肌膜", spatial: "右臂", signals: "腹胀、湿滞、痰感、右肩臂紧或肠胃通道不顺是否反复" },
    "zh-Hant": { organs: "脾胃、腸、皮膚與肌膜", spatial: "右臂", signals: "腹脹、濕滯、痰感、右肩臂緊或腸胃通道不順是否反覆" },
    en: { organs: "digestion, bowel, skin and fascia patterns", spatial: "right arm", signals: "bloating, fluid heaviness, phlegmy congestion, right shoulder-arm tightness or bowel sluggishness keep recurring" },
  },
  巳: {
    "zh-Hans": { organs: "心、小肠与三焦通道", spatial: "右肩", signals: "口疮、咽热、面红或右肩发热紧绷是否反复" },
    "zh-Hant": { organs: "心、小腸與三焦通道", spatial: "右肩", signals: "口瘡、咽熱、面紅或右肩發熱緊繃是否反覆" },
    en: { organs: "upper-body heat, throat/mouth and small-intestine-related traditional patterns", spatial: "right shoulder", signals: "mouth ulcers, throat heat, facial flushing or heat/tightness in the right shoulder keep recurring" },
  },
  午: {
    "zh-Hans": { organs: "心神、血脉与上部火象", spatial: "头部", signals: "头痛、睡不好、眼红、心烦或心悸是否反复" },
    "zh-Hant": { organs: "心神、血脈與上部火象", spatial: "頭部", signals: "頭痛、睡不好、眼紅、心煩或心悸是否反覆" },
    en: { organs: "sleep, circulation and upper-body heat patterns", spatial: "head", signals: "headaches, poor sleep, red eyes, agitation or palpitations keep recurring" },
  },
  未: {
    "zh-Hans": { organs: "胃、脾与湿热中焦", spatial: "左肩", signals: "左肩僵、饭后昏沉、胃脘胀或午后湿热感是否反复" },
    "zh-Hant": { organs: "胃、脾與濕熱中焦", spatial: "左肩", signals: "左肩僵、飯後昏沉、胃脘脹或午後濕熱感是否反覆" },
    en: { organs: "digestion and warm-damp middle-body patterns", spatial: "left shoulder", signals: "left-shoulder stiffness, post-meal drowsiness, upper-abdominal fullness or afternoon heaviness keep recurring" },
  },
  申: {
    "zh-Hans": { organs: "肺、大肠、皮毛与肃降", spatial: "左臂", signals: "左臂紧、秋燥咳、皮肤紧或大肠偏燥是否反复" },
    "zh-Hant": { organs: "肺、大腸、皮毛與肅降", spatial: "左臂", signals: "左臂緊、秋燥咳、皮膚緊或大腸偏燥是否反覆" },
    en: { organs: "breathing, skin and bowel-dryness patterns", spatial: "left arm", signals: "left-arm tightness, dry cough, tight skin or constipation/dry bowel patterns keep recurring" },
  },
  酉: {
    "zh-Hans": { organs: "肺、胸中气与呼吸节奏", spatial: "左腰", signals: "左腰闷、呼吸变浅、鼻肤干或气短是否反复" },
    "zh-Hant": { organs: "肺、胸中氣與呼吸節奏", spatial: "左腰", signals: "左腰悶、呼吸變淺、鼻膚乾或氣短是否反覆" },
    en: { organs: "breathing rhythm, chest tension and dryness patterns", spatial: "left waist", signals: "left-waist tightness, shallow breathing, dry nose/skin or shortness of breath keep recurring" },
  },
  戌: {
    "zh-Hans": { organs: "命门、腰骶与燥性承重结构", spatial: "左大腿", signals: "左膝髋干酸、腰骶紧、关节承重不适或旧伤是否反复" },
    "zh-Hant": { organs: "命門、腰骶與燥性承重結構", spatial: "左大腿", signals: "左膝髖乾酸、腰骶緊、關節承重不適或舊傷是否反覆" },
    en: { organs: "lower-back, weight-bearing joints and dry/tight structural patterns", spatial: "left thigh", signals: "dry aching around the left knee/hip, sacral tightness or old load-related injuries keep recurring" },
  },
  亥: {
    "zh-Hans": { organs: "肾、膀胱、津液与封藏", spatial: "左小腿", signals: "腰膝酸、脚凉、夜尿、咽干伴下寒或恢复力下降是否反复" },
    "zh-Hant": { organs: "腎、膀胱、津液與封藏", spatial: "左小腿", signals: "腰膝酸、腳涼、夜尿、咽乾伴下寒或恢復力下降是否反覆" },
    en: { organs: "kidney/bladder, hydration and recovery patterns", spatial: "left lower leg", signals: "aching low back/knees, cold feet, night-time urination or dryness paired with feeling cold low in the body keep recurring" },
  },
};

const AXES = [
  { a: "子", b: "午", hans: "下焦封藏 ↔ 头部火神", hant: "下焦封藏 ↔ 頭部火神", en: "lower-body storage ↔ head/upper-body heat", signalHans: "上热下寒、睡眠与下焦稳定", signalHant: "上熱下寒、睡眠與下焦穩定", signalEn: "upper-body heat, sleep and lower-body stability" },
  { a: "丑", b: "未", hans: "寒湿下沉 ↔ 湿热中焦", hant: "寒濕下沉 ↔ 濕熱中焦", en: "cold-damp heaviness ↔ warm-damp digestion", signalHans: "吃不好与肩背僵是否一起出现", signalHant: "吃不好與肩背僵是否一起出現", signalEn: "digestive sluggishness and shoulder/back stiffness appearing together" },
  { a: "寅", b: "申", hans: "生发伸展 ↔ 肃降收敛", hant: "生發伸展 ↔ 肅降收斂", en: "extension/mobility ↔ contraction/descent", signalHans: "筋抽紧与呼吸、肠道燥紧是否成对", signalHant: "筋抽緊與呼吸、腸道燥緊是否成對", signalEn: "tendon tightness pairing with breathing or bowel dryness" },
  { a: "卯", b: "酉", hans: "疏泄打开 ↔ 收敛关合", hant: "疏泄打開 ↔ 收斂關合", en: "opening/release ↔ contraction/rhythm", signalHans: "情绪卡、呼吸浅与两侧腰紧是否轮流", signalHant: "情緒卡、呼吸淺與兩側腰緊是否輪流", signalEn: "stress, shallow breathing and alternating waist tightness" },
  { a: "辰", b: "戌", hans: "湿库堆积 ↔ 燥库收口", hant: "濕庫堆積 ↔ 燥庫收口", en: "damp accumulation ↔ dry structural tension", signalHans: "肠胃湿滞与左腿、腰骶关节干紧是否并见", signalHant: "腸胃濕滯與左腿、腰骶關節乾緊是否並見", signalEn: "digestive heaviness appearing with dry/tight joints, left leg or lower back" },
  { a: "巳", b: "亥", hans: "上炎走窍 ↔ 下部封藏", hant: "上炎走竅 ↔ 下部封藏", en: "upper-body heat ↔ lower-body storage/recovery", signalHans: "面咽发热与脚冷、下寒或恢复差是否同时", signalHant: "面咽發熱與腳冷、下寒或恢復差是否同時", signalEn: "throat/facial heat appearing with cold feet, lower-body coldness or poor recovery" },
] as const;

const SEASONS = [
  { branches: ["寅", "卯", "辰"], hans: "春季木气", hant: "春季木氣", en: "spring", systemHans: "肝胆、筋目与生发", systemHant: "肝膽、筋目與生發", systemEn: "mobility, tendon and eye-related patterns" },
  { branches: ["巳", "午", "未"], hans: "夏季火土", hant: "夏季火土", en: "summer", systemHans: "心神、睡眠、上热与中焦", systemHant: "心神、睡眠、上熱與中焦", systemEn: "sleep, upper-body heat and digestion" },
  { branches: ["申", "酉", "戌"], hans: "秋季金燥", hant: "秋季金燥", en: "autumn", systemHans: "呼吸、皮肤、收敛与燥", systemHant: "呼吸、皮膚、收斂與燥", systemEn: "breathing, skin and dryness" },
  { branches: ["亥", "子", "丑"], hans: "冬季水寒", hant: "冬季水寒", en: "winter", systemHans: "封藏、下焦、水液与恢复", systemHant: "封藏、下焦、水液與恢復", systemEn: "hydration, lower-body warmth and recovery" },
] as const;

function isBranch(value: string): value is BodyBranch {
  return (BODY_BRANCH_ORDER as readonly string[]).includes(value);
}

function branchFromGanZhi(value?: string | null): BodyBranch | null {
  if (!value) return null;
  for (const character of value) if (isBranch(character)) return character;
  return null;
}

function unique<T>(values: T[]): T[] {
  return [...new Set(values)];
}

export function buildBodyAttentionLines(chart: Chart, locale: AppLocale = "zh-Hans"): string[] {
  const natalBranches = chart.pillars
    .filter((pillar) => pillar.ready && isBranch(pillar.zhi))
    .map((pillar) => pillar.zhi as BodyBranch);
  const fallback = isBranch(chart.monthBranch) ? [chart.monthBranch] : [];
  const sourceBranches = natalBranches.length ? natalBranches : fallback;
  const counts = new Map<BodyBranch, number>();
  for (const branch of sourceBranches) counts.set(branch, (counts.get(branch) ?? 0) + 1);

  const ranked = unique(sourceBranches).sort((a, b) => {
    const scoreA = (counts.get(a) ?? 0) * 2 + (a === chart.monthBranch ? 2 : 0);
    const scoreB = (counts.get(b) ?? 0) * 2 + (b === chart.monthBranch ? 2 : 0);
    if (scoreA !== scoreB) return scoreB - scoreA;
    return BODY_BRANCH_ORDER.indexOf(a) - BODY_BRANCH_ORDER.indexOf(b);
  }).slice(0, 3);

  const lines = ranked.map((branch, index) => {
    const copy = BODY_BRANCH[branch][locale];
    if (locale === "en") {
      return `${index === 0 ? "Main area to watch" : "Also watch"}: ${copy.spatial}; ${copy.organs}. Notice whether ${copy.signals}.`;
    }
    const prefix = index === 0 ? (locale === "zh-Hant" ? "優先觀察" : "优先观察") : (locale === "zh-Hant" ? "次要觀察" : "次要观察");
    return `${prefix}｜${branch}：${copy.spatial}；${copy.organs}。留意${copy.signals}。`;
  });

  const present = new Set(sourceBranches);
  const natalAxis = AXES.find((axis) => present.has(axis.a) && present.has(axis.b));
  const dayunBranch = branchFromGanZhi(chart.currentDayun?.ganZhi);
  const dayunAxis = !natalAxis && dayunBranch
    ? AXES.find((axis) => (axis.a === dayunBranch && present.has(axis.b)) || (axis.b === dayunBranch && present.has(axis.a)))
    : null;
  const axis = natalAxis ?? dayunAxis;

  if (axis) {
    if (locale === "en") {
      lines.push(`Paired axis: ${axis.en}. Read both ends as one pattern, especially ${axis.signalEn}; do not treat them as two separate diagnoses.`);
    } else if (locale === "zh-Hant") {
      lines.push(`對沖軸｜${axis.a}${axis.b}：${axis.hant}。兩端一起看，優先留意${axis.signalHant}，不要拆成兩個病。`);
    } else {
      lines.push(`对冲轴｜${axis.a}${axis.b}：${axis.hans}。两端一起看，优先留意${axis.signalHans}，不要拆成两个病。`);
    }
  }

  const season = SEASONS.find((item) => (item.branches as readonly string[]).includes(chart.monthBranch));
  if (season) {
    if (locale === "en") {
      lines.push(`Seasonal emphasis: the birth-month pattern sits in ${season.en}, so ${season.systemEn} carry extra observation weight.`);
    } else if (locale === "zh-Hant") {
      lines.push(`季令加權｜月令在${season.hant}，${season.systemHant}這一組觀察權重提高。`);
    } else {
      lines.push(`季令加权｜月令在${season.hans}，${season.systemHans}这一组观察权重提高。`);
    }
  }

  if (dayunBranch && BODY_BRANCH[dayunBranch]) {
    const copy = BODY_BRANCH[dayunBranch][locale];
    if (locale === "en") {
      lines.push(`Current-phase emphasis: ${copy.spatial} and ${copy.organs} move higher on the watch list during the current long-term cycle.`);
    } else if (locale === "zh-Hant") {
      lines.push(`當前階段｜目前大運帶到${dayunBranch}位，${copy.spatial}與${copy.organs}的觀察優先級提高。`);
    } else {
      lines.push(`当前阶段｜目前大运带到${dayunBranch}位，${copy.spatial}与${copy.organs}的观察优先级提高。`);
    }
  }

  if (locale === "en") {
    lines.push("This is a traditional symbolic body map, not a medical diagnosis. If a symptom is persistent, worsening or limits normal activity, use ordinary medical assessment rather than the chart.");
  } else if (locale === "zh-Hant") {
    lines.push("這是傳統象義身體地圖，不是體檢或診斷。部位與作息都對得上才提高觀察權重；症狀持續、加重或影響活動時，以實際醫療檢查為準。 ");
  } else {
    lines.push("这是传统象义身体地图，不是体检或诊断。部位与作息都对得上才提高观察权重；症状持续、加重或影响活动时，以实际医疗检查为准。 ");
  }

  return lines;
}
