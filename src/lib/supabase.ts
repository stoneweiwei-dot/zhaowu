import { createClient } from "@supabase/supabase-js";

const fallbackUrl = "https://plgpxusmemnmzckbwtiv.supabase.co";
const fallbackKey = "sb_publishable_7prU26nA0AX7dny0PW_ReA_GKwI588H";

export const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || fallbackUrl;
const supabaseKey = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY || fallbackKey;

export const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
  },
});
