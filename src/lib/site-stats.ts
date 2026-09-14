import { SUPABASE_KEY, SUPABASE_URL } from "@/lib/supabase-config";

const VISITOR_KEY = "zhaowu.visitor.v1";

export type PublicSiteStats = {
  totalVisits: number;
  todayVisits: number;
  version: string;
  updateNumber: number;
  publishedAt: string | null;
  latestSummary: string;
};

export type PublicReleaseEntry = {
  version: string;
  updateNumber: number;
  publishedAt: string | null;
  summary: string;
};

export const SITE_RELEASE_FALLBACK = {
  version: "ZW-WEB-2026.09.14-r131",
  updateNumber: 131,
  publishedAt: null,
  latestSummary: "新增可直接打開的版本更新頁；同步加固八字 Runtime，移除以十神／五行數量直接決定結論的快捷判法，並把網站執行母指令鎖定到 R6.2.1。",
} as const;

function publicHeaders(extra?: HeadersInit): HeadersInit {
  return {
    apikey: SUPABASE_KEY,
    Authorization: `Bearer ${SUPABASE_KEY}`,
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
    headers: publicHeaders({ Prefer: "return-minimal" }),
    body: JSON.stringify({ p_visitor_key: key }),
  });
  if (!res.ok) throw new Error(`Visit counter failed: HTTP ${res.status}`);
}

export async function getPublicReleaseHistory(limit = 30): Promise<PublicReleaseEntry[]> {
  if (!SUPABASE_URL || !SUPABASE_KEY) {
    return [{
      version: SITE_RELEASE_FALLBACK.version,
      updateNumber: SITE_RELEASE_FALLBACK.updateNumber,
      publishedAt: SITE_RELEASE_FALLBACK.publishedAt,
      summary: SITE_RELEASE_FALLBACK.latestSummary,
    }];
  }

  const safeLimit = Math.max(1, Math.min(50, Math.trunc(limit)));
  const res = await fetch(
    `${SUPABASE_URL}/rest/v1/release_history?select=version,update_number,published_at,notes&order=update_number.desc.nullslast,published_at.desc&limit=${safeLimit}`,
    { headers: publicHeaders() },
  );
  if (!res.ok) throw new Error(`Release history failed: HTTP ${res.status}`);

  const rows = await res.json() as { version?: string; update_number?: number; published_at?: string; notes?: { summary?: string } }[];
  const entries = rows
    .map((row) => ({
      version: String(row.version ?? "").trim(),
      updateNumber: Number(row.update_number ?? 0),
      publishedAt: row.published_at ?? null,
      summary: String(row.notes?.summary ?? "").trim(),
    }))
    .filter((entry) => entry.version && Number.isFinite(entry.updateNumber) && entry.updateNumber > 0);

  if (!entries.some((entry) => entry.updateNumber >= SITE_RELEASE_FALLBACK.updateNumber)) {
    entries.unshift({
      version: SITE_RELEASE_FALLBACK.version,
      updateNumber: SITE_RELEASE_FALLBACK.updateNumber,
      publishedAt: SITE_RELEASE_FALLBACK.publishedAt,
      summary: SITE_RELEASE_FALLBACK.latestSummary,
    });
  }
  return entries;
}

export async function getPublicSiteStats(): Promise<PublicSiteStats> {
  if (!SUPABASE_URL || !SUPABASE_KEY) throw new Error("Public site statistics are not configured.");
  const [settingsRes, releaseRes] = await Promise.all([
    fetch(`${SUPABASE_URL}/rest/v1/site_settings?key=eq.visitor_count&select=value&limit=1`, { headers: publicHeaders() }),
    fetch(`${SUPABASE_URL}/rest/v1/release_history?select=version,update_number,published_at,notes&order=update_number.desc.nullslast,published_at.desc&limit=1`, { headers: publicHeaders() }),
  ]);
  if (!settingsRes.ok || !releaseRes.ok) throw new Error(`Public site statistics failed: HTTP ${settingsRes.status}/${releaseRes.status}`);

  const settings = await settingsRes.json() as { value?: { total?: number; today?: number } }[];
  const releases = await releaseRes.json() as { version?: string; update_number?: number; published_at?: string; notes?: { summary?: string } }[];
  const latest = releases[0];
  const databaseUpdateNumber = Number(latest?.update_number ?? 0);
  const databaseIsCurrent = databaseUpdateNumber >= SITE_RELEASE_FALLBACK.updateNumber;

  return {
    totalVisits: Number(settings[0]?.value?.total ?? 0),
    todayVisits: Number(settings[0]?.value?.today ?? 0),
    version: databaseIsCurrent ? String(latest?.version ?? SITE_RELEASE_FALLBACK.version) : SITE_RELEASE_FALLBACK.version,
    updateNumber: databaseIsCurrent ? databaseUpdateNumber : SITE_RELEASE_FALLBACK.updateNumber,
    publishedAt: databaseIsCurrent ? (latest?.published_at ?? SITE_RELEASE_FALLBACK.publishedAt) : SITE_RELEASE_FALLBACK.publishedAt,
    latestSummary: databaseIsCurrent ? String(latest?.notes?.summary ?? SITE_RELEASE_FALLBACK.latestSummary) : SITE_RELEASE_FALLBACK.latestSummary,
  };
}
