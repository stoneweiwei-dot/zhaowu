import { useEffect, useRef, useState } from "react";
import "@/sky-current-motion.css";

type Lang = "zh-Hant" | "zh-Hans" | "en";
type Vector = { x: number; y: number; z: number };
type Astronomy = {
  GeoVector: (body: string, date: Date, aberration: boolean) => Vector;
  Ecliptic: (vector: Vector) => { elon: number };
};
type SkyPoint = { name: string; glyph: string; longitude: number; x: number; y: number };
type Snapshot = { at: Date; points: SkyPoint[] };

// This is an explicitly labelled ephemeris time-lapse, never a literal orbital speed.
const PLAYBACK_DAYS = 90;
const PLAYBACK_LOOP_MS = 45_000;
const PLAYBACK_TICK_MS = 450;
const SCRIPT_ID = "zhaowu-sky-astronomy-engine";
const SCRIPT_URL = "/vendor/astronomy-engine-2.1.19.browser.min.js";
const BODIES = [
  { name: "Mercury", glyph: "☿", radius: 19 },
  { name: "Venus", glyph: "♀", radius: 26 },
  { name: "Mars", glyph: "♂", radius: 33 },
  { name: "Jupiter", glyph: "♃", radius: 40 },
  { name: "Saturn", glyph: "♄", radius: 45 },
] as const;
let astronomyLoader: Promise<Astronomy> | null = null;

function loadAstronomy(): Promise<Astronomy> {
  if (typeof window === "undefined") return Promise.reject(new Error("Browser required"));
  const browser = window as typeof window & { Astronomy?: Astronomy };
  if (browser.Astronomy) return Promise.resolve(browser.Astronomy);
  if (astronomyLoader) return astronomyLoader;
  astronomyLoader = new Promise<Astronomy>((resolve, reject) => {
    const existing = document.getElementById(SCRIPT_ID) as HTMLScriptElement | null;
    const script = existing ?? document.createElement("script");
    const loaded = () => browser.Astronomy ? resolve(browser.Astronomy) : reject(new Error("Astronomy Engine unavailable"));
    script.addEventListener("load", loaded, { once: true });
    script.addEventListener("error", () => reject(new Error("Astronomy Engine could not load")), { once: true });
    if (!existing) {
      script.id = SCRIPT_ID;
      script.src = SCRIPT_URL;
      script.async = true;
      document.head.appendChild(script);
    }
  }).catch((error: unknown) => { astronomyLoader = null; throw error; });
  return astronomyLoader;
}

function makeSnapshot(engine: Astronomy, at: Date): Snapshot {
  const points = BODIES.map(({ name, glyph, radius }) => {
    // Geocentric tropical ecliptic longitude. Radial lanes prevent labels
    // overlapping; lane radius is not the actual distance from Earth.
    const longitude = ((engine.Ecliptic(engine.GeoVector(name, at, true)).elon % 360) + 360) % 360;
    if (!Number.isFinite(longitude)) throw new Error("Invalid ephemeris longitude");
    const angle = (longitude - 90) * Math.PI / 180;
    return { name, glyph, longitude, x: 50 + radius * Math.cos(angle), y: 50 + radius * Math.sin(angle) };
  });
  return { at, points };
}

const WORDS: Record<Lang, {
  tag: string; heading: string; loading: string; unavailable: string;
  guide: string; detail: string; explanation: string; clock: string;
  data: string; original: string; playback: string; simulation: string;
}> = {
  "zh-Hant": {
    tag: "LIVE CELESTIAL DIAL", heading: "此刻天體運行", loading: "正在計算此刻行星位置",
    unavailable: "即時星曆暫不可用，觀象圖不顯示未核實座標。",
    guide: "行星以星曆快轉演示未來90日的位置；悉尼時間及下方展開度數仍是此刻數據。",
    detail: "查看五顆行星的黃經度數", explanation: "圓圈半徑僅為排版間距，不代表行星與地球的實際距離。",
    clock: "悉尼時間", data: "熱帶黃經", original: "同源天文計算 · 不需定位或輸入生辰",
    playback: "星曆快轉 · 90日／45秒", simulation: "依真實星曆加速播放的地心行星位置（非實際速度）",
  },
  "zh-Hans": {
    tag: "LIVE CELESTIAL DIAL", heading: "此刻天体运行", loading: "正在计算此刻行星位置",
    unavailable: "实时星历暂不可用，观象图不显示未经核实的坐标。",
    guide: "行星按星历快进演示未来90日的位置；悉尼时间和下方展开度数仍是此刻数据。",
    detail: "查看五颗行星的黄经度数", explanation: "圆圈半径仅为排版间距，不代表行星与地球的实际距离。",
    clock: "悉尼时间", data: "热带黄经", original: "同源天文计算 · 不需定位或输入生辰",
    playback: "星历快进 · 90日／45秒", simulation: "依据真实星历加速播放的地心行星位置（非实际速度）",
  },
  en: {
    tag: "LIVE CELESTIAL DIAL", heading: "The sky in motion", loading: "Calculating current planetary positions",
    unavailable: "Current ephemeris unavailable; unverified positions are not displayed.",
    guide: "Planet symbols replay 90 days of calculated sky positions; the Sydney clock and expanded longitudes remain at the actual current instant.",
    detail: "View five planetary longitudes", explanation: "Track radii are visual spacing, not actual Earth–planet distances.",
    clock: "Sydney time", data: "Tropical longitude", original: "Local astronomical calculation · No location or birth details required",
    playback: "Ephemeris time-lapse · 90 days / 45 sec", simulation: "Ephemeris-calculated geocentric planets, sped up for visibility (not actual orbital speed)",
  },
};
const localeCode: Record<Lang, string> = { "zh-Hant": "zh-TW", "zh-Hans": "zh-CN", en: "en-AU" };

export function SkyCurrentMotion({ lang }: { lang: Lang }) {
  const [snapshot, setSnapshot] = useState<Snapshot | null>(null);
  const [playback, setPlayback] = useState<Snapshot | null>(null);
  const [reducedMotion, setReducedMotion] = useState(false);
  const motionSection = useRef<HTMLElement | null>(null);
  const [failed, setFailed] = useState(false);
  const copy = WORDS[lang];

  useEffect(() => {
    let cancelled = false;
    let liveTimer: number | undefined;
    let playbackTimer: number | undefined;
    let observer: IntersectionObserver | undefined;
    let visible = true;
    let engine: Astronomy | undefined;
    let baseUtc = Date.now();
    let playbackStarted = performance.now();
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)");

    const readLiveSky = () => {
      if (!engine || cancelled) return;
      try {
        setSnapshot(makeSnapshot(engine, new Date()));
        setFailed(false);
      } catch {
        setSnapshot(null);
        setPlayback(null);
        setFailed(true);
      }
    };
    const replay = () => {
      if (!engine || cancelled || document.hidden || !visible || reduced.matches) return;
      try {
        // Every frame uses the existing astronomical engine. Planetary angular
        // speed is never invented; only the labelled playback clock is sped up.
        const phase = ((performance.now() - playbackStarted) % PLAYBACK_LOOP_MS) / PLAYBACK_LOOP_MS;
        const at = new Date(baseUtc + phase * PLAYBACK_DAYS * 86_400_000);
        setPlayback(makeSnapshot(engine, at));
      } catch {
        // If time-lapse fails, keep the current sky and exact longitudes.
        setPlayback(null);
      }
    };
    const restart = () => {
      baseUtc = Date.now();
      playbackStarted = performance.now();
      readLiveSky();
      replay();
    };
    const onVisibility = () => {
      if (!document.hidden) restart();
    };
    const onMotionPreference = () => {
      setReducedMotion(reduced.matches);
      if (reduced.matches) setPlayback(null);
      else restart();
    };
    setReducedMotion(reduced.matches);
    reduced.addEventListener("change", onMotionPreference);
    document.addEventListener("visibilitychange", onVisibility);

    loadAstronomy().then((loadedEngine) => {
      if (cancelled) return;
      engine = loadedEngine;
      readLiveSky();
      setPlayback(makeSnapshot(loadedEngine, new Date()));
      if (motionSection.current && typeof IntersectionObserver !== "undefined") {
        observer = new IntersectionObserver(([entry]) => {
          const showing = Boolean(entry?.isIntersecting);
          if (showing && !visible) restart();
          visible = showing;
        }, { rootMargin: "60px" });
        observer.observe(motionSection.current);
      }
      liveTimer = window.setInterval(readLiveSky, 60_000);
      playbackTimer = window.setInterval(replay, PLAYBACK_TICK_MS);
    }).catch(() => { if (!cancelled) setFailed(true); });

    return () => {
      cancelled = true;
      observer?.disconnect();
      reduced.removeEventListener("change", onMotionPreference);
      document.removeEventListener("visibilitychange", onVisibility);
      if (liveTimer !== undefined) window.clearInterval(liveTimer);
      if (playbackTimer !== undefined) window.clearInterval(playbackTimer);
    };
  }, []);

  const localClock = snapshot
    ? new Intl.DateTimeFormat(localeCode[lang], {
        timeZone: "Australia/Sydney", dateStyle: "medium", timeStyle: "short",
      }).format(snapshot.at)
    : "";

  const moving = !reducedMotion && playback !== null;
  const displayPoints = playback && !reducedMotion ? playback.points : snapshot?.points ?? [];
  const playbackDate = playback && !reducedMotion
    ? new Intl.DateTimeFormat(localeCode[lang], {
        timeZone: "Australia/Sydney", year: "numeric", month: "short", day: "numeric",
      }).format(playback.at)
    : "";

  return (
    <section className="sky-current-motion" ref={motionSection} aria-label={copy.heading}>
      <div className="sky-motion-copy">
        <span className="sky-motion-eyebrow">{copy.tag}</span>
        <h2>{copy.heading}</h2>
        <p className="sky-motion-clock">{copy.clock} · <time dateTime={snapshot?.at.toISOString()}>{localClock || "—"}</time></p>
        <p>{copy.guide}</p>
        <small>{copy.original}</small>
      </div>
      <div className="sky-motion-visual">
        {snapshot ? (
          <div className="sky-motion-dial" role="img" aria-label={moving ? copy.simulation : copy.heading}>
            <span className="sky-motion-lane lane-one" aria-hidden="true" />
            <span className="sky-motion-lane lane-two" aria-hidden="true" />
            <span className="sky-motion-lane lane-three" aria-hidden="true" />
            <span className="sky-motion-lane lane-four" aria-hidden="true" />
            <span className="sky-motion-lane lane-five" aria-hidden="true" />
            <span className="sky-motion-earth" aria-hidden="true">⊕</span>
            <span className="sky-motion-sweep" aria-hidden="true" />
            {displayPoints.map((point) => (
              <span
                key={point.name}
                className="sky-motion-planet"
                aria-hidden="true"
                title={point.name + ": " + point.longitude.toFixed(1) + "°" + (moving ? " · " + copy.playback : "")}
                style={{ left: point.x + "%", top: point.y + "%" }}
              >{point.glyph}</span>
            ))}
          </div>
        ) : <div className="sky-motion-fallback" role="status">{failed ? copy.unavailable : copy.loading}</div>}
        {playback && !reducedMotion && <p className="sky-motion-playback-label" aria-live="off">{copy.playback} · <time dateTime={playback.at.toISOString()}>{playbackDate}</time></p>}
        <details className="sky-motion-details">
          <summary>{copy.detail}</summary>
          {snapshot ? (
            <ul>{snapshot.points.map((point) => (
              <li key={point.name}><span>{point.glyph} {point.name}</span><strong>{point.longitude.toFixed(2)}°</strong></li>
            ))}</ul>
          ) : <p>{failed ? copy.unavailable : copy.loading}</p>}
          <p>{copy.explanation}</p>
        </details>
      </div>
    </section>
  );
}
