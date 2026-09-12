import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import { captureOAuthRedirect, getProfile, restoreSession, signOutRemote, type SupabaseSession, type UserProfile } from "@/lib/supabase-rest";
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

async function resolveOwnerSession(active: SupabaseSession | null): Promise<{ session: SupabaseSession | null; profile: UserProfile | null }> {
  if (!active) return { session: null, profile: null };
  const profile = await getProfile(active).catch(() => null);
  if (!profile?.is_owner) {
    await signOutRemote(active).catch(() => undefined);
    return { session: null, profile: null };
  }
  return { session: active, profile };
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<SupabaseSession | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [isPending, setPending] = useState(true);

  const reload = useCallback(async () => {
    setPending(true);
    try {
      const restored = await restoreSession();
      const owner = await resolveOwnerSession(restored);
      setSharedBirthAccessUser(owner.session?.user.id ?? null);
      setSession(owner.session);
      setProfile(owner.profile);
    } finally {
      setPending(false);
    }
  }, []);

  useEffect(() => {
    let cancelled = false;

    const bootstrapAuth = async () => {
      setPending(true);
      try {
        // Legacy OAuth/email-confirmation callbacks are consumed only to remove
        // tokens from the URL. The session is accepted only when the profile is Owner.
        const callbackSession = await captureOAuthRedirect().catch(() => null);
        if (cancelled) return;

        const restored = callbackSession ?? await restoreSession();
        if (cancelled) return;
        const owner = await resolveOwnerSession(restored);
        if (cancelled) return;

        setSharedBirthAccessUser(owner.session?.user.id ?? null);
        setSession(owner.session);
        setProfile(owner.profile);
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
    if (!session || !profile?.is_owner) return null;
    const email = profile.email ?? session.user.email ?? "";
    const metaName = typeof session.user.user_metadata?.name === "string" ? session.user.user_metadata.name : "";
    return {
      id: session.user.id,
      displayName: profile.display_name?.trim() || metaName || email.split("@")[0] || "站主",
      email,
      isOwner: true,
      birthData: profile.birth_data ?? null,
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
