import type { Locale } from "@/lib/i18n";

export const SITE_GUIDE_ROUTES = [
  "/",
  "/#analysisForm",
  "/history",
  "/account",
  "/login",
] as const;
export type SiteGuideRoute = (typeof SITE_GUIDE_ROUTES)[number];

export type SiteGuideAnswer = {
  reply: string;
  route: SiteGuideRoute | null;
  cta: string | null;
  source: "local" | "ai" | "fallback";
};

type GuideCopy = {
  analysis: [string, string];
  history: [string, string];
  account: [string, string];
  login: [string, string];
  home: [string, string];
};

const COPY: Record<Locale, GuideCopy> = {
  "zh-Hant": {
    analysis: ["填好出生資料後，昭梧會把內部專項判讀合成一份完整綜合報告。", "開始完整分析"],
    history: ["已保存的舊報告可以在「我的紀錄」重看。", "查看我的紀錄"],
    account: ["登入後儲存的八字提問與雲端報告，都在「我的昭梧」。", "查看我的昭梧"],
    login: ["登入後才能保存報告、沿用命盤續問或進入站主後台。", "前往登入"],
    home: ["請先填寫出生資料，昭梧會直接產生一份完整綜合報告。", "返回首頁"],
  },
  "zh-Hans": {
    analysis: ["填好出生资料后，昭梧会把内部专项判断合成一份完整综合报告。", "开始完整分析"],
    history: ["已保存的旧报告可以在“我的记录”重看。", "查看我的记录"],
    account: ["登录后保存的八字提问与云端报告，都在“我的昭梧”。", "查看我的昭梧"],
    login: ["登录后才能保存报告、沿用命盘继续提问或进入站主后台。", "前往登录"],
    home: ["请先填写出生资料，昭梧会直接生成一份完整综合报告。", "返回首页"],
  },
  en: {
    analysis: ["Enter your birth details and Zhaowu will combine its internal specialist readings into one complete report.", "Start full analysis"],
    history: ["Your previously saved reports are in My history.", "Open my history"],
    account: ["BaZi questions and cloud reports saved while signed in are in My Zhaowu.", "Open My Zhaowu"],
    login: ["Sign in to save reports, continue with the same chart, or access the owner area.", "Sign in"],
    home: ["Enter your birth details to receive one complete integrated report.", "Go home"],
  },
};

const ANALYSIS = /分析|八字|工作|事業|事业|感情|戀愛|恋爱|婚姻|時機|时机|選擇|选择|運勢|运势|命理|report|analysis|career|work|love|relationship|timing|choice|destiny/i;
const HISTORY = /保存|儲存|存档|存檔|報告|报告|紀錄|记录|歷史|历史|saved|report|history|record/i;
const ACCOUNT = /我的昭梧|帳戶|账户|account|my zhaowu/i;
const LOGIN = /登入|登錄|登录|註冊|注册|後台|后台|sign.?in|log.?in|register|admin/i;
const HOME = /首頁|首页|回去|主頁|主页|home|start over/i;
const SPECIALIST = /七政|四餘|四余|一掌經|一掌经|六道|前世|達摩|达摩|紫微|斗數|斗数|seven luminar|qizheng|past.?present|prior.?li|dharma palm|zi\s?wei/i;

function answer(copy: [string, string], route: SiteGuideRoute): SiteGuideAnswer {
  return { reply: copy[0], route, cta: copy[1], source: "local" };
}

export function resolveLocalSiteGuide(message: string, locale: Locale): SiteGuideAnswer | null {
  const text = message.trim();
  if (!text) return null;
  const copy = COPY[locale];
  if (LOGIN.test(text)) return answer(copy.login, "/login");
  if (ACCOUNT.test(text)) return answer(copy.account, "/account");
  if (SPECIALIST.test(text)) return answer(copy.analysis, "/#analysisForm");
  if (HISTORY.test(text)) return answer(copy.history, "/history");
  if (ANALYSIS.test(text)) return answer(copy.analysis, "/#analysisForm");
  if (HOME.test(text)) return answer(copy.home, "/");
  return null;
}

export function defaultSiteGuide(locale: Locale): SiteGuideAnswer {
  return { reply: COPY[locale].home[0], route: null, cta: null, source: "local" };
}

/** Customer navigation is intentionally provider-free. Never add an owner-funded API fallback here. */
export async function askSiteGuide(message: string, locale: Locale, _pathname: string): Promise<SiteGuideAnswer> {
  return resolveLocalSiteGuide(message, locale) ?? defaultSiteGuide(locale);
}
