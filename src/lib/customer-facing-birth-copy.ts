import type { AppLocale } from "@/lib/bazi/types";

export type CustomerFacingBirthCopy = {
  customerKicker: string;
  customerTitle: string;
  customerLead: string;
  baziLead: string;
  chartPending: string;
  birthReady: string;
  birthReadyLead: string;
  useRecord: string;
};

export function customerFacingBirthCopy(locale: AppLocale): CustomerFacingBirthCopy {
  if (locale === "en") {
    return {
      customerKicker: "ONE-TIME SETUP",
      customerTitle: "Build your chart",
      customerLead: "Enter your birth data once. Each personal reading can reuse it.",
      baziLead: "Calculated from the birth data above.",
      chartPending: "Complete your birth data to preview the Four Pillars chart.",
      birthReady: "Birth data saved",
      birthReadyLead: "Other personal readings will reuse this birth data.",
      useRecord: "The analysis will use the birth data shown above.",
    };
  }
  if (locale === "zh-Hans") {
    return {
      customerKicker: "一次填写",
      customerTitle: "建立你的命盘",
      customerLead: "生辰只需填写一次，各命理专卷会共用这份资料。",
      baziLead: "命盘依据上方出生资料自动排出。",
      chartPending: "完成出生资料后，这里会显示四柱命盘。",
      birthReady: "出生资料已保存",
      birthReadyLead: "其他命理专卷会沿用这份出生资料。",
      useRecord: "将使用上方出生资料进行分析。",
    };
  }
  return {
    customerKicker: "一次填寫",
    customerTitle: "建立你的命盤",
    customerLead: "生辰只需填寫一次，各命理專卷會共用這份資料。",
    baziLead: "命盤依據上方出生資料自動排出。",
    chartPending: "完成出生資料後，這裡會顯示四柱命盤。",
    birthReady: "出生資料已保存",
    birthReadyLead: "其他命理專卷會沿用這份出生資料。",
    useRecord: "將使用上方出生資料進行分析。",
  };
}
