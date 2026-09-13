import { requestHasOwnerSession } from "../src/server/owner-auth";

export default function handler(req: any, res: any) {
  res.setHeader("Cache-Control", "no-store");
  if (req.method !== "GET") return res.status(405).json({ authenticated: false });
  return res.status(200).json({ authenticated: requestHasOwnerSession(req) });
}
