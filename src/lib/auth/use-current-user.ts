import { useContext } from "react";
import { AuthContext } from "@/lib/auth/provider";

export function useCurrentUserState() {
  const value = useContext(AuthContext);
  if (!value) throw new Error("useCurrentUserState must be used inside AuthProvider");
  return value;
}
