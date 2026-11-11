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

function answer(copy: readonly [string, string], route: SiteGuideRoute): SiteGuideAnswer {
  return { reply: copy[0], route, cta: copy[1], source: "local" };
}

export function resolveLocalSiteGuide(message: string, locale: DisplayLanguage): SiteGuideAnswer | null {
  const text = message.trim();
  if (!text) return null;
  const copy = COPY[locale];
  if (LOGIN.test(text)) return answer(copy.login, "/member");
  if (ACCOUNT.test(text)) return answer(copy.account, "/account");
  if (SPECIALIST.test(text)) return answer(copy.analysis, "/#birth-form");
  if (FULL_REPORT.test(text)) return answer(copy.analysis, "/#birth-form");
  if (HISTORY.test(text)) return answer(copy.history, "/history");
  if (ANALYSIS.test(text)) return answer(copy.analysis, "/#birth-form");
  if (HOME.test(text)) return answer(copy.home, "/");
  return null;
}

export function defaultSiteGuide(locale: DisplayLanguage): SiteGuideAnswer {
  return { reply: COPY[locale].home[0], route: null, cta: null, source: "local" };
}

/** Customer navigation is intentionally provider-free. Never add an owner-funded API fallback here. */
export async function askSiteGuide(message: string, locale: DisplayLanguage, _pathname: string): Promise<SiteGuideAnswer> {
  return resolveLocalSiteGuide(message, locale) ?? defaultSiteGuide(locale);
}
