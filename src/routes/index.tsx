import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { AnalysisForm } from "@/components/analysis-form";
import { AuspiciousGallerySection } from "@/components/auspicious-gallery-section";
import { DailyAlmanacWidget } from "@/components/daily-almanac-widget";
import { FollowUpBox } from "@/components/follow-up-box";
import { HomeScreenInstallPrompt } from "@/components/home-screen-install-prompt";
import { LifeViewHomeSection } from "@/components/life-view-home-section";
import { ResultView } from "@/components/result-view";
import { useI18n } from "@/lib/i18n";
import { readSharedBirthRecord, SHARED_BIRTH_EVENT, type SharedBirthRecord } from "@/lib/shared-birth";
import { useAppStore } from "@/lib/store";
import "@/home-polish-v3.css";
import "@/home-portals.css";
import "@/home-portals-astrology.css";
import "@/home-layout-r46.css";
import "@/home-birth-hub-r60.css";

export const Route = createFileRoute("/")({ component: Home });

function portalAction(locale: "zh-Hant" | "zh-Hans" | "en", birth: SharedBirthRecord | null, needsTime: boolean) {
  if (!birth) return locale === "en" ? "Start reading" : locale === "zh-Hans" ? "开始分析" : "開始分析";
  if (needsTime && birth.timeUnknown) return locale === "en" ? "Birth time needed" : locale === "zh-Hans" ? "需补出生时间" : "需補出生時間";
  return locale === "en" ? "View" : locale === "zh-Hans" ? "查看" : "查看";
}

function Home() {
  const { locale } = useI18n();
  const current = useAppStore((s) => s.current);
  const [birth, setBirth] = useState<SharedBirthRecord | null>(null);

  useEffect(() => {
    const sync = () => setBirth(readSharedBirthRecord());
    sync();
    window.addEventListener(SHARED_BIRTH_EVENT, sync);
    window.addEventListener("storage", sync);
    return () => {
      window.removeEventListener(SHARED_BIRTH_EVENT, sync);
      window.removeEventListener("storage", sync);
    };
  }, []);

  const portalCopy = locale === "en"
    ? {
        label: "Six other readings from the same birth record",
        lead: "Zi Ping BaZi now has its own section above. These other systems reuse the same saved birth record and should not ask you to enter it again.",
        items: [
          { to: "/indian-astrology" as const, title: "Classical Indian Astrology", hint: "karmic pattern · D60 minute-sensitive cross-check", needsTime: true },
          { to: "/astrology" as const, title: "Western Astrology", hint: "Sun · Moon · Rising · aspects · life areas", needsTime: false },
          { to: "/ziwei" as const, title: "Zi Wei Dou Shu", hint: "character · relationships · work · money · decade focus", needsTime: true },
          { to: "/qizheng" as const, title: "Seven Luminaries", hint: "temperament · rhythm · pressure response · timing", needsTime: true },
          { to: "/yizhangjing" as const, title: "Past & Present", hint: "carried patterns · prior-life symbolism · Indian classical astrology cross-check", needsTime: false },
          { to: "/yizhangjing" as const, title: "Dharma One-Palm Classic", hint: "four prior lives · repeated habits that stay in this life", needsTime: false },
        ],
      }
    : locale === "zh-Hans"
      ? {
          label: "同一份生辰，其他六种看法",
          lead: "四柱八字已经独立成上方专属分区。其他需要出生资料的体系直接沿用同一份记录，不再重复填写。",
          items: [
            { to: "/indian-astrology" as const, title: "印度古法占星", hint: "看业力细分层；D60 对出生分钟非常敏感", needsTime: true },
            { to: "/astrology" as const, title: "西洋星座", hint: "看太阳、月亮、上升、相位与人生领域", needsTime: false },
            { to: "/ziwei" as const, title: "紫微斗数", hint: "看性格、关系、事业、财务与十年主轴", needsTime: true },
            { to: "/qizheng" as const, title: "七政四余", hint: "看性情、节奏、压力反应与天时变化", needsTime: true },
            { to: "/yizhangjing" as const, title: "前世今生", hint: "看前四世象意、反复习性与印度古法占星旁证", needsTime: false },
            { to: "/yizhangjing" as const, title: "达摩一掌经", hint: "看前四世来路，以及被重复加强、留到今生的习惯", needsTime: false },
          ],
        }
      : {
          label: "同一份生辰，其他六種看法",
          lead: "四柱八字已經獨立成上方專屬分區。其他需要出生資料的體系直接沿用同一份記錄，不再重複填寫。",
          items: [
            { to: "/indian-astrology" as const, title: "印度古法占星", hint: "看業力細分層；D60 對出生分鐘非常敏感", needsTime: true },
            { to: "/astrology" as const, title: "西洋星座", hint: "看太陽、月亮、上升、相位與人生領域", needsTime: false },
            { to: "/ziwei" as const, title: "紫微斗數", hint: "看性格、關係、事業、財務與十年主軸", needsTime: true },
            { to: "/qizheng" as const, title: "七政四餘", hint: "看性情、節奏、壓力反應與天時變化", needsTime: true },
            { to: "/yizhangjing" as const, title: "前世今生", hint: "看前四世象意、反覆習性與印度古法占星旁證", needsTime: false },
            { to: "/yizhangjing" as const, title: "達摩一掌經", hint: "看前四世來路，以及被重複加強、留到今生的習慣", needsTime: false },
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
            <Link
              key={item.title}
              to={item.to}
              role="button"
              tabIndex={0}
              className="zhaowu-home-portal"
              aria-label={`${item.title} · ${portalAction(locale, birth, item.needsTime)}`}
            >
              <span className="zhaowu-home-portal-copy">
                <strong>{item.title}</strong>
                <small className="zhaowu-home-portal-hint">（{item.hint}）</small>
              </span>
              <span className="zhaowu-home-portal-action">{portalAction(locale, birth, item.needsTime)}</span>
            </Link>
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
