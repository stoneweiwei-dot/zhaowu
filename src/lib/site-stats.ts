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
  "version": "ZW-WEB-2026.10.26-r227",
  "updateNumber": 227,
  "publishedAt": "2026-10-26T10:55:00.000Z",
  "latestSummary": "《黃泉紀》擴展為《幽明萬象錄》，新增觀心篇，把神怪、生死與現代認知分層收進同一專題。",
  "summary": {
    "zh-Hant": "《黃泉紀》擴展為《幽明萬象錄》，新增觀心篇，把神怪、生死與現代認知分層收進同一專題。",
    "zh-Hans": "《黄泉纪》扩展为《幽明万象录》，新增观心篇，把神怪、生死与现代认知分层收进同一专题。",
    "en": "Expanded the Yellow Springs project into The Chronicle of Hidden and Manifest Worlds, adding a clearly labelled modern chapter on perception and discernment."
  },
  "details": {
    "zh-Hant": [
      "總名由《黃泉紀》改為《幽明萬象錄》；黃泉保留為三界世界觀中的一界。",
      "新增「觀心篇」五則：聽言觀行、去頭銜、直覺校正、多層視角、分辨而不貶低。",
      "3D／4D／5D、頻率、磁場只作現代認知隱喻，不寫成古籍教義或可測量事實。"
    ],
    "zh-Hans": [
      "总名由《黄泉纪》改为《幽明万象录》；黄泉保留为三界世界观中的一界。",
      "新增“观心篇”五则：听言观行、去头衔、直觉校正、多层视角、分辨而不贬低。",
      "3D／4D／5D、频率、磁场只作现代认知隐喻，不写成古籍教义或可测量事实。"
    ],
    "en": [
      "Renamed the umbrella project while keeping Yellow Springs as one realm inside the setting.",
      "Added five Inner Seeing reflections on behaviour, status, intuition, layered perspective and non-contemptuous boundaries.",
      "Treats frequency, energy fields and 3D/4D/5D language as metaphor rather than historical doctrine or measurable fact."
    ]
  }
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

/**
 * Owner 2026-10-01: ~92% of the stored "visits" came from automated browsers (every CI / production-smoke
 * Playwright context is a fresh visitor with a new key, and CI loads the app against the live counter).
 * Automated browsers are therefore never counted. navigator.webdriver is true for Playwright/Selenium/
 * Puppeteer; the UA check covers headless Chrome variants that do not set it.
 */
export function isAutomatedBrowser(nav: Pick<Navigator, "webdriver" | "userAgent"> | undefined = typeof navigator === "undefined" ? undefined : navigator) {
  if (!nav) return false;
  if (nav.webdriver) return true;
  return /HeadlessChrome|PhantomJS|Playwright|Puppeteer|Lighthouse/i.test(nav.userAgent || "");
}

export async function recordVisit() {
  if (!SUPABASE_URL || !SUPABASE_KEY || typeof window === "undefined") return;
  if (isAutomatedBrowser()) return;
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
