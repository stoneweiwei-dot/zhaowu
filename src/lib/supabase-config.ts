// These are public browser credentials, never a service-role key. One shared
// production fallback keeps every browser client on the same Supabase project
// when Vercel does not inject VITE_* values during a build.
const DEFAULT_SUPABASE_URL = "https://plgpxusmemnmzckbwtiv.supabase.co";
const DEFAULT_SUPABASE_PUBLISHABLE_KEY = "sb_publishable_7prU26nA0AX7dny0PW_ReA_GKwI588H";
const VITE_ENV = import.meta.env ?? {};

export const SUPABASE_URL = (VITE_ENV.VITE_SUPABASE_URL || DEFAULT_SUPABASE_URL).replace(/\/$/, "");
export const SUPABASE_KEY =
  VITE_ENV.VITE_SUPABASE_PUBLISHABLE_KEY || DEFAULT_SUPABASE_PUBLISHABLE_KEY;
export const supabaseConfigured = Boolean(SUPABASE_URL && SUPABASE_KEY);
