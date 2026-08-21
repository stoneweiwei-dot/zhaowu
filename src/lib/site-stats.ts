const FALLBACK_SUPABASE_URL = "https://plgpxusmemnmzckbwtiv.supabase.co";
// Supabase publishable keys are designed for public/browser clients. Authorization remains enforced by RLS/RPC policies.
const FALLBACK_SUPABASE_KEY = "sb_publishable_7prU26nA0AX7dny0PW_ReA_GKwI588H";

const SUPABASE_URL = (import.meta.env.VITE_SUPABASE_URL || FALLBACK_SUPABASE_URL).replace(/\/$/, "");
const SUPABASE_KEY = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY || FALLBACK_SUPABASE_KEY;
const VISITOR_KEY = "zhaowu.visitor.v1";

export type PublicSiteStats = {
  totalVisits: number;
  todayVisits: number;
  version: string;
  updateNumber: number;
  publishedAt: string | null;
};

function publicHeaders(extra?: HeadersInit): HeadersInit {
  return {
    apikey: SUPABASE_KEY,
    "Content-Type": "application/json",
    ...extra,
  };
}

export async function recordVisit() {
  if (!SUPABASE_URL || !SUPABASE_KEY || typeof window === "undefined") return;

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

  const res = await fetch(`${SUPABASE_URL}/rest/v1/rpc/zhaowu_record_visit`, {
    method: "POST",
    headers: publicHeaders({ Prefer: "return=minimal" }),
    body: JSON.stringify({ p_visitor_key: key }),
  });

  if (!res.ok) throw new Error(`Visit counter failed: HTTP ${res.status}`);
}

export async function getPublicSiteStats(): Promise<PublicSiteStats> {
  if (!SUPABASE_URL || !SUPABASE_KEY) {
    throw new Error("Public site statistics are not configured.");
  }

  const [settingsRes, releaseRes] = await Promise.all([
    fetch(`${SUPABASE_URL}/rest/v1/site_settings?key=eq.visitor_count&select=value&limit=1`, { headers: publicHeaders() }),
    fetch(`${SUPABASE_URL}/rest/v1/release_history?select=version,update_number,published_at&order=published_at.desc&limit=1`, { headers: publicHeaders() }),
  ]);

  if (!settingsRes.ok || !releaseRes.ok) {
    throw new Error(`Public site statistics failed: HTTP ${settingsRes.status}/${releaseRes.status}`);
  }

  const settings = await settingsRes.json() as { value?: { total?: number; today?: number } }[];
  const releases = await releaseRes.json() as { version?: string; update_number?: number; published_at?: string }[];

  return {
    totalVisits: Number(settings[0]?.value?.total ?? 0),
    todayVisits: Number(settings[0]?.value?.today ?? 0),
    version: String(releases[0]?.version ?? "—"),
    updateNumber: Number(releases[0]?.update_number ?? 0),
    publishedAt: releases[0]?.published_at ?? null,
  };
}
