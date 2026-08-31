import type { Locale } from "@/lib/i18n";
import { SUPABASE_KEY, SUPABASE_URL } from "@/lib/supabase-config";

export const SITE_GUIDE_ROUTES = [
  "/",
  "/#analysisForm",
  "/qizheng",
  "/yizhangjing",
  "/ziwei",
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
  qizheng: [string, string];
  palm: [string, string];
  ziwei: [string, string];
  history: [string, string];
  account: [string, string];
  login: [string, string];
  home: [string, string];
};

const COPY: Record<Locale, GuideCopy> = {
  "zh-Hant": {
    analysis: [
      "要問工作、感情、時機或人生選擇，從首頁的分析表單開始。",
      "開始八字分析",
    ],
    qizheng: ["七政四餘專看性情、情緒節奏、壓力反應、關係取向與機會如何落地。", "查看七政四餘"],
    palm: ["前世今生會用達摩一掌經排出前四世六道、留下的習性，以及重複六道的加強影響。", "查看前世今生"],
    ziwei: ["紫微斗數會直接生成性格、事業、財務、關係、壓力與人生階段的白話報告。", "查看紫微斗數"],
    history: ["七政、紫微與前世今生的舊報告，都可以在「我的紀錄」重看。", "查看我的紀錄"],
    account: ["登入後儲存的八字提問與雲端報告，都在「我的昭梧」。", "查看我的昭梧"],
    login: ["登入後才能保存報告、沿用命盤續問或進入站主後台。", "前往登入"],
    home: ["請從下方選擇八字、七政、前世今生、紫微或我的紀錄。", "返回首頁"],
  },
  "zh-Hans": {
    analysis: [
      "要问工作、感情、时机或人生选择，从首页的分析表单开始。",
      "开始八字分析",
    ],
    qizheng: ["七政四余专看性情、情绪节奏、压力反应、关系取向与机会如何落地。", "查看七政四余"],
    palm: ["前世今生会用达摩一掌经排出前四世六道、留下的习性，以及重复六道的加强影响。", "查看前世今生"],
    ziwei: ["紫微斗数会直接生成性格、事业、财务、关系、压力与人生阶段的白话报告。", "查看紫微斗数"],
    history: ["七政、紫微与前世今生的旧报告，都可以在“我的记录”重看。", "查看我的记录"],
    account: ["登录后保存的八字提问与云端报告，都在“我的昭梧”。", "查看我的昭梧"],
    login: ["登录后才能保存报告、沿用命盘继续提问或进入站主后台。", "前往登录"],
    home: ["请从下方选择八字、七政、前世今生、紫微或我的记录。", "返回首页"],
  },
  en: {
    analysis: [
      "For work, relationships, timing or a life decision, start with the analysis form on the home page.",
      "Start BaZi analysis",
    ],
    qizheng: ["Seven Luminaries focuses on temperament, emotional rhythm, pressure, relationships and how opportunity becomes sustainable.", "Open Seven Luminaries"],
    palm: ["Past & Present uses Dharma Palm to read four prior-life realms, carried habits and the stronger effect of repeated realms.", "Open Past & Present"],
    ziwei: ["Zi Wei gives you a plain-language report on character, work, money, relationships, pressure and your current life phase.", "Open Zi Wei"],
    history: ["Your previous Seven Luminaries, Zi Wei and Past & Present reports are in My history.", "Open my history"],
    account: ["BaZi questions and cloud reports saved while signed in are in My Zhaowu.", "Open My Zhaowu"],
    login: [
      "Sign in to save reports, continue with the same chart, or access the owner area.",
      "Sign in",
    ],
    home: ["Choose BaZi, Seven Luminaries, Past & Present, Zi Wei, or My history below.", "Go home"],
  },
};

const ANALYSIS =
  /分析|八字|工作|事業|事业|感情|戀愛|恋爱|婚姻|時機|时机|選擇|选择|運勢|运势|命理|report|analysis|career|work|love|relationship|timing|choice|destiny/i;
const QIZHENG = /七政|四餘|四余|seven luminar|qizheng/i;
const PALM = /一掌經|一掌经|六道|前世|達摩|达摩|past.?present|prior.?li|dharma palm/i;
const ZIWEI = /紫微|斗數|斗数|zi\s?wei/i;
const HISTORY = /保存|儲存|存档|存檔|報告|报告|紀錄|记录|歷史|历史|saved|report|history|record/i;
const ACCOUNT = /我的昭梧|帳戶|账户|account|my zhaowu/i;
const LOGIN =
  /登入|登錄|登录|註冊|注册|後台|后台|sign.?in|log.?in|register|admin/i;
const HOME = /首頁|首页|回去|主頁|主页|home|start over/i;

function answer(
  copy: [string, string],
  route: SiteGuideRoute,
): SiteGuideAnswer {
  return { reply: copy[0], route, cta: copy[1], source: "local" };
}

export function resolveLocalSiteGuide(
  message: string,
  locale: Locale,
): SiteGuideAnswer | null {
  const text = message.trim();
  if (!text) return null;
  const copy = COPY[locale];
  if (QIZHENG.test(text)) return answer(copy.qizheng, "/qizheng");
  if (PALM.test(text)) return answer(copy.palm, "/yizhangjing");
  if (ZIWEI.test(text)) return answer(copy.ziwei, "/ziwei");
  if (LOGIN.test(text)) return answer(copy.login, "/login");
  if (ACCOUNT.test(text)) return answer(copy.account, "/account");
  if (HISTORY.test(text)) return answer(copy.history, "/history");
  if (ANALYSIS.test(text)) return answer(copy.analysis, "/#analysisForm");
  if (HOME.test(text)) return answer(copy.home, "/");
  return null;
}

export function defaultSiteGuide(locale: Locale): SiteGuideAnswer {
  return { reply: COPY[locale].home[0], route: null, cta: null, source: "local" };
}

function isAllowedRoute(value: unknown): value is SiteGuideRoute {
  return (
    typeof value === "string" &&
    (SITE_GUIDE_ROUTES as readonly string[]).includes(value)
  );
}

export async function askSiteGuide(
  message: string,
  locale: Locale,
  pathname: string,
): Promise<SiteGuideAnswer> {
  const local = resolveLocalSiteGuide(message, locale);
  if (local) return local;

  const response = await fetch(`${SUPABASE_URL}/functions/v1/site-guide`, {
    method: "POST",
    headers: {
      apikey: SUPABASE_KEY,
      Authorization: `Bearer ${SUPABASE_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ message: message.slice(0, 400), locale, pathname }),
  });
  if (!response.ok) return defaultSiteGuide(locale);

  const body = (await response.json()) as Partial<SiteGuideAnswer>;
  return {
    reply:
      typeof body.reply === "string" && body.reply.trim()
        ? body.reply.trim().slice(0, 500)
        : defaultSiteGuide(locale).reply,
    route: isAllowedRoute(body.route) ? body.route : null,
    cta:
      typeof body.cta === "string" && body.cta.trim()
        ? body.cta.trim().slice(0, 80)
        : null,
    source: body.source === "ai" ? "ai" : "fallback",
  };
}
