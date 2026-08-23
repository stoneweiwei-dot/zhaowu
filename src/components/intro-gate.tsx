import { useCallback, useEffect, useRef, useState } from "react";
import { useI18n } from "@/lib/i18n";
import { useCurrentUserState } from "@/lib/auth/use-current-user";
import { runBootstrapReadiness } from "@/lib/bootstrap-readiness";

/** v12：重置舊 session，避免被舊邏輯秒關 */
const KEY = "zhaowu.intro.v12";
/** 影片實測約 6.0s，首次至少播到接近片尾 */
const MIN_HOLD_FIRST_MS = 6200;
/** 重訪仍至少看一段，禁止 1 秒閃進 */
const MIN_HOLD_REPEAT_MS = 4500;
const SLOW_NOTICE_MS = 10000;
const VIDEO_SRC = "/intro/loading-v10.mp4";
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
  const startedAt = useRef(0);
  const holdTarget = useRef(MIN_HOLD_FIRST_MS);
  const bootPercentRef = useRef(0);
  const videoTimeRef = useRef(0);
  const videoDurationRef = useRef(0);
  const finishTimer = useRef<number | null>(null);
  const raf = useRef<number | null>(null);
  const videoRef = useRef<HTMLVideoElement | null>(null);

  useEffect(() => {
    bootPercentRef.current = bootPercent;
  }, [bootPercent]);

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
    window.setTimeout(() => setPhase("off"), 480);
  }, [clearTimers]);

  const skip = useCallback(() => {
    finish();
  }, [finish]);

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
    // 減少動態：仍給靜態開場，但不播影片
    holdTarget.current = prefersReduced ? 2800 : seen ? MIN_HOLD_REPEAT_MS : MIN_HOLD_FIRST_MS;

    const slowTimer = window.setTimeout(() => setSlow(true), SLOW_NOTICE_MS);

    const tick = () => {
      const elapsed = performance.now() - startedAt.current;
      const target = holdTarget.current;
      const vDur = videoDurationRef.current;
      const vTime = videoTimeRef.current;

      // 進度：時間 + 影片進度雙軌，避免一下跳滿
      const timeRatio = Math.min(1, elapsed / target);
      const videoRatio = vDur > 0 ? Math.min(1, vTime / Math.max(0.1, vDur * 0.92)) : 0;
      const ceremonyRatio = Math.max(timeRatio, videoRatio * 0.95);
      const blended = ceremonyRatio * 90 + Math.min(bootPercentRef.current, 100) * 0.1;
      setPercent(Math.min(99, Math.round(blended)));

      // 完成條件：時間到 或 影片播到接近結尾
      const timeOk = elapsed >= target;
      const videoOk = vDur > 0 && vTime >= Math.max(1, vDur - 0.2);
      if (timeOk || videoOk) {
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

    // 有錯誤時仍允許在最短開場後進頁，避免卡死
    if (bootError) {
      if (!holdDone) return;
      setPercent(100);
      clearTimers();
      finishTimer.current = window.setTimeout(finish, 320);
      return clearTimers;
    }

    // 正常：開場必須走完（時間或影片近結尾）+ 後台就緒 + 非 pending
    // 影片失敗時改走純時間 hold，不秒關
    const mediaGate = reduced || mediaFailed || videoReady;
    if (!holdDone || !bootReady || isPending || !mediaGate) return;

    setPercent(100);
    clearTimers();
    finishTimer.current = window.setTimeout(finish, 360);
    return clearTimers;
  }, [
    bootError,
    bootReady,
    clearTimers,
    finish,
    holdDone,
    isPending,
    mediaFailed,
    phase,
    reduced,
    videoReady,
  ]);

  if (phase === "off") return null;

  const skipLabel = locale === "en" ? "Skip" : locale === "zh-Hans" ? "跳过" : "跳過";

  return (
    <div
      className={`fixed inset-0 z-[90] overflow-hidden bg-[#0f1410] transition-opacity duration-[480ms] ease-out ${phase === "leaving" ? "opacity-0" : "opacity-100"}`}
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
            src={VIDEO_SRC}
            poster={POSTER_SRC}
            autoPlay
            muted
            playsInline
            preload="auto"
            loop={false}
            // 始終可見，避免 opacity 0 導致「只閃一下」
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
              setVideoComplete(true);
              setHoldDone(true);
              const el = videoRef.current;
              if (el && Number.isFinite(el.duration)) {
                videoTimeRef.current = el.duration;
              }
            }}
            onError={() => setMediaFailed(true)}
          />
        ) : (
          <div className="h-full w-full bg-[radial-gradient(circle_at_50%_18%,#f3d98f_0%,#8fa18a_34%,#314039_68%,#182019_100%)]" />
        )}
        <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(180deg,rgba(8,12,10,.16)_0%,rgba(8,12,10,.06)_42%,rgba(8,12,10,.4)_100%)]" />
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_50%_16%,rgba(255,239,179,.12),transparent_34%)] mix-blend-screen" />
      </div>

      <button
        type="button"
        onClick={skip}
        className="absolute bottom-[max(18px,env(safe-area-inset-bottom))] right-[max(16px,env(safe-area-inset-right))] z-20 rounded-full border border-[#f0dfb4]/4 bg-[#152018]/6 px-4 py-2 text-[11px] tracking-[0.22em] text-[#f7edd0] backdrop-blur-sm"
      >
        {skipLabel}
      </button>

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
            {locale === "en" ? "Opening" : locale === "zh-Hans" ? "正在开启" : "正在開啟"}
          </p>
          <p className="mt-2 min-h-5 text-[11px] tracking-[0.12em] text-[#e2d5b6]">
            {isPending
              ? locale === "en"
                ? "Checking account"
                : locale === "zh-Hans"
                  ? "正在确认账号状态"
                  : "正在確認帳號狀態"
              : label}
          </p>
          <p className="mt-2 text-[9px] tracking-[0.14em] text-[#cabd9e]">
            {locale === "en"
              ? videoComplete
                ? "Ready to enter"
                : "Playing opening — or skip"
              : locale === "zh-Hans"
                ? videoComplete
                  ? "开场完成"
                  : "正在播放从暗到明 · 可右下角跳过"
                : videoComplete
                  ? "開場完成"
                  : "正在播放從暗到明 · 可右下角跳過"}
          </p>

          {bootError ? (
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
          ) : slow && (!bootReady || isPending) ? (
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
