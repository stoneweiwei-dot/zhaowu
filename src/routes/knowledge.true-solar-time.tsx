import { createFileRoute, Link } from "@tanstack/react-router";
import { useI18n } from "@/lib/i18n";
import content from "@/lib/true-solar-time-content.json";

export const Route = createFileRoute("/knowledge/true-solar-time")({ component: TrueSolarTimeArticle });

type Pair = [string, string];
type LocaleKey = "zh-Hant" | "zh-Hans" | "en";

function signed(n: number) {
  return `${n > 0 ? "+" : n < 0 ? "−" : "±"}${Math.abs(n)}`;
}

function utcLabel(offset: number) {
  return `UTC${offset >= 0 ? "+" : "−"}${Math.abs(offset)}`;
}

function TrueSolarTimeArticle() {
  const { locale } = useI18n();
  const key: LocaleKey = locale === "zh-Hant" || locale === "zh-Hans" ? locale : "en";
  const t = content.locales[key];

  return (
    <main className="mx-auto max-w-4xl space-y-5 pb-16" data-true-solar-time-page>
      <article className="seal-border rounded-2xl bg-paper p-5 sm:p-8">
        <p className="text-xs tracking-[0.26em] text-cinnabar">{t.eyebrow}</p>
        <h1 className="mt-3 font-display text-3xl leading-tight text-ink sm:text-4xl">{t.h1}</h1>
        <p className="mt-4 max-w-3xl text-[15px] leading-7 text-ink-soft">{t.lead}</p>
        <p className="mt-3 text-xs leading-6 text-ink-soft">{t.basis}</p>
      </article>

      <section className="seal-border rounded-2xl bg-cream p-5 sm:p-8">
        <h2 className="font-display text-2xl text-ink">{t.what.h}</h2>
        <p className="mt-4 text-[15px] leading-8 text-ink-soft">{t.what.p}</p>
        <ol className="mt-4 space-y-3">
          {(t.what.items as Pair[]).map(([name, text], i) => (
            <li key={name} className="rounded-xl border border-earth/25 bg-paper px-4 py-3">
              <p className="text-sm font-semibold text-ink"><span className="mr-2 text-cinnabar">{i + 1}</span>{name}</p>
              <p className="mt-1 text-[15px] leading-7 text-ink-soft">{text}</p>
            </li>
          ))}
        </ol>
        <p className="mt-4 text-[15px] font-medium leading-8 text-ink">{t.what.after}</p>
      </section>

      <section className="seal-border rounded-2xl bg-paper p-5 sm:p-8">
        <h2 className="font-display text-2xl text-ink">{t.formula.h}</h2>
        <div className="mt-4 space-y-2 overflow-x-auto rounded-xl border border-earth/30 bg-cream px-4 py-4 font-mono text-[13px] leading-7 text-ink sm:text-sm" data-formula>
          {t.formula.lines.map((line) => <p key={line} className="whitespace-pre-wrap break-words">{line}</p>)}
        </div>
        <div className="mt-4 space-y-3 text-[15px] leading-8 text-ink-soft">
          {t.formula.notes.map((note) => <p key={note}>{note}</p>)}
        </div>
      </section>

      <section className="seal-border rounded-2xl bg-cream p-5 sm:p-8">
        <h2 className="font-display text-2xl text-ink">{t.table.h}</h2>
        <p className="mt-3 text-[15px] leading-7 text-ink-soft">{t.table.intro}</p>
        <div className="mt-4 overflow-x-auto rounded-xl border border-earth/25 bg-paper">
          <table className="w-full min-w-[640px] border-collapse text-left text-sm" data-solar-examples>
            <thead>
              <tr className="border-b border-earth/25 text-xs text-ink-soft">
                {t.table.cols.map((col) => <th key={col} scope="col" className="px-3 py-2 font-medium">{col}</th>)}
              </tr>
            </thead>
            <tbody>
              {content.examples.map((row) => (
                <tr key={row.id} className="border-b border-earth/15 last:border-0">
                  <th scope="row" className="px-3 py-2 font-medium text-ink">{row.place[key]}</th>
                  <td className="px-3 py-2 tabular-nums text-ink-soft">{row.civilStamp}</td>
                  <td className="px-3 py-2 tabular-nums text-ink-soft">{utcLabel(row.utcOffset)}</td>
                  <td className="px-3 py-2 tabular-nums text-ink-soft">{signed(row.longitudeMinutes)}</td>
                  <td className="px-3 py-2 tabular-nums text-ink-soft">{signed(row.eotMinutes)}</td>
                  <td className="px-3 py-2 tabular-nums font-semibold text-ink">{signed(row.shiftMinutes)}</td>
                  <td className="px-3 py-2 tabular-nums font-semibold text-cinnabar">{row.trueSolarStamp}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="mt-4 space-y-2 text-sm leading-7 text-ink-soft">
          {t.table.notes.map((note) => <p key={note}>{note}</p>)}
        </div>
      </section>

      <section className="seal-border rounded-2xl bg-paper p-5 sm:p-8">
        <h2 className="font-display text-2xl text-ink">{t.effects.h}</h2>
        <dl className="mt-4 space-y-4">
          {(t.effects.items as Pair[]).map(([name, text]) => (
            <div key={name}>
              <dt className="text-sm font-semibold text-ink">{name}</dt>
              <dd className="mt-1 text-[15px] leading-8 text-ink-soft">{text}</dd>
            </div>
          ))}
        </dl>
      </section>

      <section className="seal-border rounded-2xl bg-cream p-5 sm:p-8">
        <h2 className="font-display text-2xl text-ink">{t.south.h}</h2>
        <div className="mt-4 space-y-4 text-[15px] leading-8 text-ink-soft">
          {t.south.p.map((para) => <p key={para}>{para}</p>)}
        </div>
      </section>

      <section className="seal-border rounded-2xl bg-paper p-5 sm:p-8">
        <h2 className="font-display text-2xl text-ink">{t.limits.h}</h2>
        <dl className="mt-4 space-y-4">
          {(t.limits.items as Pair[]).map(([name, text]) => (
            <div key={name} className="rounded-xl border border-earth/25 bg-cream px-4 py-3">
              <dt className="text-sm font-semibold text-ink">{name}</dt>
              <dd className="mt-1 text-[15px] leading-7 text-ink-soft">{text}</dd>
            </div>
          ))}
        </dl>
      </section>

      <section className="seal-border rounded-2xl bg-cream p-5 sm:p-8" data-faq>
        <h2 className="font-display text-2xl text-ink">{t.faq.h}</h2>
        <div className="mt-4 space-y-4">
          {(t.faq.items as Pair[]).map(([q, a]) => (
            <div key={q}>
              <h3 className="text-base font-semibold text-ink">{q}</h3>
              <p className="mt-1 text-[15px] leading-8 text-ink-soft">{a}</p>
            </div>
          ))}
        </div>
      </section>

      <div className="grid gap-3 sm:grid-cols-2">
        <a href="/#birth-form" className="seal-border flex min-h-14 items-center justify-between rounded-2xl bg-cream px-5 py-4 text-sm text-ink">
          <span>{t.cta.label}</span>
          <span className="text-cinnabar">→</span>
        </a>
        <Link to="/knowledge" className="seal-border flex min-h-14 items-center justify-between rounded-2xl bg-paper px-5 py-4 text-sm text-ink">
          <span>{t.cta.back}</span>
          <span className="text-cinnabar">→</span>
        </Link>
      </div>
    </main>
  );
}
