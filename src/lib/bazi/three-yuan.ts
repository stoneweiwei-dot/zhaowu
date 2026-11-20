import { BRANCHES, STEMS, taiYuan, toLunar } from "./calendar";

export type ThreeYuanReliability = "medium-low" | "low-medium" | "low" | "unavailable";

export type ThreeYuanAuxiliary = {
  taiyuan: string;
  minggong: string;
  minggongSolar: string;
  minggongReliability: ThreeYuanReliability;
  shengong: string;
  shengongBranch: string;
  shengongReliability: ThreeYuanReliability;
  lunarMonth: number | null;
  solarMonth: number;
  lunarIsLeap: boolean;
  note: string;
};

function mod(value: number, base: number): number {
  return ((value % base) + base) % base;
}

function branchIndex(branch: string): number {
  return BRANCHES.indexOf(branch as (typeof BRANCHES)[number]);
}

function stemIndex(stem: string): number {
  return STEMS.indexOf(stem as (typeof STEMS)[number]);
}

/**
 * 《三命通會》命宮口徑：正月在子、二月在亥……十二月在丑；
 * 於生月宮位安出生時辰，再順排時辰至卯。天干以年干五虎遁安宮。
 */
export function mingGongClassic(yearGz: string, lunarMonth: number, hourBranch: string): string {
  const monthPalaceIndex = mod(1 - lunarMonth, 12);
  const hourIndex = branchIndex(hourBranch);
  if (hourIndex < 0 || lunarMonth < 1 || lunarMonth > 12) return "未定";

  const stepsToMao = mod(branchIndex("卯") - hourIndex, 12);
  const palaceIndex = mod(monthPalaceIndex + stepsToMao, 12);
  const palaceBranch = BRANCHES[palaceIndex];

  const yearStemIndex = stemIndex(yearGz[0]);
  if (yearStemIndex < 0) return "未定";
  const firstMonthStem = [2, 4, 6, 8, 0][yearStemIndex % 5];
  const offsetFromYin = mod(palaceIndex - branchIndex("寅"), 12);
  return STEMS[(firstMonthStem + offsetFromYin) % 10] + palaceBranch;
}

export function solarMonthNumberFromGanzhi(monthGz: string): number {
  const index = branchIndex(monthGz[1]);
  if (index < 0) return 1;
  return mod(index - branchIndex("寅"), 12) + 1;
}

/**
 * 身宮古典核心只鎖宮位（逢酉安身）。完整干支屬後世延伸：
 * 這裡採「由月柱干支同步順推至身宮支」的固定研究口徑，必須低權重標示。
 */
export function shenGongAuxiliary(monthGz: string, lunarMonth: number, hourBranch: string): { branch: string; ganZhi: string } {
  const monthPalaceIndex = mod(lunarMonth - 1, 12);
  const hourIndex = branchIndex(hourBranch);
  if (hourIndex < 0 || lunarMonth < 1 || lunarMonth > 12) return { branch: "未定", ganZhi: "未定" };

  const stepsToYou = mod(branchIndex("酉") - hourIndex, 12);
  const palaceIndex = mod(monthPalaceIndex - stepsToYou, 12);
  const palaceBranch = BRANCHES[palaceIndex];

  const monthStemIndex = stemIndex(monthGz[0]);
  const monthBranchIndex = branchIndex(monthGz[1]);
  if (monthStemIndex < 0 || monthBranchIndex < 0) return { branch: palaceBranch, ganZhi: "未定" };
  const branchOffset = mod(palaceIndex - monthBranchIndex, 12);
  return {
    branch: palaceBranch,
    ganZhi: STEMS[mod(monthStemIndex + branchOffset, 10)] + palaceBranch,
  };
}

export function buildThreeYuanAuxiliary(input: {
  yearGz: string;
  monthGz: string;
  localYear: number;
  localMonth: number;
  localDay: number;
  hourBranch: string | null;
  timeUnknown: boolean;
}): ThreeYuanAuxiliary {
  const taiyuan = taiYuan(input.monthGz);
  const solarMonth = solarMonthNumberFromGanzhi(input.monthGz);
  const lunar = toLunar(input.localYear, input.localMonth, input.localDay);
  const lunarMonth = lunar?.month ?? null;
  const lunarIsLeap = Boolean(lunar?.isLeap);

  if (input.timeUnknown || !input.hourBranch || !lunarMonth) {
    return {
      taiyuan,
      minggong: "未定",
      minggongSolar: "未定",
      minggongReliability: "unavailable",
      shengong: "未定",
      shengongBranch: "未定",
      shengongReliability: "unavailable",
      lunarMonth,
      solarMonth,
      lunarIsLeap,
      note: "胎元可由月柱固定推得；命宮與身宮依賴出生時辰，時辰未定時不作判定。三者均不得併入四柱旺衰或改寫用神。",
    };
  }

  const minggong = mingGongClassic(input.yearGz, lunarMonth, input.hourBranch);
  const minggongSolar = mingGongClassic(input.yearGz, solarMonth, input.hourBranch);
  const shengong = shenGongAuxiliary(input.monthGz, lunarMonth, input.hourBranch);
  const monthSensitivityConflict = minggong !== minggongSolar;
  const minggongReliability: ThreeYuanReliability = monthSensitivityConflict || lunarIsLeap ? "low" : "low-medium";

  return {
    taiyuan,
    minggong,
    minggongSolar,
    minggongReliability,
    shengong: shengong.ganZhi,
    shengongBranch: shengong.branch,
    shengongReliability: "low",
    lunarMonth,
    solarMonth,
    lunarIsLeap,
    note: monthSensitivityConflict
      ? "命宮的農曆月法與節令月敏感度結果不同，已自動降為低可信度；胎元、命宮、身宮只作原局完成後的補證，不得更換格局、旺衰或用神。"
      : lunarIsLeap
        ? "命宮落在閏月敏感情形，可信度已降級；胎元、命宮、身宮只作原局完成後的補證，不得更換格局、旺衰或用神。"
        : "胎元採月干進一、月支進三；命宮採《三命通會》農曆月法並保留節令月敏感度；身宮按逢酉安身，完整干支僅作後世研究口徑。三者只作低權重補證。",
  };
}
