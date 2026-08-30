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
          label: "Three specialist sections",
          lead: "Three focused readings, each written around what that tradition explains best.",
          items: [
            { to: "/qizheng" as const, eyebrow: "CLASSICAL SKY", title: "Seven Luminaries", detail: "Your temperament, emotional rhythm, drive and natural way of handling pressure.", mark: "☉", tone: "sky" },
            { to: "/yizhangjing" as const, eyebrow: "PAST-LIFE PATTERNS", title: "Past & Present", detail: "Four prior lives, their six-realm origins, carried habits and any pattern that repeats more strongly.", mark: "緣", tone: "fate" },
            { to: "/ziwei" as const, eyebrow: "LIFE PATTERNS", title: "Zi Wei Dou Shu", detail: "Character, work, money, relationships and the main theme of your current longer phase.", mark: "斗", tone: "ziwei" },
          ],
        }
      : locale === "zh-Hans"
        ? {
            label: "三个独立专区",
            lead: "三个专题，各自只讲自己最擅长看的部分，直接给你一份清楚的个人报告。",
            items: [
              { to: "/qizheng" as const, eyebrow: "古法天象", title: "七政四余", detail: "看天性、情绪节奏、行动方式，以及面对压力时最自然的反应。", mark: "曜", tone: "sky" },
              { to: "/yizhangjing" as const, eyebrow: "四世六道", title: "前世今生", detail: "看前四世来自哪一道、留下什么习性，以及重复出现后被加强的主轴。", mark: "缘", tone: "fate" },
              { to: "/ziwei" as const, eyebrow: "人生格局", title: "紫微斗数", detail: "看性格底色、事业财务、关系模式，以及当前十年最重要的课题。", mark: "斗", tone: "ziwei" },
            ],
          }
        : {
            label: "三個獨立專區",
            lead: "三個專題，各自只講自己最擅長看的部分，直接給你一份清楚的個人報告。",
            items: [
              { to: "/qizheng" as const, eyebrow: "古法天象", title: "七政四餘", detail: "看天性、情緒節奏、行動方式，以及面對壓力時最自然的反應。", mark: "曜", tone: "sky" },
              { to: "/yizhangjing" as const, eyebrow: "四世六道", title: "前世今生", detail: "看前四世來自哪一道、留下什麼習性，以及重複出現後被加強的主軸。", mark: "緣", tone: "fate" },
              { to: "/ziwei" as const, eyebrow: "人生格局", title: "紫微斗數", detail: "看性格底色、事業財務、關係模式，以及當前十年最重要的課題。", mark: "斗", tone: "ziwei" },
            ],
          };

  return (
    <main className="zhaowu-home-sheet-page space-y-7 sm:space-y-12">
      <HomeScreenInstallPrompt />

      <section className="zhaowu-home-intro" aria-label={t("heroKicker")}>
        <p className="zhaowu-home-intro-kicker">ZHAOWU · {t("heroKicker")}</p>
      </section>

      <section className="zhaowu-home-portals-block" aria-label={portalCopy.label}>
        <header className="zhaowu-home-portals-heading">
          <p>ZHAOWU · SPECIALIST</p>
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
              <span className="zhaowu-home-portal-mark" aria-hidden="true">{item.mark}</span>
              <span className="zhaowu-home-portal-copy">
                <em>{item.eyebrow}</em>
                <strong>{item.title}</strong>
                <small>{item.detail}</small>
              </span>
              <span className="zhaowu-home-portal-arrow" aria-hidden="true">↗</span>
            </Link>
          ))}
        </div>
      </section>

      <AuspiciousGallerySection />

      <LifeViewSection />

      <section className="relative" aria-label={t("formTitle")}>
        <AnalysisForm />
      </section>
      {current ? <ResultView result={current} /> : null}
      {current ? <FollowUpBox result={current} /> : null}
    </main>
  );
}
