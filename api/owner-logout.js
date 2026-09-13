const OWNER_COOKIE = "__Host-zhaowu_owner_session";

function headerValue(req, name) {
  const headers = req?.headers;
  if (!headers) return "";
  if (typeof headers.get === "function") return String(headers.get(name) ?? "");
  const raw = headers[name] ?? headers[name.toLowerCase()];
  return String(Array.isArray(raw) ? raw[0] : raw ?? "");
}

function requestIsSameOrigin(req) {
  const origin = headerValue(req, "origin").trim();
  if (!origin) return true;
  const forwardedHost = (headerValue(req, "x-forwarded-host") || headerValue(req, "host")).split(",")[0].trim();
  if (!forwardedHost) return false;
  try { return new URL(origin).host === forwardedHost; } catch { return false; }
}

function json(res, status, body, extraHeaders = {}) {
  const headers = {
    "Content-Type": "application/json; charset=utf-8",
    "Cache-Control": "no-store",
    "X-Content-Type-Options": "nosniff",
    ...extraHeaders,
  };
  if (res && typeof res.status === "function" && typeof res.setHeader === "function") {
    for (const [key, value] of Object.entries(headers)) res.setHeader(key, value);
    return res.status(status).json(body);
  }
  return new Response(JSON.stringify(body), { status, headers });
}

export default async function handler(req, res) {
  try {
    if ((req.method || "GET") !== "POST") return json(res, 405, { ok: false });
    if (!requestIsSameOrigin(req)) return json(res, 403, { ok: false, error: "ORIGIN_REJECTED" });
    const cookie = `${OWNER_COOKIE}=; Path=/; HttpOnly; Secure; SameSite=Strict; Max-Age=0`;
    return json(res, 200, { ok: true }, { "Set-Cookie": cookie });
  } catch (error) {
    return json(res, 500, { ok: false, error: "OWNER_LOGOUT_FAILED", detail: error instanceof Error ? error.message : "unknown" });
  }
}
