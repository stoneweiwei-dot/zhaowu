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
    void getAlmanac()
      .then(setAlmanac)
      .catch(() => setAlmanac(null));
  }, []);

  return (
    <main className="space-y-10">
      <section className="grid items-end gap-8 md:grid-cols-[1.2fr_0.8fr]">
        <div className="hero-brand-card seal-border relative overflow-hidden rounded-xl bg-cream/92 p-5 sm:p-7">
          <Mark id="01" size={88} className="absolute right-2 top-2 text-cinnabar" />
          <div className="relative z-10 pr-16 sm:pr-20">
            <p className="hero-kicker">ZHAOWU · {t("heroKicker")}</p>
            <div className="mt-5 sm:mt-6">
              <h1 className="brand-wordmark" aria-label={t("brand")}><span>昭</span><span>梧</span></h1>
              <p className="brand-slogan mt-6">{t("heroSlogan")}</p>
              <p className="brand-english mt-2">{t("heroEnglish")}</p>
            </div>
            <div className="brand-rule my-6" aria-hidden="true"><span /><i /><span /></div>
            <p className="brand-support max-w-xl">{t("heroLead")}</p>
            <p className="mt-4 max-w-xl text-sm leading-7 text-ink-soft">{t("heroBody")}</p>
            <p className="brand-sign mt-5">{t("heroSign")}</p>
            <a href="#analysisForm" className="mt-6 inline-flex h-12 items-center rounded-full bg-cinnabar px-6 text-cream transition-transform duration-200 hover:-translate-y-0.5">{t("start")}</a>
          </div>
        </div>

        <aside className="seal-border relative overflow-hidden rounded-xl bg-cream/90 p-5">
          <Mark id="02" size={80} className="absolute right-2 top-2 text-cinnabar" />
          <div className="pr-20">
            <p className="text-xs tracking-[0.28em] text-cinnabar">{t("today")}</p>
            {almanac ? (
              <div className="mt-3 space-y-2">
                <p className="font-display text-3xl tracking-[0.16em]">{almanac.day}</p>
                <p className="text-sm text-ink-soft">{almanac.year}年 {almanac.month}月 · {almanac.lunar}</p>
                {almanac.jieqi ? <p className="text-sm text-cinnabar">{t("jieqi")} {almanac.jieqi}</p> : null}
                <p className="text-sm text-ink-soft">{t("yi")} {almanac.yi.join("、") || "—"}</p>
                <p className="text-sm text-ink-mute">{t("ji")} {almanac.ji.join("、") || "—"}</p>
                <p className="text-xs text-ink-mute">{t("chong")} {almanac.chong} · {t("sha")} {almanac.sha}</p>
              </div>
            ) : <div className="mt-4 h-28 animate-pulse rounded-md bg-paper-deep" />}
          </div>
        </aside>
      </section>

      <div className="flex justify-center"><Mark id="jade" size={96} className="h-24 w-24 text-cinnabar" /></div>

      <section className="grid gap-3 sm:grid-cols-3">
        {[t("s1"), t("s2"), t("s3")].map((item, i) => (
          <div key={item} className="relative min-h-28 overflow-hidden rounded-lg border border-line bg-cream/80 px-4 py-4">
            <Mark id={STEP_MARKS[i]} size={68} className="zhaowu-step-mark absolute right-2 top-2 text-cinnabar" />
            <p className="text-xs tracking-[0.2em] text-cinnabar">0{i + 1}</p>
            <p className="mt-2 pr-20 text-sm leading-6">{item}</p>
          </div>
        ))}
      </section>

      <AnalysisForm />
      {current ? <ResultView result={current} /> : null}
      {current ? <FollowUpBox result={current} /> : null}

      <div className="flex items-center justify-center py-2"><Mark id="13" size={88} className="h-20 w-20 text-cinnabar" /></div>

      <section className="seal-border relative overflow-hidden rounded-xl bg-cream/90 p-5 sm:p-7">
        <Mark id="09" size={84} className="absolute bottom-2 right-2 text-cinnabar" />
        <div className="pr-20">
          <p className="text-xs tracking-[0.28em] text-cinnabar">{t("faq")}</p>
          <dl className="mt-4 space-y-4 text-sm leading-7">
            <div><dt className="font-medium">{t("faq1q")}</dt><dd className="text-ink-soft">{t("faq1a")}</dd></div>
            <div><dt className="font-medium">{t("faq2q")}</dt><dd className="text-ink-soft">{t("faq2a")}</dd></div>
            <div><dt className="font-medium">{t("faq3q")}</dt><dd className="text-ink-soft">{t("faq3a")}</dd></div>
          </dl>
        </div>
      </section>
    </main>
  );
}
