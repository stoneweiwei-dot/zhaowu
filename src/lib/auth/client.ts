import { ownerSignOut } from "@/lib/auth/owner-api";
import { signOutRemote } from "@/lib/supabase-rest";

export const authEnabled = true;

export async function signOut() {
  await Promise.allSettled([ownerSignOut(), signOutRemote()]);
  if (typeof window !== "undefined") {
    window.dispatchEvent(new Event("zhaowu-auth-change"));
  }
}
