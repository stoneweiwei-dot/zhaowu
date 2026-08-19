import { useAuthState } from "@/lib/auth/provider";

export function useCurrentUserState() {
  return useAuthState();
}
