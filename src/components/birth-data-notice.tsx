type NoticeLocale = "zh-Hant" | "zh-Hans" | "en";

const COPY = {
  birth: {
    "zh-Hant": {
      title: "請只輸入你本人，或已取得對方同意的出生資料",
      body: "出生資料屬個人資料，預設只在你的裝置上計算與保存。替孩子輸入時，請由家長或監護人操作。",
    },
    "zh-Hans": {
      title: "请只输入你本人，或已取得对方同意的出生资料",
      body: "出生资料属个人资料，默认只在你的设备上计算与保存。替孩子输入时，请由家长或监护人操作。",
    },
    en: {
      title: "Enter only your own birth details, or details of someone who has agreed",
      body: "Birth details are personal information and are calculated and stored on your own device by default. If you are entering a child's details, a parent or guardian should do it.",
    },
  },
  question: {
    "zh-Hant": {
      title: "提問時請保護他人隱私",
      body: "請勿寫出他人的姓名、電話、住址或身分證號，用「我的上司」「他」等稱呼即可；也請避免貼上病歷等敏感資料。",
    },
    "zh-Hans": {
      title: "提问时请保护他人隐私",
      body: "请勿写出他人的姓名、电话、住址或身份证号，用“我的上司”“他”等称呼即可；也请避免贴上病历等敏感资料。",
    },
    en: {
      title: "Please protect other people's privacy when you ask",
      body: "Do not write another person's name, phone number, address or ID number; \"my manager\" or \"he\" is enough. Please also avoid pasting medical records or other sensitive details.",
    },
  },
} as const;

const LINK = {
  "zh-Hant": "隱私權政策",
  "zh-Hans": "隐私权政策",
  en: "Privacy Policy",
} as const;

/** Non-blocking reminder shown where personal data is typed in. Opens the policy in a new tab. */
export function BirthDataNotice({ locale, variant }: { locale: NoticeLocale; variant: "birth" | "question" }) {
  const copy = COPY[variant][locale];
  return (
    <aside className="zhaowu-data-notice" role="note" data-third-party-notice={variant}>
      <strong>{copy.title}</strong>
      <span>{copy.body} <a href="/privacy" target="_blank" rel="noopener">{LINK[locale]}</a></span>
    </aside>
  );
}
