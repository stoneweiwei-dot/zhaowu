// These are public browser credentials, never a service-role key. One shared
// production fallback keeps every browser client on the same Supabase project
// when Vercel does not inject VITE_* values during a build.
const DEFAULT_SUPABASE_URL = "https://plgpxusmemnmzckbwtiv.supabase.co";
const DEFAULT_SUPABASE_PUBLISHABLE_KEY = "sb_publishable_7prU26nA0AX7dny0PW_ReA_GKwI588H";
const VITE_ENV = import.meta.env ?? {};

/** Real Supabase origin. Server code, owner uploads and OAuth redirects always use this. */
export const SUPABASE_DIRECT_URL = (VITE_ENV.VITE_SUPABASE_URL || DEFAULT_SUPABASE_URL).replace(/\/$/, "");

// Mainland-China visitors cannot reliably reach *.supabase.co. On the Vercel production host
// which carries the `/sb/*` Vercel rewrites (vercel.json),
// the browser talks to Supabase through the page's own origin instead, so login, reads and
// public media need only the page origin to be reachable. Local dev, tests and non-Vercel
// archive hosts keep the direct Supabase URL unchanged.
const SAME_ORIGIN_PROXY_PREFIX = "/sb";
const PROXY_HOST_DOMAINS = ["stone-zhaowu-official.vercel.app"];

function resolveBrowserSupabaseUrl() {
  if (typeof window === "undefined" || !window.location) return SUPABASE_DIRECT_URL;
  const { protocol, hostname, origin } = window.location;
  if (protocol !== "https:") return SUPABASE_DIRECT_URL;
  const host = hostname.toLowerCase();
  const onProxyHost = PROXY_HOST_DOMAINS.some((domain) => host === domain || host.endsWith(`.${domain}`));
  return onProxyHost ? `${origin}${SAME_ORIGIN_PROXY_PREFIX}` : SUPABASE_DIRECT_URL;
}

/** Base URL for visitor-facing Supabase calls (auth, REST, Edge Functions, public media). */
export const SUPABASE_URL = resolveBrowserSupabaseUrl();
export const SUPABASE_KEY =
  VITE_ENV.VITE_SUPABASE_PUBLISHABLE_KEY || DEFAULT_SUPABASE_PUBLISHABLE_KEY;
export const supabaseConfigured = Boolean(SUPABASE_URL && SUPABASE_KEY);
