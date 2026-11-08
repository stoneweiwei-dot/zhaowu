import { useEffect, useRef, useState } from "react";

type Lang = "zh-Hant" | "zh-Hans" | "en";
const COPY = {
  "zh-Hant": {title:"太陽系 · 穿行宇宙", instruction:"拖曳或使用方向鍵調整視角", note:"動畫為藝術示意，各軌道分別加速；大小、距離與目前位置並非等比例或即時。冥王星是矮行星。", unavailable:"動畫暫時無法顯示，下方天象資料仍可查看。", pause:"暫停運行", reset:"重設視角"},
  "zh-Hans": {title:"太阳系 · 穿行宇宙", instruction:"拖动或使用方向键调整视角", note:"动画为艺术示意，各轨道分别加速；大小、距离与目前位置并非等比例或实时。冥王星是矮行星。", unavailable:"动画暂时无法显示，下方天象资料仍可查看。", pause:"暂停运行", reset:"重设视角"},
  en: {title:"Solar system in motion", instruction:"Drag or use arrow keys to change the view", note:"Illustration only: orbits are independently accelerated; sizes, distances and current positions are not to scale or real time. Pluto is a dwarf planet.", unavailable:"Animation unavailable; the sky information remains available below.", pause:"Pause motion", reset:"Reset view"},
} as const;

let loader: Promise<void> | null = null;
function loadAstronomy(): Promise<void> {
  const browser = window as typeof window & { Astronomy?: unknown };
  if (browser.Astronomy) return Promise.resolve();
  if (loader) return loader;
  loader = new Promise<void>((resolve, reject) => {
    const script = document.createElement("script");
    script.src = "/vendor/astronomy-engine-2.1.19.browser.min.js";
    script.async = true;
    script.onload = () => browser.Astronomy ? resolve() : reject(new Error("Astronomy engine unavailable"));
    script.onerror = () => reject(new Error("Astronomy engine unavailable"));
    document.head.appendChild(script);
  }).catch(error => { loader = null; throw error; });
  return loader;
}

export function SkyUniverse({ lang }: { lang: Lang }) {
  const root = useRef<HTMLDivElement>(null);
  const [failed, setFailed] = useState(false);
  const copy = COPY[lang];
  useEffect(() => {
    let cancelled = false;
    let dispose: (() => void) | undefined;
    setFailed(false);
    async function start() {
      await loadAstronomy();
      const source = "/sky-universe/universe.js";
      const module = await import(/* @vite-ignore */ source) as { mountUniverse: (element: HTMLDivElement, locale: Lang) => (() => void) | undefined };
      if (!cancelled && root.current) dispose = module.mountUniverse(root.current, lang);
    }
    start().catch(() => { if (!cancelled) setFailed(true); });
    return () => { cancelled = true; dispose?.(); };
  }, [lang]);
  const bodies = lang === "en" ? ["Mercury", "Venus", "Earth", "Mars", "Jupiter", "Saturn", "Uranus", "Neptune", "Pluto"] : lang === "zh-Hans" ? ["水星", "金星", "地球", "火星", "木星", "土星", "天王星", "海王星", "冥王星"] : ["水星", "金星", "地球", "火星", "木星", "土星", "天王星", "海王星", "冥王星"];
  return <section className="sky-universe-section" aria-label={copy.title}>
    <div className="sky-universe-stage" ref={root}>
      <canvas id="universe" tabIndex={0} role="img" aria-label={`${copy.title} · ${copy.instruction}`} />
      <div className="sky-universe-controls"><button type="button" id="orbit-motion">{copy.pause}</button><button type="button" id="orbit-reset">{copy.reset}</button></div>
      <div className="sky-universe-caption"><strong>{copy.title}</strong><span>{copy.instruction}</span><span>{failed ? copy.unavailable : copy.note}</span></div>
    </div>
    <ul className="sky-universe-legend" aria-label={copy.title}>{bodies.map((body) => <li key={body}>{body}</li>)}</ul>
  </section>;
}
