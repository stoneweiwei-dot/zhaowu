import { useEffect, useRef, useState } from "react";
import { BrandSeal } from "@/components/brand-seal";
import { useI18n } from "@/lib/i18n";
import { useCurrentUserState } from "@/lib/auth/use-current-user";

const KEY = "zhaowu.intro.v6";
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
    clearTimers();
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
      const textTimer = window.setTimeout(() => setShowText(true), 420);
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
      className={`fixed inset-0 z-[80] overflow-hidden bg-[#eee8dc] transition-opacity ${reduced ? "duration-0" : "duration-500"} ${phase === "out" ? "pointer-events-none opacity-0" : "opacity-100"}`}
      role="status"
      aria-live="polite"
      aria-label={t("introAria")}
    >
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_50%_18%,rgba(181,141,72,.13),transparent_28%),linear-gradient(rgba(112,84,46,.022)_1px,transparent_1px)] bg-[length:auto,100%_7px]" aria-hidden />

      <div className="relative flex min-h-dvh items-center justify-center px-5 py-5 sm:px-8">
        <div
          className={`relative aspect-[9/16] w-full max-w-[390px] overflow-hidden border border-[#9b8150]/45 bg-[#f6f1e7] shadow-[0_26px_80px_rgba(65,49,31,.16)] transition-all duration-700 ${showText ? "translate-y-0 opacity-100" : "translate-y-2 opacity-0"}`}
        >
          <div className="absolute inset-[10px] border border-[#9b8150]/24" aria-hidden />
          <div className="absolute inset-x-8 top-8 h-px bg-[#9b8150]/28" aria-hidden />
          <div className="absolute inset-x-8 bottom-8 h-px bg-[#9b8150]/28" aria-hidden />

          <div className="relative z-10 flex h-full flex-col items-center px-8 pb-8 pt-12 text-center sm:px-10">
            <p className="text-[9px] font-semibold tracking-[0.30em] text-[#8d6d35]">ZHAOWU · PRIVATE EDITION</p>

            <BrandSeal size="lg" decorative className="mt-9" />

            <h1 className="mt-6 font-display text-[3.25rem] font-semibold leading-none tracking-[0.16em] text-[#28231d]">昭梧</h1>
            <p className="mt-4 font-display text-base tracking-[0.16em] text-[#5f503c]">命運四柱解析報告</p>

            <div className="mt-7 w-full border-y border-[#8f7548]/28 py-5">
              <p className="font-display text-[1.05rem] leading-8 tracking-[0.08em] text-[#3e3428]">昭於未見，棲於有梧。</p>
              <p className="mt-2 text-[9px] italic tracking-[0.08em] text-[#8a7a65]">See what lies unseen. Find where you belong.</p>
            </div>

            <div className="mt-8 text-[10px] tracking-[0.30em] text-[#78664b]" aria-label="四柱结构">
              年柱 · 月柱 · 日柱 · 時柱
            </div>

            <div className="mt-8">
              <p className="text-[9px] tracking-[0.24em] text-[#a04331]">四柱繪意</p>
              <p className="mt-3 font-display text-sm leading-7 tracking-[0.04em] text-[#504536]">命理負責準確，文字負責理解，繪畫負責記憶。</p>
            </div>

            <div className="mt-auto w-full">
              <div className="flex items-center justify-center gap-2 text-[9px] tracking-[0.18em] text-[#746854]">
                <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-[#9a7738]" />
                {isPending ? t("introLoadingAuth") : t("introLoadingPage")}
              </div>
              <div className="mt-5 flex items-end justify-between gap-4 border-t border-[#8f7548]/22 pt-3">
                <p className="text-[8px] tracking-[0.18em] text-[#9b8a72]">9:16 · iPhone 收藏版</p>
                <p className="font-display text-[9px] tracking-[0.16em] text-[#8a3f2d]">STONE 原創</p>
              </div>
              {!reduced && !skipRequested ? (
                <button type="button" onClick={() => { setSkipRequested(true); setShowText(true); }} className="mt-3 text-[9px] tracking-[0.16em] text-[#9b8a72]">
                  {t("introSkip")}
                </button>
              ) : null}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
