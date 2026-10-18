import { useCallback, useEffect, useState } from "react";
import { SUPABASE_KEY, SUPABASE_URL } from "@/lib/supabase-config";
import {
  capturePasswordRecovery,
  requestPasswordReset as requestSupabasePasswordReset,
  restoreSession,
  signInWithPassword,
  signOutRemote,
  updateVisitorPassword as updateSupabaseVisitorPassword,
  type SupabaseSession,
} from "@/lib/supabase-rest";

/**
 * Optional visitor accounts (2026-10-16 owner instruction: mainland visitors must be able to log in).
 *
 * Deliberately separate from `useAuthState()` / `useCurrentUserState()`: those stay owner-only, so no
 * existing page changes behaviour because a visitor signed in. Visitors remain usable as device-local
 * guests; an account is an optional layer.
 *
 * Sign-up goes through the `visitor-signup` edge function (no confirmation e-mail, which does not reach
 * mainland mailboxes reliably); sign-in uses the normal Supabase password grant. Both go through
 * SUPABASE_URL, i.e. the same-origin /sb proxy on the production host.
 */

export type VisitorSignupError = "INVALID_EMAIL" | "INVALID_PASSWORD" | "EMAIL_EXISTS" | "RATE_LIMITED" | "NETWORK" | "FAILED";
export type VisitorLoginError = "BAD_CREDENTIALS" | "NETWORK" | "FAILED";
export type VisitorPasswordResetError = "NETWORK" | "FAILED";

export class VisitorAuthError<T extends string> extends Error {
  code: T;
  constructor(code: T) {
    super(code);
    this.code = code;
  }
}

const CHANGE_EVENT = "zhaowu-visitor-change";

export async function registerVisitor(email: string, password: string, name: string): Promise<void> {
  let response: Response;
  try {
    response = await fetch(`${SUPABASE_URL}/functions/v1/visitor-signup`, {
      method: "POST",
      headers: { apikey: SUPABASE_KEY, "Content-Type": "application/json" },
      body: JSON.stringify({ email, password, name }),
    });
  } catch {
    throw new VisitorAuthError<VisitorSignupError>("NETWORK");
  }
  if (response.ok) return;
  const body = await response.json().catch(() => ({})) as { error?: string };
  const known: VisitorSignupError[] = ["INVALID_EMAIL", "INVALID_PASSWORD", "EMAIL_EXISTS", "RATE_LIMITED"];
  throw new VisitorAuthError<VisitorSignupError>(known.includes(body.error as VisitorSignupError) ? (body.error as VisitorSignupError) : "FAILED");
}

export async function loginVisitor(email: string, password: string): Promise<SupabaseSession> {
  try {
    const session = await signInWithPassword(email, password);
    window.dispatchEvent(new Event(CHANGE_EVENT));
    return session;
  } catch (error) {
    if (error instanceof TypeError) throw new VisitorAuthError<VisitorLoginError>("NETWORK");
    const message = error instanceof Error ? error.message.toLowerCase() : "";
    throw new VisitorAuthError<VisitorLoginError>(message.includes("invalid") || message.includes("credentials") ? "BAD_CREDENTIALS" : "FAILED");
  }
}

export async function requestVisitorPasswordReset(email: string): Promise<void> {
  try {
    await requestSupabasePasswordReset(email);
  } catch (error) {
    if (error instanceof TypeError) throw new VisitorAuthError<VisitorPasswordResetError>("NETWORK");
    throw new VisitorAuthError<VisitorPasswordResetError>("FAILED");
  }
}

export async function startVisitorPasswordRecovery(): Promise<SupabaseSession | null> {
  try {
    const session = await capturePasswordRecovery();
    if (session) window.dispatchEvent(new Event(CHANGE_EVENT));
    return session;
  } catch (error) {
    const message = error instanceof Error ? error.message : "";
    if (message === "RESET_LINK_INVALID") throw error;
    if (error instanceof TypeError) throw new VisitorAuthError<VisitorPasswordResetError>("NETWORK");
    throw new VisitorAuthError<VisitorPasswordResetError>("FAILED");
  }
}

export async function updateVisitorPassword(password: string): Promise<void> {
  const session = await restoreSession();
  if (!session) throw new Error("RESET_LINK_INVALID");
  try {
    await updateSupabaseVisitorPassword(session, password);
    window.dispatchEvent(new Event(CHANGE_EVENT));
  } catch (error) {
    if (error instanceof TypeError) throw new VisitorAuthError<VisitorPasswordResetError>("NETWORK");
    throw new VisitorAuthError<VisitorPasswordResetError>("FAILED");
  }
}

export async function logoutVisitor() {
  await signOutRemote();
  window.dispatchEvent(new Event(CHANGE_EVENT));
}

export function useVisitor() {
  const [session, setSession] = useState<SupabaseSession | null>(null);
  const [pending, setPending] = useState(true);

  const reload = useCallback(async () => {
    try {
      setSession(await restoreSession());
    } catch {
      setSession(null);
    } finally {
      setPending(false);
    }
  }, []);

  useEffect(() => {
    void reload();
    const onChange = () => void reload();
    window.addEventListener(CHANGE_EVENT, onChange);
    return () => window.removeEventListener(CHANGE_EVENT, onChange);
  }, [reload]);

  return {
    pending,
    visitor: session ? { id: session.user.id, email: String(session.user.email ?? ""), name: String(session.user.user_metadata?.name ?? "") } : null,
  };
}
