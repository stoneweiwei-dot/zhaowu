import { useEffect, useState, type CSSProperties, type ReactNode } from "react";
import { Link, useRouterState } from "@tanstack/react-router";
import { BrandSeal } from "@/components/brand-seal";
import { useCurrentUserState } from "@/lib/auth/use-current-user";
import { authEnabled, signOut } from "@/lib/auth/client";
import { hydrateLocale, useI18n } from "@/lib/i18n";
import { getPublicSiteStats, recordVisit, SITE_RELEASE_FALLBACK, type PublicSiteStats } from "@/lib/site-stats";
import { GreenDragonGuide } from "@/components/green-dragon-guide";
import { backgroundPublicUrl, chooseDailyBackground, listPublicBackgrounds } from "@/lib/background-assets";

const BUILTIN_WALLPAPER = "/wallpaper-song.jpg";
let dailyWallpaperPromise: Promise<string> | null = null;

function loadDailyWallpaper(force = false) {
  if (force) dailyWallpaperPromise = null;
  dailyWallpaperPromise ??= listPublicBackgrounds()
    .then((assets) => {
      const selected = chooseDailyBackground(assets);
      return selected ? backgroundPublicUrl(selected.storage_path) : BUILTIN_WALLPAPER;
    })
    .catch(() => BUILTIN_WALLPAPER);
  return dailyWallpaperPromise;
}

function wallpaperCssValue(url: string | null) {
  return url ? `url(${JSON.stringify(url)})` : "none";
}

const EMPTY_STATS: PublicSiteStats = {
  totalVisits: 0,
  todayVisits: 0,
  version: SITE_RELEASE_FALLBACK.version,
  updateNumber: SITE_RELEASE_FALLBACK.updateNumber,
  publishedAt: SITE_RELEASE_FALLBACK.publishedAt,
  latestSummary: SITE_RELEASE_FALLBACK.latestSummary,
};

function formatReleaseDate(value: string | null, locale: "zh-Hant" | "zh-Hans" | "en") {
  if (!value) return "";
  const date = new Date(value);
  if (!Number.isFinite(date.getTime())) return "";
  return new Intl.DateTimeFormat(locale === "en" ? "en-AU" : locale === "zh-Hans" ? "zh-CN" : "zh-TW", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(date);
}

export function SiteShell({ children }: { children: ReactNode }) {
  const { t, locale, setLocale } = useI18n();
  const { user, isPending } = useCurrentUserState();
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const isHome = pathname === "/";
  const isLogin = pathname === "/login";
  const [stats, setStats] = useState<PublicSiteStats>(EMPTY_STATS);
  const [wallpaperUrl, setWallpaperUrl] = useState<string | null>(null);

  useEffect(() => {
    hydrateLocale();
    let alive = true;

    void recordVisit()
      .catch(() => undefined)
      .finally(() => {
        void getPublicSiteStats()
          .then((value) => { if (alive) setStats(value); })
          .catch(() => undefined);
      });

    return () => {
      alive = false;
    };
  }, []);

  useEffect(() => {
    let alive = true;
    const refreshWallpaper = (force = false) => {
      void loadDailyWallpaper(force).then((url) => {
        if (alive) setWallpaperUrl(url);
      });
    };

    refreshWallpaper();
    const onBackgroundChange = () => refreshWallpaper(true);
    window.addEventListener("zhaowu-background-change", onBackgroundChange);
    return () => {
      alive = false;
      window.removeEventListener("zhaowu-background-change", onBackgroundChange);
    };
  }, []);

  const releaseDate = formatReleaseDate(stats.publishedAt, locale);
  const wallpaperStyle = {
    "--zhaowu-wallpaper-url": wallpaperCssValue(wallpaperUrl),
  } as CSSProperties;

  return (
    <div
      className={`zhaowu-has-wallpaper relative isolate min-h-dvh bg-transparent text-ink ${!isLogin ? "zhaowu-home-sheet-shell" : ""} ${isLogin ? "zhaowu-login-shell overflow-auto" : "overflow-x-clip"}`}
      style={wallpaperStyle}
      data-daily-wallpaper={wallpaperUrl ? "ready" : "loading"}
    >
      {!isLogin ? (
        <header className="zhaowu-site-header sticky top-0 z-30 border-b border-line/70 backdrop-blur-md">
          <div className="mx-auto flex min-h-14 max-w-5xl items-center justify-between gap-2 px-3 py-2 sm:px-4">
            <Link to="/" className="flex min-w-0 items-center gap-2 text-ink">
              <BrandSeal />
              <span className="min-w-0 leading-none">
                <span className="block font-display text-base tracking-[0.18em] sm:text-lg sm:tracking-[0.2em]">{t("brand")}</span>
                <span className="hidden max-w-[16rem] truncate text-[10px] tracking-[0.15em] text-ink-mute sm:block">{t("tagline")}</span>
              </span>
            </Link>
            <nav className="flex shrink-0 items-center gap-1 text-sm">
              <Link to="/" className={`hidden rounded-full px-2.5 py-2 min-[520px]:inline ${pathname === "/" ? "text-cinnabar" : "text-ink-soft hover:text-ink"}`}>
                {t("navHome")}
              </Link>
              {user ? (
                <Link to="/account" className={`hidden rounded-full px-2 py-2 min-[380px]:inline-flex ${pathname === "/account" ? "text-cinnabar" : "text-ink-soft hover:text-ink"}`}>
                  {user.isOwner ? t("navAdmin") : t("navMine")}
                </Link>
              ) : null}
              {user?.isOwner ? (
                <Link
                  to="/gallery"
                  aria-label={locale === "en" ? "Open Gallery" : locale === "zh-Hans" ? "打开图库" : "打開圖庫"}
                  className={`inline-flex h-9 items-center rounded-full border px-2.5 text-[11px] font-medium shadow-sm ${pathname === "/gallery" ? "border-cinnabar/50 bg-cinnabar text-cream" : "border-line bg-cream/95 text-ink-soft"}`}
                >
                  {locale === "en" ? "Gallery" : locale === "zh-Hans" ? "图库" : "圖庫"}
                </Link>
              ) : null}
              <div
                role="group"
                aria-label={t("language")}
                className="flex h-9 shrink-0 items-stretch overflow-hidden rounded-full border border-line/80 bg-cream/95"
              >
                {([
                  ["zh-Hant", "繁中"],
                  ["zh-Hans", "简中"],
                  ["en", "EN"],
                ] as const).map(([value, label]) => (
                  <button
                    key={value}
                    type="button"
                    onClick={() => setLocale(value)}
                    aria-pressed={locale === value}
                    className={`min-w-[2.25rem] border-r border-line/60 px-1.5 text-[10px] font-medium transition last:border-r-0 sm:min-w-[2.6rem] sm:px-2 sm:text-[11px] ${
                      locale === value ? "bg-wood text-cream" : "text-ink-soft hover:bg-paper-deep hover:text-ink"
                    }`}
                  >
                    {label}
                  </button>
                ))}
              </div>
              {isPending ? (
                <span className="h-8 w-14 animate-pulse rounded-full bg-paper-deep" />
              ) : user ? (
                <button type="button" onClick={() => void signOut()} className="max-w-20 truncate rounded-full px-2.5 py-2 text-ink-soft hover:text-ink">
                  {authEnabled ? t("logout") : user.displayName}
                </button>
              ) : (
                <Link to="/login" className="rounded-full bg-wood px-3 py-2 text-cream">{t("navLogin")}</Link>
              )}
            </nav>
          </div>
        </header>
      ) : null}

      {!isLogin ? <GreenDragonGuide /> : null}

      <div className={isLogin ? "relative z-10 min-h-dvh" : `zhaowu-app-frame relative z-10 mx-auto max-w-5xl px-4 pb-14 pt-4 sm:pt-8 ${isHome ? "zhaowu-home-app-frame" : ""}`}>
        {children}
      </div>

      {!isLogin ? (
        <footer className="relative z-10 mx-auto max-w-5xl px-4 pb-10 pt-4 text-center">
          <p className="font-display text-sm tracking-[0.28em] text-ink-mute">
            {t("brand")}<span className="ml-2 tracking-[0.2em]">ZHAOWU</span>
          </p>
          <p className="mt-2 text-[10px] tracking-[0.08em] text-ink-mute" data-site-release>
            {stats.version}
            {" · "}{locale === "en" ? "Updates" : locale === "zh-Hans" ? "累计更新" : "累計更新"} {stats.updateNumber}
            {releaseDate ? ` · ${releaseDate}` : ""}
          </p>
          <p className="mt-1 text-[10px] tracking-[0.08em] text-ink-mute">
            {locale === "en" ? "Today" : "今日"} {stats.todayVisits.toLocaleString()} · {locale === "en" ? "Total visits" : locale === "zh-Hans" ? "累计访问" : "累計訪問"} {stats.totalVisits.toLocaleString()}
          </p>
          <details className="mx-auto mt-3 max-w-xl border-t border-line/60 pt-3 text-left text-[11px] leading-5 text-ink-mute" data-latest-change-report>
            <summary className="cursor-pointer list-none text-center font-medium text-ink-soft [&::-webkit-details-marker]:hidden">
              {locale === "en" ? "Latest update report ＋" : locale === "zh-Hans" ? "最新更新报告 ＋" : "最新更新報告 ＋"}
            </summary>
            <p className="mt-2 text-center">{stats.latestSummary}</p>
          </details>
        </footer>
      ) : null}
    </div>
  );
}
