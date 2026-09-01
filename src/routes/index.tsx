import { createFileRoute, Link } from "@tanstack/react-router";
import { AnalysisForm } from "@/components/analysis-form";
import { AuspiciousGallerySection } from "@/components/auspicious-gallery-section";
import { FollowUpBox } from "@/components/follow-up-box";
import { HomeScreenInstallPrompt } from "@/components/home-screen-install-prompt";
import { LifeViewSection } from "@/components/life-view-section";
import { ResultView } from "@/components/result-view";
import { useI18n } from "@/lib/i18n";
import { useAppStore } from "@/lib/store";
import "@/home-polish-v3.css";
import "@/home-portals.css";

export const Route = createFileRoute("/")({ component: Home });

function Home() {
  const { t, locale } = useI18n();
  const current = useAppStore((s) => s.current);
  const portalCopy =
    locale === "en"
      ? {
          kicker: "THREE LENSES",
          label: "Three ways to know yourself",
          lead: "Each method focuses on a different part of you.",
          learn: "You’ll learn",
          best: "Best for",
          action: "Open",
          items: [
            { to: "/qizheng" as const, eyebrow: "CLASSICAL SKY", title: "Seven Luminaries", know: "Your natural rhythm, response style and instinctive pattern under pressure.", bestAt: "Temperament, action style, pressure response and shifts in timing.", mark: "曜", tone: "sky" },
            { to: "/yizhangjing" as const, eyebrow: "PAST-LIFE PATTERNS", title: "Past & Present", know: "Which personal traits and habits tend to repeat or feel unusually familiar.", bestAt: "Four prior-life realms in Dharma Palm, carried habits and repeated themes.", mark: "世", tone: "fate" },
            { to: "/ziwei" as const, eyebrow: "PALACE PATTERNS", title: "Zi Wei Dou Shu", know: "Your core character and how you tend to operate in relationships, work and money.", bestAt: "Life-area structure and the main focus of your current decade.", mark: "斗", tone: "ziwei" },
          ],
        }
      : locale === "zh-Hans"
        ? {
            kicker: "三门",
            label: "三门分观",
            lead: "每一门看的是你不同的一部分。",
            learn: "你会知道",
            best: "最擅长看",
            action: "进入分门",
            items: [
              { to: "/qizheng" as const, eyebrow: "古法天象", title: "七政四余", know: "你的天生节奏、反应方式，以及压力下最自然的应对。", bestAt: "性情节奏、行动模式、压力反应，以及天时变化。", mark: "曜", tone: "sky" },
              { to: "/yizhangjing" as const, eyebrow: "前尘习气", title: "前世今生", know: "哪些个人特征与习惯容易反复出现，或让你有很强的熟悉感。", bestAt: "达摩一掌经的前四世六道、所留习性与重复主题。", mark: "世", tone: "fate" },
              { to: "/ziwei" as const, eyebrow: "宫位格局", title: "紫微斗数", know: "你的性格底色，以及关系、事业、财务里常见的运作方式。", bestAt: "不同人生领域的结构，以及当前十年的重点课题。", mark: "斗", tone: "ziwei" },
            ],
          }
        : {
            kicker: "三門",
            label: "三門分觀",
            lead: "每一門看的是你不同的一部分。",
            learn: "你會知道",
            best: "最擅長看",
            action: "進入分門",
            items: [
              { to: "/qizheng" as const, eyebrow: "古法天象", title: "七政四餘", know: "你的天生節奏、反應方式，以及壓力下最自然的應對。", bestAt: "性情節奏、行動模式、壓力反應，以及天時變化。", mark: "曜", tone: "sky" },
              { to: "/yizhangjing" as const, eyebrow: "前塵習氣", title: "前世今生", know: "哪些個人特徵與習慣容易反覆出現，或讓你有很強的熟悉感。", bestAt: "達摩一掌經的前四世六道、所留習性與重複主題。", mark: "世", tone: "fate" },
              { to: "/ziwei" as const, eyebrow: "宮位格局", title: "紫微斗數", know: "你的性格底色，以及關係、事業、財務裡常見的運作方式。", bestAt: "不同人生領域的結構，以及當前十年的重點課題。", mark: "斗", tone: "ziwei" },
            ],
          };

  const funCopy =
    locale === "en"
      ? {
          kicker: "FUN TESTS",
          title: "Playful self-tests",
          lead: "No birth details needed. These tests look at how you are behaving and coping right now, without pretending a self-test is a birth chart.",
          learn: "You’ll learn",
          best: "Best for",
          action: "Take the test",
          cards: [
            { to: "/fun-tests" as const, series: "SERIES 01", title: "Inner Animal × Guardian Beast", know: "The personality strategy you use most now and your instinctive response under pressure.", bestAt: "Learned behaviour and decision style; if a BaZi chart exists, it can also be compared with your guardian-beast pattern." },
            { to: "/fun-tests" as const, series: "SERIES 02 · FIVE-ELEMENT FUNCTION TEST", title: "Which function do you need to strengthen right now?", know: "Whether you currently need more growth, activation, follow-through, boundaries or recovery.", bestAt: "Turning a recent bottleneck into one practical function you can train now." },
            { to: "/quiz/six-realms" as const, series: "SERIES 03 · SIX REALMS", title: "Six Realms Habit Test", know: "Which habit pattern is showing up most strongly in your everyday choices right now.", bestAt: "Self-reflection on competition, scarcity, passivity, anger, balance and ease — not a past-life claim." },
          ],
        }
      : locale === "zh-Hans"
        ? {
            kicker: "趣味测验",
            title: "昭梧趣味测验系列",
            lead: "不用出生资料，从你现在的选择、行为与状态认识自己；自评归自评，不把趣味测验冒充命盘。",
            learn: "你会知道",
            best: "最擅长看",
            action: "开始测验",
            cards: [
              { to: "/fun-tests" as const, series: "SERIES 01", title: "内在动物 × 命局瑞兽", know: "你现在最常使用的人格策略，以及压力下最自然的反应。", bestAt: "后天行为偏好与决策方式；已有命盘时，可再和命局瑞兽交叉看。" },
              { to: "/fun-tests" as const, series: "SERIES 02 · 五行功能测验", title: "你现在最需要练哪一行？", know: "你现在更需要生长、启动、落地、收敛，还是恢复。", bestAt: "把最近 1–3 个月的卡点，转成一个可以立即练习的功能方向。" },
              { to: "/quiz/six-realms" as const, series: "SERIES 03 · 六道习气", title: "六道习气测验｜你从哪道来，看身上即知", know: "你目前最常出现的是哪一种生活习气方向。", bestAt: "观察竞争、匮乏、懈怠、怒气、平衡与安逸等日常惯性；不当作前世结论。" },
            ],
          }
        : {
            kicker: "趣味測驗",
            title: "昭梧趣味測驗系列",
            lead: "不用出生資料，從你現在的選擇、行為與狀態認識自己；自評歸自評，不把趣味測驗冒充命盤。",
            learn: "你會知道",
            best: "最擅長看",
            action: "開始測驗",
            cards: [
              { to: "/fun-tests" as const, series: "SERIES 01", title: "內在動物 × 命局瑞獸", know: "你現在最常使用的人格策略，以及壓力下最自然的反應。", bestAt: "後天行為偏好與決策方式；已有命盤時，可再和命局瑞獸交叉看。" },
              { to: "/fun-tests" as const, series: "SERIES 02 · 五行功能測驗", title: "你現在最需要練哪一行？", know: "你現在更需要生長、啟動、落地、收斂，還是恢復。", bestAt: "把最近 1–3 個月的卡點，轉成一個可以立即練習的功能方向。" },
              { to: "/quiz/six-realms" as const, series: "SERIES 03 · 六道習氣", title: "六道習氣測驗｜你從哪道來，看身上即知", know: "你目前最常出現的是哪一種生活習氣方向。", bestAt: "觀察競爭、匱乏、懈怠、怒氣、平衡與安逸等日常慣性；不當作前世結論。" },
            ],
          };

  return (
    <main className="zhaowu-home-sheet-page space-y-7 sm:space-y-12">
      <HomeScreenInstallPrompt />
      <section className="zhaowu-home-intro" aria-label={t("heroKicker")}>
        <p className="zhaowu-home-intro-kicker">ZHAOWU · {locale === "en" ? "LIFE QUIZ" : locale === "zh-Hans" ? "人生测验" : "人生測驗"}</p>
        <h1 className="zhaowu-home-quiz-title">{locale === "en" ? "Hand in the paper. Read the answer." : "交卷，先看答案"}</h1>
        <p className="zhaowu-home-intro-quiz">{locale === "en" ? "Write the question you actually want answered. The direct answer comes first; the full report is generated after." : locale === "zh-Hans" ? "把真正想问的事直接写下。交卷后立刻给结论，再生成完整报告。" : "把真正想問的事直接寫下。交卷後立刻給結論，再生成完整報告。"}</p>
      </section>
      <section className="relative" aria-label={t("formTitle")}><AnalysisForm /></section>
      {current ? <ResultView result={current} /> : null}
      {current ? <FollowUpBox result={current} /> : null}

      <section className="zhaowu-home-portals-block" aria-label={portalCopy.label}>
        <header className="zhaowu-home-portals-heading"><p>ZHAOWU · {portalCopy.kicker}</p><h2>{portalCopy.label}</h2><span>{portalCopy.lead}</span></header>
        <div className="zhaowu-home-portals">
          {portalCopy.items.map((item) => (
            <Link key={item.to} to={item.to} className={`zhaowu-home-portal zhaowu-home-portal--${item.tone}`} aria-label={item.title}>
              <span className="zhaowu-home-portal-frame" aria-hidden="true" /><span className="zhaowu-home-portal-art" aria-hidden="true" /><span className="zhaowu-home-portal-mark" aria-hidden="true">{item.mark}</span>
              <span className="zhaowu-home-portal-copy"><em>{item.eyebrow}</em><strong>{item.title}</strong><small><b>{portalCopy.learn}：</b>{item.know}</small><small><b>{portalCopy.best}：</b>{item.bestAt}</small><span className="zhaowu-home-portal-action">{portalCopy.action}<b aria-hidden="true">›</b></span></span>
            </Link>
          ))}
        </div>
      </section>

      <section className="seal-border rounded-2xl bg-cream/90 p-5 sm:p-7" aria-label={funCopy.title}>
        <header><p className="text-xs tracking-[0.28em] text-cinnabar">ZHAOWU · {funCopy.kicker}</p><h2 className="mt-2 font-display text-2xl text-ink">{funCopy.title}</h2><p className="mt-2 text-sm leading-7 text-ink-soft">{funCopy.lead}</p></header>
        <div className="mt-5 grid gap-4 sm:grid-cols-2">
          {funCopy.cards.map((card) => (
            <Link key={card.series} to={card.to} className="block rounded-2xl border border-line bg-paper p-5 transition hover:border-cinnabar/50" aria-label={card.title}>
              <div className="flex items-start justify-between gap-5"><div><span className="text-xs tracking-[0.22em] text-cinnabar">{card.series}</span><strong className="mt-2 block font-display text-xl text-ink">{card.title}</strong><span className="mt-3 block text-sm leading-6 text-ink-soft"><b className="text-ink">{funCopy.learn}：</b>{card.know}</span><span className="mt-2 block text-sm leading-6 text-ink-soft"><b className="text-ink">{funCopy.best}：</b>{card.bestAt}</span></div><span className="text-xl text-cinnabar" aria-hidden="true">↗</span></div>
              <span className="mt-4 inline-block text-sm text-cinnabar">{funCopy.action}</span>
            </Link>
          ))}
        </div>
      </section>
      <AuspiciousGallerySection />
      <LifeViewSection />
    </main>
  );
}
