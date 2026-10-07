/**
 * Public share URL for the page the visitor is currently on.
 *
 * - Preview / per-deployment hosts (`*-<hash>-<team>.vercel.app`) are replaced
 *   by the canonical production origin, so a shared link never exposes an
 *   internal deployment address.
 * - Query string and hash are always dropped. They can carry cache-busting
 *   params (`zw_release`, `zw_retry`) and checkout/access tokens
 *   (`session_id`, `access_key`) that must never be shared.
 * - Non-vercel hosts (a future custom domain, localhost) keep their own origin.
 */
export const CANONICAL_SITE_ORIGIN = "https://stone-zhaowu-official.vercel.app";

type LocationLike = Pick<Location, "origin" | "hostname" | "pathname">;

export function publicShareUrl(loc: LocationLike = window.location): string {
  const onVercelHost = loc.hostname.toLowerCase().endsWith(".vercel.app");
  const origin = onVercelHost ? CANONICAL_SITE_ORIGIN : loc.origin;
  return `${origin}${loc.pathname || "/"}`;
}
