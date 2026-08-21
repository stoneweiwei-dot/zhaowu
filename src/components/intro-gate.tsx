import { useEffect, useRef, useState } from "react";
import { useI18n } from "@/lib/i18n";
import { Mark } from "@/components/marks";
import { useCurrentUserState } from "@/lib/auth/use-current-user";

const KEY = "zhaowu.intro.v4";
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
      const textTimer = window.setTimeout(() => setShowText(true), 520);
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
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_18%_14%,rgba(181,141,72,.12),transparent_25%),radial-gradient(circle_at_88%_82%,rgba(98,111,82,.12),transparent_28%),linear-gradient(rgba(112,84,46,.025)_1px,transparent_1px)] bg-[length:auto,auto,100%_6px]" aria-hidden />
      <div className="pointer-events-none absolute inset-x-[7vw] top-[6vh] h-px bg-[#8f7548]/20" aria-hidden />
      <div className="pointer-events-none absolute inset-x-[7vw] bottom-[6vh] h-px bg-[#8f7548]/20" aria-hidden />

      <div className="relative flex min-h-dvh items-center justify-center px-5 py-5 sm:px-8">
        <div
          className={`relative aspect-[9/16] w-full max-w-[390px] overflow-hidden border border-[#9b8150]/45 bg-[#f5f0e6] shadow-[0_26px_80px_rgba(65,49,31,.18)] transition-all duration-700 ${showText ? "translate-y-0 opacity-100" : "translate-y-2 opacity-0"}`}
        >
          <div className="absolute inset-[10px] border border-[#9b8150]/25" aria-hidden />
          <div className="absolute left-0 top-0 h-24 w-24 bg-[radial-gradient(circle_at_0_0,rgba(192,145,47,.20),transparent_68%)]" aria-hidden />
          <div className="absolute bottom-0 right-0 h-32 w-32 bg-[radial-gradient(circle_at_100%_100%,rgba(87,101,72,.16),transparent_70%)]" aria-hidden />
          <Mark id="brand" size={150} eager className="pointer-events-none absolute -right-4 top-5 w-28 rotate-[7deg] opacity-[0.10]" />
          <Mark id="04" size={110} eager className="pointer-events-none absolute -bottom-5 -left-5 w-24 -rotate-12 opacity-[0.08]" />

          <div className="relative z-10 flex h-full flex-col px-8 pb-7 pt-8 sm:px-10 sm:pt-10">
            <div className="flex items-start justify-between gap-5">
              <div>
                <p className="text-[9px] font-semibold tracking-[0.28em] text-[#8d6d35]">ZHAOWU · 命理 · 時機 · 選擇</p>
                <p className="mt-4 font-display text-[2.9rem] font-semibold leading-none tracking-[0.12em] text-[#28231d]">昭梧</p>
                <p className="mt-3 font-display text-sm tracking-[0.18em] text-[#5f503c]">命運四柱解析報告</p>
              </div>
              <div className="grid h-12 w-12 place-items-center border border-[#8f7548]/45 bg-[#efe5cf] text-center font-display text-xs leading-4 text-[#8a3f2d]">昭<br />梧</div>
            </div>

            <div className="mt-7 border-y border-[#8f7548]/30 py-4">
              <p className="font-display text-[1.08rem] leading-8 tracking-[0.08em] text-[#3e3428]">昭於未見，棲於有梧。</p>
              <p className="mt-1 text-[9px] italic tracking-[0.08em] text-[#8a7a65]">See what lies unseen. Find where you belong.</p>
            </div>

            <div className="mt-7 grid grid-cols-4 gap-2" aria-hidden>
              {["年", "月", "日", "時"].map((label, index) => (
                <div key={label} className="border border-[#9b8150]/25 bg-[#efe8dc]/75 px-1 py-3 text-center">
                  <p className="text-[8px] tracking-[0.2em] text-[#8c7858]">{label}柱</p>
                  <div className={`mx-auto mt-2 grid h-8 w-8 place-items-center rounded-full text-sm ${index === 2 ? "bg-[#2e2b27] text-[#f7f1e5]" : "bg-[#e8ddc6] text-[#594a38]"}`}>{label}</div>
                </div>
              ))}
            </div>

            <div className="mt-7 flex-1 border-t border-[#8f7548]/22 pt-5">
              <p className="text-[9px] tracking-[0.24em] text-[#a04331]">四柱繪意 · PRIVATE EDITION</p>
              <p className="mt-3 max-w-[16rem] font-display text-sm leading-7 tracking-[0.04em] text-[#504536]">命理負責準確，文字負責理解，繪畫負責記憶。</p>
            </div>

            <div className="mt-auto">
              <div className="flex items-center gap-2 text-[9px] tracking-[0.18em] text-[#746854]">
                <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-[#9a7738]" />
                {isPending ? t("introLoadingAuth") : t("introLoadingPage")}
              </div>
              <div className="mt-4 flex items-end justify-between gap-4 border-t border-[#8f7548]/22 pt-3">
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
