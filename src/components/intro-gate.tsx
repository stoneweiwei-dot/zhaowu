import { useCallback, useEffect, useRef, useState } from "react";
import { useI18n } from "@/lib/i18n";
import { runBootstrapReadiness } from "@/lib/bootstrap-readiness";
import {
  INTRO_GATE_FADE_MS,
  INTRO_GATE_MIN_VISIBLE_MS,
  scheduleIntroGateHardExit,
} from "@/lib/intro-gate-policy";

const LOTUS_BLOOM_MS = 2734;
const INTRO_STILL = "/intro/dawn-lotus-r35.jpg";
const INTRO_VIDEO = "/intro/dawn-lotus-r35.mp4";

export function IntroGate() {
  const { locale } = useI18n();
  const [phase, setPhase] = useState<"in" | "leaving" | "off">("in");
  const [minimumDone, setMinimumDone] = useState(false);
  const [runtimeReady, setRuntimeReady] = useState(false);
  const [visualDone, setVisualDone] = useState(false);
  const [videoFailed, setVideoFailed] = useState(false);
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
        // The loading art is decorative. Never let it block the usable site.
        if (!cancelled) forceOff();
      },
    );

    void runBootstrapReadiness(() => undefined)
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
  const slogan =
    locale === "en" ? "See the unseen. Rest where you belong." : "昭于未见，梧有所栖";
  const skipLabel = locale === "en" ? "Skip" : locale === "zh-Hans" ? "跳过" : "跳過";

  return (
    <div
      className={`zhaowu-lotus-intro fixed inset-0 z-[100] overflow-hidden transition-opacity duration-180 ease-out ${
        phase === "leaving" ? "pointer-events-none opacity-0" : "opacity-100"
      }`}
      role="status"
      aria-live="polite"
      aria-label={loadingLabel}
    >
      <img className="zhaowu-lotus-intro__still" src={INTRO_STILL} alt="" aria-hidden draggable={false} />
      {!videoFailed ? (
        <video
          className="zhaowu-lotus-intro__art"
          autoPlay
          muted
          playsInline
          preload="auto"
          poster={INTRO_STILL}
          onError={() => setVideoFailed(true)}
          onLoadedMetadata={(event) => {
            const media = event.currentTarget;
            if (media.duration > 0) {
              media.playbackRate = Math.max(1, media.duration / (LOTUS_BLOOM_MS / 1000));
            }
          }}
        >
          <source src={INTRO_VIDEO} type="video/mp4" />
        </video>
      ) : null}
      <div className="zhaowu-lotus-intro__veil" aria-hidden />
      <div className="zhaowu-lotus-intro__copy">
        <div className="zhaowu-lotus-intro__status">
          <p className="zhaowu-lotus-intro__slogan">{slogan}</p>
          <p>{loadingLabel}</p>
          <small>STONE 原創 · 2026</small>
          <button type="button" className="zhaowu-lotus-intro__skip" onClick={forceOff}>
            {skipLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
