import { createContext, useContext, type ReactNode } from "react";

export type CurrentUser = {
  id: string;
  displayName: string;
};

export type AuthState = {
  user: CurrentUser | null;
  isPending: boolean;
};

const AuthContext = createContext<AuthState>({ user: null, isPending: false });

export function AuthProvider({ children }: { children: ReactNode }) {
  return <AuthContext.Provider value={{ user: null, isPending: false }}>{children}</AuthContext.Provider>;
}

export function useAuthState() {
  return useContext(AuthContext);
}
