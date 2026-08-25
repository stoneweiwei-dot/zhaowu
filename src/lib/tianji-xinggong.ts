export const TIANJI_MONTHS = ["正", "二", "三", "四", "五", "六", "七", "八", "九", "十", "冬", "腊"] as const;
export const TIANJI_HOURS = ["子", "丑", "寅", "卯", "辰", "巳", "午", "未", "申", "酉", "戌", "亥"] as const;

export type TianjiMonth = (typeof TIANJI_MONTHS)[number];
export type TianjiHour = (typeof TIANJI_HOURS)[number];
export type TianjiPalace = "子" | "丑" | "寅" | "卯" | "辰" | "巳" | "午" | "未" | "申" | "酉" | "戌" | "亥";

const HOUR_NUMBER: Record<TianjiHour, number> = {
  寅: 1,
  卯: 2,
  辰: 3,
  巳: 4,
  午: 5,
  未: 6,
  申: 7,
  酉: 8,
  戌: 9,
  亥: 10,
  子: 11,
  丑: 12,
};

const PALACE_BY_NUMBER: Record<number, TianjiPalace> = {
  1: "寅",
  2: "卯",
  3: "辰",
  4: "巳",
  5: "午",
  6: "未",
  7: "申",
  8: "酉",
  9: "戌",
  10: "亥",
  11: "子",
  12: "丑",
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
  const hourNumber = HOUR_NUMBER[hour];
  if (!hourNumber) throw new Error("Unsupported birth hour");

  const corrected = getCorrectedMonth(month, afterMiddleQi);
  let palaceNumber = 26 - (corrected.number + hourNumber);
  if (palaceNumber > 12) palaceNumber -= 12;

  const palace = PALACE_BY_NUMBER[palaceNumber];
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
