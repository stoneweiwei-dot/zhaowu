import { useEffect, useRef, useState } from "react";
import "@/login-films.css";

/**
 * Four real, owner-supplied clips, SHA-verified on import.
 * These are decorative videos; auth controls are real DOM elements outside this stage.
 * Never use a short-lived external transfer link as production media.
 */
const FILMS = [
  { id: "flute-dragon", src: "/login-films/flute-dragon.mp4", poster: "/login-films/flute-dragon.jpg", landscape: false },
  { id: "dragon-portrait", src: "/login-films/dragon-portrait.mp4", poster: "/login-films/dragon-portrait.jpg", landscape: false },
  { id: "lotus-sunlight", src: "/login-films/lotus-sunlight.mp4", poster: "/login-films/lotus-sunlight.jpg", landscape: false },
  { id: "imperial-cat", src: "/login-films/imperial-cat.mp4", poster: "/login-films/imperial-cat.jpg", landscape: true },
] as const;

function labels(locale: string) {
  if (locale === "en") return { controls: "Opening films", pause: "Pause animation", play: "Play animation", next: "Next animation", mute: "Mute film", unmute: "Play film sound", scene: "Film" };
  if (locale === "zh-Hans") return { controls: "登录动画", pause: "暂停动画", play: "播放动画", next: "下一段动画", mute: "静音", unmute: "开启影片声音", scene: "动画" };
  return { controls: "登入動畫", pause: "暫停動畫", play: "播放動畫", next: "下一段動畫", mute: "靜音", unmute: "開啟影片聲音", scene: "動畫" };
}

export function LoginFilmStage({ locale }: { locale: string }) {
  const video = useRef<HTMLVideoElement | null>(null);
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(() => typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches);
  const [muted, setMuted] = useState(true);
  const [failed, setFailed] = useState(false);
  const copy = labels(locale);
  const clip = FILMS[index];

  useEffect(() => {
    const element = video.current;
    if (!element || failed) return;
    element.muted = muted;
    const sync = () => {
      if (paused || document.hidden) {
        element.pause();
      } else {
        void element.play().catch(() => {
          // iOS Low Power Mode or browser autoplay policy: leave poster and usable controls.
          setPaused(true);
        });
      }
    };
    sync();
    document.addEventListener("visibilitychange", sync);
    return () => { document.removeEventListener("visibilitychange", sync); element.pause(); };
  }, [index, paused, muted, failed]);

  function togglePlayback() {
    const current = video.current;
    if (!paused) {
      current?.pause();
      setPaused(true);
    } else {
      setPaused(false);
      if (current) void current.play().catch(() => setPaused(true));
    }
  }

  function nextFilm() {
    setFailed(false);
    setIndex(current => (current + 1) % FILMS.length);
  }

  function toggleSound() {
    if (video.current) video.current.muted = !muted;
    setMuted(current => !current);
  }

  return <>
    <div className="zw-login-film-stage" data-login-film-stage data-current-film={clip.id} aria-hidden="true">
      <img className="stone-login-stage-media zw-login-film-poster" src={clip.poster} alt="" width={clip.landscape ? 910 : 512} height={clip.landscape ? 512 : 910} fetchPriority={index === 0 ? "high" : "auto"} />
      {!failed ? <video
        key={clip.id}
        ref={video}
        className="stone-login-stage-media zw-login-film-video"
        data-landscape={clip.landscape ? "true" : "false"}
        data-login-film-video
        src={clip.src}
        poster={clip.poster}
        playsInline
        muted={muted}
        preload="metadata"
        disablePictureInPicture
        onEnded={nextFilm}
        onError={() => setFailed(true)}
      /> : null}
    </div>
    <div className="zw-login-film-controls" role="group" aria-label={copy.controls} data-login-film-controls>
      <span className="zw-login-film-counter" aria-live="polite">{copy.scene} {index + 1} / {FILMS.length}</span>
      <button type="button" aria-label={paused ? copy.play : copy.pause} title={paused ? copy.play : copy.pause} onClick={togglePlayback}>{paused ? "▶" : "Ⅱ"}</button>
      <button type="button" aria-label={copy.next} title={copy.next} onClick={nextFilm}>→</button>
      <button type="button" aria-label={muted ? copy.unmute : copy.mute} title={muted ? copy.unmute : copy.mute} onClick={toggleSound}>{muted ? "♪̸" : "♪"}</button>
    </div>
  </>;
}
