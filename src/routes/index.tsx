import { createFileRoute, Link } from "@tanstack/react-router";
import { AnalysisForm } from "@/components/analysis-form";
import { FollowUpBox } from "@/components/follow-up-box";
import { HomeScreenInstallPrompt } from "@/components/home-screen-install-prompt";
import { ResultView } from "@/components/result-view";
import { useI18n } from "@/lib/i18n";
import { useAppStore } from "@/lib/store";
import "@/home-polish-v3.css";

export const Route = createFileRoute("/")({ component: Home });

function Home() {
  const { t, locale } = useI18n();
  const dualCopy = locale === "en"
    ? { title: "Two sides of character", detail: "How you operate day to day and under pressure", mark: "II" }
    : locale === "zh-Hans"
      ? { title: "性格两面", detail: "平时怎样做事，压力来时怎样反应", mark: "两面" }
      : { title: "性格兩面", detail: "平時怎樣做事，壓力來時怎樣反應", mark: "兩面" };
  const current = useAppStore((s) => s.current);
  return (
    <main className="zhaowu-home-sheet-page space-y-7 sm:space-y-12">
      <HomeScreenInstallPrompt />

      <section className="zhaowu-home-intro" aria-label={t("heroKicker")}>
        <p className="zhaowu-home-intro-kicker">ZHAOWU · {t("heroKicker")}</p>
      </section>

      <Link to="/tianji-dual" className="zhaowu-home-dual-entry" aria-label={dualCopy.title}>
        <span className="zhaowu-home-dual-mark" aria-hidden="true">{dualCopy.mark}</span>
        <span className="zhaowu-home-dual-copy"><strong>{dualCopy.title}</strong><small>{dualCopy.detail}</small></span>
        <b aria-hidden="true">→</b>
      </Link>

      <section className="relative" aria-label={t("formTitle")}><AnalysisForm /></section>
      {current ? <ResultView result={current} /> : null}
      {current ? <FollowUpBox result={current} /> : null}

    </main>
  );
}
