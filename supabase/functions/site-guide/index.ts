const ALLOWED_ROUTES = [
  "/",
  "/#analysisForm",
  "/qizheng",
  "/yizhangjing",
  "/ziwei",
  "/history",
  "/account",
  "/login",
] as const;
type AllowedRoute = (typeof ALLOWED_ROUTES)[number];

type Locale = "zh-Hant" | "zh-Hans" | "en";

function allowedOrigin(origin: string | null) {
  if (!origin) return "https://stone-zhaowu-official.vercel.app";
  try {
    const url = new URL(origin);
    if (
      url.hostname === "stone-zhaowu-official.vercel.app" ||
      (url.hostname.startsWith("stone-zhaowu-official-") &&
        url.hostname.endsWith(".vercel.app")) ||
      url.hostname === "localhost" ||
      url.hostname === "127.0.0.1"
    ) return origin;
  } catch {
    /* ignore */
  }
  return "https://stone-zhaowu-official.vercel.app";
}

function cors(req: Request) {
  return {
    "Access-Control-Allow-Origin": allowedOrigin(req.headers.get("origin")),
    "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    Vary: "Origin",
  };
}

function json(req: Request, body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      ...cors(req),
      "Content-Type": "application/json",
      "Cache-Control": "no-store",
    },
  });
}

function normalizeLocale(value: unknown): Locale {
  return value === "en" || value === "zh-Hant" ? value : "zh-Hans";
}

function fallback(locale: Locale) {
  if (locale === "en") {
    return {
      reply: "Choose BaZi, Seven Luminaries, Past & Present, Zi Wei, or My history.",
      route: "/" as AllowedRoute,
      cta: "Go home",
      source: "local",
    };
  }
  if (locale === "zh-Hant") {
    return {
      reply: "請選擇八字、七政、前世今生、紫微或我的紀錄。",
      route: "/" as AllowedRoute,
      cta: "返回首頁",
      source: "local",
    };
  }
  return {
    reply: "请选择八字、七政、前世今生、紫微或我的记录。",
    route: "/" as AllowedRoute,
    cta: "返回首页",
    source: "local",
  };
}

/**
 * Cost-isolation rule:
 * this customer-facing endpoint is deliberately provider-free.
 * Never add OPENAI_API_KEY, another owner-funded provider key, or a remote
 * translation/model fallback here. The browser implementation is local-only;
 * this endpoint remains only as a safe compatibility fallback for old clients.
 */
Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: cors(req) });
  if (req.method !== "POST") return json(req, { error: "METHOD_NOT_ALLOWED" }, 405);

  let payload: { locale?: unknown } = {};
  try {
    payload = await req.json();
  } catch {
    return json(req, { error: "INVALID_JSON" }, 400);
  }

  return json(req, fallback(normalizeLocale(payload.locale)));
});
