import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { AnalysisForm } from "@/components/analysis-form";
import { AuspiciousGallerySection } from "@/components/auspicious-gallery-section";
import { DailyAlmanacWidget } from "@/components/daily-almanac-widget";
import { FollowUpBox } from "@/components/follow-up-box";
import { HomeScreenInstallPrompt } from "@/components/home-screen-install-prompt";
import { LifeViewHomeSection } from "@/components/life-view-home-section";
import { ResultView } from "@/components/result-view";
import { ScentFiveElementTest } from "@/components/scent-five-element-test";
import { SkyEventsHomeSection } from "@/components/sky-events-home-section";
import { useI18n } from "@/lib/i18n";
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
  const [quizOpen, setQuizOpen] = useState(false);
  const [scentOpen, setScentOpen] = useState(false);

  const funCopy = locale === "en"
    ? {
        title: "ZHAOWU · SELF DISCOVERY",
        scentTitle: "Five-Element Scent Map",
        scentHint: "sensory preference compared with five-element cultural imagery",
        cards: [
          { href: "/quiz/divine-affinity", title: "Divine Affinity Scan", hint: "16 questions across Soul Pattern, symbolic lineage and Celestial Mandate" },
          { href: "/fun-tests/earth-online", title: "Earth Online · Classics Guide", hint: "8 questions to match your current stuck point with a Chinese classic" },
          { href: "/fun-tests?test=animal", title: "Inner Animal × Guardian Beast", hint: "current personality strategy and instinctive response" },
          { href: "/fun-tests?test=element", title: "Five-Element Function Test", hint: "which function you currently want to strengthen" },
          { href: "/quiz/six-realms", title: "Six Realms Habit Test", hint: "which everyday habit pattern is strongest now" },
        ],
      }
    : locale === "zh-Hans"
      ? {
          title: "昭梧 · 心境小测",
          scentTitle: "五行香气谱",
          scentHint: "看嗅觉偏好与五行文化象意，不当成身体缺什么",
          cards: [
            { href: "/quiz/divine-affinity", title: "仙佛渊源本缘测试", hint: "16 题从魂格、象征脉象、能量体、前世象征、命格深层与天命六层交叉判读" },
            { href: "/fun-tests/earth-online", title: "地球 Online · 古籍攻略", hint: "8 道题看你现在卡在哪一关，再推荐最适合此刻读的古籍" },
            { href: "/fun-tests?test=animal", title: "内在动物 × 命局瑞兽", hint: "看现在常用的人格策略与本能反应" },
            { href: "/fun-tests?test=element", title: "五行功能测验", hint: "看现在主观上最想加强哪一种功能" },
            { href: "/quiz/six-realms", title: "六道习气测验", hint: "看目前最明显的日常惯性" },
          ],
        }
      : {
          title: "昭梧 · 心境小測",
          scentTitle: "五行香氣譜",
          scentHint: "看嗅覺偏好與五行文化象意，不當成身體缺什麼",
          cards: [
            { href: "/quiz/divine-affinity", title: "仙佛淵源本緣測試", hint: "16 題從魂格、象徵脈象、能量體、前世象徵、命格深層與天命六層交叉判讀" },
            { href: "/fun-tests/earth-online", title: "地球 Online · 古籍攻略", hint: "8 道題看你現在卡在哪一關，再推薦最適合此刻讀的古籍" },
            { href: "/fun-tests?test=animal", title: "內在動物 × 命局瑞獸", hint: "看現在常用的人格策略與本能反應" },
            { href: "/fun-tests?test=element", title: "五行功能測驗", hint: "看現在主觀上最想加強哪一種功能" },
            { href: "/quiz/six-realms", title: "六道習氣測驗", hint: "看目前最明顯的日常慣性" },
          ],
        };

  return (
    <main className="zhaowu-home-sheet-page zhaowu-home-layout">
      <div className="zhaowu-home-stage zhaowu-home-stage--daily"><DailyAlmanacWidget /></div>
      <div className="zhaowu-home-stage"><SkyEventsHomeSection /></div>

      <div className="zhaowu-home-stage zhaowu-home-stage--primary relative">
        <AnalysisForm />
      </div>

      {current ? <div className="zhaowu-home-stage zhaowu-home-stage--result"><ResultView result={current} /></div> : null}
      {current ? <div className="zhaowu-home-stage zhaowu-home-stage--result"><FollowUpBox result={current} /></div> : null}

      <section className="zhaowu-home-stage zhaowu-home-stage--directory zhaowu-home-fun-section" aria-label={funCopy.title}>
        <button
          type="button"
          className="zhaowu-home-fun-gateway"
          aria-expanded={quizOpen}
          aria-controls="home-fun-tests"
          onClick={() => setQuizOpen((value) => !value)}
        >
          <span>{funCopy.title}</span>
          <span aria-hidden>{quizOpen ? "−" : "+"}</span>
        </button>
        {quizOpen ? (
          <div id="home-fun-tests" data-home-fun-tests>
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
        ) : null}
      </section>

      <div className="zhaowu-home-stage zhaowu-home-stage--gallery"><AuspiciousGallerySection /></div>
      <div className="zhaowu-home-stage zhaowu-home-stage--notes"><LifeViewHomeSection /></div>
      <div className="zhaowu-home-stage"><HomeScreenInstallPrompt /></div>
    </main>
  );
}
