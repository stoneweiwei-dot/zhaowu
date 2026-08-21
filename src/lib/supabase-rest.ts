import type { AnalysisResult } from "@/lib/bazi/types";
import type { NinePage } from "@/lib/report/nine-page";
import { SUPABASE_KEY, SUPABASE_URL, supabaseConfigured } from "@/lib/supabase-config";

export { supabaseConfigured } from "@/lib/supabase-config";
const SESSION_KEY = "zhaowu.supabase.session.v1";

export type OAuthProvider = "google" | "apple" | "twitter";

export type SupabaseUser = {
  id: string;
  email?: string | null;
  user_metadata?: Record<string, unknown>;
};

export type SupabaseSession = {
  access_token: string;
  refresh_token: string;
  expires_in: number;
  expires_at: number;
  token_type: string;
  user: SupabaseUser;
};

export type UserProfile = {
  id: string;
  email: string | null;
  display_name: string | null;
  is_owner: boolean;
  owner_archive_id: string | null;
  birth_data: Record<string, unknown> | null;
};

export type ReportRecord = {
  id: string;
  public_code: string | null;
  user_id: string | null;
  user_email: string | null;
  alias: string | null;
  record_kind: string | null;
  status: string | null;
  access_mode: string | null;
  payment_tier: string | null;
  payment_status: string | null;
  context: Record<string, unknown> | null;
  engine_snapshot: AnalysisResult | null;
  mother_draft: unknown;
  paid_report: unknown;
  visual_profile: unknown;
  image_path: string | null;
  image_error: string | null;
  created_at: string;
  updated_at: string;
};

export type ReportListRecord = Pick<
  ReportRecord,
  | "id"
  | "user_email"
  | "alias"
  | "record_kind"
  | "status"
  | "access_mode"
  | "payment_tier"
  | "payment_status"
  | "context"
  | "created_at"
  | "updated_at"
>;

function headers(token?: string | null, extra?: HeadersInit): HeadersInit {
  return {
    apikey: SUPABASE_KEY,
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    "Content-Type": "application/json",
    ...extra,
  };
}

async function jsonOrError<T>(res: Response): Promise<T> {
  const body = await res.text();
  let parsed: unknown = null;
  if (body) {
    try {
      parsed = JSON.parse(body);
    } catch {
      parsed = body;
    }
  }
  if (!res.ok) {
    const rec = parsed && typeof parsed === "object" ? (parsed as Record<string, unknown>) : null;
    const message = String(rec?.msg ?? rec?.message ?? rec?.error_description ?? rec?.error ?? `HTTP ${res.status}`);
    throw new Error(message);
  }
  return parsed as T;
}

function saveSession(raw: Omit<SupabaseSession, "expires_at"> & { expires_at?: number }): SupabaseSession {
  const session: SupabaseSession = {
    ...raw,
    expires_at: raw.expires_at ?? Math.floor(Date.now() / 1000) + Math.max(30, raw.expires_in ?? 3600),
  };
  try {
    localStorage.setItem(SESSION_KEY, JSON.stringify(session));
  } catch {
    /* ignore */
  }
  return session;
}

export function clearSession() {
  try {
    localStorage.removeItem(SESSION_KEY);
  } catch {
    /* ignore */
  }
}

function readStoredSession(): SupabaseSession | null {
  try {
    const raw = localStorage.getItem(SESSION_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as SupabaseSession;
    if (!parsed?.access_token || !parsed?.refresh_token || !parsed?.user?.id) return null;
    return parsed;
  } catch {
    return null;
  }
}

export async function refreshSession(session: SupabaseSession): Promise<SupabaseSession | null> {
  if (!supabaseConfigured) return null;
  try {
    const res = await fetch(`${SUPABASE_URL}/auth/v1/token?grant_type=refresh_token`, {
      method: "POST",
      headers: headers(),
      body: JSON.stringify({ refresh_token: session.refresh_token }),
    });
    const next = await jsonOrError<Omit<SupabaseSession, "expires_at">>(res);
    return saveSession(next);
  } catch {
    clearSession();
    return null;
  }
}

export async function restoreSession(): Promise<SupabaseSession | null> {
  const stored = readStoredSession();
  if (!stored) return null;
  const now = Math.floor(Date.now() / 1000);
  if (stored.expires_at > now + 90) return stored;
  return refreshSession(stored);
}

export async function signInWithPassword(email: string, password: string): Promise<SupabaseSession> {
  if (!supabaseConfigured) throw new Error("登入服務尚未配置。");
  const res = await fetch(`${SUPABASE_URL}/auth/v1/token?grant_type=password`, {
    method: "POST",
    headers: headers(),
    body: JSON.stringify({ email: email.trim().toLowerCase(), password }),
  });
  return saveSession(await jsonOrError<Omit<SupabaseSession, "expires_at">>(res));
}

export async function signUpWithPassword(email: string, password: string, displayName: string): Promise<{ session: SupabaseSession | null; user: SupabaseUser }> {
  if (!supabaseConfigured) throw new Error("登入服務尚未配置。");
  const res = await fetch(`${SUPABASE_URL}/auth/v1/signup`, {
    method: "POST",
    headers: headers(),
    body: JSON.stringify({
      email: email.trim().toLowerCase(),
      password,
      data: { name: displayName.trim() },
    }),
  });
  const out = await jsonOrError<{ access_token?: string; refresh_token?: string; expires_in?: number; token_type?: string; user: SupabaseUser }>(res);
  if (out.access_token && out.refresh_token) {
    const session = saveSession({
      access_token: out.access_token,
      refresh_token: out.refresh_token,
      expires_in: out.expires_in ?? 3600,
      token_type: out.token_type ?? "bearer",
      user: out.user,
    });
    return { session, user: out.user };
  }
  return { session: null, user: out.user };
}

/** Start OAuth redirect for Google / Apple / X (twitter). */
export function startOAuth(provider: OAuthProvider, redirectTo?: string) {
  if (!supabaseConfigured) throw new Error("登入服務尚未配置。");
  if (typeof window === "undefined") throw new Error("OAuth 只能在瀏覽器啟動。");
  const target = redirectTo ?? `${window.location.origin}/login`;
  const url = new URL(`${SUPABASE_URL}/auth/v1/authorize`);
  url.searchParams.set("provider", provider);
  url.searchParams.set("redirect_to", target);
  window.location.assign(url.toString());
}

async function fetchUser(accessToken: string): Promise<SupabaseUser> {
  const res = await fetch(`${SUPABASE_URL}/auth/v1/user`, {
    headers: headers(accessToken),
  });
  return jsonOrError<SupabaseUser>(res);
}

/** Capture OAuth tokens from URL hash or query after provider redirect. */
export async function captureOAuthRedirect(): Promise<SupabaseSession | null> {
  if (!supabaseConfigured || typeof window === "undefined") return null;

  const hash = window.location.hash.startsWith("#") ? window.location.hash.slice(1) : "";
  const search = window.location.search.startsWith("?") ? window.location.search.slice(1) : "";
  const params = new URLSearchParams(hash || search);

  const errorDescription = params.get("error_description") || params.get("error");
  if (errorDescription) {
    throw new Error(errorDescription);
  }

  const accessToken = params.get("access_token");
  const refreshToken = params.get("refresh_token");
  if (!accessToken || !refreshToken) return null;

  const expiresIn = Number(params.get("expires_in") ?? 3600);
  const tokenType = params.get("token_type") ?? "bearer";
  const user = await fetchUser(accessToken);
  const session = saveSession({
    access_token: accessToken,
    refresh_token: refreshToken,
    expires_in: expiresIn,
    token_type: tokenType,
    user,
  });

  // Clean sensitive tokens from the address bar.
  const cleanUrl = `${window.location.origin}${window.location.pathname}`;
  window.history.replaceState({}, document.title, cleanUrl);
  return session;
}

export async function signOutRemote(session?: SupabaseSession | null) {
  const active = session ?? readStoredSession();
  try {
    if (active?.access_token && supabaseConfigured) {
      await fetch(`${SUPABASE_URL}/auth/v1/logout`, {
        method: "POST",
        headers: headers(active.access_token),
      });
    }
  } finally {
    clearSession();
  }
}

export async function getProfile(session: SupabaseSession): Promise<UserProfile | null> {
  const res = await fetch(
    `${SUPABASE_URL}/rest/v1/profiles?id=eq.${encodeURIComponent(session.user.id)}&select=id,email,display_name,is_owner,owner_archive_id,birth_data&limit=1`,
    { headers: headers(session.access_token) },
  );
  const rows = await jsonOrError<UserProfile[]>(res);
  return rows[0] ?? null;
}

export async function updateBirthData(session: SupabaseSession, birthData: Record<string, unknown>) {
  const res = await fetch(`${SUPABASE_URL}/rest/v1/profiles?id=eq.${encodeURIComponent(session.user.id)}`, {
    method: "PATCH",
    headers: headers(session.access_token, { Prefer: "return=minimal" }),
    body: JSON.stringify({ birth_data: birthData }),
  });
  if (!res.ok) await jsonOrError(res);
}

function reportIdentity(session: SupabaseSession, profile: UserProfile | null, result: AnalysisResult) {
  return {
    id: result.id,
    user_id: session.user.id,
    user_email: profile?.email ?? session.user.email ?? null,
    alias: result.question.trim().slice(0, 80),
    record_kind: "analysis",
    access_mode: "member",
    payment_status: "not_required",
    context: {
      question: result.question,
      cityLabel: result.chart.cityLabel,
      dayMaster: result.chart.dayMaster,
      ganZhiLine: result.chart.pillars.map((p) => p.ganZhi).join(" "),
      createdAt: result.createdAt,
    },
  };
}

export async function createEngineReportRecord(args: {
  session: SupabaseSession;
  profile: UserProfile | null;
  result: AnalysisResult;
}) {
  const { session, profile, result } = args;
  const row = {
    ...reportIdentity(session, profile, result),
    status: "engine_ready",
    payment_tier: "free",
    engine_snapshot: result,
  };
  const res = await fetch(`${SUPABASE_URL}/rest/v1/report_requests?on_conflict=id`, {
    method: "POST",
    headers: headers(session.access_token, { Prefer: "resolution=ignore-duplicates,return=representation" }),
    body: JSON.stringify(row),
  });
  const rows = await jsonOrError<ReportRecord[]>(res);
  return rows[0] ?? ({ ...row, public_code: null, mother_draft: null, paid_report: null, visual_profile: null, image_path: null, image_error: null, created_at: result.createdAt, updated_at: result.createdAt } as ReportRecord);
}

export async function patchReportRecord(args: {
  session: SupabaseSession;
  profile: UserProfile | null;
  result: AnalysisResult;
  status: "report_ready" | "full_ready";
  fullReport?: string | null;
  ninePages?: NinePage[] | null;
}) {
  const { session, profile, result, status, fullReport, ninePages } = args;
  const patch: Record<string, unknown> = {
    status,
    payment_tier: status === "full_ready" ? "full" : "free",
    updated_at: new Date().toISOString(),
  };
  if (fullReport !== undefined) patch.paid_report = fullReport ? { text: fullReport } : null;
  if (ninePages !== undefined) patch.mother_draft = ninePages ? { ninePages } : null;

  const runPatch = async () => {
    const res = await fetch(`${SUPABASE_URL}/rest/v1/report_requests?id=eq.${encodeURIComponent(result.id)}`, {
      method: "PATCH",
      headers: headers(session.access_token, { Prefer: "return=representation" }),
      body: JSON.stringify(patch),
    });
    return jsonOrError<ReportRecord[]>(res);
  };

  let rows = await runPatch();
  if (!rows.length) {
    await createEngineReportRecord({ session, profile, result });
    rows = await runPatch();
  }
  return rows[0] ?? null;
}

export async function saveReportRecord(args: {
  session: SupabaseSession;
  profile: UserProfile | null;
  result: AnalysisResult;
  fullReport: string | null;
  ninePages: NinePage[] | null;
}) {
  const { session, profile, result, fullReport, ninePages } = args;
  await createEngineReportRecord({ session, profile, result });
  return patchReportRecord({
    session,
    profile,
    result,
    status: "full_ready",
    fullReport,
    ninePages,
  });
}

export async function listReportRecords(session: SupabaseSession, isOwner: boolean): Promise<ReportListRecord[]> {
  const select = "id,user_email,alias,record_kind,status,access_mode,payment_tier,payment_status,context,created_at,updated_at";
  const filter = isOwner ? "" : `&user_id=eq.${encodeURIComponent(session.user.id)}`;
  const limit = isOwner ? 50 : 3;
  const res = await fetch(`${SUPABASE_URL}/rest/v1/report_requests?select=${select}${filter}&order=created_at.desc&limit=${limit}`, {
    headers: headers(session.access_token),
  });
  const rows = await jsonOrError<ReportListRecord[]>(res);
  return rows.slice(0, limit);
}

export async function getReportRecord(session: SupabaseSession, id: string): Promise<ReportRecord | null> {
  const select = "id,public_code,user_id,user_email,alias,record_kind,status,access_mode,payment_tier,payment_status,context,engine_snapshot,mother_draft,paid_report,visual_profile,image_path,image_error,created_at,updated_at";
  const res = await fetch(
    `${SUPABASE_URL}/rest/v1/report_requests?id=eq.${encodeURIComponent(id)}&select=${select}&limit=1`,
    { headers: headers(session.access_token) },
  );
  const rows = await jsonOrError<ReportRecord[]>(res);
  return rows[0] ?? null;
}

export async function deleteReportRecord(session: SupabaseSession, id: string) {
  const res = await fetch(`${SUPABASE_URL}/rest/v1/report_requests?id=eq.${encodeURIComponent(id)}`, {
    method: "DELETE",
    headers: headers(session.access_token, { Prefer: "return=minimal" }),
  });
  if (!res.ok) await jsonOrError(res);
}
