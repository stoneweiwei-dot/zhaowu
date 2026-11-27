import { visitContext } from "./visit-context";
import { ZHAOWU_BUILD_RELEASE } from "../../lib/release-id.js";
import { SUPABASE_KEY, SUPABASE_URL } from "@/lib/supabase-config";

const VISITOR_KEY = "zhaowu.visitor.v1";
const PUBLIC_DATA_TIMEOUT_MS = 5000;
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

/**
 * Confirmed legacy cumulative visit count from before the database migration.
 * The footer counter displays `LEGACY_VISITS_BASE + dbCount`, falling back to `LEGACY_VISITS_BASE`
 * when the database count is 0 or temporarily unreachable.
 */
export const LEGACY_VISITS_BASE = 2444;

export function getDisplayedTotalVisits(newDbCount: number | null | undefined = 0): number {
  const safeNewCount = typeof newDbCount === "number" && Number.isFinite(newDbCount) && newDbCount > 0
    ? Math.floor(newDbCount)
    : 0;
  return LEGACY_VISITS_BASE + safeNewCount;
}

export function formatCumulativeVisitsNumber(total: number, language: string): string {
  const safeTotal = Number.isFinite(total) && total >= 0 ? Math.floor(total) : LEGACY_VISITS_BASE;
  const formatWan = (value: number) => {
    const rounded = Math.round((value / 10_000) * 10) / 10;
    return Number.isInteger(rounded) ? String(rounded) : rounded.toFixed(1);
  };

  if (language === "zh-Hans") {
    return safeTotal >= 10_000
      ? `${formatWan(safeTotal)} 万`
      : safeTotal.toLocaleString("zh-CN");
  }

  if (language === "zh-Hant") {
    return safeTotal >= 10_000
      ? `${formatWan(safeTotal)} 萬`
      : safeTotal.toLocaleString("zh-TW");
  }

  if (language === "ja") {
    return safeTotal >= 10_000
      ? `${formatWan(safeTotal)} 万`
      : safeTotal.toLocaleString("ja-JP");
  }

  if (language === "ko") {
    return safeTotal >= 10_000
      ? `${formatWan(safeTotal)}만`
      : safeTotal.toLocaleString("ko-KR");
  }

  return `${safeTotal.toLocaleString("en-US")}+`;
}

export function formatCumulativeVisitsLabel(language: string): string {
  if (language === "zh-Hans") return "累计访客";
  if (language === "zh-Hant") return "累計訪客";
  if (language === "ja") return "累計訪問";
  if (language === "ko") return "누적 방문객";
  if (language === "hi") return "कुल आगंतुक";
  return "Total visits";
}

export function formatCumulativeVisits(total: number, language: string): string {
  const safeTotal = Number.isFinite(total) && total >= 0 ? Math.floor(total) : LEGACY_VISITS_BASE;
  const numberPart = formatCumulativeVisitsNumber(safeTotal, language);
  if (language === "zh-Hans") {
    return safeTotal >= 10_000 ? `累计 ${numberPart}人次` : `累计 ${numberPart} 人次`;
  }
  if (language === "zh-Hant") {
    return safeTotal >= 10_000 ? `累計 ${numberPart}人次` : `累計 ${numberPart} 人次`;
  }
  if (language === "ja") {
    return safeTotal >= 10_000 ? `累計 ${numberPart}回訪問` : `累計 ${numberPart} 回訪問`;
  }
  if (language === "ko") {
    return safeTotal >= 10_000 ? `누적 ${numberPart} 회 방문` : `누적 ${numberPart}회 방문`;
  }
  return `${numberPart} visits`;
}

export const SITE_RELEASE_FALLBACK = {
  version: ZHAOWU_BUILD_RELEASE,
  updateNumber: Number(/-r(\d+)$/.exec(ZHAOWU_BUILD_RELEASE)?.[1] ?? 0),
  publishedAt: null,
  latestSummary: "發布資訊待更新。",
  summary: {
    "zh-Hant": "發布資訊待更新。",
    "zh-Hans": "发布信息待更新。",
    en: "Release notes are pending.",
  },
  details: { "zh-Hant": [], "zh-Hans": [], en: [] },
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
    body: JSON.stringify({ p_visitor_key: key, ...visitContext(window.location.pathname, document.referrer, navigator.userAgent, navigator.maxTouchPoints) }),
  });
  if (!res.ok) throw new Error(`Visit counter failed: HTTP ${res.status}`);
}

export async function getPublicSiteStats(): Promise<PublicSiteStats> {
  if (!SUPABASE_URL || !SUPABASE_KEY || typeof window === "undefined") return fallbackStats();
  if (Date.now() < publicDataBlockedUntil) return fallbackStats();

  try {
    const [settingsRes, releaseRes] = await Promise.all([
      publicFetch(`${SUPABASE_URL}/rest/v1/site_settings?key=eq.visitor_count&select=value&limit=1`, { headers: publicHeaders() }).catch(() => null),
      publicFetch(`${SUPABASE_URL}/rest/v1/release_history?select=version,update_number,published_at,notes&order=update_number.desc.nullslast,published_at.desc&limit=1`, { headers: publicHeaders() }).catch(() => null),
    ]);

    if (!settingsRes?.ok && !releaseRes?.ok) return fallbackStats();

    const settings = settingsRes?.ok
      ? (await settingsRes.json() as { value?: { total?: number; today?: number } }[])
      : [];
    const releases = releaseRes?.ok
      ? (await releaseRes.json() as { version?: string; update_number?: number; published_at?: string; notes?: { summary?: string } }[])
      : [];
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
