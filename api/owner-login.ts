import { isValidOwnerSecret, ownerCookie, requestIsSameOrigin } from "../src/server/owner-auth";

export default function handler(req: any, res: any) {
  res.setHeader("Cache-Control", "no-store");
  res.setHeader("X-Content-Type-Options", "nosniff");
  if (req.method !== "POST") return res.status(405).json({ ok: false });
  if (!requestIsSameOrigin(req)) return res.status(403).json({ ok: false, error: "ORIGIN_REJECTED" });
  const secret = typeof req.body === "string"
    ? (() => { try { return JSON.parse(req.body)?.secret; } catch { return ""; } })()
    : req.body?.secret;
  if (!isValidOwnerSecret(String(secret ?? ""))) {
    return res.status(401).json({ ok: false, error: "INVALID_OWNER_CREDENTIAL" });
  }
  res.setHeader("Set-Cookie", ownerCookie(String(secret)));
  return res.status(200).json({ ok: true });
}
