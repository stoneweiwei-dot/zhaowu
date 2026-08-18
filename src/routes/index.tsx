import { useEffect, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { getAlmanac } from "@/lib/actions";
import { AnalysisForm } from "@/components/analysis-form";
import { ResultView } from "@/components/result-view";
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
        <div className="seal-border relative overflow-hidden rounded-xl bg-cream/92 p-5 sm:p-7">
          <Mark id="01" size={88} className="absolute -right-1 -top-1 w-16 opacity-40 sm:w-[4.5rem]" />
          <p className="text-xs tracking-[0.32em] text-cinnabar">ZHAOWU</p>
          <h1 className="mt-3 font-display text-4xl leading-tight sm:text-5xl">
            {t("brand")}
            <span className="mt-2 block text-2xl text-ink-soft sm:text-3xl">{t("tagline")}</span>
          </h1>
          <p className="mt-3 text-xs tracking-[0.28em] text-ink-mute">{t("product")}</p>
          <p className="mt-5 max-w-xl text-sm leading-7 text-ink-soft">
            {t("m1")}
            <br />
            {t("m2")}
            <br />
            {t("m3")}
          </p>
          <a
            href="#analysisForm"
            className="mt-6 inline-flex h-12 items-center rounded-full bg-cinnabar px-6 text-cream"
          >
            {t("start")}
          </a>
        </div>
        <aside className="seal-border relative overflow-hidden rounded-xl bg-cream/90 p-5">
          <Mark id="02" size={72} className="absolute right-2 top-2 w-14 opacity-45" />
          <p className="text-xs tracking-[0.28em] text-cinnabar">{t("today")}</p>
          {almanac ? (
            <div className="mt-3 space-y-2">
              <p className="font-display text-3xl tracking-[0.16em]">{almanac.day}</p>
              <p className="text-sm text-ink-soft">
                {almanac.year}年 {almanac.month}月 · {almanac.lunar}
              </p>
              {almanac.jieqi ? (
                <p className="text-sm text-cinnabar">
                  {t("jieqi")} {almanac.jieqi}
                </p>
              ) : null}
              <p className="text-sm text-ink-soft">
                {t("yi")} {almanac.yi.join("、") || "—"}
              </p>
              <p className="text-sm text-ink-mute">
                {t("ji")} {almanac.ji.join("、") || "—"}
              </p>
              <p className="text-xs text-ink-mute">
                {t("chong")} {almanac.chong} · {t("sha")} {almanac.sha}
              </p>
            </div>
          ) : (
            <div className="mt-4 h-28 animate-pulse rounded-md bg-paper-deep" />
          )}
        </aside>
      </section>

      <div className="flex justify-center">
        <Mark id="jade" size={88} className="h-[5.5rem] w-auto opacity-90" />
      </div>

      <section className="grid gap-3 sm:grid-cols-3">
        {[t("s1"), t("s2"), t("s3")].map((item, i) => (
          <div key={item} className="relative overflow-hidden rounded-lg border border-line bg-cream/80 px-4 py-4">
            <Mark
              id={STEP_MARKS[i]}
              size={48}
              className="absolute right-1 top-1 w-10 opacity-35"
            />
            <p className="text-xs tracking-[0.2em] text-cinnabar">0{i + 1}</p>
            <p className="mt-1 pr-8 text-sm leading-6">{item}</p>
          </div>
        ))}
      </section>

      <AnalysisForm />

      {current ? <ResultView result={current} /> : null}

      <div className="flex items-center justify-center gap-6 py-1">
        <Mark id="13" size={96} className="h-8 w-28 opacity-40" />
      </div>

      <section className="seal-border relative overflow-hidden rounded-xl bg-cream/90 p-5 sm:p-7">
        <Mark id="09" size={80} className="absolute -right-2 bottom-0 w-16 opacity-25 sm:w-20" />
        <p className="text-xs tracking-[0.28em] text-cinnabar">{t("faq")}</p>
        <dl className="mt-4 space-y-4 text-sm leading-7">
          <div>
            <dt className="font-medium">{t("faq1q")}</dt>
            <dd className="text-ink-soft">{t("faq1a")}</dd>
          </div>
          <div>
            <dt className="font-medium">{t("faq2q")}</dt>
            <dd className="text-ink-soft">{t("faq2a")}</dd>
          </div>
          <div>
            <dt className="font-medium">{t("faq3q")}</dt>
            <dd className="text-ink-soft">{t("faq3a")}</dd>
          </div>
        </dl>
      </section>
    </main>
  );
}
