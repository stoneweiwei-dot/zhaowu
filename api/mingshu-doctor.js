import { fetchMingshuJson, jsonResponse, mingshuOrigin } from "../lib/mingshu-client.js";

export default async function handler(req, res) {
  try {
    if ((req.method || "GET") !== "GET") {
      return jsonResponse(res, 405, { ok: false, error: { code: "METHOD_NOT_ALLOWED" } });
    }
    const result = await fetchMingshuJson("/api/v1/capabilities", { timeoutMs: 8000 });
    const reachable = Boolean(result.okHttp && result.json && result.json.ok !== false);
    return jsonResponse(res, reachable ? 200 : 503, {
      ok: reachable,
      origin: mingshuOrigin(),
      apiVersion: result.json?.apiVersion ?? null,
      connection: reachable ? "reachable" : "failed",
      note: "Discovery only. Chart runtime and place availability are checked on each chart request. Birth data is not sent.",
    });
  } catch (error) {
    return jsonResponse(res, 503, {
      ok: false,
      origin: mingshuOrigin(),
      connection: "failed",
      error: { code: "CONNECTION_FAILED", message: error instanceof Error ? error.message : "unknown" },
    });
  }
}
