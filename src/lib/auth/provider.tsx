import { createContext, useCallback, useContext, useEffect, useState, type ReactNode } from "react";
import { readOwnerSession } from "@/lib/auth/owner-api";
import type { SupabaseSession, UserProfile } from "@/lib/supabase-rest";
import { createOwnerCookieSession } from "@/lib/owner-data-client";
import { setSharedBirthAccessUser } from "@/lib/shared-birth";

export type CurrentUser = {
  id: string;
  displayName: string;
  email: string;
  isOwner: boolean;
  birthData: Record<string, unknown> | null;
};

export type AuthState = {
  user: CurrentUser | null;
  profile: UserProfile | null;
  session: SupabaseSession | null;
  isPending: boolean;
  reload: () => Promise<void>;
};

const AuthContext = createContext<AuthState>({
  user: null,
  profile: null,
  session: null,
  isPending: true,
  reload: async () => undefined,
});

const OWNER_USER: CurrentUser = {
  id: "zhaowu-owner",
  displayName: "站主",
  email: "",
  isOwner: true,
  birthData: null,
};

const OWNER_DATA_SESSION = createOwnerCookieSession() as SupabaseSession;

/**
 * r146 access contract:
 * - ordinary visitors stay device-local guests; public member auth is not restored;
 * - owner identity still comes only from the independent HttpOnly Vercel cookie;
 * - the synthetic owner data session contains no Supabase credential. Its sentinel access token
 *   is intercepted by the owner bridge modules and every privileged operation goes through
 *   /api/owner-data -> the custom-auth Supabase server function.
 *
 * We deliberately do not use an IP address as identity: mobile IPs rotate and may be shared.
 */
export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<CurrentUser | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [session, setSession] = useState<SupabaseSession | null>(null);
  const [isPending, setPending] = useState(true);

  const reload = useCallback(async () => {
    setPending(true);
    try {
      const owner = await readOwnerSession().catch(() => false);
      if (owner) {
        setUser(OWNER_USER);
        setProfile(null);
        setSession(OWNER_DATA_SESSION);
        setSharedBirthAccessUser(OWNER_USER.id);
        return;
      }

      setUser(null);
      setProfile(null);
      setSession(null);
      setSharedBirthAccessUser(null);
    } finally {
      setPending(false);
    }
  }, []);

  useEffect(() => {
    void reload();
    const onAuth = () => void reload();
    window.addEventListener("zhaowu-auth-change", onAuth);
    return () => {
      window.removeEventListener("zhaowu-auth-change", onAuth);
    };
  }, [reload]);

  return (
    <AuthContext.Provider value={{ user, profile, session, isPending, reload }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuthState() {
  return useContext(AuthContext);
}
