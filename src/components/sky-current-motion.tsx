import { useEffect, useState } from "react";
import "@/sky-current-motion.css";

type Lang = "zh-Hant" | "zh-Hans" | "en";
type Vector = { x: number; y: number; z: number };
type Astronomy = {
  GeoVector: (body: string, date: Date, aberration: boolean) => Vector;
  Ecliptic: (vector: Vector) => { elon: number };
};
type SkyPoint = { name: string; glyph: string; longitude: number; x: number; y: number };
type Snapshot = { at: Date; points: SkyPoint[] };

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
  data: string; original: string;
}> = {
  "zh-Hant": {
    tag: "LIVE CELESTIAL DIAL", heading: "此刻天體運行", loading: "正在計算此刻行星位置",
    unavailable: "即時星曆暫不可用，觀象圖不顯示未核實座標。",
    guide: "行星角度依本機時間及站內星曆計算；緩慢轉動的光線只作動畫提示。",
    detail: "查看五顆行星的黃經度數", explanation: "圓圈半徑僅為排版間距，不代表行星與地球的實際距離。",
    clock: "悉尼時間", data: "熱帶黃經", original: "同源天文計算 · 不需定位或輸入生辰",
  },
  "zh-Hans": {
    tag: "LIVE CELESTIAL DIAL", heading: "此刻天体运行", loading: "正在计算此刻行星位置",
    unavailable: "实时星历暂不可用，观象图不显示未经核实的坐标。",
    guide: "行星角度依本机时间及站内星历计算；缓慢转动的光线只作动画提示。",
    detail: "查看五颗行星的黄经度数", explanation: "圆圈半径仅为排版间距，不代表行星与地球的实际距离。",
    clock: "悉尼时间", data: "热带黄经", original: "同源天文计算 · 不需定位或输入生辰",
  },
  en: {
    tag: "LIVE CELESTIAL DIAL", heading: "The sky in motion", loading: "Calculating current planetary positions",
    unavailable: "Current ephemeris unavailable; unverified positions are not displayed.",
    guide: "Planetary angles are computed for the current instant using the self-hosted ephemeris. The moving light sweep is decorative.",
    detail: "View five planetary longitudes", explanation: "Track radii are visual spacing, not actual Earth–planet distances.",
    clock: "Sydney time", data: "Tropical longitude", original: "Local astronomical calculation · No location or birth details required",
  },
};
const localeCode: Record<Lang, string> = { "zh-Hant": "zh-TW", "zh-Hans": "zh-CN", en: "en-AU" };

export function SkyCurrentMotion({ lang }: { lang: Lang }) {
  const [snapshot, setSnapshot] = useState<Snapshot | null>(null);
  const [failed, setFailed] = useState(false);
  const copy = WORDS[lang];

  useEffect(() => {
    let cancelled = false;
    let timer: number | undefined;
    loadAstronomy().then((engine) => {
      if (cancelled) return;
      const update = () => {
        try {
          const next = makeSnapshot(engine, new Date());
          if (!cancelled) { setSnapshot(next); setFailed(false); }
        } catch {
          if (!cancelled) { setSnapshot(null); setFailed(true); }
        }
      };
      update();
      timer = window.setInterval(update, 60_000);
    }).catch(() => { if (!cancelled) setFailed(true); });
    return () => { cancelled = true; if (timer !== undefined) window.clearInterval(timer); };
  }, []);

  const localClock = snapshot
    ? new Intl.DateTimeFormat(localeCode[lang], {
        timeZone: "Australia/Sydney", dateStyle: "medium", timeStyle: "short",
      }).format(snapshot.at)
    : "";

  return (
    <section className="sky-current-motion" aria-label={copy.heading}>
      <div className="sky-motion-copy">
        <span className="sky-motion-eyebrow">{copy.tag}</span>
        <h2>{copy.heading}</h2>
        <p className="sky-motion-clock">{copy.clock} · <time dateTime={snapshot?.at.toISOString()}>{localClock || "—"}</time></p>
        <p>{copy.guide}</p>
        <small>{copy.original}</small>
      </div>
      <div className="sky-motion-visual">
        {snapshot ? (
          <div className="sky-motion-dial" role="img" aria-label={copy.heading}>
            <span className="sky-motion-lane lane-one" aria-hidden="true" />
            <span className="sky-motion-lane lane-two" aria-hidden="true" />
            <span className="sky-motion-lane lane-three" aria-hidden="true" />
            <span className="sky-motion-lane lane-four" aria-hidden="true" />
            <span className="sky-motion-lane lane-five" aria-hidden="true" />
            <span className="sky-motion-earth" aria-hidden="true">⊕</span>
            <span className="sky-motion-sweep" aria-hidden="true" />
            {snapshot.points.map((point) => (
              <span
                key={point.name}
                className="sky-motion-planet"
                aria-hidden="true"
                title={point.name + ": " + point.longitude.toFixed(1) + "°"}
                style={{ left: point.x + "%", top: point.y + "%" }}
              >{point.glyph}</span>
            ))}
          </div>
        ) : <div className="sky-motion-fallback" role="status">{failed ? copy.unavailable : copy.loading}</div>}
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
