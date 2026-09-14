import { jsonResponse } from "../lib/mingshu-client.js";
import {
  SOURCE_KINDS,
  ZHAOWU_ENGINE_VERSION,
  ZHAOWU_RELEASE,
} from "../lib/zhaowu-verification.js";

export default async function handler(req, res) {
  if ((req.method || "GET") !== "GET") {
    return jsonResponse(res, 405, { ok: false, error: { code: "METHOD_NOT_ALLOWED" } });
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
