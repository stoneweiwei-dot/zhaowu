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
  version: "ZW-WEB-2026.09.22-r177",
  updateNumber: 177,
  publishedAt: "2026-09-22T23:46:00+10:00",
  latestSummary: "觀世錄新增《見局，破局，歸自己》，並把今日兩篇修行文章收束到「知命而不困命、行動仍由人自決」的主線。",
  details: {
    "zh-Hant": [
      "觀世錄新增《見局，破局，歸自己》，放在最新文章位置；同日既有《沒有神蹟之後，人怎麼修行》保留，不重複改寫。",
      "兩篇都把命理、因果與修行落回人的判斷與主權；不改命理計算、登入、付款、報告或 Supabase schema。",
    ],
    en: [
      "Notes on Life adds “See the Pattern, Break the Pattern, Return to Yourself” as the latest essay while keeping “How to Practise After the Miracles Are Gone” intact.",
      "Both essays return metaphysics and practice to human judgement and agency; no calculation, auth, payment, report or Supabase schema logic changes.",
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
