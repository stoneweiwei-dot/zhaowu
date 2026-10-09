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

export const Route = createFileRoute("/")({ component: Home });

type Section = "form" | "today" | "quiz" | "notes";

/* ── Trilingual copy ───────────────────────────────────────── */
function useCopy(locale: string) {
  if (locale === "en") {
    return {
      kicker: "ZHAOWU · PERSONAL DESTINY BOOK",
      title: "One birth record. One ZHAOWU Destiny Book.",
      tagline: "Heaven counts to forty-nine — and leaves one line open.",
      birthCta: "Build my Destiny Book",
      birthHint: "Enter birth details · Open ZHAOWU",
      navBook:  "Destiny",
      navToday: "Today",
      navQuiz:  "Explore",
      navNotes: "Notes",
      backHome: "Back to Home",
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
      birthCta: "开始建立我的命书",
      birthHint: "录入生辰・开卷昭梧",
      navBook:  "命书",
      navToday: "今日",
      navQuiz:  "测验",
      navNotes: "观世录",
      backHome: "返回首页",
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
    birthCta: "開始建立我的命書",
    birthHint: "錄入生辰・開卷昭梧",
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


function heroUiCopy(locale: string) {
  if (locale === "en") return {
    gallery: "ZHAOWU artwork carousel",
    controls: "Artwork controls",
    previous: "Previous artwork",
    next: "Next artwork",
    pause: "Pause artwork rotation",
    play: "Play artwork rotation",
    reduced: "Automatic artwork rotation is disabled by Reduce Motion",
    primaryNav: "Main features",
    scentLoading: "Loading Five-Element Scent Map",
    notesLoading: "Loading Notes on Life",
    painting: (index: number, total: number, title: string) => `${index} of ${total}: ${title}`,
  };
  if (locale === "zh-Hans") return {
    gallery: "昭梧画作轮播",
    controls: "画作切换",
    previous: "上一张画作",
    next: "下一张画作",
    pause: "暂停画作轮播",
    play: "继续画作轮播",
    reduced: "系统已开启减少动态效果，自动轮播已停用",
    primaryNav: "主要功能",
    scentLoading: "正在载入五行香气谱",
    notesLoading: "正在载入观世录",
    painting: (index: number, total: number, title: string) => `第 ${index} 张，共 ${total} 张：${title}`,
  };
  return {
    gallery: "昭梧畫作輪播",
    controls: "畫作切換",
    previous: "上一張畫作",
    next: "下一張畫作",
    pause: "暫停畫作輪播",
    play: "繼續畫作輪播",
    reduced: "系統已開啟減少動態效果，自動輪播已停用",
    primaryNav: "主要功能",
    scentLoading: "正在載入五行香氣譜",
    notesLoading: "正在載入觀世錄",
    painting: (index: number, total: number, title: string) => `第 ${index} 張，共 ${total} 張：${title}`,
  };
}

/* ── Nav item data ─────────────────────────────────────────── */
/* Owner 2026-10-08 mockup: four illustrated paper cards (art from the owner's scene set). */
const NAV_ITEMS: { id: Section; artSrc: string }[] = [
  { id: "form",  artSrc: "/art/scene-koi-rider-v1.webp" },
  { id: "today", artSrc: "/art/scene-lotus-boat-v1.webp" },
  { id: "quiz",  artSrc: "/art/scene-osmanthus-tea-v1.webp" },
  { id: "notes", artSrc: "/art/scene-butterfly-dream-v1.webp" },
];

const NAV_HINTS: Record<"zh-Hant" | "zh-Hans" | "en", Record<Section, string>> = {
  "zh-Hant": { form: "讀懂命運的紋理，看見更多可能。", today: "一日之氣，順勢而行。", quiz: "探索內心，遇見另一種自己。", notes: "看見更大的世界，也看見更深的自己。" },
  "zh-Hans": { form: "读懂命运的纹理，看见更多可能。", today: "一日之气，顺势而行。", quiz: "探索内心，遇见另一种自己。", notes: "看见更大的世界，也看见更深的自己。" },
  en: { form: "Read the grain of your life and see more options.", today: "Today's energy, and how to move with it.", quiz: "Explore within and meet another side of you.", notes: "See a wider world—and a deeper self." },
};

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
  const heroUi = heroUiCopy(locale);
  const current = useAppStore((s) => s.current);
  const setCurrent = useAppStore((s) => s.setCurrent);

  const [activeSection, setActiveSection] = useState<Section | null>(null);
  const [scentOpen, setScentOpen] = useState(false);
  const [todayExpanded, setTodayExpanded] = useState(false);

  /* auto-open form if there's a cached analysis result */
  useEffect(() => {
    if (current && activeSection === null) setActiveSection("form");
  }, [current]); // eslint-disable-line react-hooks/exhaustive-deps

  const returnToHome = () => {
    setActiveSection(null);
    if (typeof window !== "undefined" && window.location.hash) {
      window.history.pushState(null, "", window.location.pathname);
    }
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const toggleSection = (id: Section) => {
    if (id === "form") {
      openBirthBook({ focusYear: true });
      return;
    }
    setActiveSection((prev) => (prev === id ? null : id));
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const openBirthBook = (options?: { focusYear?: boolean }) => {
    const shouldFocus = options?.focusYear ?? true;
    setTodayExpanded(false);
    setActiveSection("form");
    window.requestAnimationFrame(() => {
      window.requestAnimationFrame(() => {
        const target = document.getElementById("birth-form") ?? document.getElementById("analysis");
        target?.scrollIntoView({ behavior: "smooth", block: "start" });
        if (shouldFocus) {
          window.setTimeout(() => {
            document.getElementById("birth-year")?.focus({ preventScroll: true });
          }, 350);
        }
      });
    });
  };

  useEffect(() => {
    if (typeof window === "undefined") return;
    const BIRTH_HASHES = ["#birth-form", "#analysis", "#analysisForm"];
    const fromHash = () => {
      if (BIRTH_HASHES.includes(window.location.hash)) openBirthBook({ focusYear: false });
    };
    const fromEvent = () => openBirthBook({ focusYear: false });
    fromHash();
    window.addEventListener("hashchange", fromHash);
    window.addEventListener("zhaowu:open-birth-form", fromEvent);
    return () => {
      window.removeEventListener("hashchange", fromHash);
      window.removeEventListener("zhaowu:open-birth-form", fromEvent);
    };
  }, []);

  const navLabels: Record<Section, string> = {
    form:  copy.navBook,
    today: copy.navToday,
    quiz:  copy.navQuiz,
    notes: copy.navNotes,
  };

  return (
    <main className="zw-hero-home">

      {/* ── HOME MAIN: HERO & 4 BIG PORTALS (shown when no subview active) ── */}
      {activeSection === null && (
        <>
          {/* ── BRAND INSCRIPTION ───────────────────────────────── */}
          <div className="zw-hero-inscription">
            <p className="zw-hero-inscription-kicker">{copy.kicker}</p>
            <h1 className="zw-hero-inscription-title">{copy.title}</h1>
            <p className="zw-hero-inscription-tagline">{copy.tagline}</p>
            <button
              type="button"
              className="zw-birth-entry-ticket"
              data-home-birth-entry
              aria-controls="birth-form"
              aria-expanded={false}
              onClick={() => openBirthBook({ focusYear: true })}
            >
              <span className="zw-birth-entry-seal" aria-hidden>命</span>
              <span className="zw-birth-entry-copy">
                <strong>{copy.birthCta}</strong>
                <small>{copy.birthHint}</small>
              </span>
              <span className="zw-birth-entry-arrow" aria-hidden>→</span>
            </button>
          </div>

          {/* ── FOUR BIG PORTALS NAVIGATION ─────────────────────── */}
          <div className="zw-hero-nav-wrap">
            <nav className="zw-hero-nav" aria-label={heroUi.primaryNav}>
              {NAV_ITEMS.map(({ id, artSrc }) => (
                <button
                  key={id}
                  type="button"
                  data-home-card={id}
                  className="zw-hero-nav-item zw-hero-card"
                  aria-label={navLabels[id]}
                  onClick={() => toggleSection(id)}
                >
                  <img src={artSrc} className="zw-hero-card-art" alt="" aria-hidden loading="lazy" decoding="async" width={760} height={504} />
                  <span className="zw-hero-card-copy">
                    <span className="zw-hero-nav-label">{navLabels[id]}</span>
                    <small>{NAV_HINTS[locale][id]}</small>
                  </span>
                  <span className="zw-hero-card-arrow" aria-hidden>→</span>
                </button>
              ))}
            </nav>
          </div>
        </>
      )}

      {/* ── SUBVIEW TOPBAR: RETURN TO 4 BIG PORTALS ──────────── */}
      {activeSection !== null && (
        <div className="zw-subview-topbar" data-subview-header>
          <button
            type="button"
            className="zw-subview-back-btn"
            data-subview-back
            onClick={returnToHome}
          >
            <span className="zw-subview-back-arrow" aria-hidden>←</span>
            <span>{copy.backHome}</span>
          </button>
          <span className="zw-subview-title">{navLabels[activeSection]}</span>
        </div>
      )}

      {/* ── DEDICATED VIEW: TODAY GUIDE ─────────────────────── */}
      {activeSection === "today" && (
        <div className="zw-hero-secondary-panel zw-subview-panel">
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
              <LazyDailyAlmanacWidget embedded />
              <LazySkyEventsHomeSection />
            </Suspense>
          </section>
        </div>
      )}

      {/* ── DEDICATED VIEW: FORM & DESTINY BOOK ─────────────── */}
      {activeSection === "form" && (
        <>
          <HomeSectionBoundary
            id="analysis"
            locale={locale}
            onRecover={() => { clearSharedBirthRecord(); window.location.reload(); }}
          >
            <div className="zw-hero-secondary-panel zhaowu-home-stage zhaowu-home-stage--primary relative">
              <AnalysisForm />
            </div>
          </HomeSectionBoundary>

          {/* Result view visible when there's an active result */}
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
        </>
      )}

      {/* ── DEDICATED VIEW: QUIZ ────────────────────────────── */}
      {activeSection === "quiz" && (
        <div className="zw-hero-secondary-panel zw-subview-panel">
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
              <Suspense fallback={<div className="zw-home-inline-loading" role="status">{heroUi.scentLoading}</div>}>
                <LazyScentFiveElementTest result={current} />
              </Suspense>
            ) : null}
          </div>
        </div>
      )}

      {/* ── DEDICATED VIEW: NOTES ───────────────────────────── */}
      {activeSection === "notes" && (
        <div className="zw-hero-secondary-panel zw-subview-panel">
          <Suspense fallback={<div className="zw-home-inline-loading" role="status">{heroUi.notesLoading}</div>}>
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
