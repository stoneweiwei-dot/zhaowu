import { createFileRoute } from "@tanstack/react-router";
import { useState, type ReactNode } from "react";
import { AnalysisForm } from "@/components/analysis-form";
import { DailyAlmanacWidget } from "@/components/daily-almanac-widget";
import { FollowUpBox } from "@/components/follow-up-box";
import { HomeScreenInstallPrompt } from "@/components/home-screen-install-prompt";
import { HomeSectionBoundary } from "@/components/home-section-boundary";
import { LifeViewHomeSection } from "@/components/life-view-home-section";
import { ResultView } from "@/components/result-view";
import { ScentFiveElementTest } from "@/components/scent-five-element-test";
import { SkyEventsHomeSection } from "@/components/sky-events-home-section";
import { SongComicToday } from "@/components/song-comic-layer";
import { useI18n } from "@/lib/i18n";
import { clearSharedBirthRecord } from "@/lib/shared-birth";
import { useAppStore } from "@/lib/store";
import "@/home-polish-v3.css";
import "@/home-portals.css";
import "@/home-portals-astrology.css";
import "@/home-layout-r46.css";
import "@/home-birth-hub-r60.css";

export const Route = createFileRoute("/")({ component: Home });

function Home() {
  const { locale } = useI18n();
  const current = useAppStore((s) => s.current);
  const [openPanel, setOpenPanel] = useState<"today" | "quiz" | "notes" | null>(null);
  const [scentOpen, setScentOpen] = useState(false);

  const funCopy = locale === "en"
    ? {
        title: "ZHAOWU · SELF DISCOVERY",
        homeKicker: "ZHAOWU · PERSONAL DESTINY BOOK",
        homeTitle: "One birth record. One ZHAOWU Destiny Book.",

        explore: "Explore",
        todayTitle: "Today Guide",
        todayHint: "almanac, dress, spirit slip and recent sky events",
        quizHint: "optional reflective tests, kept separate from the formal chart",
        notesTitle: "Notes on life",
        notesHint: "the latest essay and the full editorial archive",
        scentTitle: "Five-Element Scent Map",
        scentHint: "sensory preference compared with five-element cultural imagery",
        cards: [
          { href: "/quiz/divine-affinity", title: "Divine Affinity Scan", hint: "16 questions across Soul Pattern, symbolic lineage and Celestial Mandate" },
            { href: "/quiz/cultivation-destiny", title: "Cultivation Destiny Dossier", hint: "turn your saved birth chart into a spirit root, sect, paths and a personal 9:16 dossier image" },
          { href: "/fun-tests/earth-online", title: "Earth Online · Classics Guide", hint: "8 questions to match your current stuck point with a Chinese classic" },
          { href: "/fun-tests?test=animal", title: "Inner Animal × Guardian Beast", hint: "current personality strategy and instinctive response" },
          { href: "/fun-tests?test=element", title: "Five-Element Function Test", hint: "which function you currently want to strengthen" },
          { href: "/quiz/six-realms", title: "Six Realms Habit Test", hint: "which everyday habit pattern is strongest now" },
        ],
      }
    : locale === "zh-Hans"
      ? {
          title: "昭梧 · 心境小测",
          homeKicker: "昭梧 · 个人命书",
          homeTitle: "一份生辰，读成一本昭梧命书",

          explore: "延伸内容",
          todayTitle: "今日指引",
          todayHint: "黄历、穿衣、灵签与近日天象",
          quizHint: "可选的自我观察，不混入正式命盘",
          notesTitle: "观世录",
          notesHint: "最新文章与完整内容档案",
          scentTitle: "五行香气谱",
          scentHint: "看嗅觉偏好与五行文化象意，不当成身体缺什么",
          cards: [
            { href: "/quiz/divine-affinity", title: "仙佛渊源本缘测试", hint: "16 题从魂格、象征脉象、能量体、前世象征、命格深层与天命六层交叉判读" },
            { href: "/quiz/cultivation-destiny", title: "修仙命格灵测", hint: "用已保存生辰推演灵根 宗门 道途并生成个人九比十六命测图" },
            { href: "/fun-tests/earth-online", title: "地球 Online · 古籍攻略", hint: "8 道题看你现在卡在哪一关，再推荐最适合此刻读的古籍" },
            { href: "/fun-tests?test=animal", title: "内在动物 × 命局瑞兽", hint: "看现在常用的人格策略与本能反应" },
            { href: "/fun-tests?test=element", title: "五行功能测验", hint: "看现在主观上最想加强哪一种功能" },
            { href: "/quiz/six-realms", title: "六道习气测验", hint: "看目前最明显的日常惯性" },
          ],
        }
      : {
          title: "昭梧 · 心境小測",
          homeKicker: "昭梧 · 個人命書",
          homeTitle: "一份生辰，讀成一本昭梧命書",

          explore: "延伸內容",
          todayTitle: "今日指引",
          todayHint: "黃曆、穿衣、靈籤與近日天象",
          quizHint: "可選的自我觀察，不混入正式命盤",
          notesTitle: "觀世錄",
          notesHint: "最新文章與完整內容檔案",
          scentTitle: "五行香氣譜",
          scentHint: "看嗅覺偏好與五行文化象意，不當成身體缺什麼",
          cards: [
            { href: "/quiz/divine-affinity", title: "仙佛淵源本緣測試", hint: "16 題從魂格、象徵脈象、能量體、前世象徵、命格深層與天命六層交叉判讀" },
            { href: "/quiz/cultivation-destiny", title: "修仙命格靈測", hint: "用已保存生辰推演靈根 宗門 道途並生成個人九比十六命測圖" },
            { href: "/fun-tests/earth-online", title: "地球 Online · 古籍攻略", hint: "8 道題看你現在卡在哪一關，再推薦最適合此刻讀的古籍" },
            { href: "/fun-tests?test=animal", title: "內在動物 × 命局瑞獸", hint: "看現在常用的人格策略與本能反應" },
            { href: "/fun-tests?test=element", title: "五行功能測驗", hint: "看現在主觀上最想加強哪一種功能" },
            { href: "/quiz/six-realms", title: "六道習氣測驗", hint: "看目前最明顯的日常慣性" },
          ],
        };

  return (
    <main className="zhaowu-home-sheet-page zhaowu-home-layout">
      <header className="zhaowu-home-lead">
        <p>{funCopy.homeKicker}</p>
        <h1>{funCopy.homeTitle}</h1>
      </header>

      <HomeSectionBoundary id="comic"><SongComicToday locale={locale} /></HomeSectionBoundary>

      <section className="zhaowu-home-stage zhaowu-home-stage--daily-priority" aria-label={funCopy.todayTitle}>
        <HomeDisclosure id="home-today" title={funCopy.todayTitle} hint={funCopy.todayHint} open={openPanel === "today"} onToggle={() => setOpenPanel((value) => value === "today" ? null : "today")}>
          <DailyAlmanacWidget embedded />
          <SkyEventsHomeSection />
        </HomeDisclosure>
      </section>

      <HomeSectionBoundary id="analysis" onRecover={() => { clearSharedBirthRecord(); window.location.reload(); }}>
        <div className="zhaowu-home-stage zhaowu-home-stage--primary relative">
          <AnalysisForm />
        </div>
      </HomeSectionBoundary>

      {current ? <div className="zhaowu-home-stage zhaowu-home-stage--result"><ResultView result={current} /></div> : null}
      {current ? <div className="zhaowu-home-stage zhaowu-home-stage--result"><FollowUpBox result={current} /></div> : null}

      <section className="zhaowu-home-explore" aria-label={funCopy.explore}>
        <p className="zhaowu-home-explore-label">{funCopy.explore}</p>

        <HomeDisclosure id="home-fun-tests" title={funCopy.title} hint={funCopy.quizHint} open={openPanel === "quiz"} onToggle={() => setOpenPanel((value) => value === "quiz" ? null : "quiz")}>
          <div data-home-fun-tests>
            <div className="zhaowu-home-fun-grid">
              {funCopy.cards.map((card) => (
                <a key={card.title} href={card.href} className="zhaowu-home-fun-card" aria-label={card.title}>
                  <span className="min-w-0"><strong>{card.title}</strong><small>{card.hint}</small></span>
                  <span className="zhaowu-home-fun-arrow" aria-hidden>›</span>
                </a>
              ))}
              <button type="button" className="zhaowu-home-fun-card text-left" aria-expanded={scentOpen} aria-controls="home-scent-test" onClick={() => setScentOpen((value) => !value)}>
                <span className="min-w-0"><strong>{funCopy.scentTitle}</strong><small>{funCopy.scentHint}</small></span>
                <span className="zhaowu-home-fun-arrow" aria-hidden>{scentOpen ? "⌃" : "›"}</span>
              </button>
            </div>
            <div id="home-scent-test" data-scent-panel hidden={!scentOpen}>
              {scentOpen ? <ScentFiveElementTest result={current} /> : null}
            </div>
          </div>
        </HomeDisclosure>

        <HomeDisclosure id="home-notes" title={funCopy.notesTitle} hint={funCopy.notesHint} open={openPanel === "notes"} onToggle={() => setOpenPanel((value) => value === "notes" ? null : "notes")}>
          <LifeViewHomeSection />
        </HomeDisclosure>
      </section>

      <HomeSectionBoundary id="install"><div className="zhaowu-home-stage"><HomeScreenInstallPrompt /></div></HomeSectionBoundary>
    </main>
  );
}

function HomeDisclosure({ id, title, hint, open, onToggle, children }: { id: string; title: string; hint: string; open: boolean; onToggle: () => void; children: ReactNode }) {
  return (
    <section className={`zhaowu-home-disclosure${open ? " is-open" : ""}`}>
      <button type="button" className="zhaowu-home-disclosure-trigger" aria-expanded={open} aria-controls={`${id}-panel`} onClick={onToggle}>
        <span><strong>{title}</strong><small>{hint}</small></span>
        <i aria-hidden="true" />
      </button>
      {open ? <div id={`${id}-panel`} className="zhaowu-home-disclosure-panel">{children}</div> : null}
    </section>
  );
}
