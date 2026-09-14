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

function validGregorianDate(value) {
  if (!/^(19|20)\d{2}-(0[1-9]|1[0-2])-(0[1-9]|[12]\d|3[01])$/.test(value)) return false;
  const date = new Date(`${value}T00:00:00Z`);
  return Number.isFinite(date.getTime()) && date.toISOString().slice(0, 10) === value;
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

  if (!validGregorianDate(birthDate)) {
    return { ok: false, error: { code: "INVALID_INPUT", message: "birthDate must be a valid YYYY-MM-DD from 1900-2099.", details: { field: "birthDate" } } };
  }
  if (!/^([01]\d|2[0-3]):[0-5]\d$/.test(birthTime)) {
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
  if (birthCalendar === "solar" && raw.birthLeapMonth === true) {
    return { ok: false, error: { code: "INVALID_INPUT", message: "solar dates cannot use birthLeapMonth=true.", details: { field: "birthLeapMonth" } } };
  }
  if (timeMode === "true_solar") {
    const placeId = String(raw.placeId || "").trim();
    if (!/^geonames:[1-9]\d{0,11}$/.test(placeId)) {
      return { ok: false, error: { code: "INVALID_INPUT", message: "placeId must be a city-level GeoNames ID such as geonames:1796236.", details: { field: "placeId" } } };
    }
    input.placeId = placeId;
  }
  const encoded = JSON.stringify(input);
  if (Buffer.byteLength(encoded, "utf8") > MAX_BODY_BYTES) {
    return { ok: false, error: { code: "REQUEST_TOO_LARGE", message: "payload exceeds 4096 bytes." } };
  }
  return { ok: true, input };
}

export function sanitizeLocationQuery(query, locale = "zh-TW") {
  const q = String(query || "").trim();
  const safeLocale = String(locale || "zh-TW").trim();
  if (!q || q.length > 120) {
    return { ok: false, error: { code: "QUERY_REQUIRED", message: "query must be 1-120 characters." } };
  }
  if (!ALLOWED_LOCALES.has(safeLocale)) {
    return { ok: false, error: { code: "INVALID_LOCALE", message: "unsupported locale." } };
  }
  return { ok: true, query: q, locale: safeLocale };
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
