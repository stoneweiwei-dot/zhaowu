import type { LifeViewArticle } from "@/lib/life-view";

/** Snapshot diagnosis dated 2026-10-15; the linked report is preserved in Traditional Chinese. */
export const CHINA_ACCESSIBILITY_DIAGNOSIS_ARTICLE: LifeViewArticle = {
  id: "china-accessibility-diagnosis",
  publishedAt: "2026-10-16",
  title: {
    "zh-Hant": "昭梧網站在中國大陸的訪問診斷",
    "zh-Hans": "昭梧网站在中国大陆的访问诊断",
    en: "A Dated Access Diagnosis for Mainland China",
  },
  summary: {
    "zh-Hant": "整理 2026 年 10 月 15 日對 vercel.app 連線與 Google Fonts 外部請求的診斷，並提供完整原文報告。",
    "zh-Hans": "整理 2026 年 10 月 15 日对 vercel.app 连接与 Google Fonts 外部请求的诊断，并提供完整原文报告。",
    en: "A dated review of vercel.app connectivity and Google Fonts requests, prepared on 15 October 2026, with a link to the full Chinese report.",
  },
  body: {
    "zh-Hant": "這份報告記錄 2026 年 10 月 15 日對昭梧網站在中國大陸訪問情況的診斷，討論 vercel.app 網域連線與 Google Fonts 外部請求。網站設定、網路服務商與 DNS 路徑都可能改變；報告內容是當日診斷紀錄，不代表目前每個地區的即時測試結果，也不構成訪問保證。完整報告保留原文與當時提出的排查建議。",
    "zh-Hans": "这份报告记录 2026 年 10 月 15 日对昭梧网站在中国大陆访问情况的诊断，讨论 vercel.app 域名连接与 Google Fonts 外部请求。网站设置、网络服务商与 DNS 路径都可能改变；报告内容是当日诊断记录，不代表目前每个地区的实时测试结果，也不构成访问保证。完整报告保留原文与当时提出的排查建议。",
    en: "This report records a diagnosis of Zhaowu's accessibility from mainland China on 15 October 2026, covering vercel.app connectivity and external Google Fonts requests. Site configuration, carriers and DNS routes can change. Treat it as a dated snapshot, not a live test of every region or a guarantee of access. The full report remains in Traditional Chinese and preserves the recommendations made at that time.",
  },
};
