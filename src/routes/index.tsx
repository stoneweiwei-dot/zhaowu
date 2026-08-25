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
        lead: "Two focused systems: Dharma Palm traces the four palaces and six paths, while Tianji resolves the Life Palace and its star pattern. Fixed rules, calendar conversion and seasonal-qi handling are automated; the interface keeps only the inputs and results that matter.",
        palmEyebrow: "DARUMA · PALM METHOD",
        palmDesc: "A standalone chart built from the twelve earthly branches, four palaces and six paths, stepping through the birth year, month, day and hour.",
        palmPoints: ["Four-palace structure and six-path sequence", "Clear natal pattern and disposition summary"],
        palmMeta: "Traditional lookup",
        tianjiEyebrow: "TIANJI · 12 PALACES",
        tianjiTitle: "Tianji Star Palace · V2.0",
        tianjiDesc: "Starting from the birth year, month, day and hour, the system deterministically resolves the Life Palace and star-palace structure with a traceable lookup path and corresponding star traits.",
        tianjiPoints: [
          "Converts Gregorian / lunar dates, hour branch and seasonal qi automatically",
          "Advances the lookup month automatically when middle qi requires it",
          "Fixed lookup logic, no AI guessing; the path stays traceable",
        ],
        tianjiMeta: "Deterministic · zero AI",
        tianjiButton: "Open calculation",
      }
    : locale === "zh-Hans"
      ? {
          kicker: "昭梧 · 传统术数工具",
          title: "专门排盘",
          lead: "两套独立体系：一掌经看四宫六道，天机星宫看命宫星曜。规则固定，历法换算与节令判断由系统自动完成，前台只保留必要输入与清晰结果。",
          palmEyebrow: "达摩 · 一掌经",
          palmDesc: "以十二地支、四宫与六道为骨架，按出生年月日时逐层落宫，独立呈现先天格局与命性脉络。",
          palmPoints: ["四宫格局 · 六道流转", "先天命性 · 落宫脉络"],
          palmMeta: "传统查表",
          tianjiEyebrow: "天机 · 十二宫",
          tianjiTitle: "天机星宫 · V2.0",
          tianjiDesc: "以出生年月日时为起点，按固定规则推演命宫与星宫结构，完整呈现查表路径与对应星性。",
          tianjiPoints: [
            "自动换算西历／农历、出生时辰与节令中气",
            "必要时自动顺延查表月份，避免客人自行判断",
            "全程固定查表，不调用 AI 猜测，结果逻辑可追溯",
          ],
          tianjiMeta: "固定查表 · ZERO AI",
          tianjiButton: "进入排盘",
        }
      : {
          kicker: "昭梧 · 傳統術數工具",
          title: "專門排盤",
          lead: "兩套獨立體系：一掌經看四宮六道，天機星宮看命宮星曜。規則固定，曆法換算與節令判斷由系統自動完成，前台只保留必要輸入與清晰結果。",
          palmEyebrow: "達摩 · 一掌經",
          palmDesc: "以十二地支、四宮與六道為骨架，按出生年月日時逐層落宮，獨立呈現先天格局與命性脈絡。",
          palmPoints: ["四宮格局 · 六道流轉", "先天命性 · 落宮脈絡"],
          palmMeta: "傳統查表",
          tianjiEyebrow: "天機 · 十二宮",
          tianjiTitle: "天機星宮 · V2.0",
          tianjiDesc: "以出生年月日時為起點，按固定規則推演命宮與星宮結構，完整呈現查表路徑與對應星性。",
          tianjiPoints: [
            "自動換算西曆／農曆、出生時辰與節令中氣",
            "必要時自動順延查表月份，避免客人自行判斷",
            "全程固定查表，不調用 AI 猜測，結果邏輯可追溯",
          ],
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
            <img src="/ornaments/generated/phoenix.webp" alt="" aria-hidden className="zhaowu-specialist-mark zhaowu-specialist-mark--palm" />
            <div className="zhaowu-specialist-content">
              <p className="zhaowu-specialist-eyebrow">{toolsCopy.palmEyebrow}</p>
              <h3>{t("palmToolTitle")}</h3>
              <p className="zhaowu-specialist-desc">{toolsCopy.palmDesc}</p>
              <ul className="zhaowu-specialist-points">
                {toolsCopy.palmPoints.map((point) => <li key={point}>{point}</li>)}
              </ul>
              <div className="zhaowu-specialist-meta"><span />{toolsCopy.palmMeta}</div>
            </div>
            <Link to="/yizhangjing" className="zhaowu-specialist-action is-palm-action">
              <span>{t("palmToolButton")}</span><b aria-hidden>→</b>
            </Link>
          </article>

          <article className="zhaowu-specialist-card is-tianji">
            <div className="zhaowu-card-number" aria-hidden>貳</div>
            <img src="/ornaments/generated/celestial-pearl.webp" alt="" aria-hidden className="zhaowu-specialist-mark zhaowu-specialist-mark--tianji" />
            <div className="zhaowu-specialist-content">
              <p className="zhaowu-specialist-eyebrow">{toolsCopy.tianjiEyebrow}</p>
              <h3>{toolsCopy.tianjiTitle}</h3>
              <p className="zhaowu-specialist-desc">{toolsCopy.tianjiDesc}</p>
              <ul className="zhaowu-specialist-points">
                {toolsCopy.tianjiPoints.map((point) => <li key={point}>{point}</li>)}
              </ul>
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