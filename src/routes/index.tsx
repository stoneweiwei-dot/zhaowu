import { createFileRoute, Link } from "@tanstack/react-router";
import { AnalysisForm } from "@/components/analysis-form";
import { FollowUpBox } from "@/components/follow-up-box";
import { ResultView } from "@/components/result-view";
import { useI18n } from "@/lib/i18n";
import { useAppStore } from "@/lib/store";

export const Route = createFileRoute("/")({ component: Home });

const STEPS = ["s1", "s2", "s3"] as const;

const PROOFS = [
  { title: "proofPrimaryTitle" as const, body: "proofPrimaryBody" as const },
  { title: "proofPastTitle" as const, body: "proofPastBody" as const },
  { title: "proofBoundaryTitle" as const, body: "proofBoundaryBody" as const },
];

function Home() {
  const { t } = useI18n();
  const current = useAppStore((s) => s.current);

  return (
    <main className="space-y-6 sm:space-y-14">
      <section
        className="relative isolate overflow-hidden rounded-[1.4rem] border border-[#b99755]/35 bg-[radial-gradient(circle_at_76%_18%,rgba(222,187,111,.18),transparent_25%),radial-gradient(circle_at_10%_92%,rgba(111,157,130,.22),transparent_30%),linear-gradient(145deg,#17372f_0%,#0d2823_52%,#091c19_100%)] px-5 py-6 text-[#f6ead0] shadow-[0_18px_52px_rgba(28,42,34,.18)] sm:rounded-[2rem] sm:px-10 sm:py-14 sm:shadow-[0_28px_80px_rgba(28,42,34,.22)]"
        aria-labelledby="zhaowu-title"
      >
        <div className="pointer-events-none absolute inset-2 rounded-[1rem] border border-[#d7b76f]/20 sm:inset-3 sm:rounded-[1.45rem]" aria-hidden />

        <div className="relative z-10 max-w-2xl">
          <p className="text-[10px] font-semibold tracking-[0.25em] text-[#d5b16b] sm:text-[11px] sm:tracking-[0.32em]">ZHAOWU · {t("heroKicker")}</p>
          <h1 id="zhaowu-title" className="mt-3 font-display text-[3.5rem] font-bold leading-none tracking-[0.06em] text-[#f6ead0] sm:mt-4 sm:text-8xl sm:tracking-[0.08em]">
            {t("brand")}
          </h1>
          <p className="mt-4 max-w-xl pr-10 font-display text-xl font-semibold leading-[1.5] tracking-[0.08em] text-[#efd9a4] sm:mt-7 sm:pr-0 sm:text-3xl sm:leading-[1.55] sm:tracking-[0.1em]">
            {t("heroSlogan")}
          </p>
          <p className="mt-2 max-w-xl pr-8 font-serif text-[11px] italic leading-5 tracking-[0.08em] text-[#f5ead0]/55 sm:mt-3 sm:pr-0 sm:text-xs sm:tracking-[0.12em]">{t("heroEnglish")}</p>
          <div className="my-4 h-px w-44 max-w-[58vw] bg-gradient-to-r from-[#d5b16b] to-transparent sm:my-6 sm:w-56 sm:max-w-[70vw]" aria-hidden />
          <p className="max-w-xl pr-6 font-display text-sm leading-7 tracking-[0.03em] text-[#f1e3c1] sm:pr-0 sm:text-lg sm:leading-8 sm:tracking-[0.04em]">{t("heroLead")}</p>
          <p className="mt-3 hidden max-w-xl text-sm leading-7 text-[#f5ead0]/68 sm:block">{t("heroBody")}</p>
          <p className="mt-5 hidden w-fit border-y border-[#d5b16b]/30 py-2 font-display text-xs tracking-[0.24em] text-[#efd9a4] sm:block">{t("heroSign")}</p>

          <div className="mt-5 flex flex-col gap-3 sm:mt-7 sm:flex-row sm:flex-wrap">
            <a href="#analysisForm" className="inline-flex min-h-12 w-full items-center justify-center rounded-full border border-[#e2c985]/35 bg-cinnabar px-6 text-sm font-medium tracking-[0.08em] text-cream shadow-[0_14px_30px_rgba(0,0,0,.2)] sm:w-auto">
              {t("start")}
            </a>
            <Link to="/account" className="hidden min-h-12 items-center justify-center rounded-full border border-[#e2c985]/35 bg-[#fff9e9]/8 px-6 text-sm text-[#f5ead0] sm:inline-flex">
              {t("accountAdmin")}
            </Link>
          </div>
        </div>
      </section>

      <section className="relative" aria-label={t("formTitle")}>
        <AnalysisForm />
      </section>

      {current ? <ResultView result={current} /> : null}
      {current ? <FollowUpBox result={current} /> : null}

      <section className="grid overflow-hidden rounded-[1.5rem] border border-line/80 bg-cream/72 sm:grid-cols-3" aria-label={t("steps")}>
        {STEPS.map((step, index) => (
          <article key={step} className="relative min-h-32 overflow-hidden border-b border-line/70 p-5 last:border-b-0 sm:border-b-0 sm:border-r sm:last:border-r-0">
            <p className="font-display text-3xl text-cinnabar/80">0{index + 1}</p>
            <p className="relative z-10 mt-3 max-w-[14rem] font-display text-base leading-7 tracking-[0.03em] text-ink">{t(step)}</p>
          </article>
        ))}
      </section>

      <section className="relative overflow-hidden rounded-[1.75rem] border border-line bg-gradient-to-br from-cream/94 to-paper/80 p-5 shadow-[0_18px_50px_rgba(69,50,29,.08)] sm:p-8" aria-labelledby="method-title">
        <span className="text-[11px] font-semibold tracking-[0.28em] text-cinnabar">{t("methodKicker")}</span>
        <h2 id="method-title" className="mt-3 max-w-3xl font-display text-2xl font-semibold leading-10 tracking-[0.05em] text-ink sm:text-3xl">{t("methodTitle")}</h2>
        <p className="mt-3 max-w-3xl text-sm leading-7 text-ink-soft">{t("methodLead")}</p>

        <div className="mt-6 grid gap-3 md:grid-cols-3">
          {PROOFS.map((proof, index) => (
            <article key={proof.title} className="relative min-h-48 overflow-hidden rounded-xl border border-line/75 bg-cream/72 p-5">
              <span className="text-xs tracking-[0.2em] text-cinnabar">0{index + 1}</span>
              <h3 className="mt-5 font-display text-lg font-semibold tracking-[0.05em] text-ink">{t(proof.title)}</h3>
              <p className="relative z-10 mt-3 text-sm leading-7 text-ink-soft">{t(proof.body)}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="rounded-[1.5rem] border-y border-line/80 bg-cream/45 px-5 py-7 sm:px-8" aria-labelledby="faq-title">
        <h2 id="faq-title" className="font-display text-2xl font-semibold tracking-[0.12em] text-ink">{t("faq")}</h2>
        <dl className="mt-6 grid gap-5 text-sm leading-7 md:grid-cols-3">
          <div><dt className="font-display font-semibold text-ink">{t("faq1q")}</dt><dd className="mt-2 text-ink-soft">{t("faq1a")}</dd></div>
          <div><dt className="font-display font-semibold text-ink">{t("faq2q")}</dt><dd className="mt-2 text-ink-soft">{t("faq2a")}</dd></div>
          <div><dt className="font-display font-semibold text-ink">{t("faq3q")}</dt><dd className="mt-2 text-ink-soft">{t("faq3a")}</dd></div>
        </dl>
      </section>
    </main>
  );
}
