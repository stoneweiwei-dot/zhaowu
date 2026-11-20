/**
 * Production owner calls always use zhaowu-core.
 * Vercel can inject SUPABASE_URL from another Supabase project; trusting that
 * value sends Face ID device calls away from the project that stores owner_devices.
 * Preview and development still honor an explicit URL.
 */
export const OWNER_PRODUCTION_SUPABASE_URL = "https://gyisxbkjzvdretbqzeuw.supabase.co";
export function ownerSupabaseUrl(env = process.env) {
  if (String(env?.VERCEL_ENV ?? "").toLowerCase() === "production") {
    return OWNER_PRODUCTION_SUPABASE_URL;
  }
  return String(env?.SUPABASE_URL || env?.VITE_SUPABASE_URL || OWNER_PRODUCTION_SUPABASE_URL).trim().replace(/\/$/, "");
}
