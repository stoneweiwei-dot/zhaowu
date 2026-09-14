const DEFAULT_ORIGIN = "https://mingshu.help";
const MAX_BODY_BYTES = 4096;
const ALLOWED_CALENDARS = new Set(["solar", "lunar"]);
const ALLOWED_GENDERS = new Set(["male", "female"]);
const ALLOWED_TIME_MODES = new Set(["true_solar", "clock"]);
const ALLOWED_LOCALES = new Set(["zh-CN", "en", "zh-TW", "zh-HK", "ja-JP"]);

export function mingshuOrigin() {
  const raw = String(process.env.MINGSHU_API_ORIGIN || DEFAULT_ORIGIN).trim().replace(/\/$/, "");
  if (!raw.startsWith("https://")) return DEFAULT_ORIGIN;
  return raw;
}

export function jsonResponse(res, status, body) {
  const headers = {
    "Content-Type": "application/json; charset=utf-8",
    "Cache-Control": "no-store",
    "X-Content-Type-Options": "nosniff",
  };
  if (res && typeof res.status === "function" && typeof res.setHeader === "function") {
    for (const [key, value] of Object.entries(headers)) res.setHeader(key, value);
    return res.status(status).json(body);
  }
  return new Response(JSON.stringify(body), { status, headers });
}

export function sanitizeChartInput(raw) {
  if (!raw || typeof raw !== "object" || Array.isArray(raw)) {
    return { ok: false, error: { code: "INVALID_INPUT", message: "JSON object required." } };
  }
  const birthDate = String(raw.birthDate || "").trim();
  const birthTime = String(raw.birthTime || "").trim();
  const birthCalendar = String(raw.birthCalendar || "").trim();
  const gender = String(raw.gender || "").trim();
  const timeMode = String(raw.timeMode || "").trim();
  const locale = String(raw.locale || "zh-TW").trim();
  if (!/^\d{4}-\d{2}-\d{2}$/.test(birthDate)) {
    return { ok: false, error: { code: "INVALID_INPUT", message: "birthDate must be YYYY-MM-DD.", details: { field: "birthDate" } } };
  }
  if (!/^\d{2}:\d{2}$/.test(birthTime)) {
    return { ok: false, error: { code: "INVALID_INPUT", message: "birthTime must be HH:mm.", details: { field: "birthTime" } } };
  }
  if (!ALLOWED_CALENDARS.has(birthCalendar)) {
    return { ok: false, error: { code: "INVALID_INPUT", message: "birthCalendar must be solar or lunar.", details: { field: "birthCalendar" } } };
  }
  if (!ALLOWED_GENDERS.has(gender)) {
    return { ok: false, error: { code: "INVALID_INPUT", message: "gender must be male or female.", details: { field: "gender" } } };
  }
  if (!ALLOWED_TIME_MODES.has(timeMode)) {
    return { ok: false, error: { code: "INVALID_INPUT", message: "timeMode must be true_solar or clock.", details: { field: "timeMode" } } };
  }
  if (!ALLOWED_LOCALES.has(locale)) {
    return { ok: false, error: { code: "INVALID_INPUT", message: "unsupported locale.", details: { field: "locale" } } };
  }

  const input = { birthDate, birthTime, birthCalendar, gender, timeMode, locale };
  if (birthCalendar === "lunar") {
    if (typeof raw.birthLeapMonth !== "boolean") {
      return { ok: false, error: { code: "INVALID_INPUT", message: "birthLeapMonth required for lunar.", details: { field: "birthLeapMonth" } } };
    }
    input.birthLeapMonth = raw.birthLeapMonth;
  }
  if (timeMode === "true_solar") {
    const placeId = Number(raw.placeId);
    if (!Number.isInteger(placeId) || placeId <= 0) {
      return { ok: false, error: { code: "INVALID_INPUT", message: "placeId required for true_solar.", details: { field: "placeId" } } };
    }
    input.placeId = placeId;
  }
  const encoded = JSON.stringify(input);
  if (Buffer.byteLength(encoded, "utf8") > MAX_BODY_BYTES) {
    return { ok: false, error: { code: "REQUEST_TOO_LARGE", message: "payload exceeds 4096 bytes." } };
  }
  return { ok: true, input };
}

export function classifyMingshuSource(payload) {
  return {
    engine: "mingshu-bazi",
    origin: mingshuOrigin(),
    layer: "SIDE_CHANNEL",
    calcTruth: false,
    note: "本命書引擎的判斷；不得覆蓋昭梧四柱 Calculation Truth。",
    chartDigest: payload && typeof payload.chartDigest === "string" ? payload.chartDigest : null,
  };
}

export async function fetchMingshuJson(path, options = {}) {
  const origin = mingshuOrigin();
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), options.timeoutMs || 12000);
  try {
    const response = await fetch(`${origin}${path}`, {
      method: options.method || "GET",
      headers: {
        Accept: "application/json",
        ...(options.body ? { "Content-Type": "application/json" } : {}),
        ...(options.locale ? { "X-Locale": options.locale } : {}),
      },
      body: options.body ? JSON.stringify(options.body) : undefined,
      signal: controller.signal,
      redirect: "error",
    });
    const text = await response.text();
    let json = null;
    try { json = text ? JSON.parse(text) : null; } catch { json = null; }
    return { status: response.status, json, okHttp: response.ok };
  } catch (error) {
    const aborted = error && error.name === "AbortError";
    return {
      status: 0,
      json: { ok: false, error: { code: "CONNECTION_FAILED", message: aborted ? "timeout" : "network" } },
      okHttp: false,
    };
  } finally {
    clearTimeout(timer);
  }
}
