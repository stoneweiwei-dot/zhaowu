import { createHash, timingSafeEqual } from "node:crypto";
import { fetchMingshuJson, jsonResponse, sanitizeLocationQuery } from "../lib/mingshu-client.js";

const OWNER_COOKIE = "__Host-zhaowu_owner_session";
const OWNER_KEY_SHA256 = "6236d83b2be351c9c80cd4ed07e8cadac684ab8d5a659096eb26b2e984a33c07";

function hash(value) {
  return createHash("sha256").update(String(value), "utf8").digest();
}

function isValidOwnerSecret(value) {
  if (!value || value.length < 8 || value.length > 256) return false;
  const expected = Buffer.from(OWNER_KEY_SHA256, "hex");
  const actual = hash(value);
  return actual.length === expected.length && timingSafeEqual(actual, expected);
}

function headerValue(req, name) {
  const headers = req?.headers;
  if (!headers) return "";
  if (typeof headers.get === "function") return String(headers.get(name) ?? "");
  const raw = headers[name] ?? headers[name.toLowerCase()];
  return String(Array.isArray(raw) ? raw[0] : raw ?? "");
}

function readCookie(req, name) {
  const raw = headerValue(req, "cookie");
  for (const part of raw.split(";")) {
    const index = part.indexOf("=");
    if (index < 0) continue;
    if (part.slice(0, index).trim() !== name) continue;
    try { return decodeURIComponent(part.slice(index + 1)); } catch { return ""; }
  }
  return "";
}

function requestHasOwnerSession(req) {
  return isValidOwnerSecret(readCookie(req, OWNER_COOKIE));
}

function queryValue(req, name) {
  const direct = req?.query?.[name];
  if (direct !== undefined) return Array.isArray(direct) ? direct[0] : direct;
  try {
    const url = new URL(req?.url || "", "https://zhaowu.local");
    return url.searchParams.get(name) || "";
  } catch {
    return "";
  }
}

export default async function handler(req, res) {
  if ((req.method || "GET") !== "GET") {
    return jsonResponse(res, 405, { ok: false, error: { code: "METHOD_NOT_ALLOWED" } });
  }
  if (!requestHasOwnerSession(req)) {
    return jsonResponse(res, 401, { ok: false, error: { code: "OWNER_REQUIRED" } });
  }

  const sanitized = sanitizeLocationQuery(queryValue(req, "q"), queryValue(req, "locale") || "zh-TW");
  if (!sanitized.ok) return jsonResponse(res, 400, sanitized);

  const result = await fetchMingshuJson(
    `/api/locations?q=${encodeURIComponent(sanitized.query)}`,
    { locale: sanitized.locale, timeoutMs: 10000 },
  );
  if (!result.okHttp || !result.json) {
    return jsonResponse(res, result.status === 429 ? 429 : 503, result.json || {
      ok: false,
      error: { code: "SERVICE_UNAVAILABLE" },
    });
  }
  return jsonResponse(res, 200, {
    ...result.json,
    zhaowu: { purpose: "owner-side location lookup", storesResult: false },
  });
}
