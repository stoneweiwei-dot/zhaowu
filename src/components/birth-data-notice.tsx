type NoticeLocale = "zh-Hant" | "zh-Hans" | "en";

// One short line, deliberately: the first step of the free flow must not feel like a legal form.
// The full wording (children, sensitive data, medical records) lives in the Privacy Policy.
const COPY = {
  birth: {
    "zh-Hant": "請只輸入你本人，或已取得對方同意的出生資料。",
    "zh-Hans": "请只输入你本人，或已取得对方同意的出生资料。",
    en: "Enter only your own birth details, or those of someone who has agreed.",
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
