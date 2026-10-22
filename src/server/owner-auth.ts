// Keep all Node entrypoints on the same sealed-cookie and runtime-credential boundary.
import { ownerSetCookie, ownerClearCookie } from "../../lib/owner-session-cookie.js";
export { OWNER_COOKIE, isValidOwnerSecret, readCookie, requestHasOwnerSession } from "../../lib/owner-session-cookie.js";

export const ownerCookie = ownerSetCookie;
export const clearOwnerCookie = ownerClearCookie;

export function requestIsSameOrigin(req: any) {
  const origin = String(req?.headers?.origin ?? "").trim();
  if (!origin) return true;
  const forwardedHost = String(req?.headers?.["x-forwarded-host"] ?? req?.headers?.host ?? "")
    .split(",")[0]
    .trim();
  if (!forwardedHost) return false;
  try {
    return new URL(origin).host === forwardedHost;
  } catch {
    return false;
  }
}
