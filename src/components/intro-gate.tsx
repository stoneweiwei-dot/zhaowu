import { useCallback, useEffect, useRef, useState } from "react";
import { useI18n } from "@/lib/i18n";
import { useCurrentUserState } from "@/lib/auth/use-current-user";
import { runBootstrapReadiness } from "@/lib/bootstrap-readiness";

const KEY = "zhaowu.intro.v11";
/** 首次保留從暗到明的氣勢，但避免整段約 15 秒過長 */
const CEREMONY_FIRST_MS = 8200;
/** 重訪仍給一點開場，不瞬間切走 */
const CEREMONY_REPEAT_MS = 2400;
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
  const [mediaFailed, setMediaFailed] = useState(false);
  const [bootError, setBootError] = useState<string | null>(null);
  const [reduced, setReduced] = useState(false);
  const [slow, setSlow] = useState(false);
  const [attempt, setAttempt] = useState(0);
  const [ceremonyDone, setCeremonyDone] = useState(false);
  const startedAt = useRef(0);
  const seenBefore = useRef(false);
  const ceremonyTarget = useRef(CEREMONY_FIRST_MS);
  const bootPercentRef = useRef(0);
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
    window.setTimeout(() => setPhase("off"), 420);
  }, [clearTimers]);

  const skip = useCallback(() => {
    finish();
  }, [finish]);

  useEffect(() => {
    if (typeof window === "undefined") return;
    startedAt.current = performance.now();
    const prefersReduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    setReduced(prefersReduced);
    try {
      seenBefore.current = sessionStorage.getItem(KEY) === "1";
    } catch {
      seenBefore.current = false;
    }
    ceremonyTarget.current =
      prefersReduced ? 600 : seenBefore.current ? CEREMONY_REPEAT_MS : CEREMONY_FIRST_MS;

    const slowTimer = window.setTimeout(() => setSlow(true), SLOW_NOTICE_MS);

    const tick = () => {
      const elapsed = performance.now() - startedAt.current;
      const target = ceremonyTarget.current;
      const ceremonyRatio = Math.min(1, elapsed / target);
      // 前台儀式進度主導，後台就緒只微調，避免一下跳到 100%
      const blended = ceremonyRatio * 88 + Math.min(bootPercentRef.current, 100) * 0.12;
      setPercent(Math.min(99, Math.round(blended)));
      if (elapsed >= target) {
        setCeremonyDone(true);
        return;
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
        setLabel(locale === "en" ? "Waiting for services" : locale === "zh-Hans" ? "等待关键服务就绪" : "等待關鍵服務就緒");
      });

    return () => {
      cancelled = true;
    };
  }, [attempt, locale]);

  useEffect(() => {
    if (phase !== "in" || bootError) return;
    // 必須：儀式走完 + 後台就緒 + 帳號狀態不在 pending
    const mediaOk = reduced || videoReady || mediaFailed;
    if (!ceremonyDone || !bootReady || isPending || !mediaOk) return;

    setPercent(100);
    clearTimers();
    finishTimer.current = window.setTimeout(finish, 380);
    return clearTimers;
  }, [bootError, bootReady, ceremonyDone, clearTimers, finish, isPending, mediaFailed, phase, reduced, videoReady]);

  if (phase === "off") return null;

  const skipLabel = locale === "en" ? "Skip" : locale === "zh-Hans" ? "跳过" : "跳過";

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
          className="intro-media intro-poster absolute inset-0 h-full w-full object-cover"
          draggable={false}
        />
        {!reduced ? (
          <video
            ref={videoRef}
            className={`intro-media intro-video absolute inset-0 h-full w-full object-cover transition-opacity duration-700 ${videoReady ? "opacity-100" : "opacity-0"}`}
            src={VIDEO_SRC}
            poster={POSTER_SRC}
            autoPlay
            muted
            playsInline
            preload="auto"
            loop={false}
            onCanPlay={() => {
              setVideoReady(true);
              const el = videoRef.current;
              if (el) {
                el.playbackRate = 1;
                void el.play().catch(() => undefined);
              }
            }}
            onLoadedData={() => setVideoReady(true)}
            onError={() => setMediaFailed(true)}
          />
        ) : (
          <div className="h-full w-full bg-[radial-gradient(circle_at_50%_18%,#f3d98f_0%,#8fa18a_34%,#314039_68%,#182019_100%)]" />
        )}
        <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(180deg,rgba(8,12,10,.18)_0%,rgba(8,12,10,.08)_40%,rgba(8,12,10,.42)_100%)]" />
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_50%_16%,rgba(255,239,179,.14),transparent_34%)] mix-blend-screen" />
      </div>

      <button
        type="button"
        onClick={skip}
        className="absolute bottom-[max(18px,env(safe-area-inset-bottom))] right-[max(16px,env(safe-area-inset-right))] z-20 rounded-full border border-[#f0dfb4]/35 bg-[#152018]/55 px-4 py-2 text-[11px] tracking-[0.22em] text-[#f7edd0] backdrop-blur-sm transition hover:border-[#f0dfb4]/7 hover:bg-[#1b2820]/75"
      >
        {skipLabel}
      </button>

      <div className="relative z-10 mx-auto flex min-h-dvh w-full max-w-[430px] flex-col px-6 pb-[max(56px,env(safe-area-inset-bottom))] pt-[max(36px,env(safe-area-inset-top))] text-center text-[#fff9e8]">
        <div className="pt-2">
          <p className="text-[11px] tracking-[0.48em] text-[#f0dfb4]">Z H A O W U</p>
          <p className="mt-2 text-[9px] tracking-[0.34em] text-[#d9c89d]">DESTINY · TIMING · CHOICE</p>
        </div>

        <div className="mt-[10vh] rounded-[28px] border border-[#f8e7bb]/18 bg-[#172018]/22 px-5 py-6 shadow-[0_18px_60px_rgba(0,0,0,.14)] backdrop-blur-[1px]">
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
            className="mx-auto flex h-[104px] w-[104px] items-center justify-center rounded-full bg-white/10 p-[5px] shadow-[0_0_42px_rgba(241,205,116,.22)]"
            style={{
              background: `conic-gradient(rgba(248,223,155,.98) ${percent * 3.6}deg, rgba(255,255,255,.16) 0deg)`,
            }}
          >
            <div className="flex h-full w-full items-center justify-center rounded-full bg-[#1a211a]/7 ring-1 ring-[#f5dfaa]/22">
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
              ? "Watch the light rise — or skip"
              : locale === "zh-Hans"
                ? "可看完从暗到明，也可右下角跳过"
                : "可看完從暗到明，也可右下角跳過"}
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
