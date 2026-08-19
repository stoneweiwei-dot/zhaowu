import { useState, type FormEvent } from "react";
import { Link } from "@tanstack/react-router";
import type { AnalysisResult } from "@/lib/bazi/types";
import { followUpLife } from "@/lib/actions";
import { useCurrentUserState } from "@/lib/auth/use-current-user";
import { useAppStore } from "@/lib/store";

export function FollowUpBox({ result }: { result: AnalysisResult }) {
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
      setError(err instanceof Error ? err.message : "續問失敗。");
    } finally {
      setBusy(false);
    }
  }

  if (isPending) return null;

  if (!user) {
    return (
      <section className="seal-border rounded-xl bg-cream/90 p-5 text-center">
        <p className="font-display text-lg">繼續問這張盤</p>
        <p className="mt-2 text-sm text-ink-mute">登入後可沿用同一張命盤追問，不需要重新填出生資料。</p>
        <Link to="/login" className="mt-4 inline-flex h-10 items-center rounded-full border border-line bg-cream px-4 text-sm text-ink">登入後續問</Link>
      </section>
    );
  }

  return (
    <section className="seal-border rounded-xl bg-cream/95 p-5 sm:p-7">
      <p className="text-xs tracking-[0.28em] text-cinnabar">FOLLOW UP · SAME CHART</p>
      <h2 className="mt-2 font-display text-2xl">繼續問這張盤</h2>
      <p className="mt-2 text-sm leading-7 text-ink-mute">四柱、月令、真太陽時與大運沿用目前這張盤，只重新判斷你的新問題。</p>
      <form className="mt-4 flex flex-col gap-3 sm:flex-row" onSubmit={(e) => void submit(e)}>
        <textarea
          value={question}
          onChange={(e) => setQuestion(e.target.value)}
          maxLength={400}
          rows={2}
          placeholder="例如：那我現在應該先換工作，還是先把手上的事做完？"
          className="min-h-12 flex-1 resize-y rounded-lg border border-line bg-cream px-4 py-3 text-sm leading-6 outline-none focus:border-cinnabar"
        />
        <button type="submit" disabled={busy || !question.trim()} className="h-12 shrink-0 rounded-full bg-cinnabar px-5 text-sm text-cream disabled:opacity-50">
          {busy ? "分析中…" : "繼續問"}
        </button>
      </form>
      {error ? <p className="mt-3 text-sm text-cinnabar">{error}</p> : null}
    </section>
  );
}
