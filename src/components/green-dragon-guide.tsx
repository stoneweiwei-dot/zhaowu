import { useEffect, useRef, useState, type FormEvent, type PointerEvent as ReactPointerEvent } from "react";
import { useRouterState } from "@tanstack/react-router";
import { BackgroundMusic } from "@/components/background-music";
import {
  askSiteGuide,
  defaultSiteGuide,
  type SiteGuideAnswer,
  type SiteGuideRoute,
} from "@/lib/site-guide";
import { useI18n, type Locale } from "@/lib/i18n";
import { useAppStore } from "@/lib/store";

const POSITION_STORAGE_KEY = "zhaowu.dragonAssistant.position.v1";
const DOCK_SIZE = 52;
const EDGE_GAP = 10;
const TOP_GAP = 76;
const BOTTOM_GAP = 78;
const BUBBLE_INITIAL_DELAY_MS = 18_000;
const BUBBLE_REPEAT_MIN_MS = 48_000;
const BUBBLE_REPEAT_JITTER_MS = 24_000;
const BUBBLE_VISIBLE_MS = 4_800;

type DockPosition = { x: number; y: number };
type MusicStatus = {
  playing: boolean;
  loading: boolean;
  trackId: string | null;
  trackName: string | null;
  loopEnabled: boolean;
  shuffleEnabled: boolean;
};
type BubbleState = { kind: "guide" | "music"; text: string };

const EMPTY_MUSIC_STATUS: MusicStatus = {
  playing: false,
  loading: false,
  trackId: null,
  trackName: null,
  loopEnabled: true,
  shuffleEnabled: false,
};

function go(route: SiteGuideRoute) {
  if (route === "/#analysisForm") {
    if (window.location.pathname !== "/") window.location.assign("/#analysisForm");
    else document.getElementById("analysisForm")?.scrollIntoView({ behavior: "smooth", block: "start" });
    return;
  }
  window.location.assign(route);
}

function clampPosition(position: DockPosition): DockPosition {
  if (typeof window === "undefined") return position;
  const maxX = Math.max(EDGE_GAP, window.innerWidth - DOCK_SIZE - EDGE_GAP);
  const maxY = Math.max(TOP_GAP, window.innerHeight - DOCK_SIZE - BOTTOM_GAP);
  return {
    x: Math.min(maxX, Math.max(EDGE_GAP, position.x)),
    y: Math.min(maxY, Math.max(TOP_GAP, position.y)),
  };
}

function readSavedPosition(): DockPosition | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(POSITION_STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as DockPosition;
    if (!Number.isFinite(parsed?.x) || !Number.isFinite(parsed?.y)) return null;
    return clampPosition(parsed);
  } catch {
    return null;
  }
}

function savePosition(position: DockPosition) {
  try {
    window.localStorage.setItem(POSITION_STORAGE_KEY, JSON.stringify(position));
  } catch {}
}

function guideBubbles(locale: Locale) {
  if (locale === "en") {
    return [
      "Need a reading? Tap me and I’ll take you straight to the right section.",
      "Your saved reports are one tap away in My history.",
      "Save your birth data once and the complete chart will appear automatically.",
      "You can move me. Drag the dragon to either side of the screen.",
      "Music lives here too — tap me for the full playlist controls.",
    ];
  }
  if (locale === "zh-Hans") {
    return [
      "不知道从哪里开始？点我，我直接带你去对应分析。",
      "以前生成过的报告，可以从「我的记录」重新打开。",
      "生辰只要保存一次，完整命盘就会自动出现。",
      "我可以移动：按住小龙拖到屏幕两边都可以。",
      "播放器也在我这里，点开就能切歌、循环或随机播放。",
    ];
  }
  return [
    "不知道從哪裡開始？點我，我直接帶你去對應分析。",
    "以前生成過的報告，可以從「我的紀錄」重新打開。",
    "生辰只要保存一次，完整命盤就會自動出現。",
    "我可以移動：按住小龍拖到螢幕兩邊都可以。",
    "播放器也在我這裡，點開就能切歌、循環或隨機播放。",
  ];
}

export function GreenDragonGuide() {
  const { locale } = useI18n();
  const pathname = useRouterState({ select: (state) => state.location.pathname });
  const current = useAppStore((state) => state.current);
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState("");
  const [busy, setBusy] = useState(false);
  const [answer, setAnswer] = useState<SiteGuideAnswer>(() => defaultSiteGuide(locale));
  const [position, setPosition] = useState<DockPosition | null>(null);
  const [dragging, setDragging] = useState(false);
  const [bubble, setBubble] = useState<BubbleState | null>(null);
  const [musicStatus, setMusicStatus] = useState<MusicStatus>(EMPTY_MUSIC_STATUS);
  const dragRef = useRef<{ pointerId: number; startX: number; startY: number; originX: number; originY: number; moved: boolean } | null>(null);
  const suppressClickRef = useRef(false);

  useEffect(() => {
    setAnswer(defaultSiteGuide(locale));
  }, [locale]);

  useEffect(() => {
    if (!current) return;
    const followUp = locale === "en"
      ? "Your analysis is ready. Want to see the reasoning, the risks, or go straight to the next step?"
      : locale === "zh-Hans"
        ? "刚看完你的分析。想先看依据、风险，还是直接看下一步？"
        : "剛看完你的分析。想先看依據、風險，還是直接看下一步？";
    setAnswer({ reply: followUp, route: null, cta: null, source: "local" });
    setBubble({ kind: "guide", text: followUp });
  }, [current, locale]);

  useEffect(() => {
    const saved = readSavedPosition();
    if (saved) {
      setPosition(saved);
      return;
    }
    const setDefault = () => setPosition(clampPosition({
      x: window.innerWidth - DOCK_SIZE - EDGE_GAP,
      y: window.innerHeight - DOCK_SIZE - BOTTOM_GAP,
    }));
    setDefault();
  }, []);

  useEffect(() => {
    const onResize = () => setPosition((current) => current ? clampPosition(current) : current);
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  useEffect(() => {
    const onStatus = (event: Event) => {
      const detail = (event as CustomEvent<MusicStatus>).detail;
      if (!detail) return;
      setMusicStatus(detail);
    };
    window.addEventListener("zhaowu-music-status", onStatus as EventListener);
    return () => window.removeEventListener("zhaowu-music-status", onStatus as EventListener);
  }, []);

  useEffect(() => {
    if (open || dragging) {
      setBubble(null);
      return;
    }

    let showTimer = 0;
    let hideTimer = 0;
    let disposed = false;

    const schedule = (delay: number) => {
      showTimer = window.setTimeout(() => {
        if (disposed || document.hidden) {
          schedule(12_000);
          return;
        }

        const guidePool = guideBubbles(locale);
        const showMusic = Math.random() < 0.26;
        if (showMusic) {
          const fallback = locale === "en" ? "Play music" : locale === "zh-Hans" ? "播放音乐" : "播放音樂";
          const status = musicStatus.trackName
            ? (musicStatus.playing
                ? (locale === "en" ? `Playing · ${musicStatus.trackName}` : locale === "zh-Hans" ? `正在播放 · ${musicStatus.trackName}` : `正在播放 · ${musicStatus.trackName}`)
                : (locale === "en" ? `Music · ${musicStatus.trackName}` : `音樂 · ${musicStatus.trackName}`))
            : fallback;
          setBubble({ kind: "music", text: status });
        } else {
          setBubble({ kind: "guide", text: guidePool[Math.floor(Math.random() * guidePool.length)] });
        }

        hideTimer = window.setTimeout(() => setBubble(null), BUBBLE_VISIBLE_MS);
        schedule(BUBBLE_REPEAT_MIN_MS + Math.floor(Math.random() * BUBBLE_REPEAT_JITTER_MS));
      }, delay);
    };

    schedule(BUBBLE_INITIAL_DELAY_MS);
    return () => {
      disposed = true;
      window.clearTimeout(showTimer);
      window.clearTimeout(hideTimer);
    };
  }, [open, dragging, locale, musicStatus.trackName, musicStatus.playing]);

  const copy = locale === "en"
    ? {
        title: "Jade Dragon guide",
        intro: "",
        placeholder: "For example: take me to my complete report",
        ask: "Ask",
        close: "Close guide",
        open: "Open Jade Dragon guide",
        drag: "Drag Jade Dragon",
        music: "Music",
      }
    : locale === "zh-Hans"
      ? {
          title: "青玉小龙助手",
          intro: "",
          placeholder: "例如：带我去看完整报告",
          ask: "问小龙",
          close: "关闭助手",
          open: "打开青玉小龙助手",
          drag: "拖动青玉小龙",
          music: "音乐",
        }
      : {
          title: "青玉小龍助手",
          intro: "",
          placeholder: "例如：帶我去看完整報告",
          ask: "問小龍",
          close: "關閉助手",
          open: "打開青玉小龍助手",
          drag: "拖動青玉小龍",
          music: "音樂",
        };

  async function submit(event: FormEvent) {
    event.preventDefault();
    const message = input.trim();
    if (!message || busy) return;
    setBusy(true);
    try {
      const next = await askSiteGuide(message, locale, pathname);
      setAnswer(next);
      setInput("");
    } finally {
      setBusy(false);
    }
  }

  const beginDrag = (event: ReactPointerEvent<HTMLButtonElement>) => {
    if (event.button !== 0) return;
    const rect = event.currentTarget.getBoundingClientRect();
    dragRef.current = {
      pointerId: event.pointerId,
      startX: event.clientX,
      startY: event.clientY,
      originX: position?.x ?? rect.left,
      originY: position?.y ?? rect.top,
      moved: false,
    };
    event.currentTarget.setPointerCapture?.(event.pointerId);
  };

  const continueDrag = (event: ReactPointerEvent<HTMLButtonElement>) => {
    const drag = dragRef.current;
    if (!drag || drag.pointerId !== event.pointerId) return;
    const dx = event.clientX - drag.startX;
    const dy = event.clientY - drag.startY;
    if (!drag.moved && Math.hypot(dx, dy) < 5) return;
    drag.moved = true;
    setDragging(true);
    setOpen(false);
    setBubble(null);
    setPosition(clampPosition({ x: drag.originX + dx, y: drag.originY + dy }));
  };

  const endDrag = (event: ReactPointerEvent<HTMLButtonElement>) => {
    const drag = dragRef.current;
    if (!drag || drag.pointerId !== event.pointerId) return;
    dragRef.current = null;
    if (!drag.moved) return;
    suppressClickRef.current = true;
    setDragging(false);
    setPosition((current) => {
      if (!current) return current;
      const rightX = Math.max(EDGE_GAP, window.innerWidth - DOCK_SIZE - EDGE_GAP);
      const snapped = clampPosition({
        x: current.x + DOCK_SIZE / 2 < window.innerWidth / 2 ? EDGE_GAP : rightX,
        y: current.y,
      });
      savePosition(snapped);
      return snapped;
    });
  };

  const onTriggerClick = () => {
    if (suppressClickRef.current) {
      suppressClickRef.current = false;
      return;
    }
    setBubble(null);
    setOpen((value) => !value);
  };

  const sendMusicCommand = (command: "toggle" | "next" | "previous") => {
    window.dispatchEvent(new CustomEvent("zhaowu-music-command", { detail: { command } }));
  };

  const isLeft = position ? position.x + DOCK_SIZE / 2 < (typeof window === "undefined" ? 0 : window.innerWidth / 2) : false;
  const opensDown = position ? position.y < (typeof window === "undefined" ? 0 : window.innerHeight * 0.48) : false;

  return (
    <aside
      className={`zhaowu-dragon-guide ${isLeft ? "is-left" : "is-right"} ${opensDown ? "opens-down" : "opens-up"} ${dragging ? "is-dragging" : ""}`}
      data-site-guide
      data-dragon-assistant
      data-dragon-side={isLeft ? "left" : "right"}
      style={position ? { left: position.x, top: position.y, right: "auto", bottom: "auto" } : undefined}
    >
      {bubble ? (
        <div className={`zhaowu-dragon-bubble ${bubble.kind === "music" ? "is-music" : "is-guide"}`} data-dragon-bubble>
          <button type="button" className="zhaowu-dragon-bubble-main" onClick={() => { setBubble(null); setOpen(true); }} aria-label={copy.open}>
            <span>{bubble.text}</span>
          </button>
          {bubble.kind === "music" ? (
            <div className="zhaowu-dragon-bubble-player" aria-label={copy.music}>
              <button type="button" data-background-music-control onClick={() => sendMusicCommand("toggle")} aria-label={musicStatus.playing ? (locale === "en" ? "Pause" : "暫停") : (locale === "en" ? "Play" : "播放")}>{musicStatus.playing ? "Ⅱ" : "▶"}</button>
              <button type="button" onClick={() => sendMusicCommand("next")} aria-label={locale === "en" ? "Next track" : locale === "zh-Hans" ? "下一首" : "下一首"}>⏭</button>
            </div>
          ) : null}
        </div>
      ) : null}

      <section className="zhaowu-dragon-guide-panel" role="dialog" aria-label={copy.title} hidden={!open}>
        <header>
          <span className="zhaowu-dragon-guide-avatar is-thinking" aria-hidden />
          <div><strong>{copy.title}</strong>{copy.intro ? <p>{copy.intro}</p> : null}</div>
          <button type="button" onClick={() => setOpen(false)} aria-label={copy.close}>×</button>
        </header>

        <BackgroundMusic />

        <div className="zhaowu-dragon-guide-answer" aria-live="polite">
          <p>{answer.reply}</p>
          {answer.route && answer.cta ? <button type="button" onClick={() => answer.route && go(answer.route)}>{answer.cta}<span aria-hidden>→</span></button> : null}
        </div>

        <div className="zhaowu-dragon-guide-shortcuts" aria-label={locale === "en" ? "Reading navigation" : locale === "zh-Hans" ? "分析导航" : "分析導覽"}>
          <button type="button" onClick={() => go("/#analysisForm")}>{locale === "en" ? "Full report" : locale === "zh-Hans" ? "完整综合报告" : "完整綜合報告"}</button>
          <button type="button" onClick={() => window.location.assign("/fun-tests")}>{locale === "en" ? "Fun tests" : locale === "zh-Hans" ? "趣味测验" : "趣味測驗"}</button>
          <button type="button" onClick={() => go("/history")}>{locale === "en" ? "My history" : locale === "zh-Hans" ? "我的记录" : "我的紀錄"}</button>
        </div>

        <form onSubmit={submit}>
          <input value={input} onChange={(event) => setInput(event.target.value)} maxLength={400} placeholder={copy.placeholder} aria-label={copy.placeholder} />
          <button type="submit" disabled={busy || !input.trim()}>{busy ? "…" : copy.ask}</button>
        </form>
      </section>

      <button
        className="zhaowu-dragon-guide-trigger"
        type="button"
        onPointerDown={beginDrag}
        onPointerMove={continueDrag}
        onPointerUp={endDrag}
        onPointerCancel={endDrag}
        onClick={onTriggerClick}
        aria-expanded={open}
        aria-label={open ? copy.close : copy.open}
        title={copy.drag}
      >
        <span className="zhaowu-dragon-guide-avatar" aria-hidden />
        <span className="zhaowu-dragon-guide-label">{locale === "en" ? "Guide" : locale === "zh-Hans" ? "小龙" : "小龍"}</span>
        {musicStatus.playing ? <span className="zhaowu-dragon-playing-dot" aria-hidden /> : null}
      </button>
    </aside>
  );
}
