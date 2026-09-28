import { SUPABASE_KEY, SUPABASE_URL } from "@/lib/supabase-config";

const VISITOR_KEY = "zhaowu.visitor.v1";
const PUBLIC_DATA_TIMEOUT_MS = 900;
const PUBLIC_DATA_COOLDOWN_MS = 5 * 60_000;
let publicDataBlockedUntil = 0;

export type PublicSiteStats = {
  totalVisits: number;
  todayVisits: number;
  version: string;
  updateNumber: number;
  publishedAt: string | null;
  latestSummary: string;
};

export const SITE_RELEASE_FALLBACK = {
  version: "ZW-WEB-2026.09.28-r215",
  updateNumber: 215,
  publishedAt: "2026-09-28T11:50:00+10:00",
  latestSummary: "修復登入影片/圖庫大檔（>6MB）續傳上傳 403 RLS 失敗（授權標頭配置錯誤）。",
  details: {
    "zh-Hant": [
      "修復大檔（>6MB）續傳上傳（TUS resumable）在 Supabase Storage 回傳「new row violates row-level security policy」403 的問題：signed-upload token 應放在 x-signature 標頭，authorization 標頭需帶有效 Supabase JWT（此處為 anon key），先前把 signed token 誤放進 authorization 導致 Storage API 無法驗證。",
    ],
    en: [
      "Fixed large-file (>6MB) resumable (TUS) uploads to Supabase Storage failing with a 403 \"new row violates row-level security policy\" error: the signed-upload token belongs in the x-signature header, while authorization needs a valid Supabase JWT (anon key here). The token had been placed in authorization instead, which the Storage API could not validate.",
    ],
  },
} as const;

function fallbackStats(): PublicSiteStats {
  return {
    totalVisits: 0,
    todayVisits: 0,
    version: SITE_RELEASE_FALLBACK.version,
    updateNumber: SITE_RELEASE_FALLBACK.updateNumber,
    publishedAt: SITE_RELEASE_FALLBACK.publishedAt,
    latestSummary: SITE_RELEASE_FALLBACK.latestSummary,
  };
}

function publicHeaders(extra?: HeadersInit): HeadersInit {
  return {
    apikey: SUPABASE_KEY,
    Authorization: `Bearer ${SUPABASE_KEY}`,
    "Content-Type": "application/json",
    ...extra,
  };
}

async function publicFetch(input: string, init: RequestInit = {}) {
  if (Date.now() < publicDataBlockedUntil) throw new Error("public-data-cooldown");
  const controller = new AbortController();
  const timer = window.setTimeout(() => controller.abort(), PUBLIC_DATA_TIMEOUT_MS);
  try {
    const res = await fetch(input, { ...init, signal: controller.signal });
    if (res.status === 402) publicDataBlockedUntil = Date.now() + PUBLIC_DATA_COOLDOWN_MS;
    return res;
  } catch (error) {
    publicDataBlockedUntil = Date.now() + PUBLIC_DATA_COOLDOWN_MS;
    throw error;
  } finally {
    window.clearTimeout(timer);
  }
}

export async function recordVisit() {
  if (!SUPABASE_URL || !SUPABASE_KEY || typeof window === "undefined") return;
  if (Date.now() < publicDataBlockedUntil) return;

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

  const res = await publicFetch(`${SUPABASE_URL}/rest/v1/rpc/zhaowu_record_visit`, {
    method: "POST",
    headers: publicHeaders({ Prefer: "return=minimal" }),
    body: JSON.stringify({ p_visitor_key: key }),
  });
  if (!res.ok) throw new Error(`Visit counter failed: HTTP ${res.status}`);
}

export async function getPublicSiteStats(): Promise<PublicSiteStats> {
  if (!SUPABASE_URL || !SUPABASE_KEY || typeof window === "undefined") return fallbackStats();
  if (Date.now() < publicDataBlockedUntil) return fallbackStats();

  try {
    const [settingsRes, releaseRes] = await Promise.all([
      publicFetch(`${SUPABASE_URL}/rest/v1/site_settings?key=eq.visitor_count&select=value&limit=1`, { headers: publicHeaders() }),
      publicFetch(`${SUPABASE_URL}/rest/v1/release_history?select=version,update_number,published_at,notes&order=update_number.desc.nullslast,published_at.desc&limit=1`, { headers: publicHeaders() }),
    ]);

    if (!settingsRes.ok || !releaseRes.ok) return fallbackStats();

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
  } catch {
    return fallbackStats();
  }
}
