import { createFileRoute } from "@tanstack/react-router";
import { lazy, Suspense, useState, useEffect } from "react";
import { AnalysisForm } from "@/components/analysis-form";
import { DeepReadingHeroCard } from "@/components/deep-reading-hero-card";
import { FollowUpBox } from "@/components/follow-up-box";
import { HomeScreenInstallPrompt } from "@/components/home-screen-install-prompt";
import { HomeSectionBoundary } from "@/components/home-section-boundary";
import { ResultView } from "@/components/result-view";
import { useI18n } from "@/lib/i18n";
import { clearSharedBirthRecord } from "@/lib/shared-birth";
import { useAppStore } from "@/lib/store";
import "@/home-hero-v1.css";
import "@/home-polish-v3.css";
import "@/home-portals.css";
import "@/home-portals-astrology.css";
import "@/home-layout-r46.css";
import "@/home-birth-hub-r60.css";

export const Route = createFileRoute("/")({ component: Home });

/* ── Hero painting set ─────────────────────────────────────── */
const HERO_PAINTINGS = [
  { src: "/hero-gallery/dragon-scholar.webp",      alt: "天龍觀者" },
  { src: "/hero-gallery/lotus-lady.webp",          alt: "蓮池仙境" },
  { src: "/hero-gallery/koi-dragon-rider.webp",    alt: "御龍飛天" },
  { src: "/hero-gallery/cloud-dragon.webp",        alt: "雲龍出岫" },
  { src: "/hero-gallery/river-rain-boat.webp",     alt: "煙雨孤舟" },
  { src: "/hero-gallery/karst-mist-lake.webp",     alt: "山水雲霧" },
  { src: "/hero-gallery/temple-bamboo-rain.webp",  alt: "竹雨古寺" },
  { src: "/hero-gallery/misty-mountains-lake.webp",alt: "煙嵐疊翠" },
];

type Section = "form" | "today" | "quiz" | "notes";

/* ── Trilingual copy ───────────────────────────────────────── */
function useCopy(locale: string) {
  if (locale === "en") {
    return {
      kicker: "ZHAOWU · PERSONAL DESTINY BOOK",
      title: "One birth record. One ZHAOWU Destiny Book.",
      tagline: "Heaven counts to forty-nine — and leaves one line open.",
      birthCta: "Enter birth details · Open ZHAOWU",
      birthHint: "Begin with your birth record",
      navBook:  "Destiny",
      navToday: "Today",
      navQuiz:  "Explore",
      navNotes: "Notes",
      todayHint: "almanac, five-element dress and spirit slip",
      quizHint: "optional self-discovery tests",
      notesTitle: "Notes on Life",
      notesHint: "essays and editorial archive",
      scentTitle: "Five-Element Scent Map",
      scentHint: "sensory preference vs. five-element symbolism",
      cards: [
        { href: "/quiz/divine-affinity",       title: "Divine Affinity Scan",           hint: "16 questions across Soul Pattern, Celestial Mandate" },
        { href: "/quiz/cultivation-destiny",   title: "Cultivation Destiny Dossier",    hint: "spirit root, sect, paths + personal 9:16 dossier image" },
        { href: "/fun-tests/earth-online",     title: "Earth Online · Classics Guide",  hint: "8 questions to match your stuck point with a Chinese classic" },
        { href: "/fun-tests?test=animal",      title: "Inner Animal × Guardian Beast",  hint: "current personality strategy and instinctive response" },
        { href: "/fun-tests?test=element",     title: "Five-Element Function Test",     hint: "which function you currently want to strengthen" },
        { href: "/quiz/six-realms",            title: "Six Realms Habit Test",          hint: "which everyday habit pattern is strongest now" },
      ],
    };
  }
  if (locale === "zh-Hans") {
    return {
      kicker: "昭梧 · 个人命书",
      title: "一份生辰，读成一本昭梧命书",
      tagline: "天衍四九，其留与一。爱出者爱返，福往者福来。",
      birthCta: "录入生辰・开卷昭梧",
      birthHint: "以子平八字，起一生节奏",
      navBook:  "命书",
      navToday: "今日",
      navQuiz:  "测验",
      navNotes: "观世录",
      todayHint: "黄历、五行穿衣、灵签各自展开",
      quizHint: "可选的自我观察",
      notesTitle: "观世录",
      notesHint: "最新文章与完整内容档案",
      scentTitle: "五行香气谱",
      scentHint: "看嗅觉偏好与五行文化象意",
      cards: [
        { href: "/quiz/divine-affinity",       title: "仙佛渊源本缘测试",   hint: "16 题从魂格、象征脉象、天命六层交叉判读" },
        { href: "/quiz/cultivation-destiny",   title: "修仙命格灵测",       hint: "推演灵根宗门道途并生成个人九比十六命测图" },
        { href: "/fun-tests/earth-online",     title: "地球 Online · 古籍攻略", hint: "8 道题看你现在卡在哪一关，推荐古籍" },
        { href: "/fun-tests?test=animal",      title: "内在动物 × 命局瑞兽", hint: "看现在常用的人格策略与本能反应" },
        { href: "/fun-tests?test=element",     title: "五行功能测验",        hint: "看现在主观上最想加强哪一种功能" },
        { href: "/quiz/six-realms",            title: "六道习气测验",        hint: "看目前最明显的日常惯性" },
      ],
    };
  }
  /* 繁體中文 (default) */
  return {
    kicker: "昭梧 · 個人命書",
    title: "一份生辰，讀成一本昭梧命書",
    tagline: "天衍四九，其留與一。愛出者愛返，福往者福來。",
    birthCta: "錄入生辰・開卷昭梧",
    birthHint: "以子平八字，起一生節奏",
    navBook:  "命書",
    navToday: "今日",
    navQuiz:  "測驗",
    navNotes: "觀世錄",
    todayHint: "黃曆、五行穿衣、靈籤各自展開",
    quizHint: "可選的自我觀察",
    notesTitle: "觀世錄",
    notesHint: "最新文章與完整內容檔案",
    scentTitle: "五行香氣譜",
    scentHint: "看嗅覺偏好與五行文化象意",
    cards: [
      { href: "/quiz/divine-affinity",       title: "仙佛淵源本緣測試",   hint: "16 題從魂格、象徵脈象、天命六層交叉判讀" },
      { href: "/quiz/cultivation-destiny",   title: "修仙命格靈測",       hint: "推演靈根宗門道途並生成個人九比十六命測圖" },
      { href: "/fun-tests/earth-online",     title: "地球 Online · 古籍攻略", hint: "8 道題看你現在卡在哪一關，推薦古籍" },
      { href: "/fun-tests?test=animal",      title: "內在動物 × 命局瑞獸", hint: "看現在常用的人格策略與本能反應" },
      { href: "/fun-tests?test=element",     title: "五行功能測驗",        hint: "看現在主觀上最想加強哪一種功能" },
      { href: "/quiz/six-realms",            title: "六道習氣測驗",        hint: "看目前最明顯的日常慣性" },
    ],
  };
}

/* ── Nav item data ─────────────────────────────────────────── */
const NAV_ITEMS: { id: Section; iconSrc: string }[] = [
  { id: "form",  iconSrc: "/emblems/jade-destiny.svg" },
  { id: "today", iconSrc: "/emblems/jade-today.svg" },
  { id: "quiz",  iconSrc: "/emblems/jade-quiz.svg" },
  { id: "notes", iconSrc: "/emblems/jade-notes.svg" },
];

const LazyDailyAlmanacWidget = lazy(() =>
  import("@/components/daily-almanac-widget").then((mod) => ({ default: mod.DailyAlmanacWidget })),
);
const LazySkyEventsHomeSection = lazy(() =>
  import("@/components/sky-events-home-section").then((mod) => ({ default: mod.SkyEventsHomeSection })),
);
const LazyLifeViewHomeSection = lazy(() =>
  import("@/components/life-view-home-section").then((mod) => ({ default: mod.LifeViewHomeSection })),
);
const LazyScentFiveElementTest = lazy(() =>
  import("@/components/scent-five-element-test").then((mod) => ({ default: mod.ScentFiveElementTest })),
);

/* ── Home ──────────────────────────────────────────────────── */
function Home() {
  const { locale } = useI18n();
  const copy = useCopy(locale);
  const current = useAppStore((s) => s.current);
  const setCurrent = useAppStore((s) => s.setCurrent);

  const [heroIdx, setHeroIdx] = useState(0);
  const [heroManual, setHeroManual] = useState(false);
  const [activeSection, setActiveSection] = useState<Section | null>(null);
  const [scentOpen, setScentOpen] = useState(false);
  const [todayExpanded, setTodayExpanded] = useState(false);

  /* Auto-cycle only while motion is welcome and the visitor has not chosen a painting. */
  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const t = setInterval(() => setHeroIdx((i) => (i + 1) % HERO_PAINTINGS.length), 4500);
    return () => clearInterval(t);
  }, [heroManual]);

  /* auto-open form if there's a cached analysis result */
  useEffect(() => {
    if (current && activeSection === null) setActiveSection("form");
  }, [current]); // eslint-disable-line react-hooks/exhaustive-deps

  const toggleSection = (id: Section) => {
    if (id === "today") {
      setActiveSection(null);
      setTodayExpanded(true);
      return;
    }
    setTodayExpanded(false);
    setActiveSection((prev) => (prev === id ? null : id));
  };

  const openBirthBook = () => {
    setTodayExpanded(false);
    setActiveSection("form");
    window.requestAnimationFrame(() => {
      window.requestAnimationFrame(() => {
        document.getElementById("analysis")?.scrollIntoView({ behavior: "smooth", block: "start" });
      });
    });
  };

  const navLabels: Record<Section, string> = {
    form:  copy.navBook,
    today: copy.navToday,
    quiz:  copy.navQuiz,
    notes: copy.navNotes,
  };
  const visibleHeroIndexes = [heroIdx, (heroIdx + 1) % HERO_PAINTINGS.length];

  return (
    <main className="zw-hero-home">

      {/* ── PAINTING HERO GALLERY ───────────────────────────── */}
      <div className="zw-hero-gallery" role="region" aria-label="昭梧畫作">
        {visibleHeroIndexes.map((i) => {
          const p = HERO_PAINTINGS[i];
          return (
            <img
              key={p.src}
              src={p.src}
              alt={p.alt}
              className={`zw-hero-painting${i === heroIdx ? " is-active" : ""}`}
              loading={i === heroIdx ? "eager" : "lazy"}
              fetchPriority={i === heroIdx ? "high" : "low"}
              decoding="async"
            />
          );
        })}
        <div className="zw-hero-dots" role="tablist" aria-label="畫作切換">
          {HERO_PAINTINGS.map((_, i) => (
            <button
              key={i}
              role="tab"
              aria-selected={i === heroIdx}
              aria-label={`第 ${i + 1} 張`}
              className={`zw-hero-dot${i === heroIdx ? " is-active" : ""}`}
              onClick={() => { setHeroIdx(i); setHeroManual(true); }}
            />
          ))}
        </div>
      </div>

      {/* ── BRAND INSCRIPTION ───────────────────────────────── */}
      <div className="zw-hero-inscription">
        <p className="zw-hero-inscription-kicker">{copy.kicker}</p>
        <h1 className="zw-hero-inscription-title">{copy.title}</h1>
        <p className="zw-hero-inscription-tagline">{copy.tagline}</p>
        <button
          type="button"
          className="zw-birth-entry-ticket"
          data-home-birth-entry
          aria-controls="analysis"
          aria-expanded={activeSection === "form"}
          onClick={openBirthBook}
        >
          <span className="zw-birth-entry-seal" aria-hidden>命</span>
          <span className="zw-birth-entry-copy">
            <strong>{copy.birthCta}</strong>
            <small>{copy.birthHint}</small>
          </span>
          <span className="zw-birth-entry-arrow" aria-hidden>→</span>
        </button>
      </div>

      {/* ── ICON NAVIGATION ─────────────────────────────────── */}
      <div className="zw-hero-nav-wrap">
        <nav className="zw-hero-nav" aria-label="主要功能">
          {NAV_ITEMS.map(({ id, iconSrc }) => (
            <button
              key={id}
              type="button"
              className={`zw-hero-nav-item${activeSection === id ? " is-active" : ""}`}
              aria-expanded={id === "today" ? undefined : activeSection === id}
              aria-controls={id === "today" ? "home-today-guide" : undefined}
              aria-label={navLabels[id]}
              onClick={() => toggleSection(id)}
            >
              <img src={iconSrc} className="zw-hero-nav-icon" alt="" aria-hidden />
              <span className="zw-hero-nav-label">{navLabels[id]}</span>
            </button>
          ))}
        </nav>
      </div>

      {/* ── TODAY GUIDE: FIRST DAILY-RETURN SURFACE ─────────── */}
      <section id="home-today-guide" className="zw-home-today-priority" aria-label={copy.navToday}>
        <Suspense
          fallback={
            <div className="zw-home-today-skeleton" role="status" aria-label={locale === "en" ? "Loading Today Guide" : locale === "zh-Hans" ? "正在载入今日指引" : "正在載入今日指引"}>
              <span />
              <strong />
              <i />
            </div>
          }
        >
          {todayExpanded ? (
            <>
              <LazyDailyAlmanacWidget embedded />
              <button
                type="button"
                className="zw-home-today-collapse"
                onClick={() => setTodayExpanded(false)}
              >
                {locale === "en" ? "Collapse Today Guide" : locale === "zh-Hans" ? "收起今日指引" : "收起今日指引"}
              </button>
              <LazySkyEventsHomeSection />
            </>
          ) : (
            <LazyDailyAlmanacWidget onExpand={() => setTodayExpanded(true)} />
          )}
        </Suspense>
      </section>

      {/* ── SECONDARY PANEL: FORM ───────────────────────────── */}
      {activeSection === "form" && (
        <HomeSectionBoundary
          id="analysis"
          locale={locale}
          onRecover={() => { clearSharedBirthRecord(); window.location.reload(); }}
        >
          <div className="zw-hero-secondary-panel zhaowu-home-stage zhaowu-home-stage--primary relative">
            <AnalysisForm />
          </div>
        </HomeSectionBoundary>
      )}

      {/* Result view always visible when there's a result */}
      {current && (
        <>
          <HomeSectionBoundary
            id="report"
            locale={locale}
            onRecover={() => { setCurrent(null); window.location.reload(); }}
          >
            <div className="zw-hero-secondary-panel zhaowu-home-stage zhaowu-home-stage--result">
              <ResultView result={current} />
            </div>
            <div className="zw-hero-secondary-panel zhaowu-home-stage zhaowu-home-stage--result">
              <FollowUpBox result={current} />
            </div>
          </HomeSectionBoundary>
          <HomeSectionBoundary id="hero" locale={locale}>
            <DeepReadingHeroCard />
          </HomeSectionBoundary>
        </>
      )}

      {/* ── SECONDARY PANEL: QUIZ ───────────────────────────── */}
      {activeSection === "quiz" && (
        <div className="zw-hero-secondary-panel">
          <div className="zhaowu-home-fun-grid" style={{ padding: "0 16px" }}>
            {copy.cards.map((card) => (
              <a key={card.title} href={card.href} className="zhaowu-home-fun-card" aria-label={card.title}>
                <span className="min-w-0">
                  <strong>{card.title}</strong>
                  <small>{card.hint}</small>
                </span>
                <span className="zhaowu-home-fun-arrow" aria-hidden>›</span>
              </a>
            ))}
            <button
              type="button"
              className="zhaowu-home-fun-card text-left"
              aria-expanded={scentOpen}
              aria-controls="home-scent-test"
              onClick={() => setScentOpen((v) => !v)}
            >
              <span className="min-w-0">
                <strong>{copy.scentTitle}</strong>
                <small>{copy.scentHint}</small>
              </span>
              <span className="zhaowu-home-fun-arrow" aria-hidden>{scentOpen ? "⌃" : "›"}</span>
            </button>
          </div>
          <div id="home-scent-test" data-scent-panel hidden={!scentOpen}>
            {scentOpen ? (
              <Suspense fallback={null}>
                <LazyScentFiveElementTest result={current} />
              </Suspense>
            ) : null}
          </div>
        </div>
      )}

      {/* ── SECONDARY PANEL: NOTES ──────────────────────────── */}
      {activeSection === "notes" && (
        <div className="zw-hero-secondary-panel">
          <Suspense fallback={null}>
            <LazyLifeViewHomeSection />
          </Suspense>
        </div>
      )}

      {/* ── INSTALL PROMPT ──────────────────────────────────── */}
      <HomeSectionBoundary id="install" locale={locale}>
        <div className="zhaowu-home-stage">
          <HomeScreenInstallPrompt />
        </div>
      </HomeSectionBoundary>

    </main>
  );
}
