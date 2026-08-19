import { useEffect, useRef, useState } from "react";
import { useI18n } from "@/lib/i18n";
import { Mark } from "@/components/marks";

const KEY = "zhaowu.intro.v2";
const FADE_MS = 600;

export function IntroGate() {
  const { t } = useI18n();
  const [phase, setPhase] = useState<"off" | "in" | "out">("off");
  const [showText, setShowText] = useState(false);
  const timers = useRef<number[]>([]);

  function clearTimers() {
    timers.current.forEach((id) => window.clearTimeout(id));
    timers.current = [];
  }

  function finish() {
    setPhase("out");
    const id = window.setTimeout(() => {
      setPhase("off");
      try {
        sessionStorage.setItem(KEY, "1");
      } catch {
        /* ignore */
      }
    }, FADE_MS);
    timers.current.push(id);
  }

  function skip() {
    clearTimers();
    finish();
  }

  useEffect(() => {
    if (typeof window === "undefined") return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    try {
      if (sessionStorage.getItem(KEY)) return;
    } catch {
      return;
    }

    setPhase("in");
    const textTimer = window.setTimeout(() => setShowText(true), 1800);
    const endTimer = window.setTimeout(finish, 3800);
    timers.current.push(textTimer, endTimer);
    return () => clearTimers();
  }, []);

  if (phase === "off") return null;

  return (
    <div
      className={`fixed inset-0 z-[80] flex items-center justify-center overflow-hidden bg-[#0d0a08] transition-opacity duration-700 ${phase === "out" ? "pointer-events-none opacity-0" : "opacity-100"}`}
      role="presentation"
      onClick={skip}
      onKeyDown={(e) => {
        if (e.key === "Escape" || e.key === "Enter" || e.key === " ") skip();
      }}
      tabIndex={0}
    >
      <div className="intro-atmosphere" aria-hidden>
        <div className="intro-sky" />
        <div className="intro-sun" />
        <div className="intro-mist" />
        <div className="intro-ridge intro-ridge-b" />
        <div className="intro-ridge intro-ridge-a" />
      </div>

      <div className={`relative z-10 flex flex-col items-center gap-5 px-6 text-center transition-opacity duration-700 ${showText ? "opacity-100" : "opacity-0"}`}>
        <Mark id="brand" size={88} eager className="intro-seal h-20 w-20 text-[#e8c9a0] drop-shadow-lg" />
        <p className="font-display text-4xl tracking-[0.36em] text-[#f7f0e4] drop-shadow">{t("brand")}</p>
        <p className="text-sm tracking-[0.28em] text-[#e8c9a0]">{t("manifesto")}</p>
        <p className="mt-6 text-[11px] tracking-[0.2em] text-white/50">點擊跳過</p>
      </div>
    </div>
  );
}
