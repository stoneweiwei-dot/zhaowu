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
        title: "Dual Destiny Engine",
        lead: "Enter birth details once. Two independent calculations reveal the outward stance and the inner pattern together.",
        eyebrow: "TIANJI STAR PALACE × DHARMA PALM",
        toolTitle: "Tianji · Dual Destiny Chart V3.0",
        desc: "Gregorian or lunar input with automatic middle-qi correction, Tianji Life Palace, Dharma Palm four palaces and one integrated reading.",
        points: ["Two independent traditional engines", "One birth input, one integrated result", "Fixed and traceable calculation · zero AI"],
        meta: "Two engines · one input",
        button: "Open dual chart",
      }
    : locale === "zh-Hans"
      ? {
          kicker: "昭梧 · 传统术数工具",
          title: "天机 · 双轨命盘",
          lead: "出生资料只填一次，两套独立算法同时呈现外在立足点与内在灵魂底色。",
          eyebrow: "天机星宫 × 达摩一掌经",
          toolTitle: "天机 · 双轨命盘综合引擎 V3.0",
          desc: "西历、农历都可输入；自动处理中气，输出天机命宫、一掌经四宫六道与融合星评。",
          points: ["两套传统算法独立计算", "一次输入，同时得到双轨结果", "固定查表、路径可追溯 · ZERO AI"],
          meta: "双引擎 · 一次输入",
          button: "进入双轨排盘",
        }
      : {
          kicker: "昭梧 · 傳統術數工具",
          title: "天機 · 雙軌命盤",
          lead: "出生資料只填一次，兩套獨立算法同時呈現外在立足點與內在靈魂底色。",
          eyebrow: "天機星宮 × 達摩一掌經",
          toolTitle: "天機 · 雙軌命盤綜合引擎 V3.0",
          desc: "西曆、農曆都可輸入；自動處理中氣，輸出天機命宮、一掌經四宮六道與融合星評。",
          points: ["兩套傳統算法獨立計算", "一次輸入，同時得到雙軌結果", "固定查表、路徑可追溯 · ZERO AI"],
          meta: "雙引擎 · 一次輸入",
          button: "進入雙軌排盤",
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

        <div className="zhaowu-tools-grid is-single">
          <article className="zhaowu-specialist-card is-tianji is-dual">
            <div className="zhaowu-card-number" aria-hidden>雙</div>
            <img src="/ornaments/generated/phoenix.webp" alt="" aria-hidden className="zhaowu-specialist-mark zhaowu-specialist-mark--palm zhaowu-specialist-mark--dual-palm" />
            <img src="/ornaments/generated/celestial-pearl.webp" alt="" aria-hidden className="zhaowu-specialist-mark zhaowu-specialist-mark--tianji" />
            <div className="zhaowu-specialist-content">
              <p className="zhaowu-specialist-eyebrow">{toolsCopy.eyebrow}</p>
              <h3>{toolsCopy.toolTitle}</h3>
              <p className="zhaowu-specialist-desc">{toolsCopy.desc}</p>
              <ul className="zhaowu-specialist-points">
                {toolsCopy.points.map((point) => <li key={point}>{point}</li>)}
              </ul>
              <div className="zhaowu-specialist-meta"><span />{toolsCopy.meta}</div>
            </div>
            <Link to="/tianji-dual" className="zhaowu-specialist-action is-tianji-action">
              <span>{toolsCopy.button}</span><b aria-hidden>→</b>
            </Link>
          </article>
        </div>
      </section>
    </main>
  );
}
