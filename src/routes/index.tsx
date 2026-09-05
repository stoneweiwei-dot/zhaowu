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
import "@/home-layout-r50.css";

export const Route = createFileRoute("/")({ component: Home });

type MethodCard = { title: string; focus: string; note?: string };

function Home() {
  const { t, locale } = useI18n();
  const current = useAppStore((s) => s.current);

  const methodCopy: { label: string; lead: string; items: MethodCard[] } = locale === "en"
    ? {
        label: "Seven lenses, one birth profile",
        lead: "Enter your birth details once above. Each tradition looks at a different layer; Zi Ping BaZi remains Zhaowu’s primary judgement system.",
        items: [
          { title: "Zi Ping BaZi", focus: "life structure, timing, choices and the practical rhythm behind the question" },
          { title: "Classical Indian Astrology", focus: "sidereal chart themes, lunar mansion emphasis and longer timing cycles" },
          { title: "Western Astrology", focus: "Sun, Moon, Rising, aspects and psychological life areas" },
          { title: "Zi Wei Dou Shu", focus: "character, relationships, work, money and decade-level life themes" },
          { title: "Seven Luminaries & Four Residuals", focus: "temperament, emotional rhythm, pressure response and celestial timing" },
          { title: "Past & Present", focus: "repeating symbolic patterns, carried habits and karmic themes", note: "Includes an optional D60 karmic cross-check. D60 is extremely time-sensitive: a difference of only a few minutes can change the result, so it is used only when the birth time is known accurately to the minute." },
          { title: "Dharma One-Palm Classic", focus: "four prior-life symbolic patterns, Six-Realms habits and what may carry into present behaviour" },
        ],
      }
    : locale === "zh-Hans"
      ? {
          label: "七种看法，一份出生资料",
          lead: "出生时间与地点只填一次。不同体系各看不同层面；昭梧仍以子平八字作为主判断。",
          items: [
            { title: "四柱八字", focus: "看人生结构、时间节奏、现实选择，以及问题背后的主线" },
            { title: "印度古法占星", focus: "看恒星黄道、本命重点、月宿倾向与较长周期的时间主题" },
            { title: "西洋星座", focus: "看太阳、月亮、上升、相位与心理层面的人生领域" },
            { title: "紫微斗数", focus: "看性格、关系、事业、财务与十年阶段的生活主题" },
            { title: "七政四余", focus: "看性情、情绪节奏、压力反应与天时变化" },
            { title: "前世今生", focus: "看反复出现的象征模式、旧有惯性与因果业力主题", note: "额外加入印度 D60 业力旁证。D60 对出生时间极敏感，相差几分钟就可能改变结果；只有明确知道出生时间并能精确到分钟时才启用。" },
            { title: "达摩一掌经", focus: "看前四世六道象意、重复习性，以及可能延续到今生的行为惯性" },
          ],
        }
      : {
          label: "七種看法，一份出生資料",
          lead: "出生時間與地點只填一次。不同體系各看不同層面；昭梧仍以子平八字作為主判斷。",
          items: [
            { title: "四柱八字", focus: "看人生結構、時間節奏、現實選擇，以及問題背後的主線" },
            { title: "印度古法占星", focus: "看恆星黃道、本命重點、月宿傾向與較長週期的時間主題" },
            { title: "西洋星座", focus: "看太陽、月亮、上升、相位與心理層面的人生領域" },
            { title: "紫微斗數", focus: "看性格、關係、事業、財務與十年階段的生活主題" },
            { title: "七政四餘", focus: "看性情、情緒節奏、壓力反應與天時變化" },
            { title: "前世今生", focus: "看反覆出現的象徵模式、舊有慣性與因果業力主題", note: "額外加入印度 D60 業力旁證。D60 對出生時間極敏感，相差幾分鐘就可能改變結果；只有明確知道出生時間並能精確到分鐘時才啟用。" },
            { title: "達摩一掌經", focus: "看前四世六道象意、重複習性，以及可能延續到今生的行為慣性" },
          ],
        };

  const funCopy = locale === "en"
    ? { title: "Playful self-tests", lead: "Short self-tests. No birth details needed.", cards: [
        { to: "/fun-tests" as const, title: "Inner Animal × Guardian Beast", hint: "current personality strategy and instinctive response" },
        { to: "/fun-tests" as const, title: "Five-Element Function Test", hint: "what you most need to strengthen right now" },
        { to: "/quiz/six-realms" as const, title: "Six Realms Habit Test", hint: "which everyday habit pattern is strongest now" },
      ] }
    : locale === "zh-Hans"
      ? { title: "趣味测验", lead: "轻量自评，不用出生资料。", cards: [
          { to: "/fun-tests" as const, title: "内在动物 × 命局瑞兽", hint: "看现在常用的人格策略与本能反应" },
          { to: "/fun-tests" as const, title: "五行功能测验", hint: "看现在最需要加强哪一种功能" },
          { to: "/quiz/six-realms" as const, title: "六道习气测验", hint: "看目前最明显的日常惯性" },
        ] }
      : { title: "趣味測驗", lead: "輕量自評，不用出生資料。", cards: [
          { to: "/fun-tests" as const, title: "內在動物 × 命局瑞獸", hint: "看現在常用的人格策略與本能反應" },
          { to: "/fun-tests" as const, title: "五行功能測驗", hint: "看現在最需要加強哪一種功能" },
          { to: "/quiz/six-realms" as const, title: "六道習氣測驗", hint: "看目前最明顯的日常慣性" },
        ] };

  return (
    <main className="zhaowu-home-sheet-page zhaowu-home-layout zhaowu-home-r50">
      <section id="bazi" className="zhaowu-home-stage zhaowu-home-stage--primary relative" aria-label={t("formTitle")}>
        <AnalysisForm />
      </section>

      {current ? <div className="zhaowu-home-stage zhaowu-home-stage--result"><ResultView result={current} /></div> : null}
      {current ? <div className="zhaowu-home-stage zhaowu-home-stage--result"><FollowUpBox result={current} /></div> : null}

      <div className="zhaowu-home-stage zhaowu-home-stage--daily"><DailyAlmanacWidget /></div>

      <section className="zhaowu-home-stage zhaowu-home-stage--directory zhaowu-home-portals-block zhaowu-method-directory" aria-label={methodCopy.label}>
        <header className="zhaowu-home-portals-heading">
          <h2>{methodCopy.label}</h2>
          <span>{methodCopy.lead}</span>
        </header>
        <div className="zhaowu-method-grid">
          {methodCopy.items.map((item, index) => (
            <article key={item.title} className="zhaowu-method-card">
              <span className="zhaowu-method-index" aria-hidden>{String(index + 1).padStart(2, "0")}</span>
              <div>
                <h3>{item.title}</h3>
                <p>{item.focus}</p>
                {item.note ? <small>{item.note}</small> : null}
              </div>
            </article>
          ))}
        </div>
      </section>

      <section className="zhaowu-home-stage zhaowu-home-stage--directory zhaowu-home-fun-section" aria-label={funCopy.title}>
        <header className="zhaowu-home-fun-heading"><h2>{funCopy.title}</h2><p>{funCopy.lead}</p></header>
        <div className="zhaowu-home-fun-grid">
          {funCopy.cards.map((card) => (
            <Link key={card.title} to={card.to} className="zhaowu-home-fun-card" aria-label={card.title}>
              <span className="min-w-0"><strong>{card.title}</strong><small>（{card.hint}）</small></span><span className="zhaowu-home-fun-arrow" aria-hidden>›</span>
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
