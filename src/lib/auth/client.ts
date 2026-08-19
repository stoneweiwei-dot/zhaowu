import { signOutRemote, supabaseConfigured } from "@/lib/supabase-rest";

export const authEnabled = supabaseConfigured;

export async function signOut() {
  await signOutRemote();
  if (typeof window !== "undefined") {
    window.dispatchEvent(new Event("zhaowu-auth-change"));
  }
}
