import { useEffect } from "react";
import { useAuthState } from "@/lib/auth/provider";
import { readOwnerSession } from "@/lib/auth/owner-api";
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
 * /account and /gallery are owner-only operational surfaces. A transient non-owner render can
 * occur while the provider is settling, especially under React StrictMode/WebKit. Never redirect
 * from that transient snapshot alone: confirm the HttpOnly owner cookie with /api/owner-session.
 * A confirmed owner asks the provider to reload; a confirmed guest is redirected home. This keeps
 * guest isolation without racing a valid owner session.
 */
export function useCurrentUserState() {
  const state = useAuthState();
  const pathname = currentPathname();
  const ownerDataRoute = OWNER_DATA_ROUTES.has(pathname);
  const isOwner = state.user?.isOwner === true;

  useEffect(() => {
    if (!ownerDataRoute || state.isPending || isOwner || typeof window === "undefined") return;
    let cancelled = false;
    void readOwnerSession()
      .then(async (confirmedOwner) => {
        if (cancelled) return;
        if (confirmedOwner) {
          await state.reload();
          return;
        }
        if (!cancelled && OWNER_DATA_ROUTES.has(currentPathname())) {
          window.location.replace("/");
        }
      })
      .catch(() => {
        if (!cancelled && OWNER_DATA_ROUTES.has(currentPathname())) {
          window.location.replace("/");
        }
      });
    return () => {
      cancelled = true;
    };
  }, [ownerDataRoute, state.isPending, isOwner, state.reload]);

  if (ownerDataRoute && !state.isPending && !isOwner) {
    return { ...state, isPending: true };
  }
  if (!isOwner || state.session || !ownerDataRoute) return state;
  return { ...state, session: OWNER_DATA_SESSION };
}
