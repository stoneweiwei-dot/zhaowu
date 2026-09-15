import { useAuthState } from "@/lib/auth/provider";
import type { SupabaseSession } from "@/lib/supabase-rest";
import { createOwnerCookieSession } from "@/lib/owner-data-client";

const OWNER_DATA_ROUTES = new Set(["/account", "/gallery"]);
const OWNER_DATA_SESSION = createOwnerCookieSession() as SupabaseSession;

function currentPathname() {
  if (typeof window === "undefined") return "";
  const normalized = window.location.pathname.replace(/\/+$/, "");
  return normalized || "/";
}

/**
 * The independent owner cookie is never promoted to a general application session.
 * Only the owner back-office routes receive a non-secret sentinel session; bridge modules
 * detect that sentinel and call the same-origin /api/owner-data server boundary instead of
 * sending it to Supabase. Public/guest routes keep session=null exactly as r144 requires.
 */
export function useCurrentUserState() {
  const state = useAuthState();
  if (!state.user?.isOwner || state.session || !OWNER_DATA_ROUTES.has(currentPathname())) return state;
  return { ...state, session: OWNER_DATA_SESSION };
}
