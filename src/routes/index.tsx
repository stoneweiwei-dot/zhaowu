import { createFileRoute, Link } from "@tanstack/react-router";
import { AnalysisForm } from "@/components/analysis-form";
import { FollowUpBox } from "@/components/follow-up-box";
import { HomeScreenInstallPrompt } from "@/components/home-screen-install-prompt";
import { ResultView } from "@/components/result-view";
import { useCurrentUserState } from "@/lib/auth/use-current-user";
import { useI18n } from "@/lib/i18n";
import { useAppStore } from "@/lib/store";
import "@/home-polish-v3.css";

export const Route = createFileRoute("/")({ component: Home });

function Home() {
  const { t, locale } = useI18n();
  const { user, isPending } = useCurrentUserState();
  const current = useAppStore((s) => s.current);
  const toolsCopy = locale === "en"
    ? {
        kicker: "ZHAOWU · TRADITIONAL METHODS",
        title: "Specialist charts",
        lead: "Two focused systems, each with its own fixed calculation logic.",
        palmEyebrow: "DARUMA · PALM METHOD",
        palmDesc: "Four palaces and six paths, presented as a compact standalone reading.",
        palmMeta: "Traditional lookup",
        tianjiEyebrow: "TIANJI · 12 PALACES",
        tianjiTitle: "Tianji Star Palace · V2.0",
        tianjiDesc: "Gregorian or lunar birth date. Middle-qi correction is handled automatically.",
        tianjiMeta: "Deterministic · zero AI",
        tianjiButton: "Open calculation",
      }
    : locale === "zh-Hans"
      ? {
          kicker: "昭梧 · 传统术数工具",
          title: "专门排盘",
          lead: "两套独立体系，各自按固定规则计算，不把复杂判断丢给客人。",
          palmEyebrow: "达摩 · 一掌经",
          palmDesc: "四宫与六道独立排盘，结果直接呈现，不混入主八字报告。",
          palmMeta: "传统查表",
          tianjiEyebrow: "天机 · 十二宫",
          tianjiTitle: "天机星宫 · V2.0",
          tianjiDesc: "西历、农历都可输入；中气与时辰由系统自动换算。",
          tianjiMeta: "固定查表 · ZERO AI",
          tianjiButton: "进入排盘",
        }
      : {
          kicker: "昭梧 · 傳統術數工具",
          title: "專門排盤",
          lead: "兩套獨立體系，各自按固定規則計算，不把複雜判斷丟給客人。",
          palmEyebrow: "達摩 · 一掌經",
          palmDesc: "四宮與六道獨立排盤，結果直接呈現，不混入主八字報告。",
          palmMeta: "傳統查表",
          tianjiEyebrow: "天機 · 十二宮",
          tianjiTitle: "天機星宮 · V2.0",
          tianjiDesc: "西曆、農曆都可輸入；中氣與時辰由系統自動換算。",
          tianjiMeta: "固定查表 · ZERO AI",
          tianjiButton: "進入排盤",
        };

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

      <section className="zhaowu-tools-section" aria-label={t("galleryTitle")}>
        <header className="zhaowu-tools-heading">
          <div>
            <p>{toolsCopy.kicker}</p>
            <h2>{toolsCopy.title}</h2>
          </div>
          <span>{toolsCopy.lead}</span>
        </header>

        <div className="zhaowu-tools-grid">
          <article className="zhaowu-specialist-card is-palm">
            <div className="zhaowu-card-number" aria-hidden>壹</div>
            <img src="/emblems/lotus-emblem.svg" alt="" aria-hidden className="zhaowu-specialist-mark" />
            <div className="zhaowu-specialist-content">
              <p className="zhaowu-specialist-eyebrow">{toolsCopy.palmEyebrow}</p>
              <h3>{t("palmToolTitle")}</h3>
              <p className="zhaowu-specialist-desc">{toolsCopy.palmDesc}</p>
              <div className="zhaowu-specialist-meta"><span />{toolsCopy.palmMeta}</div>
            </div>
            <Link to="/yizhangjing" className="zhaowu-specialist-action is-palm-action">
              <span>{t("palmToolButton")}</span><b aria-hidden>→</b>
            </Link>
          </article>

          <article className="zhaowu-specialist-card is-tianji">
            <div className="zhaowu-card-number" aria-hidden>貳</div>
            <div className="zhaowu-tianji-orbit-mark" aria-hidden><i /><i /><i /><b>天機</b></div>
            <div className="zhaowu-specialist-content">
              <p className="zhaowu-specialist-eyebrow">{toolsCopy.tianjiEyebrow}</p>
              <h3>{toolsCopy.tianjiTitle}</h3>
              <p className="zhaowu-specialist-desc">{toolsCopy.tianjiDesc}</p>
              <div className="zhaowu-specialist-meta"><span />{toolsCopy.tianjiMeta}</div>
            </div>
            <Link to="/tianji-xinggong" className="zhaowu-specialist-action is-tianji-action">
              <span>{toolsCopy.tianjiButton}</span><b aria-hidden>→</b>
            </Link>
          </article>
        </div>
      </section>
    </main>
  );
}
