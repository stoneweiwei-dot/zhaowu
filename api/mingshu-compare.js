import { fetchMingshuJson, jsonResponse, sanitizeChartInput } from "../lib/mingshu-client.js";
import { requestHasOwnerSession } from "../lib/owner-session-cookie.js";
import {
  compareZhaowuWithMingshu,
  isUsableZhaowuSnapshot,
  projectZhaowuChart,
} from "../lib/zhaowu-verification.js";

function headerValue(req, name) {
  const headers = req?.headers;
  if (!headers) return "";
  if (typeof headers.get === "function") return String(headers.get(name) ?? "");
  const raw = headers[name] ?? headers[name.toLowerCase()];
  return String(Array.isArray(raw) ? raw[0] : raw ?? "");
}

const MAX_COMPARE_BODY_BYTES = 65536;

async function readJsonBody(req) {
  if (req && typeof req.body === "object" && req.body) return req.body;
  if (typeof req.json === "function") return req.json();
  const chunks = [];
  let size = 0;
  for await (const chunk of req) {
    const buffer = Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk);
    size += buffer.length;
    if (size > MAX_COMPARE_BODY_BYTES) return null;
    chunks.push(buffer);
  }
  if (!chunks.length) return {};
  return JSON.parse(Buffer.concat(chunks).toString("utf8"));
}

export default async function handler(req, res) {
  if ((req.method || "POST") !== "POST") {
    return jsonResponse(res, 405, { ok: false, error: { code: "METHOD_NOT_ALLOWED" } });
  }
  if (!requestHasOwnerSession(req)) {
    return jsonResponse(res, 401, {
      ok: false,
      error: { code: "OWNER_REQUIRED", message: "Cross-engine verification is owner-gated." },
    });
  }

  let body;
  try {
    body = await readJsonBody(req);
  } catch {
    return jsonResponse(res, 400, { ok: false, error: { code: "INVALID_JSON" } });
  }
  if (!body) {
    return jsonResponse(res, 413, { ok: false, error: { code: "REQUEST_TOO_LARGE" } });
  }

  const sanitized = sanitizeChartInput(body.mingshuInput);
  if (!sanitized.ok) return jsonResponse(res, 400, sanitized);
  if (!isUsableZhaowuSnapshot(body.zhaowuSnapshot)) {
    return jsonResponse(res, 400, {
      ok: false,
      error: { code: "INVALID_ZHAOWU_SNAPSHOT", message: "A Zhaowu chart snapshot with dayMaster and at least three pillars is required." },
    });
  }
  const localProjection = projectZhaowuChart(body.zhaowuSnapshot);

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
    ok: true,
    comparison: compareZhaowuWithMingshu(localProjection, result.json),
    policy: {
      zhaowuCalculationTruthAuthoritative: true,
      sideChannelMayOverride: false,
      writesCustomerReport: false,
      stored: false,
    },
  });
}
