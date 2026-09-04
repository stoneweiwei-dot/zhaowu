import { useCallback, useEffect, useRef, useState } from "react";
import { useI18n } from "@/lib/i18n";
import { runBootstrapReadiness } from "@/lib/bootstrap-readiness";
import {
  INTRO_GATE_FADE_MS,
  INTRO_GATE_MIN_VISIBLE_MS,
  scheduleIntroGateHardExit,
} from "@/lib/intro-gate-policy";

const LOTUS_BLOOM_MS = 5000;
const OWNER_LOADING_VIDEO = "/intro/loading-owner-r40.mp4";
const OWNER_LOADING_POSTER = "/intro/loading-owner-r40.jpg";

export function IntroGate() {
  const { locale } = useI18n();
  const [phase, setPhase] = useState<"in" | "leaving" | "off">("in");
  const [minimumDone, setMinimumDone] = useState(false);
  const [runtimeReady, setRuntimeReady] = useState(false);
  const [visualDone, setVisualDone] = useState(false);
  const finishedRef = useRef(false);
  const exitTimerRef = useRef<number | null>(null);

  const forceOff = useCallback(() => {
    if (finishedRef.current && exitTimerRef.current === null) return;
    finishedRef.current = true;
    if (exitTimerRef.current !== null) {
      window.clearTimeout(exitTimerRef.current);
      exitTimerRef.current = null;
    }
    setPhase("off");
  }, []);

  const finish = useCallback(() => {
    if (finishedRef.current) return;
    finishedRef.current = true;
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
    const visualTimer = window.setTimeout(() => {
      if (!cancelled) setVisualDone(true);
    }, LOTUS_BLOOM_MS);
    const cancelHardExit = scheduleIntroGateHardExit(
      window.setTimeout,
      window.clearTimeout,
      () => {
        // Decorative loading art must never block the usable site.
        if (!cancelled) forceOff();
      },
    );

    void runBootstrapReadiness(() => {})
      .then(() => {
        if (!cancelled) setRuntimeReady(true);
      })
      .catch(() => {
        // Do not fade here: bootstrap failure must reveal the already-mounted site immediately.
        if (!cancelled) forceOff();
      });

    return () => {
      cancelled = true;
      window.clearTimeout(minimumTimer);
      window.clearTimeout(visualTimer);
      cancelHardExit();
      if (exitTimerRef.current !== null) {
        window.clearTimeout(exitTimerRef.current);
        exitTimerRef.current = null;
      }
    };
  }, [forceOff]);

  useEffect(() => {
    if (minimumDone && runtimeReady && visualDone) finish();
  }, [finish, minimumDone, runtimeReady, visualDone]);

  if (phase === "off") return null;

  const loadingLabel =
    locale === "en"
      ? "Preparing Zhaowu"
      : locale === "zh-Hans"
        ? "正在准备昭梧"
        : "正在準備昭梧";

  return (
    <div
      className={`zhaowu-lotus-intro fixed inset-0 z-[100] overflow-hidden transition-opacity duration-180 ease-out ${
        phase === "leaving" ? "pointer-events-none opacity-0" : "opacity-100"
      }`}
      role="status"
      aria-live="polite"
      aria-label={loadingLabel}
      data-intro-motion="owner-video"
    >
      <video
        className="zhaowu-lotus-intro__video"
        src={OWNER_LOADING_VIDEO}
        poster={OWNER_LOADING_POSTER}
        autoPlay
        muted
        playsInline
        preload="auto"
        onEnded={() => setVisualDone(true)}
        onError={() => setVisualDone(true)}
      />
    </div>
  );
}