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

/**
 * Public fallback so version history remains visible even if the statistics request is unavailable.
 * Every production runtime/backend change must bump this release and add the matching change report.
 */
export const SITE_RELEASE_FALLBACK = {
  version: "ZW-WEB-2026.09.02-r30",
  updateNumber: 30,
  publishedAt: "2026-09-01T21:18:41.034649+00:00",
  latestSummary: "依新補參考還原山水宣紙底、半透明細金邊面板與朱紅按鈕；採用站主上傳的梧桐蓮池影片及並蒂蓮靜圖，保留三秒進站、四柱、隨機吉祥圖與文章折疊；清除遮住山水的舊表單底色。",
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
    fetch(`${SUPABASE_URL}/rest/v1/release_history?select=version,update_number,published_at,notes&order=update_number.desc.nullslast,published_at.desc&limit=1`, { headers: publicHeaders() }),
  ]);

  if (!settingsRes.ok || !releaseRes.ok) {
    throw new Error(`Public site statistics failed: HTTP ${settingsRes.status}/${releaseRes.status}`);
  }

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
