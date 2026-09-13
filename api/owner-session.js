import { createHash, timingSafeEqual } from "node:crypto";

const OWNER_COOKIE = "__Host-zhaowu_owner_session";
const OWNER_KEY_SHA256 = "ab535831ae942e32e9c00f2181ba70d7aea3eca8678199c647a3fa609321efca";

function hash(value) {
  return createHash("sha256").update(String(value), "utf8").digest();
}

function isValidOwnerSecret(value) {
  if (!value || value.length < 32 || value.length > 256) return false;
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
    const key = part.slice(0, index).trim();
    if (key !== name) continue;
    try { return decodeURIComponent(part.slice(index + 1)); } catch { return ""; }
  }
  return "";
}

function requestHasOwnerSession(req) {
  return isValidOwnerSecret(readCookie(req, OWNER_COOKIE));
}

function json(res, status, body) {
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

export default async function handler(req, res) {
  try {
    if ((req.method || "GET") !== "GET") return json(res, 405, { authenticated: false });
    return json(res, 200, { authenticated: requestHasOwnerSession(req) });
  } catch (error) {
    return json(res, 500, { authenticated: false, error: "OWNER_SESSION_FAILED", detail: error instanceof Error ? error.message : "unknown" });
  }
}
