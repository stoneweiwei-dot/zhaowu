import { useEffect, useRef, useState } from "react";
import "./visitor-welcome-films.css";

/** Public homepage only. Four original owner-supplied films, verified on ingest. No authentication. */
const FILMS = [
  { name: "flute-dragon", landscape: false },
  { name: "dragon-portrait", landscape: false },
  { name: "lotus-sunlight", landscape: false },
  { name: "imperial-cat", landscape: true },
] as const;

const words = (locale: string) => locale === "en" ? {
  tagline: "Where time, art and your own story meet",
  enter: "Enter ZHAOWU",
  about: "Discover what makes ZHAOWU different",
  controls: "Welcome animation controls",
  pause: "Pause film", play: "Play film", next: "Next film", mute: "Mute", unmute: "Enable sound",
  count: "Film",
} : locale === "zh-Hans" ? {
  tagline: "以东方时间与宋式美学，读天地与自己",
  enter: "进入昭梧",
  about: "认识昭梧特色",
  controls: "迎宾动画控制",
  pause: "暂停影片", play: "播放影片", next: "下一段影片", mute: "关闭声音", unmute: "开启声音",
  count: "影片",
} : {
  tagline: "以東方時間與宋式美學，讀天地與自己",
  enter: "進入昭梧",
  about: "認識昭梧特色",
  controls: "迎賓動畫控制",
  pause: "暫停影片", play: "播放影片", next: "下一段影片", mute: "關閉聲音", unmute: "開啟聲音",
  count: "影片",
};

export function VisitorWelcomeFilms({ locale }: { locale: string }) {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(() => typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches);
  const [muted, setMuted] = useState(true);
  const [failed, setFailed] = useState(false);
  const film = FILMS[index];
  const t = words(locale);

  useEffect(() => {
    const video = videoRef.current;
    if (!video || failed) return;
    video.muted = muted;
    const sync = () => {
      if (paused || document.hidden) video.pause();
      else void video.play().catch(() => setPaused(true));
    };
    sync();
    document.addEventListener("visibilitychange", sync);
    return () => {
      document.removeEventListener("visibilitychange", sync);
      video.pause();
    };
  }, [index, paused, muted, failed]);

  const next = () => { setFailed(false); setIndex(i => (i + 1) % FILMS.length); };
  const playToggle = () => setPaused(p => !p);
  const soundToggle = () => setMuted(v => !v);

  return <section className="zw-visitor-welcome" data-public-welcome-films data-film={film.name} aria-label={t.controls}>
    <div className="zw-visitor-media" aria-hidden="true">
      <img src={"/login-films/" + film.name + ".jpg"} alt="" width={film.landscape ? 910 : 512} height={film.landscape ? 512 : 910} fetchPriority={index === 0 ? "high" : "auto"}/>
      {!failed && <video key={film.name} ref={videoRef}
        src={"/login-films/" + film.name + ".mp4"}
        poster={"/login-films/" + film.name + ".jpg"}
        autoPlay={!paused} playsInline muted={muted} preload="metadata"
        disablePictureInPicture
        onEnded={next}
        onError={() => { setFailed(true); setPaused(true); }}
        aria-hidden="true"
      />}
    </div>
    <div className="zw-visitor-content">
      <div className="zw-visitor-seal" aria-label="昭梧 ZHAOWU">
        <span>昭梧</span><small>Z H A O W U</small>
      </div>
      <div className="zw-visitor-message">
        <p>{t.tagline}</p>
        <nav className="zw-visitor-actions" aria-label={t.controls}>
          <a className="zw-visitor-enter" href="#home-guide">{t.enter}<span aria-hidden="true">↓</span></a>
          <a className="zw-visitor-about" href="/about" data-public-features-link>{t.about}<span aria-hidden="true">↗</span></a>
        </nav>
      </div>
    </div>
    <div className="zw-visitor-controls" role="group" aria-label={t.controls}>
      <span aria-live="polite">{t.count} {index + 1} / {FILMS.length}</span>
      <button type="button" onClick={playToggle} aria-label={paused ? t.play : t.pause} aria-pressed={!paused}>{paused ? "▶" : "Ⅱ"}</button>
      <button type="button" onClick={next} aria-label={t.next}>→</button>
      <button type="button" onClick={soundToggle} aria-label={muted ? t.unmute : t.mute} aria-pressed={!muted}>{muted ? "♪̸" : "♪"}</button>
    </div>
  </section>;
}
