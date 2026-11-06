// Explicit environment configuration takes precedence, including in production.
export const OWNER_PRODUCTION_SUPABASE_URL = "https://gyisxbkjzvdretbqzeuw.supabase.co";
export function ownerSupabaseUrl(env = process.env) {
  return String(env?.SUPABASE_URL || env?.VITE_SUPABASE_URL || OWNER_PRODUCTION_SUPABASE_URL).trim().replace(/\/$/, "");
}
