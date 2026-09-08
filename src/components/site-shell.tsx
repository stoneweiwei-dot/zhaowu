import { useEffect, useState, type ReactNode } from "react";
import { Link, useRouterState } from "@tanstack/react-router";
import { BrandSeal } from "@/components/brand-seal";
import { useCurrentUserState } from "@/lib/auth/use-current-user";
import { authEnabled, signOut } from "@/lib/auth/client";
import { hydrateLocale, useI18n } from "@/lib/i18n";
import { getPublicSiteStats, recordVisit, SITE_RELEASE_FALLBACK, type PublicSiteStats } from "@/lib/site-stats";
import { GreenDragonGuide } from "@/components/green-dragon-guide";
import { runLocalHousekeeping } from "@/lib/local-housekeeping";

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

  useEffect(() => {
    hydrateLocale();
    runLocalHousekeeping();
    let alive = true;
    void recordVisit()
      .catch(() => undefined)
      .finally(() => {
        void getPublicSiteStats()
          .then((value) => { if (alive) setStats(value); })
          .catch(() => undefined);
      });
    return () => { alive = false; };
  }, []);

  const releaseDate = formatReleaseDate(stats.publishedAt, locale);
  const languageOptions = [
    { value: "zh-Hant" as const, label: "繁體", aria: "繁中" },
    { value: "zh-Hans" as const, label: "簡體", aria: "简中" },
    { value: "en" as const, label: "ENG", aria: "EN" },
  ];

  return (
    <div className={`relative min-h-dvh bg-transparent text-ink ${!isLogin ? "zhaowu-home-sheet-shell" : ""} ${isLogin ? "zhaowu-login-shell overflow-auto" : "overflow-x-hidden"}`}>
      {!isLogin ? (
        <header className="zhaowu-site-header sticky top-0 z-30">
          <div className="zhaowu-header-shell mx-auto max-w-5xl px-3 py-2 sm:px-4">
            <div className="zhaowu-header-primary">
              <Link to="/" className="zhaowu-brand-link text-ink" aria-label={t("brand")}>
                <BrandSeal />
                <span className="zhaowu-brand-copy">
                  <span className="zhaowu-brand-name font-display">{t("brand")}</span>
                  <span className="zhaowu-brand-tagline">{t("tagline")}</span>
                </span>
              </Link>

              <div className="zhaowu-header-account-actions">
                {user?.isOwner ? (
                  <Link to="/gallery" className="zhaowu-header-utility zhaowu-header-gallery" aria-label={locale === "en" ? "Open Gallery" : locale === "zh-Hans" ? "打开图库" : "打開圖庫"}>
                    {locale === "en" ? "Gallery" : locale === "zh-Hans" ? "图库" : "圖庫"}
                  </Link>
                ) : null}
                {isPending ? (
                  <span className="zhaowu-header-pending" />
                ) : user ? (
                  <>
                    <Link to="/account" className="zhaowu-header-utility">
                      {user.isOwner ? t("navAdmin") : t("navMine")}
                    </Link>
                    <button type="button" onClick={() => void signOut()} className="zhaowu-header-utility zhaowu-header-signout">
                      {authEnabled ? t("logout") : user.displayName}
                    </button>
                  </>
                ) : (
                  <Link to="/login" className="zhaowu-header-login">{t("navLogin")}</Link>
                )}
              </div>
            </div>

            <nav className="zhaowu-header-nav" aria-label={locale === "en" ? "Site controls" : locale === "zh-Hans" ? "网站控制" : "網站控制"}>
              <div role="group" aria-label={t("language")} className="site-lang-group">
                {languageOptions.map(({ value, label, aria }) => (
                  <button
                    key={value}
                    type="button"
                    onClick={() => setLocale(value)}
                    aria-label={aria}
                    aria-pressed={locale === value}
                    data-active={locale === value ? "true" : "false"}
                    className="site-lang-button"
                  >
                    {label}
                  </button>
                ))}
              </div>
              <Link to="/" aria-current={pathname === "/" ? "page" : undefined} className={`zhaowu-header-home-link ${pathname === "/" ? "is-active" : ""}`}>
                {user ? (locale === "en" ? "BaZi" : "四柱八字") : t("navHome")}
              </Link>
            </nav>
          </div>
        </header>
      ) : null}

      {!isLogin ? <GreenDragonGuide /> : null}

      <div className={isLogin ? "relative z-10 min-h-dvh" : `zhaowu-app-frame relative z-10 mx-auto max-w-5xl px-4 pb-14 pt-4 sm:pt-8 ${isHome ? "zhaowu-home-app-frame" : ""}`}>
        {children}
      </div>

      {!isLogin ? (
        <footer className="zhaowu-site-footer relative z-10 mx-auto max-w-5xl px-4 pb-10 pt-4 text-center">
          <p className="font-display text-sm tracking-[0.22em] text-ink-mute">{t("brand")}<span className="ml-2">ZHAOWU</span></p>
          <p className="mt-2 text-xs text-ink-mute" data-site-release>
            {stats.version} · {locale === "en" ? "Updates" : locale === "zh-Hans" ? "累计更新" : "累計更新"} {stats.updateNumber}{releaseDate ? ` · ${releaseDate}` : ""}
          </p>
          <p className="mt-1 text-xs text-ink-mute">
            {locale === "en" ? "Today" : "今日"} {stats.todayVisits.toLocaleString()} · {locale === "en" ? "Total visits" : locale === "zh-Hans" ? "累计访问" : "累計訪問"} {stats.totalVisits.toLocaleString()}
          </p>
          <details className="mx-auto mt-4 max-w-xl border-t border-line/60 pt-3 text-left text-sm leading-6 text-ink-mute" data-latest-change-report>
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
