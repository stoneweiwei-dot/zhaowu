type NoticeLocale = "zh-Hant" | "zh-Hans" | "en";

// One short line, deliberately: the first step of the free flow must not feel like a legal form.
// The full wording (children, sensitive data, medical records) lives in the Privacy Policy.
const COPY = {
  birth: {
    "zh-Hant": "完成命盤後，生辰與盤面摘要會儲存於伺服器，用於提供及改善命盤服務；僅管理員可查看。你可來信要求刪除。請只輸入你本人或已同意者的資料。",
    "zh-Hans": "完成命盘后，生辰与盘面摘要会储存在服务器，用于提供和改善命盘服务；仅管理员可查看。你可来信申请删除。请只输入你本人或已同意者的资料。",
    en: "After a chart is completed, birth details and its chart snapshot are stored on our server to provide and improve the chart service. Only administrators can view them. Email us to request deletion. Enter only your own details or those of someone who agreed.",
  },
  question: {
    "zh-Hant": "提問請勿寫出他人的姓名、電話、住址等可識別資料。",
    "zh-Hans": "提问请勿写出他人的姓名、电话、住址等可识别资料。",
    en: "Please don't include other people's names, phone numbers or addresses.",
  },
} as const;

const LINK = {
  "zh-Hant": "隱私權政策",
  "zh-Hans": "隐私权政策",
  en: "Privacy Policy",
} as const;

/** Non-blocking one-line reminder shown where personal data is typed in. Opens the policy in a new tab. */
export function BirthDataNotice({ locale, variant }: { locale: NoticeLocale; variant: "birth" | "question" }) {
  return (
    <p className="zhaowu-data-notice" role="note" data-third-party-notice={variant}>
      {COPY[variant][locale]} <a href="/privacy" target="_blank" rel="noopener">{LINK[locale]}</a>
    </p>
  );
}
