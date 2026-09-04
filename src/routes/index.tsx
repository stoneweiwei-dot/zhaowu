import { createFileRoute, Link } from "@tanstack/react-router";
import { AnalysisForm } from "@/components/analysis-form";
import { AuspiciousGallerySection } from "@/components/auspicious-gallery-section";
import { DailyAlmanacWidget } from "@/components/daily-almanac-widget";
import { FollowUpBox } from "@/components/follow-up-box";
import { HomeScreenInstallPrompt } from "@/components/home-screen-install-prompt";
import { LifeViewHomeSection } from "@/components/life-view-home-section";
import { ResultView } from "@/components/result-view";
import { useI18n } from "@/lib/i18n";
import { useAppStore } from "@/lib/store";
import "@/home-polish-v3.css";
import "@/home-portals.css";
import "@/home-portals-astrology.css";

export const Route = createFileRoute("/")({ component: Home });

function Home() {
  const { t, locale } = useI18n();
  const current = useAppStore((s) => s.current);

  const portalCopy = locale === "en"
    ? {
        label: "Four ways to know yourself",
        lead: "Choose a system first. The details stay inside each section.",
        items: [
          { to: "/qizheng" as const, title: "Seven Luminaries", hint: "temperament · rhythm · pressure response · timing" },
          { to: "/astrology" as const, title: "Western Astrology", hint: "Sun · Moon · Rising · aspects · life areas" },
          { to: "/yizhangjing" as const, title: "Past & Present", hint: "carried patterns · prior-life symbolism · D60 cross-check" },
          { to: "/ziwei" as const, title: "Zi Wei Dou Shu", hint: "character · relationships · work · money · decade focus" },
        ],
      }
    : locale === "zh-Hans"
      ? {
          label: "四门分观",
          lead: "先选体系，具体怎么看放到里面再展开。",
          items: [
            { to: "/qizheng" as const, title: "七政四余", hint: "看性情、节奏、压力反应与天时变化" },
            { to: "/astrology" as const, title: "西洋星盘", hint: "看太阳、月亮、上升、相位与人生领域" },
            { to: "/yizhangjing" as const, title: "前世今生", hint: "看前四世象意、反复习性与 D60 旁证" },
            { to: "/ziwei" as const, title: "紫微斗数", hint: "看性格、关系、事业、财务与十年主轴" },
          ],
        }
      : {
          label: "四門分觀",
          lead: "先選體系，具體怎麼看放到裡面再展開。",
          items: [
            { to: "/qizheng" as const, title: "七政四餘", hint: "看性情、節奏、壓力反應與天時變化" },
            { to: "/astrology" as const, title: "西洋星盤", hint: "看太陽、月亮、上升、相位與人生領域" },
            { to: "/yizhangjing" as const, title: "前世今生", hint: "看前四世象意、反覆習性與 D60 旁證" },
            { to: "/ziwei" as const, title: "紫微斗數", hint: "看性格、關係、事業、財務與十年主軸" },
          ],
        };

  const funCopy = locale === "en"
    ? {
        title: "Playful self-tests",
        lead: "Short self-tests. No birth details needed.",
        cards: [
          { to: "/fun-tests" as const, title: "Inner Animal × Guardian Beast", hint: "current personality strategy and instinctive response" },
          { to: "/fun-tests" as const, title: "Five-Element Function Test", hint: "what you most need to strengthen right now" },
          { to: "/quiz/six-realms" as const, title: "Six Realms Habit Test", hint: "which everyday habit pattern is strongest now" },
        ],
      }
    : locale === "zh-Hans"
      ? {
          title: "趣味测验",
          lead: "轻量自评，不用出生资料。",
          cards: [
            { to: "/fun-tests" as const, title: "内在动物 × 命局瑞兽", hint: "看现在常用的人格策略与本能反应" },
            { to: "/fun-tests" as const, title: "五行功能测验", hint: "看现在最需要加强哪一种功能" },
            { to: "/quiz/six-realms" as const, title: "六道习气测验", hint: "看目前最明显的日常惯性" },
          ],
        }
      : {
          title: "趣味測驗",
          lead: "輕量自評，不用出生資料。",
          cards: [
            { to: "/fun-tests" as const, title: "內在動物 × 命局瑞獸", hint: "看現在常用的人格策略與本能反應" },
            { to: "/fun-tests" as const, title: "五行功能測驗", hint: "看現在最需要加強哪一種功能" },
            { to: "/quiz/six-realms" as const, title: "六道習氣測驗", hint: "看目前最明顯的日常慣性" },
          ],
        };

  return (
    <main className="zhaowu-home-sheet-page space-y-7 sm:space-y-10">
      <DailyAlmanacWidget />
      <section id="bazi" className="relative" aria-label={t("formTitle")}><AnalysisForm /></section>
      {current ? <ResultView result={current} /> : null}
      {current ? <FollowUpBox result={current} /> : null}

      <section className="zhaowu-home-portals-block" aria-label={portalCopy.label}>
        <header className="zhaowu-home-portals-heading">
          <h2>{portalCopy.label}</h2>
          <span>{portalCopy.lead}</span>
        </header>
        <div className="zhaowu-home-portals">
          {portalCopy.items.map((item) => (
            <Link key={item.to} to={item.to} className="zhaowu-home-portal" aria-label={item.title}>
              <span className="zhaowu-home-portal-copy">
                <strong>{item.title}</strong>
                <small className="zhaowu-home-portal-hint">（{item.hint}）</small>
              </span>
              <span className="zhaowu-home-portal-arrow" aria-hidden>›</span>
            </Link>
          ))}
        </div>
      </section>

      <section className="rounded-2xl border border-line/80 bg-[#fbf5e9] px-5 py-5" aria-label={funCopy.title}>
        <header className="flex items-end justify-between gap-3 border-b border-line/70 pb-3">
          <div><h2 className="font-display text-xl text-ink">{funCopy.title}</h2><p className="mt-1 text-xs text-ink-mute">{funCopy.lead}</p></div>
        </header>
        <div className="mt-2 divide-y divide-line/60">
          {funCopy.cards.map((card) => (
            <Link key={card.title} to={card.to} className="flex min-h-16 items-center justify-between gap-4 py-3" aria-label={card.title}>
              <span className="min-w-0"><strong className="block font-display text-base text-ink">{card.title}</strong><small className="mt-1 block text-xs leading-5 text-ink-mute">（{card.hint}）</small></span>
              <span className="shrink-0 text-cinnabar" aria-hidden>›</span>
            </Link>
          ))}
        </div>
      </section>

      <AuspiciousGallerySection />
      <LifeViewHomeSection />
      <HomeScreenInstallPrompt />
    </main>
  );
}
