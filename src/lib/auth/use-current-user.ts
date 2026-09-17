import { useEffect } from "react";
import { useAuthState } from "@/lib/auth/provider";
import type { SupabaseSession } from "@/lib/supabase-rest";
import { createOwnerCookieSession } from "@/lib/owner-data-client";

const OWNER_DATA_ROUTES = new Set(["/account", "/gallery"]);
const OWNER_DATA_SESSION = createOwnerCookieSession() as SupabaseSession;
const OWNER_ROUTE_REDIRECT_GRACE_MS = 120;

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
 *
 * React may briefly commit a non-pending guest snapshot while the successful owner probe is
 * publishing its user state. Defer the redirect by one short grace window so that a confirmed
 * owner render can cancel it. A real guest still leaves the owner-only route immediately from
 * the user's perspective and never receives an owner data session.
 */
export function useCurrentUserState() {
  const state = useAuthState();
  const pathname = currentPathname();
  const ownerDataRoute = OWNER_DATA_ROUTES.has(pathname);
  const isOwner = state.user?.isOwner === true;

  useEffect(() => {
    if (!ownerDataRoute || state.isPending || isOwner || typeof window === "undefined") return;
    const timer = window.setTimeout(() => {
      window.location.replace("/");
    }, OWNER_ROUTE_REDIRECT_GRACE_MS);
    return () => window.clearTimeout(timer);
  }, [ownerDataRoute, state.isPending, isOwner]);

  if (ownerDataRoute && !state.isPending && !isOwner) {
    return { ...state, isPending: true };
  }
  if (!isOwner || state.session || !ownerDataRoute) return state;
  return { ...state, session: OWNER_DATA_SESSION };
}
