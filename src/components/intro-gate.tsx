import { useCallback, useEffect, useRef, useState } from "react";
import { useI18n } from "@/lib/i18n";
import { runBootstrapReadiness } from "@/lib/bootstrap-readiness";
import {
  INTRO_GATE_FADE_MS,
  INTRO_GATE_MIN_VISIBLE_MS,
  scheduleIntroGateHardExit,
} from "@/lib/intro-gate-policy";

const POSTER_SRC = "/intro/loading-poster.jpg?v=20260824-motion";

export function IntroGate() {
  const { locale } = useI18n();
  const [phase, setPhase] = useState<"in" | "leaving" | "off">("in");
  const [percent, setPercent] = useState(4);
  const [minimumDone, setMinimumDone] = useState(false);
  const [runtimeReady, setRuntimeReady] = useState(false);
  const finishedRef = useRef(false);
  const exitTimerRef = useRef<number | null>(null);

  const forceOff = useCallback(() => {
    if (finishedRef.current && exitTimerRef.current === null) return;
    finishedRef.current = true;
    if (exitTimerRef.current !== null) {
      window.clearTimeout(exitTimerRef.current);
      exitTimerRef.current = null;
    }
    setPercent(100);
    setPhase("off");
  }, []);

  const finish = useCallback(() => {
    if (finishedRef.current) return;
    finishedRef.current = true;
    setPercent(100);
    setPhase("leaving");
    exitTimerRef.current = window.setTimeout(() => {
      exitTimerRef.current = null;
      setPhase("off");
    }, INTRO_GATE_FADE_MS);
  }, []);

  useEffect(() => {
    let cancelled = false;
    const minimumTimer = window.setTimeout(() => {
      if (!cancelled) setMinimumDone(true);
    }, INTRO_GATE_MIN_VISIBLE_MS);
    const cancelHardExit = scheduleIntroGateHardExit(
      window.setTimeout,
      window.clearTimeout,
      () => {
        // Do not fade here: the blocking overlay must be fully gone before 3 seconds.
        if (!cancelled) forceOff();
      },
    );

    void runBootstrapReadiness((progress) => {
      if (cancelled) return;
      setPercent(Math.min(96, Math.max(4, progress.percent)));
    })
      .then(() => {
        if (!cancelled) setRuntimeReady(true);
      })
      .catch(() => {
        // Failed data/auth/runtime warm-up degrades immediately to the usable page.
        if (!cancelled) forceOff();
      });

    return () => {
      cancelled = true;
      window.clearTimeout(minimumTimer);
      cancelHardExit();
      if (exitTimerRef.current !== null) {
        window.clearTimeout(exitTimerRef.current);
        exitTimerRef.current = null;
      }
    };
  }, [forceOff]);

  useEffect(() => {
    if (minimumDone && runtimeReady) finish();
  }, [finish, minimumDone, runtimeReady]);

  if (phase === "off") return null;

  const loadingLabel = locale === "en" ? "Preparing Zhaowu" : locale === "zh-Hans" ? "正在准备昭梧" : "正在準備昭梧";

  return (
    <div
      className={`fixed inset-0 z-[100] overflow-hidden bg-[#11150f] transition-opacity duration-150 ease-out ${phase === "leaving" ? "pointer-events-none opacity-0" : "opacity-100"}`}
      role="status"
      aria-live="polite"
      aria-label={loadingLabel}
    >
      <img src={POSTER_SRC} alt="" aria-hidden className="intro-media intro-poster" draggable={false} />
      <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(180deg,rgba(12,14,10,.16)_0%,rgba(12,14,10,.05)_42%,rgba(12,14,10,.48)_100%)]" />
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_50%_16%,rgba(255,238,186,.13),transparent_34%)] mix-blend-screen" />

      <div className="relative z-10 mx-auto flex min-h-dvh w-full max-w-[430px] flex-col px-6 pb-[max(34px,env(safe-area-inset-bottom))] pt-[max(34px,env(safe-area-inset-top))] text-center text-[#fff8df]">
        <div>
          <p className="text-[11px] tracking-[0.48em] text-[#f0dfb4]">Z H A O W U</p>
          <p className="mt-2 text-[9px] tracking-[0.34em] text-[#d7c69c]">DESTINY · TIMING · CHOICE</p>
        </div>

        <div className="mt-auto pb-4">
          <div className="mx-auto h-[3px] w-36 overflow-hidden rounded-full bg-white/20">
            <div
              className="h-full rounded-full bg-[#f0d99c] transition-[width] duration-300 ease-out"
              style={{ width: `${percent}%` }}
            />
          </div>
          <p className="mt-4 font-display text-[15px] tracking-[0.18em] text-[#fff7df]">{loadingLabel}</p>
          <p className="mt-2 text-[10px] tabular-nums tracking-[0.18em] text-[#d7c69c]">{percent}%</p>
          <p className="mt-4 text-[9px] tracking-[0.22em] text-[#cbbb96]">STONE 原創 · 2026</p>
        </div>
      </div>
    </div>
  );
}
