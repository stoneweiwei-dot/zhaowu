import { jsonResponse } from "../lib/mingshu-client.js";
import {
  SOURCE_KINDS,
  ZHAOWU_ENGINE_VERSION,
  ZHAOWU_RELEASE,
} from "../lib/zhaowu-verification.js";

function headerValue(req, name) {
  const headers = req?.headers;
  if (!headers) return "";
  if (typeof headers.get === "function") return String(headers.get(name) ?? "");
  const raw = headers[name] ?? headers[name.toLowerCase()];
  return String(Array.isArray(raw) ? raw[0] : raw ?? "");
}

function decodeHeader(value) {
  if (!value) return "";
  try { return decodeURIComponent(value); } catch { return value; }
}

function numberOrNull(value) {
  const parsed = Number.parseFloat(value);
  return Number.isFinite(parsed) ? parsed : null;
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

function visitorLocation(req) {
  return {
    ok: true,
    source: "ip",
    accuracy: "coarse",
    city: decodeHeader(headerValue(req, "x-vercel-ip-city")),
    country: headerValue(req, "x-vercel-ip-country"),
    region: headerValue(req, "x-vercel-ip-country-region"),
    postalCode: headerValue(req, "x-vercel-ip-postal-code"),
    latitude: numberOrNull(headerValue(req, "x-vercel-ip-latitude")),
    longitude: numberOrNull(headerValue(req, "x-vercel-ip-longitude")),
    timezone: decodeHeader(headerValue(req, "x-vercel-ip-timezone")),
  };
}

export default async function handler(req, res) {
  if ((req.method || "GET") !== "GET") {
    return jsonResponse(res, 405, { ok: false, error: { code: "METHOD_NOT_ALLOWED" } });
  }
  if (queryValue(req, "mode") === "visitor-location") {
    return jsonResponse(res, 200, visitorLocation(req));
  }
  return jsonResponse(res, 200, {
    ok: true,
    apiVersion: "1",
    release: ZHAOWU_RELEASE,
    engine: {
      name: "Zhaowu BaZi",
      version: ZHAOWU_ENGINE_VERSION,
      calculationTruth: "STONE ZiPing R6.2.1",
    },
    sourceKinds: SOURCE_KINDS,
    capabilities: {
      bazi: {
        trueSolarTime: true,
        unknownBirthTime: "supported-with-degraded-judgment",
        evidenceLabels: true,
        chartFingerprint: true,
        externalCrossCheck: true,
      },
      verification: {
        mingshu: "optional-side-channel",
        sideChannelOverridesCalculationTruth: false,
      },
    },
    endpoints: {
      capabilities: "/api/zhaowu-capabilities",
      visitorLocation: "/api/zhaowu-capabilities?mode=visitor-location",
      doctor: "/api/zhaowu-doctor",
      mingshuDoctor: "/api/mingshu-doctor",
      mingshuLocations: "/api/mingshu-locations",
      mingshuChart: "/api/mingshu-chart",
      mingshuCompare: "/api/mingshu-compare",
    },
    privacy: {
      discoverySendsBirthData: false,
      comparisonStored: false,
      externalBirthDataRequiresOwnerAction: true,
    },
  });
}
