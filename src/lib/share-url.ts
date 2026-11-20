/**
 * Public share URL for the page the visitor is currently on.
 *
 * - Preview / per-deployment hosts (`*-<hash>-<team>.vercel.app`) are replaced
 *   by the canonical production origin, so a shared link never exposes an
 *   internal deployment address.
 * - The current query string and hash are always dropped. They can carry
 *   cache-busting params (`zw_release`, `zw_retry`) and checkout/access tokens
 *   (`session_id`, `access_key`) that must never be shared.
 * - A fixed, non-sensitive source/medium pair is then added so public shares
 *   can be measured without identifying the visitor or report.
 * - The production custom domain and localhost keep their own origin.
 */
export const CANONICAL_SITE_ORIGIN = "https://zhao-wu.com";

type LocationLike = Pick<Location, "origin" | "hostname" | "pathname">;

export function publicShareUrl(loc: LocationLike = window.location): string {
  const onVercelHost = loc.hostname.toLowerCase().endsWith(".vercel.app");
  const origin = onVercelHost ? CANONICAL_SITE_ORIGIN : loc.origin;
  const url = new URL(loc.pathname || "/", origin);
  url.searchParams.set("utm_source", "zhaowu");
  url.searchParams.set("utm_medium", "share");
  return url.toString();
}
