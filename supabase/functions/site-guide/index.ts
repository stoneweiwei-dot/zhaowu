const ALLOWED_ROUTES = [
  "/",
  "/#analysisForm",
  "/history",
  "/account",
  "/login",
] as const;
type AllowedRoute = (typeof ALLOWED_ROUTES)[number];
type Locale = "zh-Hant" | "zh-Hans" | "en";

const PRIMARY_ORIGIN = "https://archive-stone-zhaowu-official.netlify.app";

function allowedOrigin(origin: string | null) {
  if (!origin) return PRIMARY_ORIGIN;
  try {
    const url = new URL(origin);
    if (
      url.hostname === "archive-stone-zhaowu-official.netlify.app" ||
      url.hostname === "zhaowu.soul-terminal.com" ||
      url.hostname === "stone-zhaowu-official.vercel.app" ||
      (url.hostname.startsWith("stone-zhaowu-official-") && url.hostname.endsWith(".vercel.app")) ||
      url.hostname === "localhost" || url.hostname === "127.0.0.1"
    ) return origin;
  } catch { /* reject below */ }
  return PRIMARY_ORIGIN;
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
    headers: { ...cors(req), "Content-Type": "application/json", "Cache-Control": "no-store" },
  });
}

function normalizeLocale(value: unknown): Locale {
  return value === "en" || value === "zh-Hant" ? value : "zh-Hans";
}

function fallback(locale: Locale) {
  if (locale === "en") return { reply: "Enter your birth details to receive one complete integrated report.", route: "/#analysisForm" as AllowedRoute, cta: "Start full analysis", source: "local" };
  if (locale === "zh-Hant") return { reply: "請先填寫出生資料，昭梧會直接產生一份完整綜合報告。", route: "/#analysisForm" as AllowedRoute, cta: "開始完整分析", source: "local" };
  return { reply: "请先填写出生资料，昭梧会直接生成一份完整综合报告。", route: "/#analysisForm" as AllowedRoute, cta: "开始完整分析", source: "local" };
}

/**
 * Cost-isolation invariant: this compatibility endpoint is provider-free.
 * Never add a private owner-funded model, translation service, or provider fallback here.
 */
Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: cors(req) });
  if (req.method !== "POST") return json(req, { error: "METHOD_NOT_ALLOWED" }, 405);

  let payload: { locale?: unknown } = {};
  try { payload = await req.json(); }
  catch { return json(req, { error: "INVALID_JSON" }, 400); }

  return json(req, fallback(normalizeLocale(payload.locale)));
});
