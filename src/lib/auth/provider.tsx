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

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<CurrentUser | null>(null);
  const [isPending, setPending] = useState(true);

  const reload = useCallback(async () => {
    setPending(true);
    try {
      const authenticated = await readOwnerSession();
      setUser(authenticated ? OWNER_USER : null);
      setSharedBirthAccessUser(authenticated ? OWNER_USER.id : null);
    } finally {
      setPending(false);
    }
  }, []);

  useEffect(() => {
    let cancelled = false;
    void readOwnerSession()
      .then((authenticated) => {
        if (cancelled) return;
        setUser(authenticated ? OWNER_USER : null);
        setSharedBirthAccessUser(authenticated ? OWNER_USER.id : null);
      })
      .finally(() => { if (!cancelled) setPending(false); });

    const onAuth = () => void reload();
    window.addEventListener("zhaowu-auth-change", onAuth);
    return () => {
      cancelled = true;
      window.removeEventListener("zhaowu-auth-change", onAuth);
    };
  }, [reload]);

  return (
    <AuthContext.Provider value={{ user, profile: null, session: null, isPending, reload }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuthState() {
  return useContext(AuthContext);
}
