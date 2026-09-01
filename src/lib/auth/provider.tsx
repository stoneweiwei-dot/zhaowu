import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import { captureOAuthRedirect, getProfile, restoreSession, type SupabaseSession, type UserProfile } from "@/lib/supabase-rest";

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

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<SupabaseSession | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [isPending, setPending] = useState(true);

  const reload = useCallback(async () => {
    setPending(true);
    try {
      const active = await restoreSession();
      setSession(active);
      if (!active) {
        setProfile(null);
        return;
      }
      const p = await getProfile(active).catch(() => null);
      setProfile(p);
    } finally {
      setPending(false);
    }
  }, []);

  useEffect(() => {
    let cancelled = false;

    const bootstrapAuth = async () => {
      setPending(true);
      try {
        // Supabase can return OAuth/email-confirmation tokens to any allowed site URL.
        // Capture them before restoring storage so sensitive hash/query tokens never
        // remain exposed in the address bar as a long "gibberish" string.
        const callbackSession = await captureOAuthRedirect().catch(() => null);
        if (cancelled) return;

        const active = callbackSession ?? await restoreSession();
        if (cancelled) return;
        setSession(active);
        if (!active) {
          setProfile(null);
          return;
        }
        const p = await getProfile(active).catch(() => null);
        if (!cancelled) setProfile(p);
      } finally {
        if (!cancelled) setPending(false);
      }
    };

    void bootstrapAuth();
    const onAuth = () => void reload();
    window.addEventListener("zhaowu-auth-change", onAuth);
    return () => {
      cancelled = true;
      window.removeEventListener("zhaowu-auth-change", onAuth);
    };
  }, [reload]);

  const user = useMemo<CurrentUser | null>(() => {
    if (!session) return null;
    const email = profile?.email ?? session.user.email ?? "";
    const metaName = typeof session.user.user_metadata?.name === "string" ? session.user.user_metadata.name : "";
    return {
      id: session.user.id,
      displayName: profile?.display_name?.trim() || metaName || email.split("@")[0] || "會員",
      email,
      isOwner: Boolean(profile?.is_owner),
      birthData: profile?.birth_data ?? null,
    };
  }, [profile, session]);

  return (
    <AuthContext.Provider value={{ user, profile, session, isPending, reload }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuthState() {
  return useContext(AuthContext);
}
