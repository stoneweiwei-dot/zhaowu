/**
 * Single owner-backend Supabase project. Only Vercel Production is pinned:
 * a marketplace integration may silently inject SUPABASE_URL from a
 * completely different project's store.
 * Non-production preserves explicit environment overrides for tests.
 */
export const OWNER_PRODUCTION_SUPABASE_URL = "https://plgpxusmemnmzckbwtiv.supabase.co";
export function ownerSupabaseUrl(env = process.env) {
  if (String(env?.VERCEL_ENV ?? "").toLowerCase() === "production") {
    return OWNER_PRODUCTION_SUPABASE_URL;
  }
  return String(env?.SUPABASE_URL || env?.VITE_SUPABASE_URL || OWNER_PRODUCTION_SUPABASE_URL).trim().replace(/\/$/, "");
}
