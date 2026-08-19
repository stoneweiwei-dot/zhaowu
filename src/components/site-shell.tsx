import { useEffect, useState, type ReactNode } from "react";
import { Link, useRouterState } from "@tanstack/react-router";
import { useCurrentUserState } from "@/lib/auth/use-current-user";
import { authEnabled, signOut } from "@/lib/auth/client";
import { hydrateLocale, useI18n, type Locale } from "@/lib/i18n";
import { getPublicSiteStats, recordVisit, type PublicSiteStats } from "@/lib/supabase-rest";
import { IntroGate } from "@/components/intro-gate";
import { Mark, SealScatter } from "@/components/marks";

const EMPTY_STATS: PublicSiteStats = {
  totalVisits: 0,
  todayVisits: 0,
  version: "—",
  updateNumber: 0,
  publishedAt: null,
};

function nextLocale(locale: Locale): Locale {
  if (locale === "zh-Hant") return "zh-Hans";
  if (locale === "zh-Hans") return "en";
  return "zh-Hant";
}

function localeLabel(locale: Locale) {
  if (locale === "zh-Hant") return "繁";
  if (locale === "zh-Hans") return "简";
  return "EN";
}

export function SiteShell({ children }: { children: ReactNode }) {
  const { t, locale, setLocale } = useI18n();
  const { user, isPending } = useCurrentUserState();
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const showScatter = pathname !== "/login";
  const [stats, setStats] = useState<PublicSiteStats>(EMPTY_STATS);

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
    return () => { alive = false; };
  }, []);

  return (
    <div className="relative min-h-dvh overflow-x-hidden">
      <IntroGate />
      {showScatter ? <SealScatter /> : null}
      <header className="sticky top-0 z-30 border-b border-line/80 bg-paper/80 backdrop-blur-md">
        <div className="mx-auto flex h-14 max-w-5xl items-center justify-between gap-2 px-3 sm:px-4">
          <Link to="/" className="relative z-10 flex min-w-0 items-center gap-2 text-ink">
            <Mark id="brand" size={36} eager alt="" className="h-9 w-9 shrink-0" />
            <span className="min-w-0 leading-none">
              <span className="block font-display text-lg tracking-[0.2em]">{t("brand")}</span>
              <span className="hidden max-w-[16rem] truncate text-[10px] tracking-[0.15em] text-ink-mute min-[390px]:block">{t("tagline")}</span>
            </span>
          </Link>
          <nav className="relative z-10 flex shrink-0 items-center gap-0.5 text-sm">
            <Link to="/" className={`hidden rounded-full px-2.5 py-2 min-[520px]:inline ${pathname === "/" ? "text-cinnabar" : "text-ink-soft hover:text-ink"}`}>
              {t("navHome")}
            </Link>
            <Link to="/account" className={`rounded-full px-2.5 py-2 ${pathname === "/account" ? "text-cinnabar" : "text-ink-soft hover:text-ink"}`}>
              {user?.isOwner ? "後台" : t("navMine")}
            </Link>
            <button
              type="button"
              className="rounded-full px-2.5 py-2 text-ink-soft hover:text-ink"
              onClick={() => setLocale(nextLocale(locale))}
              aria-label="Switch language"
              title="繁體 / 简体 / English"
            >
              {localeLabel(locale)}
            </button>
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
      <div className="relative z-10 mx-auto max-w-5xl px-4 pb-12 pt-8">{children}</div>
      <footer className="relative z-10 mx-auto max-w-5xl px-4 pb-10 pt-2 text-center">
        <Mark id="04" size={140} className="mx-auto mb-3 h-10 w-36 opacity-45" />
        <p className="font-display text-sm tracking-[0.28em] text-ink-mute">
          {t("brand")}<span className="ml-2 tracking-[0.2em]">ZHAOWU</span>
        </p>
        <p className="mt-2 text-[10px] tracking-[0.08em] text-ink-mute">
          {stats.version !== "—" ? `${stats.version} · #${stats.updateNumber}` : ""}
          {stats.version !== "—" ? " · " : ""}
          今日 {stats.todayVisits.toLocaleString()} · 累計 {stats.totalVisits.toLocaleString()}
        </p>
      </footer>
    </div>
  );
}
