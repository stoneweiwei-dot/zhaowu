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
        lead: "Zi Ping BaZi has its own section above. Tap any method below: it reuses the same saved birth record and generates its own available result without making you type it again.",
        items: [
          { href: "/astrology?mode=vedic", title: "Classical Indian Astrology", hint: "karmic pattern · D60 minute-sensitive accuracy check" },
          { href: "/astrology", title: "Western Astrology", hint: "Sun · Moon · Rising · aspects · life areas" },
          { href: "/ziwei", title: "Zi Wei Dou Shu", hint: "Life/Body palaces · bureau · major stars · natal transformations" },
          { href: "/qizheng", title: "Seven Luminaries", hint: "temperament · rhythm · pressure response · timing" },
          { href: "/yizhangjing?mode=integrated", title: "Past & Present", hint: "four-palace symbolism · repeated habits · Seven-Luminaries cross-check" },
          { href: "/yizhangjing", title: "Dharma One-Palm Classic", hint: "four prior-life palaces · repeated habits carried into this life" },
        ],
      }
    : locale === "zh-Hans"
      ? {
          label: "同一份生辰，其他六种看法",
          lead: "四柱八字已经独立成上方专属分区。下面六种看法都可以直接点开，自动沿用同一份出生记录生成各自可验证的内容，不再重复填写。",
          items: [
            { href: "/astrology?mode=vedic", title: "印度古法占星", hint: "业力细分层；D60 对出生分钟非常敏感，先做精度检查" },
            { href: "/astrology", title: "西洋星座", hint: "太阳、月亮、上升、相位与人生领域" },
            { href: "/ziwei", title: "紫微斗数", hint: "命身宫、五行局、命宫主星与生年四化" },
            { href: "/qizheng", title: "七政四余", hint: "性情、节奏、压力反应、关系与天时变化" },
            { href: "/yizhangjing?mode=integrated", title: "前世今生", hint: "四宫象意、反复习性与七政旁证" },
            { href: "/yizhangjing", title: "达摩一掌经", hint: "前四世来路与被重复加强、留到今生的习惯" },
          ],
        }
      : {
          label: "同一份生辰，其他六種看法",
          lead: "四柱八字已經獨立成上方專屬分區。下面六種看法都可以直接點開，自動沿用同一份出生記錄生成各自可驗證的內容，不再重複填寫。",
          items: [
            { href: "/astrology?mode=vedic", title: "印度古法占星", hint: "業力細分層；D60 對出生分鐘非常敏感，先做精度檢查" },
            { href: "/astrology", title: "西洋星座", hint: "太陽、月亮、上升、相位與人生領域" },
            { href: "/ziwei", title: "紫微斗數", hint: "命身宮、五行局、命宮主星與生年四化" },
            { href: "/qizheng", title: "七政四餘", hint: "性情、節奏、壓力反應、關係與天時變化" },
            { href: "/yizhangjing?mode=integrated", title: "前世今生", hint: "四宮象意、反覆習性與七政旁證" },
            { href: "/yizhangjing", title: "達摩一掌經", hint: "前四世來路與被重複加強、留到今生的習慣" },
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
            <a key={item.title} href={item.href} className="zhaowu-home-portal" aria-label={item.title}>
              <span className="zhaowu-home-portal-copy">
                <strong>{item.title}</strong>
                <small className="zhaowu-home-portal-hint">（{item.hint}）</small>
              </span>
              <span className="zhaowu-home-portal-arrow" aria-hidden>›</span>
            </a>
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
