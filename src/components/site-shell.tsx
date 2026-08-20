import { useEffect, useState, type ReactNode } from "react";
import { Link, useRouterState } from "@tanstack/react-router";
import { useCurrentUserState } from "@/lib/auth/use-current-user";
import { authEnabled, signOut } from "@/lib/auth/client";
import { hydrateLocale, useI18n, type Locale } from "@/lib/i18n";
import { getPublicSiteStats, recordVisit, type PublicSiteStats } from "@/lib/site-stats";
import { backgroundPublicUrl, chooseDailyBackground, listPublicBackgrounds } from "@/lib/background-assets";
import { IntroGate } from "@/components/intro-gate";
import { SealScatter } from "@/components/marks";

const EMPTY_STATS: PublicSiteStats = {
  totalVisits: 0,
  todayVisits: 0,
  version: "—",
  updateNumber: 0,
  publishedAt: null,
};

export function SiteShell({ children }: { children: ReactNode }) {
  const { t, locale, setLocale } = useI18n();
  const { user, isPending } = useCurrentUserState();
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const showScatter = pathname !== "/login";
  const [stats, setStats] = useState<PublicSiteStats>(EMPTY_STATS);
  const [backgroundUrl, setBackgroundUrl] = useState<string | null>(null);

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

    void listPublicBackgrounds()
      .then((assets) => {
        if (!alive) return;
        const selected = chooseDailyBackground(assets);
        setBackgroundUrl(selected ? backgroundPublicUrl(selected.storage_path) : null);
      })
      .catch(() => undefined);

    return () => { alive = false; };
  }, []);

  return (
    <div className="relative isolate min-h-dvh overflow-x-clip bg-transparent text-ink">
      {backgroundUrl ? (
        <div
          aria-hidden
          className="pointer-events-none fixed inset-0 z-0 bg-cover bg-center bg-no-repeat opacity-[0.14] saturate-75"
          style={{ backgroundImage: `linear-gradient(rgba(247,239,221,.25), rgba(239,225,195,.72)), url(${backgroundUrl})` }}
        />
      ) : null}
      <IntroGate />
      {showScatter ? <SealScatter /> : null}
      <header className="sticky top-0 z-30 border-b border-line/70 bg-cream/92 backdrop-blur-md">
        <div className="mx-auto flex min-h-14 max-w-5xl items-center justify-between gap-2 px-3 py-2 sm:px-4">
          <Link to="/" className="flex min-w-0 items-center gap-2 text-ink">
            <span className="grid h-8 w-8 shrink-0 place-items-center rounded-full border border-cinnabar/30 bg-paper text-xs font-display text-cinnabar sm:h-9 sm:w-9 sm:text-sm">昭</span>
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
            <label htmlFor="site-language" className="sr-only">{t("language")}</label>
            <select
              id="site-language"
              value={locale}
              onChange={(e) => setLocale(e.target.value as Locale)}
              aria-label={t("language")}
              className="h-10 max-w-[4.6rem] rounded-full border border-line/80 bg-paper/60 px-2 text-xs text-ink-soft outline-none focus:border-cinnabar"
            >
              <option value="zh-Hant">繁體</option>
              <option value="zh-Hans">简体</option>
              <option value="en">EN</option>
            </select>
            {isPending ? (
              <span className="h-8 w-14 animate-pulse rounded-full bg-paper-deep" />
            ) : user ? (
              <button type="button" onClick={() => void signOut()} className="max-w-20 truncate rounded-full px-2.5 py-2 text-ink-soft hover:text-ink">
                {authEnabled ? t("logout") : user.displayName}
              </button>
            ) : (
              <Link to="/login" className="rounded-full bg-cinnabar px-3 py-2 text-cream">{t("navLogin")}</Link>
            )}
          </nav>
        </div>
      </header>
      <div className="relative z-10 mx-auto max-w-5xl px-4 pb-14 pt-4 sm:pt-8">{children}</div>
      <footer className="relative z-10 mx-auto max-w-5xl px-4 pb-10 pt-4 text-center">
        <p className="font-display text-sm tracking-[0.28em] text-ink-mute">
          {t("brand")}<span className="ml-2 tracking-[0.2em]">ZHAOWU</span>
        </p>
        <p className="mt-2 text-[10px] tracking-[0.08em] text-ink-mute">
          {stats.version !== "—" ? `${stats.version} · #${stats.updateNumber}` : "ZHAOWU"}
          {stats.version !== "—" ? " · " : ""}
          {locale === "en" ? "Today" : "今日"} {stats.todayVisits.toLocaleString()} · {locale === "en" ? "Total" : locale === "zh-Hans" ? "累计" : "累計"} {stats.totalVisits.toLocaleString()}
        </p>
      </footer>
    </div>
  );
}
