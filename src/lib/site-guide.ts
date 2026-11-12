import type { DisplayLanguage } from "@/lib/display-language";
import { SITE_LOCALIZATION } from "@/lib/site-localization";

export const SITE_GUIDE_ROUTES = [
  "/",
  "/#birth-form",
  "/history",
  "/account",
  "/login",
  "/member",
] as const;
export type SiteGuideRoute = (typeof SITE_GUIDE_ROUTES)[number];

export type SiteGuideAnswer = {
  reply: string;
  route: SiteGuideRoute | null;
  cta: string | null;
  source: "local" | "ai" | "fallback";
};

type GuideCopy = {
  analysis: readonly [string, string];
  history: readonly [string, string];
  account: readonly [string, string];
  login: readonly [string, string];
  home: readonly [string, string];
};

const COPY = Object.fromEntries(
  Object.entries(SITE_LOCALIZATION).map(([language, copy]) => [language, copy.guide])
) as Record<DisplayLanguage, GuideCopy>;

const ANALYSIS = /分析|八字|工作|事業|事业|感情|戀愛|恋爱|婚姻|時機|时机|選擇|选择|運勢|运势|命理|report|analysis|career|work|love|relationship|timing|choice|destiny/i;
const FULL_REPORT = /完整(?:綜合|综合)?報告|完整(?:綜合|综合)?分析|complete\s+report|full\s+report|complete\s+analysis|full\s+analysis/i;
const HISTORY = /保存|儲存|存档|存檔|報告|报告|紀錄|记录|歷史|历史|saved|report|history|record/i;
const ACCOUNT = /我的昭梧|帳戶|账户|account|my zhaowu/i;
const LOGIN = /登入|登錄|登录|註冊|注册|後台|后台|sign.?in|log.?in|register|admin/i;
const HOME = /首頁|首页|回去|主頁|主页|home|start over/i;
const SPECIALIST = /七政|四餘|四余|一掌經|一掌经|六道|前世|達摩|达摩|紫微|斗數|斗数|seven luminar|qizheng|past.?present|prior.?li|dharma palm|zi\s?wei/i;

type LocalizedIntent = { login: readonly string[]; account: readonly string[]; full: readonly string[]; history: readonly string[]; analysis: readonly string[]; home: readonly string[] };
const LOCALIZED_INTENTS: Partial<Record<DisplayLanguage, LocalizedIntent>> = {
  "ja": {
    "login": [
      "ログイン",
      "サインイン",
      "登録"
    ],
    "account": [
      "アカウント",
      "マイページ"
    ],
    "full": [
      "完全版",
      "詳細版レポート"
    ],
    "history": [
      "私のレポート",
      "保存したレポート",
      "過去のレポート"
    ],
    "analysis": [
      "命書を作成",
      "分析",
      "八字",
      "出生情報"
    ],
    "home": [
      "ホーム",
      "最初のページ"
    ]
  },
  "ko": {
    "login": [
      "로그인",
      "회원가입"
    ],
    "account": [
      "계정",
      "내 페이지"
    ],
    "full": [
      "전체 보고서",
      "유료 보고서"
    ],
    "history": [
      "내 보고서",
      "저장한 보고서",
      "지난 보고서"
    ],
    "analysis": [
      "분석",
      "사주",
      "명식",
      "출생 정보"
    ],
    "home": [
      "홈으로",
      "첫 화면"
    ]
  },
  "hi": {
    "login": [
      "साइन इन",
      "लॉगिन",
      "पंजीकरण"
    ],
    "account": [
      "मेरा खाता",
      "खाता पृष्ठ"
    ],
    "full": [
      "पूरी रिपोर्ट",
      "विस्तृत रिपोर्ट"
    ],
    "history": [
      "मेरी रिपोर्टें",
      "सहेजी गई रिपोर्ट",
      "पुरानी रिपोर्ट"
    ],
    "analysis": [
      "विश्लेषण",
      "जन्म विवरण",
      "कुंडली",
      "काम"
    ],
    "home": [
      "होम",
      "मुख्य पृष्ठ"
    ]
  },
  "th": {
    "login": [
      "เข้าสู่ระบบ",
      "สมัครสมาชิก"
    ],
    "account": [
      "บัญชีของฉัน",
      "หน้าบัญชี"
    ],
    "full": [
      "รายงานฉบับเต็ม",
      "รายงานละเอียด"
    ],
    "history": [
      "รายงานของฉัน",
      "รายงานที่บันทึก"
    ],
    "analysis": [
      "วิเคราะห์",
      "ผังดวง",
      "วันเกิด",
      "เรื่องงาน"
    ],
    "home": [
      "หน้าแรก",
      "กลับบ้าน"
    ]
  },
  "id": {
    "login": [
      "masuk",
      "daftar",
      "login"
    ],
    "account": [
      "akun saya",
      "halaman akun"
    ],
    "full": [
      "laporan lengkap",
      "analisis lengkap"
    ],
    "history": [
      "laporan saya",
      "laporan tersimpan",
      "laporan lama"
    ],
    "analysis": [
      "analisis",
      "bagan bazi",
      "data lahir",
      "pekerjaan"
    ],
    "home": [
      "beranda",
      "halaman utama"
    ]
  },
  "vi": {
    "login": [
      "đăng nhập",
      "đăng ký"
    ],
    "account": [
      "tài khoản",
      "trang cá nhân"
    ],
    "full": [
      "báo cáo đầy đủ",
      "bản luận giải đầy đủ"
    ],
    "history": [
      "báo cáo của tôi",
      "báo cáo đã lưu",
      "báo cáo cũ"
    ],
    "analysis": [
      "phân tích",
      "lá số",
      "bát tự",
      "ngày sinh"
    ],
    "home": [
      "trang chủ",
      "về đầu trang"
    ]
  },
  "fil": {
    "login": [
      "mag-sign in",
      "mag-log in",
      "magparehistro"
    ],
    "account": [
      "aking account",
      "pamahalaan ang account"
    ],
    "full": [
      "buong ulat",
      "kumpletong ulat"
    ],
    "history": [
      "aking mga ulat",
      "mga na-save kong ulat",
      "mga dating ulat"
    ],
    "analysis": [
      "pagsusuri",
      "birth chart",
      "impormasyon ng kapanganakan",
      "trabaho"
    ],
    "home": [
      "home",
      "bumalik sa simula"
    ]
  }
};

function matchesLocalizedIntent(value: string, terms?: readonly string[]): boolean {
  if (!terms) return false;
  const normalized = value.toLocaleLowerCase();
  return terms.some((term) => normalized.includes(term.toLocaleLowerCase()));
}

function answer(copy: readonly [string, string], route: SiteGuideRoute): SiteGuideAnswer {
  return { reply: copy[0], route, cta: copy[1], source: "local" };
}

export function resolveLocalSiteGuide(message: string, locale: DisplayLanguage): SiteGuideAnswer | null {
  const text = message.trim();
  if (!text) return null;
  const copy = COPY[locale];
  const words = LOCALIZED_INTENTS[locale];
  if (LOGIN.test(text) || matchesLocalizedIntent(text, words?.login)) return answer(copy.login, "/member");
  if (ACCOUNT.test(text) || matchesLocalizedIntent(text, words?.account)) return answer(copy.account, "/account");
  if (SPECIALIST.test(text)) return answer(copy.analysis, "/#birth-form");
  if (FULL_REPORT.test(text) || matchesLocalizedIntent(text, words?.full)) return answer(copy.analysis, "/#birth-form");
  if (HISTORY.test(text) || matchesLocalizedIntent(text, words?.history)) return answer(copy.history, "/history");
  if (ANALYSIS.test(text) || matchesLocalizedIntent(text, words?.analysis)) return answer(copy.analysis, "/#birth-form");
  if (HOME.test(text) || matchesLocalizedIntent(text, words?.home)) return answer(copy.home, "/");
  return null;
}

export function defaultSiteGuide(locale: DisplayLanguage): SiteGuideAnswer {
  return { reply: COPY[locale].home[0], route: null, cta: null, source: "local" };
}

/** Customer navigation is intentionally provider-free. Never add an owner-funded API fallback here. */
export async function askSiteGuide(message: string, locale: DisplayLanguage, _pathname: string): Promise<SiteGuideAnswer> {
  return resolveLocalSiteGuide(message, locale) ?? defaultSiteGuide(locale);
}
