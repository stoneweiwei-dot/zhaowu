import { useState } from "react";
import { analyzeLife, consumeQuestionAccess } from "@/lib/actions";
import { useAppStore } from "@/lib/store";

export function FollowUpBox() {
  const current = useAppStore((s) => s.current);
  const lastInput = useAppStore((s) => s.lastInput);
  const setCurrent = useAppStore((s) => s.setCurrent);
  const setLastInput = useAppStore((s) => s.setLastInput);
  const [question, setQuestion] = useState("");
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);
  if (!current || !lastInput) return null;

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!question.trim()) return;
    setBusy(true); setMsg(null);
    try {
      await consumeQuestionAccess();
      const input = { ...lastInput, question: question.trim() };
      const result = await analyzeLife({ data: input });
      setLastInput(input);
      setCurrent(result);
      setQuestion("");
      window.setTimeout(() => document.getElementById("result")?.scrollIntoView({ behavior: "smooth", block: "start" }), 30);
    } catch (err) {
      const text = err instanceof Error ? err.message : String(err);
      setMsg(text === "QUESTION_LIMIT" ? "今天免费的 2 次提问已经用完。" : text);
    } finally { setBusy(false); }
  }

  return (
    <section className="seal-border rounded-xl bg-cream/95 p-5 sm:p-7">
      <p className="text-xs tracking-[0.28em] text-cinnabar">继续问这张盘</p>
      <p className="mt-2 text-sm leading-7 text-ink-soft">出生资料不用重填。这里只替换问题，仍然沿用同一张命盘。</p>
      <form className="mt-4 flex flex-col gap-3 sm:flex-row" onSubmit={submit}>
        <input value={question} onChange={(e) => setQuestion(e.target.value)} maxLength={400} placeholder="继续问一个具体问题…" className="h-11 flex-1 rounded-full border border-line bg-cream px-4 text-sm outline-none focus:border-cinnabar" />
        <button disabled={busy} className="h-11 rounded-full bg-ink px-5 text-sm text-cream disabled:opacity-60">{busy ? "分析中…" : "继续问"}</button>
      </form>
      {msg ? <p className="mt-3 text-sm text-cinnabar">{msg}</p> : null}
    </section>
  );
}
