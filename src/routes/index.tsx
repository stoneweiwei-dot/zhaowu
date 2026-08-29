import { createFileRoute, Link } from "@tanstack/react-router";
import { AnalysisForm } from "@/components/analysis-form";
import { FollowUpBox } from "@/components/follow-up-box";
import { HomeScreenInstallPrompt } from "@/components/home-screen-install-prompt";
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
          lead: "Three separate routes. Each calculates its own layer before interpretation.",
          items: [
            { to: "/qizheng" as const, eyebrow: "CLASSICAL SKY", title: "Seven Luminaries", detail: "Sun, Moon, five planets and the four derived points in a separate classical-sky view.", mark: "☉", tone: "sky" },
            { to: "/tianji-dual" as const, eyebrow: "SYMBOLIC THREAD", title: "Past & Present", detail: "A symbolic view of older patterns and how they tend to surface in present-day responses.", mark: "↺", tone: "fate" },
            { to: "/ziwei" as const, eyebrow: "STAR PALACES", title: "Zi Wei Dou Shu", detail: "Twelve palaces, fourteen major stars, longer cycles and yearly timing, explained in plain English.", mark: "✦", tone: "ziwei" },
          ],
        }
      : locale === "zh-Hans"
        ? {
            label: "三个独立专区",
            lead: "七政四余、前世今生、紫微斗数，各自独立计算，不混进主八字判断。",
            items: [
              { to: "/qizheng" as const, eyebrow: "古法天象", title: "七政四余", detail: "独立查看日月五星与四余的天象层，和主八字判断分开。", mark: "曜", tone: "sky" },
              { to: "/tianji-dual" as const, eyebrow: "因缘旧习", title: "前世今生", detail: "用既有双轨计算看旧有惯性与今生反应；只作传统象征表达。", mark: "缘", tone: "fate" },
              { to: "/ziwei" as const, eyebrow: "星宫推演", title: "紫微斗数", detail: "十二宫、十四主星、大限与流年先算后解，先给你白话总解。", mark: "斗", tone: "ziwei" },
            ],
          }
        : {
            label: "三個獨立專區",
            lead: "七政四餘、前世今生、紫微斗數，各自獨立計算，不混進主八字判斷。",
            items: [
              { to: "/qizheng" as const, eyebrow: "古法天象", title: "七政四餘", detail: "獨立查看日月五星與四餘的天象層，和主八字判斷分開。", mark: "曜", tone: "sky" },
              { to: "/tianji-dual" as const, eyebrow: "因緣舊習", title: "前世今生", detail: "用既有雙軌計算看舊有慣性與今生反應；只作傳統象徵表達。", mark: "緣", tone: "fate" },
              { to: "/ziwei" as const, eyebrow: "星宮推演", title: "紫微斗數", detail: "十二宮、十四主星、大限與流年先算後解，先給你白話總解。", mark: "斗", tone: "ziwei" },
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

      <section className="relative" aria-label={t("formTitle")}>
        <AnalysisForm />
      </section>
      {current ? <ResultView result={current} /> : null}
      {current ? <FollowUpBox result={current} /> : null}
    </main>
  );
}
