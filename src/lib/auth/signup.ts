import { SUPABASE_KEY, SUPABASE_URL, supabaseConfigured } from "@/lib/supabase-config";
import type { SupabaseSession, SupabaseUser } from "@/lib/supabase-rest";

const SESSION_KEY = "zhaowu.supabase.session.v1";
export const PRODUCTION_AUTH_REDIRECT = "https://stone-zhaowu-official.vercel.app/";

type SignupPayload = {
  access_token?: string;
  refresh_token?: string;
  expires_in?: number;
  token_type?: string;
  user: SupabaseUser;
  msg?: string;
  message?: string;
  error_description?: string;
  error?: string;
};

function saveSignupSession(out: SignupPayload): SupabaseSession | null {
  if (!out.access_token || !out.refresh_token || !out.user?.id) return null;
  const expiresIn = out.expires_in ?? 3600;
  const session: SupabaseSession = {
    access_token: out.access_token,
    refresh_token: out.refresh_token,
    expires_in: expiresIn,
    expires_at: Math.floor(Date.now() / 1000) + Math.max(30, expiresIn),
    token_type: out.token_type ?? "bearer",
    user: out.user,
  };
  try {
    localStorage.setItem(SESSION_KEY, JSON.stringify(session));
  } catch {
    /* ignore storage failures; caller can still use the returned session */
  }
  return session;
}

/**
 * Email signup with an explicit production redirect.
 *
 * Supabase otherwise falls back to the Auth Site URL. If that dashboard value is
 * stale (for example an old preview or localhost URL), the confirmation email can
 * verify successfully and then dump the customer onto a blank/error page. Pinning
 * redirect_to here keeps confirmation links returning to the one official site.
 */
export async function signUpWithPassword(
  email: string,
  password: string,
  displayName: string,
): Promise<{ session: SupabaseSession | null; user: SupabaseUser }> {
  if (!supabaseConfigured) throw new Error("登入服務尚未配置。");

  const endpoint = new URL(`${SUPABASE_URL}/auth/v1/signup`);
  endpoint.searchParams.set("redirect_to", PRODUCTION_AUTH_REDIRECT);
  const res = await fetch(endpoint.toString(), {
    method: "POST",
    headers: {
      apikey: SUPABASE_KEY,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      email: email.trim().toLowerCase(),
      password,
      data: { name: displayName.trim() },
    }),
  });

  const body = await res.text();
  let parsed: SignupPayload;
  try {
    parsed = body ? JSON.parse(body) as SignupPayload : ({} as SignupPayload);
  } catch {
    parsed = { user: {} as SupabaseUser, message: body || `HTTP ${res.status}` };
  }

  if (!res.ok) {
    const message = parsed.msg ?? parsed.message ?? parsed.error_description ?? parsed.error ?? `HTTP ${res.status}`;
    throw new Error(String(message));
  }
  if (!parsed.user?.id) throw new Error("註冊完成，但沒有收到有效的會員資料。");

  return { session: saveSignupSession(parsed), user: parsed.user };
}
