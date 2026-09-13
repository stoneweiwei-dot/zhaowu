import { isValidOwnerSecret, ownerCookie } from "../src/server/owner-auth";

export default function handler(req: any, res: any) {
  res.setHeader("Cache-Control", "no-store");
  if (req.method !== "POST") return res.status(405).json({ ok: false });
  const password = typeof req.body === "string"
    ? (() => { try { return JSON.parse(req.body)?.password; } catch { return ""; } })()
    : req.body?.password;
  if (!isValidOwnerSecret(String(password ?? ""))) {
    return res.status(401).json({ ok: false, error: "INVALID_OWNER_CREDENTIAL" });
  }
  res.setHeader("Set-Cookie", ownerCookie(String(password)));
  return res.status(200).json({ ok: true });
}
