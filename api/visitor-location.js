import { jsonResponse } from "../lib/mingshu-client.js";

function header(req, name) {
  const value = req?.headers?.[name] ?? req?.headers?.[name.toLowerCase()];
  return Array.isArray(value) ? value[0] : String(value || "");
}

function decodeHeader(value) {
  if (!value) return "";
  try { return decodeURIComponent(value); } catch { return value; }
}

function numberOrNull(value) {
  const parsed = Number.parseFloat(value);
  return Number.isFinite(parsed) ? parsed : null;
}

export default async function handler(req, res) {
  if ((req.method || "GET") !== "GET") {
    return jsonResponse(res, 405, { ok: false, error: { code: "METHOD_NOT_ALLOWED" } });
  }

  return jsonResponse(res, 200, {
    ok: true,
    source: "ip",
    accuracy: "coarse",
    city: decodeHeader(header(req, "x-vercel-ip-city")),
    country: header(req, "x-vercel-ip-country"),
    region: header(req, "x-vercel-ip-country-region"),
    postalCode: header(req, "x-vercel-ip-postal-code"),
    latitude: numberOrNull(header(req, "x-vercel-ip-latitude")),
    longitude: numberOrNull(header(req, "x-vercel-ip-longitude")),
    timezone: decodeHeader(header(req, "x-vercel-ip-timezone")),
  });
}
