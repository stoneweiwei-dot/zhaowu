import { createContext, useCallback, useContext, useEffect, useState, type ReactNode } from "react";
import { readOwnerSession } from "@/lib/auth/owner-api";
import type { SupabaseSession, UserProfile } from "@/lib/supabase-rest";
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

/**
 * r144 access contract remains protected by r146:
 * - ordinary visitors are device-local guests; no member auth is restored or required;
 * - the birth record stays in the phone/browser through shared-birth.ts;
 * - owner auth remains an independent HttpOnly Vercel cookie and is the only active login.
 *
 * r146 deliberately keeps the provider session null for owner everywhere. Owner-only data
 * access is injected only by use-current-user.ts on the back-office routes, so the public
 * guest-first analysis flow cannot mistake the owner cookie for a Supabase member session.
 *
 * We deliberately do not use an IP address as identity: mobile IPs rotate and may be shared.
 * The earlier guest-first implementation used device localStorage, which is the stable behavior
 * the owner asked to restore.
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
        setSession(null);
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
