import { createContext, useCallback, useEffect, useMemo, useState, type ReactNode } from "react";
import type { User } from "@supabase/supabase-js";
import type { AnalyzeInput } from "@/lib/bazi/types";
import { supabase } from "@/lib/supabase";

export type ZhaowuProfile = {
  id: string;
  email: string | null;
  displayName: string;
  isOwner: boolean;
  ownerArchiveId: string | null;
  birthData: Partial<AnalyzeInput> | null;
};

export type CurrentUser = {
  id: string;
  email: string;
  displayName: string;
};

type AuthContextValue = {
  user: CurrentUser | null;
  profile: ZhaowuProfile | null;
  isPending: boolean;
  refreshProfile: () => Promise<void>;
};

export const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [authUser, setAuthUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<ZhaowuProfile | null>(null);
  const [isPending, setIsPending] = useState(true);

  const loadProfile = useCallback(async (u: User | null) => {
    setAuthUser(u);
    if (!u) {
      setProfile(null);
      setIsPending(false);
      return;
    }
    const { data } = await supabase
      .from("profiles")
      .select("id,email,display_name,is_owner,owner_archive_id,birth_data")
      .eq("id", u.id)
      .maybeSingle();
    setProfile(
      data
        ? {
            id: data.id,
            email: data.email,
            displayName: data.display_name || u.email || "昭梧会员",
            isOwner: Boolean(data.is_owner),
            ownerArchiveId: data.owner_archive_id,
            birthData: (data.birth_data as Partial<AnalyzeInput> | null) || null,
          }
        : null,
    );
    setIsPending(false);
  }, []);

  useEffect(() => {
    let alive = true;
    void supabase.auth.getUser().then(({ data }) => {
      if (alive) void loadProfile(data.user ?? null);
    });
    const { data: sub } = supabase.auth.onAuthStateChange((_event, session) => {
      if (alive) void loadProfile(session?.user ?? null);
    });
    return () => {
      alive = false;
      sub.subscription.unsubscribe();
    };
  }, [loadProfile]);

  const refreshProfile = useCallback(async () => {
    const { data } = await supabase.auth.getUser();
    await loadProfile(data.user ?? null);
  }, [loadProfile]);

  const user = useMemo<CurrentUser | null>(() => {
    if (!authUser?.email) return null;
    return {
      id: authUser.id,
      email: authUser.email,
      displayName: profile?.displayName || authUser.email,
    };
  }, [authUser, profile]);

  const value = useMemo(() => ({ user, profile, isPending, refreshProfile }), [user, profile, isPending, refreshProfile]);
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
