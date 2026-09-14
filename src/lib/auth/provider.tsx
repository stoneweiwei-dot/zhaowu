import { createContext, useCallback, useContext, useEffect, useState, type ReactNode } from "react";
import { readOwnerSession } from "@/lib/auth/owner-api";
import {
  captureOAuthRedirect,
  getProfile,
  restoreSession,
  type SupabaseSession,
  type UserProfile,
} from "@/lib/supabase-rest";
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

function memberFrom(session: SupabaseSession, profile: UserProfile | null): CurrentUser {
  return {
    id: session.user.id,
    displayName: profile?.display_name || session.user.email || "會員",
    email: profile?.email || session.user.email || "",
    isOwner: false,
    birthData: profile?.birth_data ?? null,
  };
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<CurrentUser | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [session, setSession] = useState<SupabaseSession | null>(null);
  const [isPending, setPending] = useState(true);

  const reload = useCallback(async () => {
    setPending(true);
    try {
      let memberSession: SupabaseSession | null = null;
      try {
        memberSession = await captureOAuthRedirect();
      } catch {
        memberSession = null;
      }
      if (!memberSession) memberSession = await restoreSession();
      const owner = await readOwnerSession();

      if (owner) {
        setUser(OWNER_USER);
        setProfile(null);
        setSession(null);
        setSharedBirthAccessUser(OWNER_USER.id);
        return;
      }

      if (memberSession) {
        const nextProfile = await getProfile(memberSession).catch(() => null);
        setSession(memberSession);
        setProfile(nextProfile);
        setUser(memberFrom(memberSession, nextProfile));
        setSharedBirthAccessUser(memberSession.user.id);
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
