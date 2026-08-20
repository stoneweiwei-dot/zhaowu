import { useState, type FormEvent } from "react";
import { Link } from "@tanstack/react-router";
import type { AnalysisResult } from "@/lib/bazi/types";
import { followUpLife } from "@/lib/actions";
import { useCurrentUserState } from "@/lib/auth/use-current-user";
import { useAppStore } from "@/lib/store";
import { useI18n } from "@/lib/i18n";

export function FollowUpBox({ result }: { result: AnalysisResult }) {
  const { t } = useI18n();
  const { user, isPending } = useCurrentUserState();
  const setCurrent = useAppStore((s) => s.setCurrent);
  const [question, setQuestion] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function submit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const q = question.trim();
    if (!q) return;
    setBusy(true);
    setError(null);
    try {
      const next = await followUpLife({ data: { question: q, base: result } });
      setCurrent(next);
      setQuestion("");
      window.setTimeout(() => document.getElementById("result")?.scrollIntoView({ behavior: "smooth", block: "start" }), 30);
    } catch (err) {
      setError(err instanceof Error ? err.message : t("followError"));
    } finally {
      setBusy(false);
    }
  }

  if (isPending) return null;

  if (!user) {
    return (
      <section className="seal-border rounded-xl bg-cream/90 p-5 text-center">
        <p className="font-display text-lg">{t("followTitle")}</p>
        <p className="mt-2 text-sm text-ink-mute">{t("followGuestLead")}</p>
        <Link to="/login" className="mt-4 inline-flex min-h-11 items-center rounded-full border border-line bg-cream px-4 text-sm text-ink">{t("followLogin")}</Link>
      </section>
    );
  }

  return (
    <section className="seal-border rounded-xl bg-cream/95 p-5 sm:p-7">
      <p className="text-xs tracking-[0.28em] text-cinnabar">FOLLOW UP · SAME CHART</p>
      <h2 className="mt-2 font-display text-2xl">{t("followTitle")}</h2>
      <p className="mt-2 text-sm leading-7 text-ink-mute">{t("followLead")}</p>
      <form className="mt-4 flex flex-col gap-3 sm:flex-row" onSubmit={(e) => void submit(e)}>
        <textarea
          value={question}
          onChange={(e) => setQuestion(e.target.value)}
          maxLength={400}
          rows={2}
          placeholder={t("followPh")}
          className="min-h-12 flex-1 resize-y rounded-lg border border-line bg-cream px-4 py-3 text-sm leading-6 outline-none focus:border-cinnabar"
        />
        <button type="submit" disabled={busy || !question.trim()} className="h-12 shrink-0 rounded-full bg-cinnabar px-5 text-sm text-cream disabled:opacity-50">
          {busy ? t("followBusy") : t("followButton")}
        </button>
      </form>
      {error ? <p role="alert" className="mt-3 text-sm text-cinnabar">{error}</p> : null}
    </section>
  );
}
