import { useCallback, useEffect, useRef, useState } from "react";
import { useI18n } from "@/lib/i18n";
import { useCurrentUserState } from "@/lib/auth/use-current-user";
import { runBootstrapReadiness } from "@/lib/bootstrap-readiness";

/** v14：預設播完一輪再進站；可選循環（站點預設片，不耗 token） */
const KEY = "zhaowu.intro.v14";
/** 與加速後影片長度對齊；僅作進度參考，真正進站以影片播完為準 */
const MIN_HOLD_FIRST_MS = 6200;
const MIN_HOLD_REPEAT_MS = 4500;
const SLOW_NOTICE_MS = 10000;
/** 優先新加速片；若尚未上傳則回退舊片 */
const VIDEO_SRC_PRIMARY = "/intro/loading-v11.mp4";
const VIDEO_SRC_FALLBACK = "/intro/loading-v10.mp4";
const POSTER_SRC = "/intro/loading-poster.jpg";

export function IntroGate() {
  const { t, locale } = useI18n();
  const { isPending } = useCurrentUserState();
  const [phase, setPhase] = useState<"in" | "leaving" | "off">("in");
  const [percent, setPercent] = useState(0);
  const [label, setLabel] = useState("正在啟動昭梧");
  const [bootReady, setBootReady] = useState(false);
  const [bootPercent, setBootPercent] = useState(0);
  const [videoReady, setVideoReady] = useState(false);
  const [videoComplete, setVideoComplete] = useState(false);
  const [mediaFailed, setMediaFailed] = useState(false);
  const [bootError, setBootError] = useState<string | null>(null);
  const [reduced, setReduced] = useState(false);
  const [slow, setSlow] = useState(false);
  const [attempt, setAttempt] = useState(0);
  const [holdDone, setHoldDone] = useState(false);
  /** 使用者選擇持續循環站點預設開場片，不自動進主頁 */
  const [ambientLoop, setAmbientLoop] = useState(false);
  const [videoSrc, setVideoSrc] = useState(VIDEO_SRC_PRIMARY);
  const startedAt = useRef(0);
  const holdTarget = useRef(MIN_HOLD_FIRST_MS);
  const bootPercentRef = useRef(0);
  const videoTimeRef = useRef(0);
  const videoDurationRef = useRef(0);
  const ambientLoopRef = useRef(false);
  const finishTimer = useRef<number | null>(null);
  const raf = useRef<number | null>(null);
  const videoRef = useRef<HTMLVideoElement | null>(null);

  useEffect(() => {
    bootPercentRef.current = bootPercent;
  }, [bootPercent]);

  useEffect(() => {
    ambientLoopRef.current = ambientLoop;
  }, [ambientLoop]);

  const clearTimers = useCallback(() => {
    if (finishTimer.current !== null) {
      window.clearTimeout(finishTimer.current);
      finishTimer.current = null;
    }
    if (raf.current !== null) {
      window.cancelAnimationFrame(raf.current);
      raf.current = null;
    }
  }, []);

  const finish = useCallback(() => {
    clearTimers();
    try {
      sessionStorage.setItem(KEY, "1");
    } catch {
      /* ignore */
    }
    setPhase("leaving");
    window.setTimeout(() => setPhase("off"), 420);
  }, [clearTimers]);

  const skip = useCallback(() => {
    ambientLoopRef.current = false;
    setAmbientLoop(false);
    finish();
  }, [finish]);

  const enableLoop = useCallback(() => {
    ambientLoopRef.current = true;
    setAmbientLoop(true);
    setPercent(100);
    setVideoComplete(true);
    setHoldDone(true);
    const el = videoRef.current;
    if (el) {
      el.loop = true;
      el.muted = true;
      void el.play().catch(() => undefined);
    }
  }, []);

  useEffect(() => {
    if (typeof window === "undefined") return;
    startedAt.current = performance.now();
    const prefersReduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    setReduced(prefersReduced);

    let seen = false;
    try {
      seen = sessionStorage.getItem(KEY) === "1";
    } catch {
      seen = false;
    }
    holdTarget.current = prefersReduced ? 2800 : seen ? MIN_HOLD_REPEAT_MS : MIN_HOLD_FIRST_MS;

    const slowTimer = window.setTimeout(() => setSlow(true), SLOW_NOTICE_MS);

    const tick = () => {
      if (ambientLoopRef.current) {
        setPercent(100);
        raf.current = window.requestAnimationFrame(tick);
        return;
      }

      const elapsed = performance.now() - startedAt.current;
      const target = holdTarget.current;
      const vDur = videoDurationRef.current;
      const vTime = videoTimeRef.current;

      const timeRatio = Math.min(1, elapsed / target);
      const videoRatio = vDur > 0 ? Math.min(1, vTime / Math.max(0.1, vDur * 0.98)) : 0;
      const ceremonyRatio = Math.max(timeRatio * 0.35, videoRatio);
      const blended = ceremonyRatio * 92 + Math.min(bootPercentRef.current, 100) * 0.08;
      setPercent(Math.min(99, Math.round(blended)));

      // 預設：必須接近片尾才算 hold 完成（不是純計時秒關）
      const videoOk = vDur > 0 && vTime >= Math.max(1, vDur - 0.15);
      const timeFallback = prefersReduced || (vDur <= 0 && elapsed >= target);
      if (videoOk || timeFallback) {
        setHoldDone(true);
        if (videoOk) setVideoComplete(true);
      }

      raf.current = window.requestAnimationFrame(tick);
    };
    raf.current = window.requestAnimationFrame(tick);

    return () => {
      window.clearTimeout(slowTimer);
      if (raf.current !== null) window.cancelAnimationFrame(raf.current);
    };
  }, []);

  useEffect(() => {
    let cancelled = false;
    setBootError(null);
    setBootReady(false);
    setBootPercent(0);

    void runBootstrapReadiness((progress) => {
      if (cancelled) return;
      setBootPercent(progress.percent);
      setLabel(progress.label);
    })
      .then(() => {
        if (!cancelled) {
          setBootReady(true);
          setBootPercent(100);
          setLabel(locale === "en" ? "Ready" : locale === "zh-Hans" ? "准备完成" : "準備完成");
        }
      })
      .catch((error: unknown) => {
        if (cancelled) return;
        const message = error instanceof Error ? error.message : "啟動檢查未完成。";
        setBootError(message);
        setLabel(
          locale === "en" ? "Waiting for services" : locale === "zh-Hans" ? "等待关键服务就绪" : "等待關鍵服務就緒",
        );
      });

    return () => {
      cancelled = true;
    };
  }, [attempt, locale]);

  useEffect(() => {
    if (phase !== "in") return;
    // 循環模式下永不自動進站
    if (ambientLoop) return;

    if (bootError) {
      if (!holdDone) return;
      setPercent(100);
      clearTimers();
      finishTimer.current = window.setTimeout(finish, 320);
      return clearTimers;
    }

    const mediaGate = reduced || mediaFailed || videoReady;
    // 預設：影片（或降動態）播完一輪 + 後台就緒才進站
    if (!holdDone || !bootReady || isPending || !mediaGate) return;
    if (!reduced && !mediaFailed && !videoComplete) return;

    setPercent(100);
    clearTimers();
    finishTimer.current = window.setTimeout(finish, 360);
    return clearTimers;
  }, [
    ambientLoop,
    bootError,
    bootReady,
    clearTimers,
    finish,
    holdDone,
    isPending,
    mediaFailed,
    phase,
    reduced,
    videoComplete,
    videoReady,
  ]);

  if (phase === "off") return null;

  const skipLabel = locale === "en" ? "Skip" : locale === "zh-Hans" ? "跳过" : "跳過";
  const loopLabel = ambientLoop
    ? locale === "en"
      ? "Looping"
      : locale === "zh-Hans"
        ? "循环中"
        : "循環中"
    : locale === "en"
      ? "Loop"
      : locale === "zh-Hans"
        ? "循环"
        : "循環";
  const enterLabel = locale === "en" ? "Enter" : locale === "zh-Hans" ? "进入" : "進入";

  return (
    <div
      className={`fixed inset-0 z-[90] overflow-hidden bg-[#0f1410] transition-opacity duration-[420ms] ease-out ${phase === "leaving" ? "opacity-0" : "opacity-100"}`}
      role="status"
      aria-live="polite"
      aria-label={t("introAria")}
    >
      <div className="absolute inset-0 bg-[#121812]" aria-hidden>
        <img
          src={POSTER_SRC}
          alt=""
          className="absolute inset-0 h-full w-full object-cover"
          draggable={false}
        />
        {!reduced ? (
          <video
            ref={videoRef}
            className="absolute inset-0 h-full w-full object-cover"
            src={videoSrc}
            poster={POSTER_SRC}
            autoPlay
            muted
            playsInline
            preload="auto"
            loop={ambientLoop}
            style={{ opacity: 1 }}
            onLoadedMetadata={() => {
              const el = videoRef.current;
              if (el && Number.isFinite(el.duration) && el.duration > 0) {
                videoDurationRef.current = el.duration;
              }
            }}
            onCanPlay={() => {
              setVideoReady(true);
              const el = videoRef.current;
              if (el) {
                el.muted = true;
                el.playbackRate = 1;
                el.loop = ambientLoopRef.current;
                void el.play().catch(() => undefined);
              }
            }}
            onLoadedData={() => {
              setVideoReady(true);
              const el = videoRef.current;
              if (el) void el.play().catch(() => undefined);
            }}
            onTimeUpdate={() => {
              const el = videoRef.current;
              if (!el) return;
              videoTimeRef.current = el.currentTime || 0;
              if (Number.isFinite(el.duration) && el.duration > 0) {
                videoDurationRef.current = el.duration;
              }
            }}
            onEnded={() => {
              // 循環模式：由 video.loop 接手，不進站
              if (ambientLoopRef.current) {
                const el = videoRef.current;
                if (el) {
                  el.currentTime = 0;
                  void el.play().catch(() => undefined);
                }
                return;
              }
              setVideoComplete(true);
              setHoldDone(true);
              const el = videoRef.current;
              if (el && Number.isFinite(el.duration)) {
                videoTimeRef.current = el.duration;
              }
            }}
            onError={() => {
              if (videoSrc === VIDEO_SRC_PRIMARY) {
                setVideoSrc(VIDEO_SRC_FALLBACK);
                setVideoReady(false);
                setMediaFailed(false);
                return;
              }
              setMediaFailed(true);
            }}
          />
        ) : (
          <div className="h-full w-full bg-[radial-gradient(circle_at_50%_18%,#f3d98f_0%,#8fa18a_34%,#314039_68%,#182019_100%)]" />
        )}
        <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(180deg,rgba(8,12,10,.16)_0%,rgba(8,12,10,.06)_42%,rgba(8,12,10,.4)_100%)]" />
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_50%_16%,rgba(255,239,179,.12),transparent_34%)] mix-blend-screen" />
      </div>

      <div className="absolute bottom-[max(18px,env(safe-area-inset-bottom))] right-[max(16px,env(safe-area-inset-right))] z-20 flex items-center gap-2">
        <button
          type="button"
          onClick={enableLoop}
          aria-pressed={ambientLoop}
          className={`rounded-full border px-4 py-2 text-[11px] tracking-[0.18em] backdrop-blur-sm ${ambientLoop ? "border-[#f0dfb4]/7 bg-[#f0dfb4]/2 text-[#fff6d8]" : "border-[#f0dfb4]/4 bg-[#152018]/6 text-[#f7edd0]"}`}
        >
          {loopLabel}
        </button>
        {ambientLoop ? (
          <button
            type="button"
            onClick={skip}
            className="rounded-full border border-[#f0dfb4]/55 bg-[#1a261c]/75 px-4 py-2 text-[11px] tracking-[0.18em] text-[#fff6d8] backdrop-blur-sm"
          >
            {enterLabel}
          </button>
        ) : (
          <button
            type="button"
            onClick={skip}
            className="rounded-full border border-[#f0dfb4]/4 bg-[#152018]/6 px-4 py-2 text-[11px] tracking-[0.22em] text-[#f7edd0] backdrop-blur-sm"
          >
            {skipLabel}
          </button>
        )}
      </div>

      <div className="relative z-10 mx-auto flex min-h-dvh w-full max-w-[430px] flex-col px-6 pb-[max(56px,env(safe-area-inset-bottom))] pt-[max(36px,env(safe-area-inset-top))] text-center text-[#fff9e8]">
        <div className="pt-2">
          <p className="text-[11px] tracking-[0.48em] text-[#f0dfb4]">Z H A O W U</p>
          <p className="mt-2 text-[9px] tracking-[0.34em] text-[#d9c89d]">DESTINY · TIMING · CHOICE</p>
        </div>

        <div className="mt-[10vh] rounded-[28px] border border-[#f8e7bb]/18 bg-[#172018]/2 px-5 py-6 shadow-[0_18px_60px_rgba(0,0,0,.12)]">
          <h1 className="font-display text-[clamp(1.75rem,8vw,2.55rem)] leading-[1.35] tracking-[0.04em] text-[#fff8de]">
            昭於未見，梧於有歸。
          </h1>
          <div className="mx-auto mt-5 h-px w-24 bg-[#e9d39b]/75" />
          <div className="mt-5 space-y-2 font-display text-[15px] tracking-[0.12em] text-[#fff7df]">
            <p>命理不是宿命</p>
            <p>運勢不是答案</p>
            <p>選擇才是開始</p>
          </div>
          <p className="mt-5 font-serif text-[13px] italic tracking-[0.04em] text-[#eadcb8]">See the unseen. Find your ground.</p>
        </div>

        <div className="mt-auto pb-3">
          <div
            className="mx-auto flex h-[104px] w-[104px] items-center justify-center rounded-full p-[5px] shadow-[0_0_42px_rgba(241,205,116,.2)]"
            style={{
              background: `conic-gradient(rgba(248,223,155,.98) ${percent * 3.6}deg, rgba(255,255,255,.16) 0deg)`,
            }}
          >
            <div className="flex h-full w-full items-center justify-center rounded-full bg-[#1a211a]/72 ring-1 ring-[#f5dfaa]/2">
              <span className="font-display text-[28px] tabular-nums text-[#fff6dc]">
                {percent}
                <span className="ml-0.5 text-sm">%</span>
              </span>
            </div>
          </div>

          <p className="mt-5 font-display text-[17px] tracking-[0.16em] text-[#fff7e5]">
            {ambientLoop
              ? locale === "en"
                ? "Ambient opening"
                : locale === "zh-Hans"
                  ? "循环开场"
                  : "循環開場"
              : locale === "en"
                ? "Opening"
                : locale === "zh-Hans"
                  ? "正在开启"
                  : "正在開啟"}
          </p>
          <p className="mt-2 min-h-5 text-[11px] tracking-[0.12em] text-[#e2d5b6]">
            {ambientLoop
              ? locale === "en"
                ? "Site default video · no token used"
                : locale === "zh-Hans"
                  ? "网站默认开场片 · 不消耗 token"
                  : "網站預設開場片 · 不消耗 token"
              : isPending
                ? locale === "en"
                  ? "Checking account"
                  : locale === "zh-Hans"
                    ? "正在确认账号状态"
                    : "正在確認帳號狀態"
                : label}
          </p>
          <p className="mt-2 text-[9px] tracking-[0.14em] text-[#cabd9e]">
            {ambientLoop
              ? locale === "en"
                ? "Looping · tap Enter when ready"
                : locale === "zh-Hans"
                  ? "持续循环中 · 想进站再点「进入」"
                  : "持續循環中 · 想進站再點「進入」"
              : locale === "en"
                ? videoComplete
                  ? "Ready to enter"
                  : "Plays once, then enters — or Skip / Loop"
                : locale === "zh-Hans"
                  ? videoComplete
                    ? "开场完成"
                    : "默认播完一轮进站 · 可跳过或循环"
                  : videoComplete
                    ? "開場完成"
                    : "預設播完一輪進站 · 可跳過或循環"}
          </p>

          {bootError && !ambientLoop ? (
            <div className="mt-4 rounded-2xl border border-[#f1d8a2]/35 bg-[#1a211a]/62 px-4 py-3 text-[11px] text-[#f4e5c1]">
              <p>{bootError}</p>
              <button
                type="button"
                onClick={() => {
                  setSlow(false);
                  setAttempt((value) => value + 1);
                }}
                className="mt-2 rounded-full border border-[#edd7a3]/45 px-4 py-2 tracking-[0.12em] text-[#fff3d1]"
              >
                {locale === "en" ? "Retry" : locale === "zh-Hans" ? "重新连接" : "重新連接"}
              </button>
            </div>
          ) : slow && !ambientLoop && (!bootReady || isPending) ? (
            <p className="mt-4 text-[10px] tracking-[0.08em] text-[#ead7aa]">
              {locale === "en"
                ? "Still connecting core services…"
                : locale === "zh-Hans"
                  ? "仍在连接关键服务…"
                  : "仍在連接關鍵服務…"}
            </p>
          ) : null}

          <div className="mx-auto mt-5 h-px w-40 bg-[#ecd9a8]/4" />
          <p className="mt-3 text-[9px] tracking-[0.22em] text-[#d4c39f]">STONE 原創 · 2026</p>
        </div>
      </div>
    </div>
  );
}
