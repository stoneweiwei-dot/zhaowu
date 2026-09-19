import { redirect } from "@tanstack/react-router";
import { readOwnerSession } from "@/lib/auth/owner-api";

/** Keep specialist calculation screens available for the owner without exposing them as customer products. */
export async function requireOwnerRoute() {
  const authenticated = await readOwnerSession().catch(() => false);
  if (!authenticated) throw redirect({ to: "/", replace: true });
}
