export const TIANJI_MONTHS = ["正", "二", "三", "四", "五", "六", "七", "八", "九", "十", "冬", "腊"] as const;
export const TIANJI_HOURS = ["子", "丑", "寅", "卯", "辰", "巳", "午", "未", "申", "酉", "戌", "亥"] as const;

export type TianjiMonth = (typeof TIANJI_MONTHS)[number];
export type TianjiHour = (typeof TIANJI_HOURS)[number];
export type TianjiPalace = "子" | "丑" | "寅" | "卯" | "辰" | "巳" | "午" | "未" | "申" | "酉" | "戌" | "亥";

/**
 * 天机星宫 V2.0 权威查表。
 * 行 = 农历月份，列 = 出生时辰，值 = 命宫。
 *
 * 这张表直接对应站主提供的 12×12 原表，不再依赖推导公式，
 * 这样以后即使规则文案调整，实际结果仍以原表为唯一依据。
 */
export const TIANJI_PALACE_TABLE: Record<TianjiMonth, Record<TianjiHour, TianjiPalace>> = {
  正: { 子: "卯", 丑: "寅", 寅: "丑", 卯: "子", 辰: "亥", 巳: "戌", 午: "酉", 未: "申", 申: "未", 酉: "午", 戌: "巳", 亥: "辰" },
  二: { 子: "寅", 丑: "丑", 寅: "子", 卯: "亥", 辰: "戌", 巳: "酉", 午: "申", 未: "未", 申: "午", 酉: "巳", 戌: "辰", 亥: "卯" },
  三: { 子: "丑", 丑: "子", 寅: "亥", 卯: "戌", 辰: "酉", 巳: "申", 午: "未", 未: "午", 申: "巳", 酉: "辰", 戌: "卯", 亥: "寅" },
  四: { 子: "子", 丑: "亥", 寅: "戌", 卯: "酉", 辰: "申", 巳: "未", 午: "午", 未: "巳", 申: "辰", 酉: "卯", 戌: "寅", 亥: "丑" },
  五: { 子: "亥", 丑: "戌", 寅: "酉", 卯: "申", 辰: "未", 巳: "午", 午: "巳", 未: "辰", 申: "卯", 酉: "寅", 戌: "丑", 亥: "子" },
  六: { 子: "戌", 丑: "酉", 寅: "申", 卯: "未", 辰: "午", 巳: "巳", 午: "辰", 未: "卯", 申: "寅", 酉: "丑", 戌: "子", 亥: "亥" },
  七: { 子: "酉", 丑: "申", 寅: "未", 卯: "午", 辰: "巳", 巳: "辰", 午: "卯", 未: "寅", 申: "丑", 酉: "子", 戌: "亥", 亥: "戌" },
  八: { 子: "申", 丑: "未", 寅: "午", 卯: "巳", 辰: "辰", 巳: "卯", 午: "寅", 未: "丑", 申: "子", 酉: "亥", 戌: "戌", 亥: "酉" },
  九: { 子: "未", 丑: "午", 寅: "巳", 卯: "辰", 辰: "卯", 巳: "寅", 午: "丑", 未: "子", 申: "亥", 酉: "戌", 戌: "酉", 亥: "申" },
  十: { 子: "午", 丑: "巳", 寅: "辰", 卯: "卯", 辰: "寅", 巳: "丑", 午: "子", 未: "亥", 申: "戌", 酉: "酉", 戌: "申", 亥: "未" },
  冬: { 子: "巳", 丑: "辰", 寅: "卯", 卯: "寅", 辰: "丑", 巳: "子", 午: "亥", 未: "戌", 申: "酉", 酉: "申", 戌: "未", 亥: "午" },
  腊: { 子: "辰", 丑: "卯", 寅: "寅", 卯: "丑", 辰: "子", 巳: "亥", 午: "戌", 未: "酉", 申: "申", 酉: "未", 戌: "午", 亥: "巳" },
};

export const STAR_BY_PALACE: Record<TianjiPalace, string> = {
  子: "天贵星",
  丑: "天厄星",
  寅: "天权星",
  卯: "天赦星",
  辰: "天如星",
  巳: "天文星",
  午: "天福星",
  未: "天驿星",
  申: "天孤星",
  酉: "天秘星",
  戌: "天艺星",
  亥: "天寿星",
};

export type TianjiResult = {
  originalMonth: TianjiMonth;
  correctedMonth: TianjiMonth;
  correctedMonthNumber: number;
  hour: TianjiHour;
  afterMiddleQi: boolean;
  palace: TianjiPalace;
  star: string;
};

export function getCorrectedMonth(month: TianjiMonth, afterMiddleQi: boolean): { month: TianjiMonth; number: number } {
  const monthIndex = TIANJI_MONTHS.indexOf(month);
  if (monthIndex < 0) throw new Error("Unsupported lunar month");

  const rawNumber = monthIndex + 1;
  const correctedNumber = afterMiddleQi ? (rawNumber % 12) + 1 : rawNumber;
  return {
    month: TIANJI_MONTHS[correctedNumber - 1],
    number: correctedNumber,
  };
}

export function calculateTianjiXinggong(month: TianjiMonth, hour: TianjiHour, afterMiddleQi = false): TianjiResult {
  if (!TIANJI_HOURS.includes(hour)) throw new Error("Unsupported birth hour");

  const corrected = getCorrectedMonth(month, afterMiddleQi);
  const palace = TIANJI_PALACE_TABLE[corrected.month]?.[hour];
  if (!palace) throw new Error("Unable to resolve Tianji palace");

  return {
    originalMonth: month,
    correctedMonth: corrected.month,
    correctedMonthNumber: corrected.number,
    hour,
    afterMiddleQi,
    palace,
    star: STAR_BY_PALACE[palace],
  };
}
