import { createFileRoute, Link } from "@tanstack/react-router";
import { AnalysisForm } from "@/components/analysis-form";
import { FollowUpBox } from "@/components/follow-up-box";
import { HomeScreenInstallPrompt } from "@/components/home-screen-install-prompt";
import { ResultView } from "@/components/result-view";
import { useCurrentUserState } from "@/lib/auth/use-current-user";
import { useI18n } from "@/lib/i18n";
import { useAppStore } from "@/lib/store";

export const Route = createFileRoute("/")({ component: Home });

function Home() {
  const { t, locale } = useI18n();
  const { user, isPending } = useCurrentUserState();
  const current = useAppStore((s) => s.current);
  const tianjiCopy = locale === "en"
    ? { title: "Tianji Star Palace · V2.0", button: "Open calculation" }
    : locale === "zh-Hans"
      ? { title: "天机星宫 · V2.0", button: "进入查表" }
      : { title: "天機星宮 · V2.0", button: "進入查表" };

  return (
    <main className="space-y-6 sm:space-y-10">
      <HomeScreenInstallPrompt />

      <section className="zhaowu-home-hero px-5 py-7 sm:px-10 sm:py-14" aria-labelledby="zhaowu-title">
        <div className="relative z-10 max-w-2xl">
          <p className="text-[10px] font-semibold tracking-[0.25em] text-earth sm:text-[11px] sm:tracking-[0.32em]">ZHAOWU · {t("heroKicker")}</p>
          <h1 id="zhaowu-title" className="mt-3 font-display text-[3.5rem] font-bold leading-none tracking-[0.06em] text-ink sm:mt-4 sm:text-8xl sm:tracking-[0.08em]">
            {t("brand")}
          </h1>
          <p className="mt-4 max-w-xl font-display text-xl font-semibold leading-[1.5] tracking-[0.08em] text-wood sm:mt-7 sm:text-3xl sm:leading-[1.55] sm:tracking-[0.1em]">
            {t("heroSlogan")}
          </p>
          <p className="mt-2 max-w-xl font-serif text-[11px] italic leading-5 tracking-[0.08em] text-water/75 sm:mt-3 sm:text-xs sm:tracking-[0.12em]">{t("heroEnglish")}</p>
          <div className="my-4 h-px w-44 max-w-[58vw] bg-gradient-to-r from-earth/80 to-transparent sm:my-6 sm:w-56 sm:max-w-[70vw]" aria-hidden />
          <p className="max-w-xl font-display text-sm leading-7 tracking-[0.03em] text-ink sm:text-lg sm:leading-8 sm:tracking-[0.04em]">{t("heroLead")}</p>
          <p className="mt-3 hidden max-w-xl text-sm leading-7 text-ink-soft sm:block">{t("heroBody")}</p>

          <div className="mt-5 flex flex-col gap-3 sm:mt-7 sm:flex-row sm:flex-wrap">
            <a href="#analysisForm" className="inline-flex min-h-12 w-full items-center justify-center rounded-full border border-wood/25 bg-wood px-6 text-sm font-medium tracking-[0.08em] text-cream shadow-[0_14px_30px_rgba(35,94,81,.14)] sm:w-auto">
              {t("start")}
            </a>
            <Link
              to={user ? "/account" : "/login"}
              className="inline-flex min-h-12 w-full items-center justify-center rounded-full border border-earth/35 bg-cream px-6 text-sm text-ink-soft sm:w-auto"
            >
              {isPending ? "…" : user ? t("accountAdmin") : t("navLogin")}
            </Link>
          </div>
        </div>
      </section>

      <section className="relative" aria-label={t("formTitle")}>
        <AnalysisForm />
      </section>

      {current ? <ResultView result={current} /> : null}
      {current ? <FollowUpBox result={current} /> : null}

      <section className="grid gap-4 sm:grid-cols-2" aria-label={t("galleryTitle")}>
        <article className="zhaowu-tool-card relative flex min-h-[168px] flex-col gap-4 overflow-hidden rounded-[1.5rem] border border-earth/30 p-5 shadow-[0_16px_44px_rgba(69,50,29,.07)] sm:p-7">
          <img src="/emblems/lotus-emblem.svg" alt="" aria-hidden className="zhaowu-tool-card-mark" />
          <h2 className="relative z-10 font-display text-xl font-semibold tracking-[0.05em] text-ink sm:text-2xl">{t("palmToolTitle")}</h2>
          <Link to="/yizhangjing" className="relative z-10 mt-auto inline-flex min-h-12 items-center justify-center rounded-full border border-wood/35 bg-cream px-5 text-sm font-medium text-wood transition hover:bg-wood hover:text-cream">
            {t("palmToolButton")}
          </Link>
        </article>

        <article className="relative flex min-h-[168px] flex-col gap-4 overflow-hidden rounded-[1.5rem] border border-[#5c3d78]/25 bg-[radial-gradient(circle_at_80%_0%,rgba(89,48,124,.12),transparent_42%),linear-gradient(145deg,rgba(247,242,233,.96),rgba(239,231,245,.86))] p-5 shadow-[0_16px_44px_rgba(54,31,74,.08)] sm:p-7">
          <div className="absolute -right-10 -top-12 h-36 w-36 rounded-full border border-[#6f4d89]/15 shadow-[0_0_0_28px_rgba(111,77,137,.04),0_0_0_56px_rgba(111,77,137,.025)]" aria-hidden />
          <p className="relative z-10 text-[10px] font-semibold tracking-[0.22em] text-[#76548d]">DETERMINISTIC · ZERO AI</p>
          <h2 className="relative z-10 font-display text-xl font-semibold tracking-[0.05em] text-ink sm:text-2xl">{tianjiCopy.title}</h2>
          <Link to="/tianji-xinggong" className="relative z-10 mt-auto inline-flex min-h-12 items-center justify-center rounded-full border border-[#684c7f]/30 bg-[#22112f] px-5 text-sm font-medium text-[#f6effb] transition hover:bg-[#3a2050]">
            {tianjiCopy.button}
          </Link>
        </article>
      </section>
    </main>
  );
}
