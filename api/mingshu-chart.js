import { createHash, timingSafeEqual } from "node:crypto";
import { classifyMingshuSource, fetchMingshuJson, jsonResponse, sanitizeChartInput } from "../lib/mingshu-client.js";

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
    const key = part.slice(0, index).trim();
    if (key !== name) continue;
    try { return decodeURIComponent(part.slice(index + 1)); } catch { return ""; }
  }
  return "";
}

function requestHasOwnerSession(req) {
  return isValidOwnerSecret(readCookie(req, OWNER_COOKIE));
}

async function readJsonBody(req) {
  if (req && typeof req.body === "object" && req.body) return req.body;
  if (typeof req.json === "function") return req.json();
  const chunks = [];
  for await (const chunk of req) chunks.push(chunk);
  const raw = Buffer.concat(chunks.map((item) => Buffer.isBuffer(item) ? item : Buffer.from(item)));
  if (raw.length > 4096) return null;
  return raw.length ? JSON.parse(raw.toString("utf8")) : {};
}

export default async function handler(req, res) {
  try {
    if ((req.method || "POST") !== "POST") {
      return jsonResponse(res, 405, { ok: false, error: { code: "METHOD_NOT_ALLOWED" } });
    }
    if (!requestHasOwnerSession(req)) {
      return jsonResponse(res, 401, { ok: false, error: { code: "OWNER_REQUIRED", message: "Mingshu chart proxy is owner-gated." } });
    }
    let body;
    try {
      body = await readJsonBody(req);
    } catch {
      return jsonResponse(res, 400, { ok: false, error: { code: "INVALID_CONTENT_TYPE" } });
    }
    const sanitized = sanitizeChartInput(body);
    if (!sanitized.ok) return jsonResponse(res, 400, sanitized);

    const result = await fetchMingshuJson("/api/v1/chart", {
      method: "POST",
      body: sanitized.input,
      locale: sanitized.input.locale,
      timeoutMs: 15000,
    });
    if (!result.okHttp || !result.json) {
      return jsonResponse(res, result.status === 429 ? 429 : 503, result.json || {
        ok: false,
        error: { code: "SERVICE_UNAVAILABLE" },
      });
    }
    return jsonResponse(res, 200, {
      ...result.json,
      source: classifyMingshuSource(result.json),
      zhaowu: {
        wiredIntoFinalizeReading: false,
        overridesBaziCalcTruth: false,
      },
    });
  } catch (error) {
    return jsonResponse(res, 503, {
      ok: false,
      error: { code: "CONNECTION_FAILED", message: error instanceof Error ? error.message : "unknown" },
    });
  }
}
