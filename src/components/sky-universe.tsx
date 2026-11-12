import { useEffect, useRef, useState } from "react";

type Lang = "zh-Hant" | "zh-Hans" | "en";
const COPY = {
  "zh-Hant": {
    title: "太陽系 · 穿行宇宙",
    note: "太陽與八大行星的藝術示意；大小、距離與軌道經過縮放。日期依悉尼時間更新，實際觀測資料見下方紀錄。",
    unavailable: "星圖暫時無法顯示，下方天象資料仍可查看。",
  },
  "zh-Hans": {
    title: "太阳系 · 穿行宇宙",
    note: "太阳与八大行星的艺术示意；大小、距离与轨道经过缩放。日期依悉尼时间更新，实际观测资料见下方记录。",
    unavailable: "星图暂时无法显示，下方天象资料仍可查看。",
  },
  en: {
    title: "Solar system in motion",
    note: "An artistic view of the Sun and eight planets, with scaled sizes, distances and orbits. Dates follow Sydney time. Observational data appears below.",
    unavailable: "The chart is unavailable. Sky information remains available below.",
  },
} as const;

export function SkyUniverse({ lang }: { lang: Lang }) {
  const frame = useRef<HTMLIFrameElement>(null);
  const loadTimer = useRef<number | undefined>(undefined);
  const ready = useRef(false);
  const [failed, setFailed] = useState(false);
  const copy = COPY[lang];

  useEffect(() => {
    setFailed(false);
    ready.current = false;
    const receiveStatus = (event: MessageEvent) => {
      if (event.origin !== window.location.origin || event.source !== frame.current?.contentWindow) return;
      if (event.data?.type === "zhaowu:sky-chart-failed") {
        window.clearTimeout(loadTimer.current);
        setFailed(true);
      }
      if (event.data?.type === "zhaowu:sky-chart-ready") {
        ready.current = true;
        window.clearTimeout(loadTimer.current);
        setFailed(false);
      }
    };
    window.addEventListener("message", receiveStatus);
    return () => {
      window.clearTimeout(loadTimer.current);
      window.removeEventListener("message", receiveStatus);
    };
  }, [lang]);

  return <section className="sky-universe-section" aria-label={copy.title}>
    <iframe
      key={lang}
      ref={frame}
      className="sky-universe-frame"
      src={`/sky-universe/chart.html?lang=${lang}&v=20261112`}
      title={copy.title}
      loading="lazy"
      hidden={failed}
      onLoad={() => {
        window.clearTimeout(loadTimer.current);
        if (!ready.current) loadTimer.current = window.setTimeout(() => setFailed(true), 13_000);
      }}
      onError={() => setFailed(true)}
    />
    <p className="sky-universe-note" role={failed ? "status" : undefined}>{failed ? copy.unavailable : copy.note}</p>
  </section>;
}
