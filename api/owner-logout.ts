import { clearOwnerCookie, requestIsSameOrigin } from "../src/server/owner-auth";

export default function handler(req: any, res: any) {
  res.setHeader("Cache-Control", "no-store");
  res.setHeader("X-Content-Type-Options", "nosniff");
  if (req.method !== "POST") return res.status(405).json({ ok: false });
  if (!requestIsSameOrigin(req)) return res.status(403).json({ ok: false, error: "ORIGIN_REJECTED" });
  res.setHeader("Set-Cookie", clearOwnerCookie());
  return res.status(200).json({ ok: true });
}
