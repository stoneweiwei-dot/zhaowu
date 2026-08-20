import { useEffect, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { getAlmanac } from "@/lib/actions";
import { AnalysisForm } from "@/components/analysis-form";
import { ResultView } from "@/components/result-view";
import { FollowUpBox } from "@/components/follow-up-box";
import { Mark } from "@/components/marks";
import { useAppStore } from "@/lib/store";
import { useI18n } from "@/lib/i18n";

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
    <main className="zhaowu-home">
      <section className="zhaowu-sanctum" aria-labelledby="zhaowu-title">
        <div className="zhaowu-sanctum-mist" aria-hidden />
        <Mark id="brand" size={230} eager className="zhaowu-sanctum-seal" />
        <Mark id="04" size={150} className="zhaowu-sanctum-ornament zhaowu-sanctum-ornament-a" />
        <Mark id="01" size={170} className="zhaowu-sanctum-ornament zhaowu-sanctum-ornament-b" />
        <Mark id="03" size={150} className="zhaowu-sanctum-ornament zhaowu-sanctum-ornament-c" />

        <div className="zhaowu-sanctum-copy">
          <p className="hero-kicker">ZHAOWU · {t("heroKicker")}</p>
          <h1 id="zhaowu-title" className="brand-wordmark"><span>昭</span><span>梧</span></h1>
          <p className="zhaowu-sanctum-slogan">{t("heroSlogan")}</p>
          <p className="brand-english">{t("heroEnglish")}</p>
          <div className="zhaowu-sanctum-rule" aria-hidden><span /><i /><span /></div>
          <p className="zhaowu-sanctum-lead">{t("heroLead")}</p>
          <p className="zhaowu-sanctum-body">{t("heroBody")}</p>
          <a href="#analysisForm" className="zhaowu-start-button">{t("start")}</a>
        </div>

        <aside className="zhaowu-almanac-ribbon" aria-label={t("today")}>
          <div className="zhaowu-almanac-mark"><Mark id="02" size={94} /></div>
          <div className="zhaowu-almanac-copy">
            <p className="zhaowu-almanac-label">{t("today")}</p>
            {almanac ? (
              <>
                <p className="zhaowu-almanac-day">{almanac.day}</p>
                <p>{almanac.year}年 {almanac.month}月 · {almanac.lunar}</p>
                <p className="text-cinnabar">{almanac.jieqi ? `${t("jieqi")} ${almanac.jieqi}` : ""}</p>
                <p>{t("yi")} {almanac.yi.join("、") || "—"}</p>
                <p className="text-ink-mute">{t("ji")} {almanac.ji.join("、") || "—"}</p>
              </>
            ) : <div className="mt-3 h-20 animate-pulse rounded-full bg-paper-deep/50" />}
          </div>
        </aside>
      </section>

      <section className="zhaowu-steps" aria-label="使用步骤">
        {[t("s1"), t("s2"), t("s3")].map((item, i) => (
          <article key={item} className="zhaowu-step">
            <div className="zhaowu-step-number">0{i + 1}</div>
            <div className="zhaowu-step-copy">{item}</div>
            <Mark id={STEP_MARKS[i]} size={112} className="zhaowu-step-emblem" />
          </article>
        ))}
      </section>

      <section className="zhaowu-form-stage">
        <Mark id="09" size={190} className="zhaowu-form-ghost zhaowu-form-ghost-a" />
        <Mark id="07" size={170} className="zhaowu-form-ghost zhaowu-form-ghost-b" />
        <AnalysisForm />
      </section>

      {current ? <ResultView result={current} /> : null}
      {current ? <FollowUpBox result={current} /> : null}

      <section className="zhaowu-faq">
        <div className="zhaowu-faq-title-wrap">
          <Mark id="04" size={120} className="zhaowu-faq-emblem" />
          <p className="zhaowu-faq-kicker">{t("faq")}</p>
        </div>
        <dl className="zhaowu-faq-list">
          <div><dt>{t("faq1q")}</dt><dd>{t("faq1a")}</dd></div>
          <div><dt>{t("faq2q")}</dt><dd>{t("faq2a")}</dd></div>
          <div><dt>{t("faq3q")}</dt><dd>{t("faq3a")}</dd></div>
        </dl>
      </section>
    </main>
  );
}
