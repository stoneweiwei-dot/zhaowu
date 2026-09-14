import { fetchMingshuJson, jsonResponse, mingshuOrigin } from "../lib/mingshu-client.js";
import { ZHAOWU_ENGINE_VERSION, ZHAOWU_RELEASE } from "../lib/zhaowu-verification.js";

export default async function handler(req, res) {
  if ((req.method || "GET") !== "GET") {
    return jsonResponse(res, 405, { ok: false, error: { code: "METHOD_NOT_ALLOWED" } });
  }

  const result = await fetchMingshuJson("/api/v1/capabilities", { timeoutMs: 8000 });
  const mingshuReachable = Boolean(result.okHttp && result.json && result.json.ok !== false);

  return jsonResponse(res, 200, {
    ok: true,
    release: ZHAOWU_RELEASE,
    local: {
      status: "reachable",
      engineVersion: ZHAOWU_ENGINE_VERSION,
      calculationTruthReady: true,
    },
    sideChannels: {
      mingshu: {
        required: false,
        status: mingshuReachable ? "reachable" : "failed",
        origin: mingshuOrigin(),
        apiVersion: result.json?.apiVersion ?? null,
        error: mingshuReachable ? null : (result.json?.error ?? { code: "CONNECTION_FAILED" }),
      },
    },
    safeguards: {
      failOpen: true,
      sideChannelOverridesCalculationTruth: false,
      birthDataSentByDoctor: false,
    },
  });
}
