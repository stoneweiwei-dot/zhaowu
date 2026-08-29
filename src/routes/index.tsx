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
          label: "Three classical systems",
          items: [
            { to: "/qizheng" as const, title: "Seven Luminaries", detail: "Sun · Moon · Five planets", mark: "曜", tone: "sky" },
            { to: "/tianji-dual" as const, title: "Past & Present", detail: "Old patterns · present response", mark: "緣", tone: "fate" },
            { to: "/ziwei" as const, title: "Zi Wei Dou Shu", detail: "Twelve palaces · fourteen stars", mark: "斗", tone: "ziwei" },
          ],
        }
      : locale === "zh-Hans"
        ? {
            label: "三门传统体系",
            items: [
              { to: "/qizheng" as const, title: "七政四余", detail: "日月五星 · 罗计孛炁", mark: "曜", tone: "sky" },
              { to: "/tianji-dual" as const, title: "前世今生", detail: "旧习惯 · 今生反应", mark: "缘", tone: "fate" },
              { to: "/ziwei" as const, title: "紫微斗数", detail: "十二宫 · 十四主星", mark: "斗", tone: "ziwei" },
            ],
          }
        : {
            label: "三門傳統體系",
            items: [
              { to: "/qizheng" as const, title: "七政四餘", detail: "日月五星 · 羅計孛炁", mark: "曜", tone: "sky" },
              { to: "/tianji-dual" as const, title: "前世今生", detail: "舊習慣 · 今生反應", mark: "緣", tone: "fate" },
              { to: "/ziwei" as const, title: "紫微斗數", detail: "十二宮 · 十四主星", mark: "斗", tone: "ziwei" },
            ],
          };

  return (
    <main className="zhaowu-home-sheet-page space-y-7 sm:space-y-12">
      <HomeScreenInstallPrompt />

      <section className="zhaowu-home-intro" aria-label={t("heroKicker")}>
        <p className="zhaowu-home-intro-kicker">ZHAOWU · {t("heroKicker")}</p>
      </section>

      <section className="zhaowu-home-portals" aria-label={portalCopy.label}>
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
              <strong>{item.title}</strong>
              <small>{item.detail}</small>
            </span>
            <span className="zhaowu-home-portal-arrow" aria-hidden="true">↗</span>
          </Link>
        ))}
      </section>

      <section className="relative" aria-label={t("formTitle")}>
        <AnalysisForm />
      </section>
      {current ? <ResultView result={current} /> : null}
      {current ? <FollowUpBox result={current} /> : null}
    </main>
  );
}
