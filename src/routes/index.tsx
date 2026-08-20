import { useEffect, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { getAlmanac } from "@/lib/actions";
import { AnalysisForm } from "@/components/analysis-form";
import { ResultView } from "@/components/result-view";
import { FollowUpBox } from "@/components/follow-up-box";
import { Mark } from "@/components/marks";
import { useAppStore } from "@/lib/store";
import { useI18n } from "@/lib/i18n";
import "@/home-v2.css";

export const Route = createFileRoute("/")({ component: Home });

type Almanac = Awaited<ReturnType<typeof getAlmanac>>;
const STEP_MARKS = ["06", "16", "17"] as const;

function Home() {
  const { t } = useI18n();
  const current = useAppStore((s) => s.current);
  const [almanac, setAlmanac] = useState<Almanac | null>(null);

  useEffect(() => {
    void getAlmanac().then(setAlmanac).catch(() => setAlmanac(null));
  }, []);

  return (
    <main className="zhaowu-v2">
      <section className="zhaowu-v2-hero" aria-labelledby="zhaowu-title">
        <span className="zhaowu-v2-build">ZW · 2026.08.20 · JADE</span>
        <Mark id="brand" size={340} eager className="zhaowu-v2-seal" />
        <Mark id="04" size={180} className="zhaowu-v2-corner a" />
        <Mark id="03" size={220} className="zhaowu-v2-corner b" />

        <div className="zhaowu-v2-inner">
          <p className="zhaowu-v2-kicker">ZHAOWU · {t("heroKicker")}</p>
          <h1 id="zhaowu-title" className="zhaowu-v2-wordmark">昭梧</h1>
          <p className="zhaowu-v2-slogan">{t("heroSlogan")}</p>
          <p className="zhaowu-v2-english">{t("heroEnglish")}</p>
          <div className="zhaowu-v2-rule" aria-hidden />
          <p className="zhaowu-v2-lead">{t("heroLead")}</p>
          <p className="zhaowu-v2-body">{t("heroBody")}</p>
          <a href="#analysisForm" className="zhaowu-v2-start">{t("start")}</a>
        </div>
      </section>

      <aside className="zhaowu-v2-almanac" aria-label={t("today")}>
        <Mark id="02" size={94} />
        <div>
          <p className="zhaowu-v2-almanac-title">{t("today")}</p>
          {almanac ? (
            <div className="zhaowu-v2-almanac-meta">
              <p>{almanac.day} · {almanac.year}年 {almanac.month}月 · {almanac.lunar}</p>
              {almanac.jieqi ? <p>{t("jieqi")} {almanac.jieqi}</p> : null}
              <p>{t("yi")} {almanac.yi.join("、") || "—"}</p>
              <p>{t("ji")} {almanac.ji.join("、") || "—"}</p>
            </div>
          ) : <div className="mt-2 h-12 animate-pulse bg-paper-deep/40" />}
        </div>
      </aside>

      <section className="zhaowu-v2-steps" aria-label="使用步骤">
        {[t("s1"), t("s2"), t("s3")].map((item, i) => (
          <article key={item} className="zhaowu-v2-step">
            <div className="zhaowu-v2-step-no">0{i + 1}</div>
            <div className="zhaowu-v2-step-text">{item}</div>
            <Mark id={STEP_MARKS[i]} size={150} />
          </article>
        ))}
      </section>

      <section className="zhaowu-v2-form">
        <AnalysisForm />
      </section>

      {current ? <ResultView result={current} /> : null}
      {current ? <FollowUpBox result={current} /> : null}

      <section className="zhaowu-v2-faq">
        <h2>{t("faq")}</h2>
        <dl>
          <div><dt>{t("faq1q")}</dt><dd>{t("faq1a")}</dd></div>
          <div><dt>{t("faq2q")}</dt><dd>{t("faq2a")}</dd></div>
          <div><dt>{t("faq3q")}</dt><dd>{t("faq3a")}</dd></div>
        </dl>
      </section>
    </main>
  );
}
