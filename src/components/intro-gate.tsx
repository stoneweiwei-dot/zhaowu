import { useEffect, useRef, useState } from "react";
import { useI18n } from "@/lib/i18n";
import { Mark } from "@/components/marks";
import { useCurrentUserState } from "@/lib/auth/use-current-user";

const KEY = "zhaowu.intro.v3";
const FADE_MS = 520;
const MAX_WAIT_MS = 7000;

export function IntroGate() {
  const { t } = useI18n();
  const { isPending } = useCurrentUserState();
  const [phase, setPhase] = useState<"in" | "out" | "off">("in");
  const [showText, setShowText] = useState(false);
  const [skipRequested, setSkipRequested] = useState(false);
  const [reduced, setReduced] = useState(false);
  const startedAt = useRef(0);
  const seenBefore = useRef(false);
  const timers = useRef<number[]>([]);

  function clearTimers() {
    timers.current.forEach((id) => window.clearTimeout(id));
    timers.current = [];
  }

  function finish() {
    if (phase === "out" || phase === "off") return;
    setPhase("out");
    const id = window.setTimeout(() => {
      setPhase("off");
      try { sessionStorage.setItem(KEY, "1"); } catch { /* ignore */ }
    }, FADE_MS);
    timers.current.push(id);
  }

  useEffect(() => {
    if (typeof window === "undefined") return;
    startedAt.current = performance.now();
    const prefersReduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    setReduced(prefersReduced);
    try { seenBefore.current = sessionStorage.getItem(KEY) === "1"; } catch { seenBefore.current = false; }
    if (prefersReduced || seenBefore.current) setShowText(true);
    else {
      const textTimer = window.setTimeout(() => setShowText(true), 1000);
      timers.current.push(textTimer);
    }
    const maxTimer = window.setTimeout(() => finish(), MAX_WAIT_MS);
    timers.current.push(maxTimer);
    return () => clearTimers();
  }, []);

  useEffect(() => {
    if (phase !== "in" || isPending || typeof window === "undefined") return;
    const domReady = document.readyState !== "loading";
    if (!domReady) return;
    const elapsed = performance.now() - startedAt.current;
    const minWait = skipRequested || reduced || seenBefore.current ? 180 : 1850;
    if (elapsed >= minWait) {
      finish();
      return;
    }
    const id = window.setTimeout(() => finish(), minWait - elapsed);
    timers.current.push(id);
  }, [isPending, phase, reduced, skipRequested]);

  if (phase === "off") return null;

  return (
    <div
      className={`fixed inset-0 z-[80] flex items-center justify-center overflow-hidden bg-[#0d0a08] transition-opacity ${reduced ? "duration-0" : "duration-500"} ${phase === "out" ? "pointer-events-none opacity-0" : "opacity-100"}`}
      role="status"
      aria-live="polite"
      aria-label="昭梧正在載入"
    >
      <div className="intro-atmosphere" aria-hidden>
        <div className="intro-sky" />
        <div className="intro-sun" />
        <div className="intro-mist" />
        <div className="intro-ridge intro-ridge-b" />
        <div className="intro-ridge intro-ridge-a" />
        <div className="intro-crane">⌁</div>
      </div>

      <div className={`relative z-10 flex flex-col items-center gap-5 px-6 text-center transition-opacity duration-700 ${showText ? "opacity-100" : "opacity-0"}`}>
        <Mark id="brand" size={88} eager className="intro-seal h-20 w-20 text-[#e8c9a0] drop-shadow-lg" />
        <p className="font-display text-4xl tracking-[0.36em] text-[#f7f0e4] drop-shadow">{t("brand")}</p>
        <p className="text-sm tracking-[0.24em] text-[#e8c9a0]">{t("manifesto")}</p>
        <div className="mt-2 flex items-center gap-2 text-[10px] tracking-[0.2em] text-white/45">
          <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-[#e8c9a0]" />
          {isPending ? "正在載入帳號與報告資料" : "正在完成頁面準備"}
        </div>
        {!reduced && !skipRequested ? (
          <button type="button" onClick={() => { setSkipRequested(true); setShowText(true); }} className="mt-2 text-[11px] tracking-[0.2em] text-white/50">
            跳過動畫
          </button>
        ) : null}
      </div>
    </div>
  );
}
