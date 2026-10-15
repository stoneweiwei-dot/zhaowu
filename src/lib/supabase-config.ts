// These are public browser credentials, never a service-role key. One shared
// production fallback keeps every browser client on the same Supabase project
// when Vercel does not inject VITE_* values during a build.
const DEFAULT_SUPABASE_URL = "https://plgpxusmemnmzckbwtiv.supabase.co";
const DEFAULT_SUPABASE_PUBLISHABLE_KEY = "sb_publishable_7prU26nA0AX7dny0PW_ReA_GKwI588H";
const VITE_ENV = import.meta.env ?? {};

/** Real Supabase origin. Server code, owner uploads and OAuth redirects always use this. */
export const SUPABASE_DIRECT_URL = (VITE_ENV.VITE_SUPABASE_URL || DEFAULT_SUPABASE_URL).replace(/\/$/, "");

// Mainland-China visitors cannot reliably reach *.supabase.co. On the China-facing
// production domain, which carries the `/sb/*` Vercel rewrite (vercel.json), the browser talks to Supabase through
// the page's own origin instead, so login, reads and public media need exactly one reachable
// host. Anywhere else (localhost, tests, archive hosts) the direct URL is kept unchanged.
const SAME_ORIGIN_PROXY_PREFIX = "/sb";
// No custom domain is connected: the site lives only on stone-zhaowu-official.vercel.app, which keeps
// the proven direct path. Add a domain here only after the owner has registered it and pointed DNS to Vercel.
const PROXY_HOST_DOMAINS: string[] = [];

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
