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
import "@/home-layout-r46.css";
import "@/home-birth-hub-r60.css";

export const Route = createFileRoute("/")({ component: Home });

function Home() {
  const { locale } = useI18n();
  const current = useAppStore((s) => s.current);

  const portalCopy = locale === "en"
    ? {
        label: "Six other readings from the same birth record",
        lead: "Zi Ping BaZi now has its own section above. These other systems reuse the same saved birth record and should not ask you to enter it again.",
        items: [
          { title: "Classical Indian Astrology", hint: "karmic pattern · D60 minute-sensitive cross-check" },
          { title: "Western Astrology", hint: "Sun · Moon · Rising · aspects · life areas" },
          { title: "Zi Wei Dou Shu", hint: "character · relationships · work · money · decade focus" },
          { title: "Seven Luminaries", hint: "temperament · rhythm · pressure response · timing" },
          { title: "Past & Present", hint: "carried patterns · prior-life symbolism · Indian classical astrology cross-check" },
          { title: "Dharma One-Palm Classic", hint: "four prior lives · repeated habits that stay in this life" },
        ],
      }
    : locale === "zh-Hans"
      ? {
          label: "同一份生辰，其他六种看法",
          lead: "四柱八字已经独立成上方专属分区。其他需要出生资料的体系直接沿用同一份记录，不再重复填写。",
          items: [
            { title: "印度古法占星", hint: "看业力细分层；D60 对出生分钟非常敏感" },
            { title: "西洋星座", hint: "看太阳、月亮、上升、相位与人生领域" },
            { title: "紫微斗数", hint: "看性格、关系、事业、财务与十年主轴" },
            { title: "七政四余", hint: "看性情、节奏、压力反应与天时变化" },
            { title: "前世今生", hint: "看前四世象意、反复习性与印度古法占星旁证" },
            { title: "达摩一掌经", hint: "看前四世来路，以及被重复加强、留到今生的习惯" },
          ],
        }
      : {
          label: "同一份生辰，其他六種看法",
          lead: "四柱八字已經獨立成上方專屬分區。其他需要出生資料的體系直接沿用同一份記錄，不再重複填寫。",
          items: [
            { title: "印度古法占星", hint: "看業力細分層；D60 對出生分鐘非常敏感" },
            { title: "西洋星座", hint: "看太陽、月亮、上升、相位與人生領域" },
            { title: "紫微斗數", hint: "看性格、關係、事業、財務與十年主軸" },
            { title: "七政四餘", hint: "看性情、節奏、壓力反應與天時變化" },
            { title: "前世今生", hint: "看前四世象意、反覆習性與印度古法占星旁證" },
            { title: "達摩一掌經", hint: "看前四世來路，以及被重複加強、留到今生的習慣" },
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
    <main className="zhaowu-home-sheet-page zhaowu-home-layout">
      <div className="zhaowu-home-stage zhaowu-home-stage--primary relative">
        <AnalysisForm />
      </div>

      {current ? <div className="zhaowu-home-stage zhaowu-home-stage--result"><ResultView result={current} /></div> : null}
      {current ? <div className="zhaowu-home-stage zhaowu-home-stage--result"><FollowUpBox result={current} /></div> : null}

      <div className="zhaowu-home-stage zhaowu-home-stage--daily"><DailyAlmanacWidget /></div>

      <section className="zhaowu-home-stage zhaowu-home-stage--directory zhaowu-home-portals-block" aria-label={portalCopy.label}>
        <header className="zhaowu-home-portals-heading">
          <h2>{portalCopy.label}</h2>
          <span>{portalCopy.lead}</span>
        </header>
        <div className="zhaowu-home-portals">
          {portalCopy.items.map((item) => (
            <article key={item.title} className="zhaowu-home-portal" aria-label={item.title}>
              <span className="zhaowu-home-portal-copy">
                <strong>{item.title}</strong>
                <small className="zhaowu-home-portal-hint">（{item.hint}）</small>
              </span>
            </article>
          ))}
        </div>
      </section>

      <section className="zhaowu-home-stage zhaowu-home-stage--directory zhaowu-home-fun-section" aria-label={funCopy.title}>
        <header className="zhaowu-home-fun-heading">
          <h2>{funCopy.title}</h2>
          <p>{funCopy.lead}</p>
        </header>
        <div className="zhaowu-home-fun-grid">
          {funCopy.cards.map((card) => (
            <Link key={card.title} to={card.to} className="zhaowu-home-fun-card" aria-label={card.title}>
              <span className="min-w-0">
                <strong>{card.title}</strong>
                <small>（{card.hint}）</small>
              </span>
              <span className="zhaowu-home-fun-arrow" aria-hidden>›</span>
            </Link>
          ))}
        </div>
      </section>

      <div className="zhaowu-home-stage zhaowu-home-stage--gallery"><AuspiciousGallerySection /></div>
      <div className="zhaowu-home-stage zhaowu-home-stage--notes"><LifeViewHomeSection /></div>
      <div className="zhaowu-home-stage"><HomeScreenInstallPrompt /></div>
    </main>
  );
}
