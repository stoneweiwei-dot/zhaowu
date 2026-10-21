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
  "version": "ZW-WEB-2026.10.21-r226",
  "updateNumber": 226,
  "publishedAt": "2026-10-21T00:00:00+11:00",
  "latestSummary": "近日天象新增太陽進入天蠍、水星在天蠍轉為視逆行，以及太陽合金星；附悉尼時刻、星曆來源與非因果占星象徵解讀。",
  "summary": {
    "zh-Hant": "近日天象新增太陽進入天蠍、水星在天蠍轉為視逆行，以及太陽合金星；附悉尼時刻、星曆來源與非因果占星象徵解讀。",
    "zh-Hans": "近日天象新增太阳进入天蝎、水星在天蝎转为视逆行，以及太阳合金星；附悉尼时刻、星历来源与非因果占星象征解读。",
    "en": "Sky events now cover the Sun's Scorpio ingress, Mercury's retrograde station in Scorpio, and the Sun–Venus conjunction, with Sydney timings, ephemeris sources and non-causal symbolic readings."
  },
  "details": {
    "zh-Hant": [
      "新增天象：太陽約於悉尼 10 月 23 日 20:38 AEDT 進入熱帶黃道天蠍座。",
      "水星約於悉尼 10 月 24 日 18:12 AEDT，在天蠍座 20°58′–20°59′開始視逆行；同日太陽合金星約在 14:44 AEDT。",
      "資料註明悉尼時區與可查星曆來源；天文座標事實與傳統占星象徵分開，不將象徵解讀寫成因果預測。"
    ],
    "zh-Hans": [
      "新增天象：太阳约于悉尼 10 月 23 日 20:38 AEDT 进入热带黄道天蝎座。",
      "水星约于悉尼 10 月 24 日 18:12 AEDT，在天蝎座 20°58′–20°59′开始视逆行；同日太阳合金星约在 14:44 AEDT。",
      "资料注明悉尼时区与可查星历来源；天文坐标事实与传统占星象征分开，不将象征解读写成因果预测。"
    ],
    "en": [
      "Added the Sun's tropical ingress into Scorpio at about 20:38 AEDT on 23 October in Sydney.",
      "Mercury stations retrograde near 20°58′–20°59′ Scorpio at about 18:12 AEDT on 24 October; the Sun–Venus conjunction is about 14:44 AEDT that day.",
      "Sydney time zone and ephemeris sources are explicit; coordinate facts are separated from traditional, non-causal astrological symbolism."
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
