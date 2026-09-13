import { ownerSignOut } from "@/lib/auth/owner-api";

export const authEnabled = true;

export async function signOut() {
  await ownerSignOut();
  if (typeof window !== "undefined") {
    window.dispatchEvent(new Event("zhaowu-auth-change"));
  }
}
