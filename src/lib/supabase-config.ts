// These are public browser credentials, never a service-role key. One shared
// production fallback keeps every browser client on the same Supabase project
// The active core project is intentionally isolated from the legacy Storage project, so stale VITE_SUPABASE_* build variables must not redirect production back to the restricted legacy project.
const DEFAULT_SUPABASE_URL = "https://gyisxbkjzvdretbqzeuw.supabase.co";
const DEFAULT_SUPABASE_PUBLISHABLE_KEY = "sb_publishable_8CDd8cAdEukFUPnegaNrQw_THwddbiQ";
const VITE_ENV = import.meta.env ?? {};

export const SUPABASE_URL = (VITE_ENV.VITE_SUPABASE_CORE_URL || DEFAULT_SUPABASE_URL).replace(/\/$/, "");
export const SUPABASE_KEY =
  VITE_ENV.VITE_SUPABASE_CORE_PUBLISHABLE_KEY || DEFAULT_SUPABASE_PUBLISHABLE_KEY;
export const supabaseConfigured = Boolean(SUPABASE_URL && SUPABASE_KEY);
