import { useEffect } from "react";
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
 *
 * /account and /gallery are owner-only operational surfaces. Once the owner-session probe has
 * completed, an ordinary guest is kept in a pending shell and redirected to the public home
 * route so retired member/login UI cannot flash or become an active public path.
 */
export function useCurrentUserState() {
  const state = useAuthState();
  const pathname = currentPathname();
  const ownerDataRoute = OWNER_DATA_ROUTES.has(pathname);
  const isOwner = state.user?.isOwner === true;

  useEffect(() => {
    if (!ownerDataRoute || state.isPending || isOwner || typeof window === "undefined") return;
    window.location.replace("/");
  }, [ownerDataRoute, state.isPending, isOwner]);

  if (ownerDataRoute && !state.isPending && !isOwner) {
    return { ...state, isPending: true };
  }
  if (!isOwner || state.session || !ownerDataRoute) return state;
  return { ...state, session: OWNER_DATA_SESSION };
}
