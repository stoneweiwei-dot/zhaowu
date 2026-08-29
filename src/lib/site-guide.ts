import type { Locale } from "@/lib/i18n";
import { SUPABASE_KEY, SUPABASE_URL } from "@/lib/supabase-config";

export const SITE_GUIDE_ROUTES = [
  "/",
  "/#analysisForm",
  "/tianji-dual",
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
  dual: [string, string];
  account: [string, string];
  login: [string, string];
  home: [string, string];
};

const COPY: Record<Locale, GuideCopy> = {
  "zh-Hant": {
    analysis: [
      "要問工作、感情、時機或人生選擇，從首頁的分析表單開始。",
      "開始分析",
    ],
    dual: [
      "想看自己平時怎樣做事、壓力來時怎樣反應，請進入「性格兩面」。",
      "查看性格兩面",
    ],
    account: ["已保存的出生資料與最近報告都在「我的昭梧」。", "查看我的昭梧"],
    login: ["登入後才能保存報告、沿用命盤續問或進入站主後台。", "前往登入"],
    home: ["我可以帶你去分析、性格兩面、已保存報告或登入頁。", "返回首頁"],
  },
  "zh-Hans": {
    analysis: [
      "要问工作、感情、时机或人生选择，从首页的分析表单开始。",
      "开始分析",
    ],
    dual: [
      "想看自己平时怎样做事、压力来时怎样反应，请进入“性格两面”。",
      "查看性格两面",
    ],
    account: ["已保存的出生资料与最近报告都在“我的昭梧”。", "查看我的昭梧"],
    login: ["登录后才能保存报告、沿用命盘继续提问或进入站主后台。", "前往登录"],
    home: ["我可以带你去分析、性格两面、已保存报告或登录页。", "返回首页"],
  },
  en: {
    analysis: [
      "For work, relationships, timing or a life decision, start with the analysis form on the home page.",
      "Start analysis",
    ],
    dual: [
      "To see how you act day to day and how you respond under pressure, open Two sides of character.",
      "View two sides",
    ],
    account: [
      "Your saved birth details and recent reports are in My Zhaowu.",
      "Open My Zhaowu",
    ],
    login: [
      "Sign in to save reports, continue with the same chart, or access the owner area.",
      "Sign in",
    ],
    home: [
      "I can guide you to an analysis, Two sides of character, saved reports, or sign-in.",
      "Go home",
    ],
  },
};

const ANALYSIS =
  /分析|八字|工作|事業|事业|感情|戀愛|恋爱|婚姻|時機|时机|選擇|选择|運勢|运势|命理|report|analysis|career|work|love|relationship|timing|choice|destiny/i;
const DUAL =
  /性格兩面|性格两面|雙軌|双轨|天機|天机|一掌經|一掌经|命宮|命宫|六道|前世|two sides|dual|tianji|palm|life palace/i;
const ACCOUNT =
  /我的昭梧|保存|報告|报告|紀錄|记录|歷史|历史|帳戶|账户|account|saved|report|history/i;
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
  if (DUAL.test(text)) return answer(copy.dual, "/tianji-dual");
  if (LOGIN.test(text)) return answer(copy.login, "/login");
  if (ACCOUNT.test(text)) return answer(copy.account, "/account");
  if (ANALYSIS.test(text)) return answer(copy.analysis, "/#analysisForm");
  if (HOME.test(text)) return answer(copy.home, "/");
  return null;
}

export function defaultSiteGuide(locale: Locale): SiteGuideAnswer {
  return answer(COPY[locale].home, "/");
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
