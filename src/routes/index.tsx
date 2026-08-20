import { createFileRoute, Link } from "@tanstack/react-router";
import { AnalysisForm } from "@/components/analysis-form";
import { FollowUpBox } from "@/components/follow-up-box";
import { Mark } from "@/components/marks";
import { ResultView } from "@/components/result-view";
import { useI18n } from "@/lib/i18n";
import { useAppStore } from "@/lib/store";

export const Route = createFileRoute("/")({ component: Home });

const STEPS = [
  { key: "s1" as const, mark: "06" },
  { key: "s2" as const, mark: "16" },
  { key: "s3" as const, mark: "17" },
];

const PROOFS = [
  { title: "proofPrimaryTitle" as const, body: "proofPrimaryBody" as const, mark: "02" },
  { title: "proofPastTitle" as const, body: "proofPastBody" as const, mark: "01" },
  { title: "proofBoundaryTitle" as const, body: "proofBoundaryBody" as const, mark: "04" },
];

function Home() {
  const { t } = useI18n();
  const current = useAppStore((s) => s.current);

  return (
    <main className="space-y-10 sm:space-y-14">
      <section
        className="relative isolate overflow-hidden rounded-[2rem] border border-[#b99755]/35 bg-[radial-gradient(circle_at_76%_18%,rgba(222,187,111,.18),transparent_25%),radial-gradient(circle_at_10%_92%,rgba(111,157,130,.22),transparent_30%),linear-gradient(145deg,#17372f_0%,#0d2823_52%,#091c19_100%)] px-5 py-10 text-[#f6ead0] shadow-[0_28px_80px_rgba(28,42,34,.22)] sm:px-10 sm:py-14"
        aria-labelledby="zhaowu-title"
      >
        <div className="pointer-events-none absolute inset-3 rounded-[1.45rem] border border-[#d7b76f]/20" aria-hidden />
        <Mark id="brand" size={300} eager className="pointer-events-none absolute -right-24 top-8 w-64 rotate-[8deg] opacity-25 sm:-right-12 sm:w-72 sm:opacity-35" />
        <Mark id="04" size={150} className="pointer-events-none absolute -bottom-12 -left-10 w-36 -rotate-12 opacity-15" />

        <div className="relative z-10 max-w-2xl">
          <p className="text-[11px] font-semibold tracking-[0.32em] text-[#d5b16b]">ZHAOWU · {t("heroKicker")}</p>
          <h1 id="zhaowu-title" className="mt-4 font-display text-[5.4rem] font-bold leading-none tracking-[0.08em] text-[#f6ead0] sm:text-8xl">
            {t("brand")}
          </h1>
          <p className="mt-7 max-w-xl font-display text-2xl font-semibold leading-[1.55] tracking-[0.1em] text-[#efd9a4] sm:text-3xl">
            {t("heroSlogan")}
          </p>
          <p className="mt-3 max-w-xl font-serif text-xs italic tracking-[0.12em] text-[#f5ead0]/55">{t("heroEnglish")}</p>
          <div className="my-6 h-px w-56 max-w-[70vw] bg-gradient-to-r from-[#d5b16b] to-transparent" aria-hidden />
          <p className="max-w-xl font-display text-base leading-8 tracking-[0.04em] text-[#f1e3c1] sm:text-lg">{t("heroLead")}</p>
          <p className="mt-3 max-w-xl text-sm leading-7 text-[#f5ead0]/68">{t("heroBody")}</p>
          <p className="mt-5 w-fit border-y border-[#d5b16b]/30 py-2 font-display text-xs tracking-[0.24em] text-[#efd9a4]">{t("heroSign")}</p>

          <div className="mt-7 flex flex-col gap-3 min-[390px]:flex-row min-[390px]:flex-wrap">
            <a href="#analysisForm" className="inline-flex min-h-12 items-center justify-center rounded-full border border-[#e2c985]/35 bg-cinnabar px-6 text-sm font-medium tracking-[0.08em] text-cream shadow-[0_14px_30px_rgba(0,0,0,.2)]">
              {t("start")}
            </a>
            <Link to="/account" className="inline-flex min-h-12 items-center justify-center rounded-full border border-[#e2c985]/35 bg-[#fff9e9]/8 px-6 text-sm text-[#f5ead0]">
              {t("accountAdmin")}
            </Link>
          </div>
        </div>
      </section>

      <section className="grid overflow-hidden rounded-[1.5rem] border border-line/80 bg-cream/72 sm:grid-cols-3" aria-label={t("steps")}>
        {STEPS.map((step, index) => (
          <article key={step.key} className="relative min-h-32 overflow-hidden border-b border-line/70 p-5 last:border-b-0 sm:border-b-0 sm:border-r sm:last:border-r-0">
            <p className="font-display text-3xl text-cinnabar/80">0{index + 1}</p>
            <p className="relative z-10 mt-3 max-w-[14rem] pr-14 font-display text-base leading-7 tracking-[0.03em] text-ink">{t(step.key)}</p>
            <Mark id={step.mark} size={110} className="pointer-events-none absolute -bottom-5 -right-5 w-24 rotate-6 opacity-25" />
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
              <h3 className="mt-5 pr-12 font-display text-lg font-semibold tracking-[0.05em] text-ink">{t(proof.title)}</h3>
              <p className="relative z-10 mt-3 text-sm leading-7 text-ink-soft">{t(proof.body)}</p>
              <Mark id={proof.mark} size={100} className="pointer-events-none absolute -right-5 -top-4 w-24 rotate-6 opacity-20" />
            </article>
          ))}
        </div>
      </section>

      <section className="relative" aria-label={t("formTitle")}>
        <AnalysisForm />
      </section>

      {current ? <ResultView result={current} /> : null}
      {current ? <FollowUpBox result={current} /> : null}

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
