import type { AnalysisResult } from "@/lib/bazi/types";
import type { NinePage } from "@/lib/report/nine-page";
import type { DecreeOverlay } from "@/lib/report/decree-image";

const SUPABASE_URL = (import.meta.env.VITE_SUPABASE_URL ?? "").replace(/\/$/, "");
const SUPABASE_KEY = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY ?? "";
const SESSION_KEY = "zhaowu.supabase.session.v1";
const VISITOR_KEY = "zhaowu.visitor.v1";

export const supabaseConfigured = Boolean(SUPABASE_URL && SUPABASE_KEY);

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

export type PublicSiteStats = {
  totalVisits: number;
  todayVisits: number;
  version: string;
  updateNumber: number;
  publishedAt: string | null;
};

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

export async function saveReportRecord(args: {
  session: SupabaseSession;
  profile: UserProfile | null;
  result: AnalysisResult;
  fullReport: string | null;
  ninePages: NinePage[] | null;
  decreeOverlay: DecreeOverlay | null;
}) {
  const { session, profile, result, fullReport, ninePages, decreeOverlay } = args;
  const alias = result.question.trim().slice(0, 80);
  const row = {
    user_id: session.user.id,
    user_email: profile?.email ?? session.user.email ?? null,
    alias,
    record_kind: "analysis",
    status: "ready",
    access_mode: "member",
    payment_tier: fullReport || ninePages ? "full" : "free",
    payment_status: "not_required",
    context: {
      question: result.question,
      cityLabel: result.chart.cityLabel,
      dayMaster: result.chart.dayMaster,
      ganZhiLine: result.chart.pillars.map((p) => p.ganZhi).join(" "),
      createdAt: result.createdAt,
    },
    engine_snapshot: result,
    mother_draft: ninePages ? { ninePages } : null,
    paid_report: fullReport ? { text: fullReport, ninePages: ninePages ?? null } : ninePages ? { ninePages } : null,
    visual_profile: decreeOverlay ? { decreeOverlay } : null,
  };
  const res = await fetch(`${SUPABASE_URL}/rest/v1/report_requests`, {
    method: "POST",
    headers: headers(session.access_token, { Prefer: "return=representation" }),
    body: JSON.stringify(row),
  });
  const rows = await jsonOrError<ReportRecord[]>(res);
  return rows[0];
}

export async function listReportRecords(session: SupabaseSession, isOwner: boolean): Promise<ReportRecord[]> {
  const select = "id,public_code,user_id,user_email,alias,record_kind,status,access_mode,payment_tier,payment_status,context,engine_snapshot,mother_draft,paid_report,visual_profile,image_path,image_error,created_at,updated_at";
  const filter = isOwner ? "" : `&user_id=eq.${encodeURIComponent(session.user.id)}`;
  const limit = isOwner ? 50 : 3;
  const res = await fetch(`${SUPABASE_URL}/rest/v1/report_requests?select=${select}${filter}&order=created_at.desc&limit=${limit}`, {
    headers: headers(session.access_token),
  });
  const rows = await jsonOrError<ReportRecord[]>(res);
  return rows.filter((row) => row.record_kind !== "test").slice(0, limit);
}

export async function deleteReportRecord(session: SupabaseSession, id: string) {
  const res = await fetch(`${SUPABASE_URL}/rest/v1/report_requests?id=eq.${encodeURIComponent(id)}`, {
    method: "DELETE",
    headers: headers(session.access_token, { Prefer: "return=minimal" }),
  });
  if (!res.ok) await jsonOrError(res);
}

export async function recordVisit() {
  if (!supabaseConfigured || typeof window === "undefined") return;
  let key = "";
  try {
    key = localStorage.getItem(VISITOR_KEY) ?? "";
    if (!key) {
      key = crypto.randomUUID();
      localStorage.setItem(VISITOR_KEY, key);
    }
  } catch {
    key = crypto.randomUUID();
  }
  await fetch(`${SUPABASE_URL}/rest/v1/site_visits?on_conflict=visitor_key,visited_on`, {
    method: "POST",
    headers: headers(null, { Prefer: "resolution=ignore-duplicates,return=minimal" }),
    body: JSON.stringify([{ visitor_key: key }]),
  }).catch(() => undefined);
}

export async function getPublicSiteStats(): Promise<PublicSiteStats> {
  if (!supabaseConfigured) return { totalVisits: 0, todayVisits: 0, version: "—", updateNumber: 0, publishedAt: null };
  const [settingsRes, releaseRes] = await Promise.all([
    fetch(`${SUPABASE_URL}/rest/v1/site_settings?key=eq.visitor_count&select=value&limit=1`, { headers: headers() }),
    fetch(`${SUPABASE_URL}/rest/v1/release_history?select=version,update_number,published_at&order=published_at.desc&limit=1`, { headers: headers() }),
  ]);
  const settings = settingsRes.ok ? await settingsRes.json() as { value?: { total?: number; today?: number } }[] : [];
  const releases = releaseRes.ok ? await releaseRes.json() as { version?: string; update_number?: number; published_at?: string }[] : [];
  return {
    totalVisits: Number(settings[0]?.value?.total ?? 0),
    todayVisits: Number(settings[0]?.value?.today ?? 0),
    version: String(releases[0]?.version ?? "—"),
    updateNumber: Number(releases[0]?.update_number ?? 0),
    publishedAt: releases[0]?.published_at ?? null,
  };
}
