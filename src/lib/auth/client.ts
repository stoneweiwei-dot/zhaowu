import { ownerSignOut } from "@/lib/auth/owner-api";
import { resetLoginAnimationSeen } from "@/lib/login-animation";
import { signOutRemote } from "@/lib/supabase-rest";

export const authEnabled = true;

export async function signOut() {
  if (typeof window !== "undefined") resetLoginAnimationSeen(window.sessionStorage);
  await Promise.allSettled([ownerSignOut(), signOutRemote()]);
  if (typeof window !== "undefined") {
    window.dispatchEvent(new Event("zhaowu-auth-change"));
  }
}
