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
          kicker: "THREE WAYS",
          label: "Three Ways of Seeing",
          lead: "Three traditions, each revealing a different layer.",
          action: "Enter",
          items: [
            { to: "/qizheng" as const, eyebrow: "CLASSICAL SKY", title: "Seven Luminaries", detail: "Read celestial rhythm, temperament, action and your natural response under pressure.", mark: "曜", tone: "sky" },
            { to: "/yizhangjing" as const, eyebrow: "PAST-LIFE PATTERNS", title: "Past & Present", detail: "Trace prior-life habits and the themes that return more strongly in this life.", mark: "世", tone: "fate" },
            { to: "/ziwei" as const, eyebrow: "PALACE PATTERNS", title: "Zi Wei Dou Shu", detail: "Read character, relationships, work, money and the main theme of the current decade.", mark: "斗", tone: "ziwei" },
          ],
        }
      : locale === "zh-Hans"
        ? {
            kicker: "三门",
            label: "三门分观",
            lead: "各依其法，各见其深。",
            action: "进入分门",
            items: [
              { to: "/qizheng" as const, eyebrow: "古法天象", title: "七政四余", detail: "观天象气机，辨性情节奏、行动方式，以及临事时最自然的应对。", mark: "曜", tone: "sky" },
              { to: "/yizhangjing" as const, eyebrow: "前尘习气", title: "前世今生", detail: "看前四世所来之道、所留之习，以及今生反复出现而被加强的主题。", mark: "世", tone: "fate" },
              { to: "/ziwei" as const, eyebrow: "宫位格局", title: "紫微斗数", detail: "察性格底色、关系模式、事业财务脉络，以及当前十年的重要课题。", mark: "斗", tone: "ziwei" },
            ],
          }
        : {
            kicker: "三門",
            label: "三門分觀",
            lead: "各依其法，各見其深。",
            action: "進入分門",
            items: [
              { to: "/qizheng" as const, eyebrow: "古法天象", title: "七政四餘", detail: "觀天象氣機，辨性情節奏、行動方式，以及臨事時最自然的應對。", mark: "曜", tone: "sky" },
              { to: "/yizhangjing" as const, eyebrow: "前塵習氣", title: "前世今生", detail: "看前四世所來之道、所留之習，以及今生反覆出現而被加強的主題。", mark: "世", tone: "fate" },
              { to: "/ziwei" as const, eyebrow: "宮位格局", title: "紫微斗數", detail: "察性格底色、關係模式、事業財務脈絡，以及當前十年的重要課題。", mark: "斗", tone: "ziwei" },
            ],
          };

  const funCopy = locale === "en"
    ? { kicker: "FUN TESTS", title: "Playful self-tests", lead: "Short tests for personality and behaviour. The first one compares your inner animal with your chart guardian beast.", cardTitle: "Inner Animal × Guardian Beast", cardDetail: "12 questions. Find your current animal archetype, then compare it with your BaZi guardian beast to see whether the two patterns align.", action: "Take the test" }
    : locale === "zh-Hans"
      ? { kicker: "趣味测验", title: "昭梧趣味测验系列", lead: "轻一点，但不是乱测。心理自评和命理象征分开计算，再做交叉解读。", cardTitle: "内在动物 × 命局瑞兽", cardDetail: "12题测出你当前最常使用的动物人格原型；已有命盘时，再判断内外同象、相生、相制或异象。", action: "开始测验" }
      : { kicker: "趣味測驗", title: "昭梧趣味測驗系列", lead: "輕一點，但不是亂測。心理自評和命理象徵分開計算，再做交叉解讀。", cardTitle: "內在動物 × 命局瑞獸", cardDetail: "12 題測出你當前最常使用的動物人格原型；已有命盤時，再判斷內外同象、相生、相制或異象。", action: "開始測驗" };

  return (
    <main className="zhaowu-home-sheet-page space-y-7 sm:space-y-12">
      <HomeScreenInstallPrompt />

      <section className="zhaowu-home-intro" aria-label={t("heroKicker")}>
        <p className="zhaowu-home-intro-kicker">ZHAOWU · {t("heroKicker")}</p>
        <p className="zhaowu-home-intro-quiz">
          {locale === "en"
            ? "Fill the paper. Get the answer. Then generate the report."
            : locale === "zh-Hans"
              ? "像心理测验一样交卷：先得答案，再生成报告。"
              : "像心理測驗一樣交卷：先得答案，再生成報告。"}
        </p>
      </section>

      <section className="relative" aria-label={t("formTitle")}>
        <AnalysisForm />
      </section>
      {current ? <ResultView result={current} /> : null}
      {current ? <FollowUpBox result={current} /> : null}

      <section className="zhaowu-home-portals-block" aria-label={portalCopy.label}>
        <header className="zhaowu-home-portals-heading">
          <p>ZHAOWU · {portalCopy.kicker}</p>
          <h2>{portalCopy.label}</h2>
          <span>{portalCopy.lead}</span>
        </header>
        <div className="zhaowu-home-portals">
          {portalCopy.items.map((item) => (
            <Link
              key={item.to}
              to={item.to}
              className={`zhaowu-home-portal zhaowu-home-portal--${item.tone}`}
              aria-label={item.title}
            >
              <span className="zhaowu-home-portal-frame" aria-hidden="true" />
              <span className="zhaowu-home-portal-art" aria-hidden="true" />
              <span className="zhaowu-home-portal-mark" aria-hidden="true">{item.mark}</span>
              <span className="zhaowu-home-portal-copy">
                <em>{item.eyebrow}</em>
                <strong>{item.title}</strong>
                <small>{item.detail}</small>
                <span className="zhaowu-home-portal-action">{portalCopy.action}<b aria-hidden="true">›</b></span>
              </span>
            </Link>
          ))}
        </div>
      </section>

      <section className="seal-border rounded-2xl bg-cream/90 p-5 sm:p-7" aria-label={funCopy.title}>
        <header>
          <p className="text-xs tracking-[0.28em] text-cinnabar">ZHAOWU · {funCopy.kicker}</p>
          <h2 className="mt-2 font-display text-2xl text-ink">{funCopy.title}</h2>
          <p className="mt-2 text-sm leading-7 text-ink-soft">{funCopy.lead}</p>
        </header>
        <Link to="/fun-tests" className="mt-5 block rounded-2xl border border-line bg-paper p-5 transition hover:border-cinnabar/50" aria-label={funCopy.cardTitle}>
          <div className="flex items-start justify-between gap-5">
            <div>
              <span className="text-xs tracking-[0.22em] text-cinnabar">SERIES 01</span>
              <strong className="mt-2 block font-display text-xl text-ink">{funCopy.cardTitle}</strong>
              <span className="mt-2 block text-sm leading-6 text-ink-soft">{funCopy.cardDetail}</span>
            </div>
            <span className="text-xl text-cinnabar" aria-hidden="true">↗</span>
          </div>
          <span className="mt-4 inline-block text-sm text-cinnabar">{funCopy.action}</span>
        </Link>
      </section>

      <AuspiciousGallerySection />
      <LifeViewSection />
    </main>
  );
}
