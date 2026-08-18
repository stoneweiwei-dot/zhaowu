import { useEffect, type ReactNode } from "react";
import { Link, useRouterState } from "@tanstack/react-router";
import { useCurrentUserState } from "@/lib/auth/use-current-user";
import { authEnabled, signOut } from "@/lib/auth/client";
import { hydrateLocale, useI18n } from "@/lib/i18n";
import { IntroGate } from "@/components/intro-gate";
import { Mark, SealScatter } from "@/components/marks";

export function SiteShell({ children }: { children: ReactNode }) {
  const { t, locale, setLocale } = useI18n();
  const { user, isPending } = useCurrentUserState();
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const showScatter = pathname !== "/login";

  useEffect(() => {
    hydrateLocale();
  }, []);

  return (
    <div className="relative min-h-dvh overflow-x-hidden">
      <IntroGate />
      {showScatter ? <SealScatter /> : null}
      <header className="sticky top-0 z-30 border-b border-line/80 bg-paper/80 backdrop-blur-md">
        <div className="mx-auto flex h-14 max-w-5xl items-center justify-between gap-3 px-4">
          <Link to="/" className="relative z-10 flex items-center gap-2 text-ink">
            <Mark id="brand" size={36} eager alt="" className="h-9 w-9" />
            <span className="leading-none">
              <span className="block font-display text-lg tracking-[0.2em]">{t("brand")}</span>
              <span className="block text-[10px] tracking-[0.18em] text-ink-mute">{t("tagline")}</span>
            </span>
          </Link>
          <nav className="relative z-10 flex items-center gap-1 text-sm">
            <Link
              to="/"
              className={`hidden rounded-full px-3 py-2 min-[420px]:inline ${pathname === "/" ? "text-cinnabar" : "text-ink-soft hover:text-ink"}`}
            >
              {t("navHome")}
            </Link>
            <Link
              to="/account"
              className={`rounded-full px-3 py-2 ${pathname === "/account" ? "text-cinnabar" : "text-ink-soft hover:text-ink"}`}
            >
              {t("navMine")}
            </Link>
            <button
              type="button"
              className="rounded-full px-3 py-2 text-ink-soft hover:text-ink"
              onClick={() => setLocale(locale === "zh-Hant" ? "zh-Hans" : "zh-Hant")}
            >
              {locale === "zh-Hant" ? "繁" : "简"}
            </button>
            {isPending ? (
              <span className="h-8 w-16 animate-pulse rounded-full bg-paper-deep" />
            ) : user ? (
              <button
                type="button"
                onClick={() => void signOut()}
                className="max-w-28 truncate rounded-full px-3 py-2 text-ink-soft hover:text-ink"
              >
                {authEnabled ? t("logout") : user.displayName}
              </button>
            ) : (
              <Link to="/login" className="rounded-full bg-cinnabar px-3 py-2 text-cream">
                {t("navLogin")}
              </Link>
            )}
          </nav>
        </div>
      </header>
      <div className="relative z-10 mx-auto max-w-5xl px-4 pb-12 pt-8">{children}</div>
      <footer className="relative z-10 mx-auto max-w-5xl px-4 pb-10 pt-2 text-center">
        <Mark id="04" size={140} className="mx-auto mb-3 h-10 w-36 opacity-45" />
        <p className="font-display text-sm tracking-[0.28em] text-ink-mute">
          {t("brand")}
          <span className="ml-2 tracking-[0.2em]">ZHAOWU</span>
        </p>
      </footer>
    </div>
  );
}
