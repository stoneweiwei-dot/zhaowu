const ALLOWED_ROUTES = [
  "/",
  "/#analysisForm",
  "/qizheng",
  "/yizhangjing",
  "/ziwei",
  "/tianji-dual",
  "/history",
  "/account",
  "/login",
] as const;
type AllowedRoute = (typeof ALLOWED_ROUTES)[number];

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
    )
      return origin;
  } catch {
    /* ignore */
  }
  return "https://stone-zhaowu-official.vercel.app";
}

function cors(req: Request) {
  return {
    "Access-Control-Allow-Origin": allowedOrigin(req.headers.get("origin")),
    "Access-Control-Allow-Headers":
      "authorization, x-client-info, apikey, content-type",
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

function safeRoute(value: unknown): AllowedRoute | null {
  return typeof value === "string" &&
    (ALLOWED_ROUTES as readonly string[]).includes(value)
    ? (value as AllowedRoute)
    : null;
}

function fallback(locale: string) {
  if (locale === "en")
    return {
      reply:
        "Choose BaZi, Seven Luminaries, Past & Present, Zi Wei, Two sides, or My history.",
      route: "/",
      cta: "Go home",
      source: "fallback",
    };
  if (locale === "zh-Hant")
    return {
      reply: "請選擇八字、七政、前世今生、紫微、性格兩面或我的紀錄。",
      route: "/",
      cta: "返回首頁",
      source: "fallback",
    };
  return {
    reply: "请选择八字、七政、前世今生、紫微、性格两面或我的记录。",
    route: "/",
    cta: "返回首页",
    source: "fallback",
  };
}

function outputText(body: any): string {
  if (typeof body?.output_text === "string") return body.output_text;
  for (const item of body?.output ?? [])
    for (const part of item?.content ?? [])
      if (typeof part?.text === "string") return part.text;
  return "";
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS")
    return new Response("ok", { headers: cors(req) });
  if (req.method !== "POST")
    return json(req, { error: "METHOD_NOT_ALLOWED" }, 405);

  let payload: { message?: unknown; locale?: unknown; pathname?: unknown };
  try {
    payload = await req.json();
  } catch {
    return json(req, { error: "INVALID_JSON" }, 400);
  }
  const message =
    typeof payload.message === "string"
      ? payload.message.trim().slice(0, 400)
      : "";
  const locale =
    payload.locale === "en" || payload.locale === "zh-Hant"
      ? payload.locale
      : "zh-Hans";
  const pathname =
    typeof payload.pathname === "string" ? payload.pathname.slice(0, 80) : "/";
  if (!message) return json(req, { error: "MESSAGE_REQUIRED" }, 400);

  const key = Deno.env.get("OPENAI_API_KEY");
  if (!key) return json(req, fallback(locale));

  try {
    const response = await fetch("https://api.openai.com/v1/responses", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${key}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "gpt-4.1-nano",
        max_output_tokens: 360,
        text: {
          format: {
            type: "json_schema",
            name: "site_guide",
            strict: true,
            schema: {
              type: "object",
              additionalProperties: false,
              properties: {
                reply: { type: "string" },
                route: {
                  type: ["string", "null"],
                  enum: [...ALLOWED_ROUTES, null],
                },
                cta: { type: ["string", "null"] },
              },
              required: ["reply", "route", "cta"],
            },
          },
        },
        instructions: `You are the Jade Dragon navigation guide for Zhaowu. You ONLY help visitors choose an existing page. Never perform BaZi readings, medical/legal/financial advice, or invent routes. Available routes: / = home; /#analysisForm = BaZi questions about work, relationships, timing or choices; /qizheng = Seven Luminaries plain-language report; /yizhangjing = Past & Present Dharma Palm report; /ziwei = Zi Wei plain-language report; /tianji-dual = Two sides of character; /history = specialist reports saved on this device; /account = signed-in BaZi questions and cloud reports; /login = sign in/register. Reply naturally and completely in ${locale}. Return only compact JSON with keys reply, route, cta. route must be one available route or null. Keep reply under 55 words.`,
        input: `Current page: ${pathname}\nVisitor: ${message}`,
      }),
    });
    if (!response.ok) {
      const errorBody = await response.json().catch(() => ({}));
      console.error(
        "site-guide OpenAI request failed",
        response.status,
        errorBody?.error?.type ?? "unknown",
        errorBody?.error?.code ?? "unknown",
      );
      return json(req, fallback(locale));
    }
    const data = await response.json();
    const raw = outputText(data)
      .replace(/^```json\s*|\s*```$/g, "")
      .trim();
    const parsed = JSON.parse(raw);
    return json(req, {
      reply:
        typeof parsed.reply === "string"
          ? parsed.reply.slice(0, 500)
          : fallback(locale).reply,
      route: safeRoute(parsed.route),
      cta: typeof parsed.cta === "string" ? parsed.cta.slice(0, 80) : null,
      source: "ai",
    });
  } catch (error) {
    console.error(
      "site-guide response handling failed",
      error instanceof Error ? error.message : String(error),
    );
    return json(req, fallback(locale));
  }
});
