import { clearOwnerCookie } from "../src/server/owner-auth";

export default function handler(req: any, res: any) {
  res.setHeader("Cache-Control", "no-store");
  if (req.method !== "POST") return res.status(405).json({ ok: false });
  res.setHeader("Set-Cookie", clearOwnerCookie());
  return res.status(200).json({ ok: true });
}
