// Server-to-server authorisation for the owner promo function.
// The public browser never receives this bridge secret. Vercel authenticates
// the owner session (and requires a password-backed session for promo actions)
// before forwarding a request here.

function text(value) {
  return String(value ?? "").trim();
}

export function authorizeBridgeHeaders(headers, expectedSecret) {
  const bridgeVersion = text(headers?.get?.("x-zhaowu-server-bridge"));
  if (bridgeVersion !== "r146" && bridgeVersion !== "r161" && bridgeVersion !== "r162") {
    return { ok: false, status: 403, error: "BRIDGE_REQUIRED" };
  }

  const expected = text(expectedSecret);
  if (expected.length < 32) {
    return { ok: false, status: 503, error: "BRIDGE_NOT_CONFIGURED" };
  }

  const actual = text(headers?.get?.("x-zhaowu-bridge-secret"));
  if (actual.length !== expected.length) {
    return { ok: false, status: 401, error: "BRIDGE_UNAUTHORIZED" };
  }
  let diff = 0;
  for (let index = 0; index < actual.length; index += 1) {
    diff |= actual.charCodeAt(index) ^ expected.charCodeAt(index);
  }
  if (diff !== 0) return { ok: false, status: 401, error: "BRIDGE_UNAUTHORIZED" };
  return { ok: true };
}
