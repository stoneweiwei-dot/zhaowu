import { useEffect, useId, useMemo, useRef, useState } from "react";
import { buildChart } from "@/lib/bazi/chart";
import type { Locale } from "@/lib/i18n";
import { loadOwnerMusic, type OwnerMusicState } from "@/lib/owner-music-client";
import { prepareQuietAudio, releaseQuietAudio } from "@/lib/quiet-audio";
import type { ReportAccessLevel } from "@/lib/report-access";
import {
  buildFiveTonePlan,
  matchFiveToneTracks,
  resolveFiveTonePrimary,
  type FiveToneRole,
  type PaidReportAccessLevel,
} from "@/lib/report/five-tone-gift";
import type { SharedBirthRecord } from "@/lib/shared-birth";

type Copy = {
  kicker: string;
  title: string;
  lead: (element: string, tone: string, count: number) => string;
  gift: (count: number) => string;
  missingBirth: string;
  loading: string;
  unavailable: string;
  pendingTrack: string;
  play: string;
  pause: string;
  boundary: string;
  role: Record<FiveToneRole, string>;
};

const COPY: Record<Locale, Copy> = {
  "zh-Hant": {
    kicker: "ZHAOWU · FIVE TONES",
    title: "你的命盤專屬五音療癒聆聽",
    lead: (element, tone, count) => `依完整命盤目前的功能取向，以${element}行・${tone}音為主，為你排出 ${count} 首聆聽序列；不是按五行數量「缺什麼補什麼」。`,
    gift: (count) => `本次付費奉送 ${count} 首`,
    missingBirth: "先在首頁保存出生資料，這裡便會自動排出你的專屬五音。",
    loading: "正在從昭梧音樂庫取回你的曲目……",
    unavailable: "五音曲庫暫時未能連線，請稍後重新整理；你的付費權益不會消失。",
    pendingTrack: "此音正在從音樂後台同步",
    play: "播放",
    pause: "暫停",
    boundary: "「療癒」在此指放鬆、調息與自我照顧的聆聽體驗；五音屬傳統聲音文化，不替代醫療、心理治療或專業診斷。",
    role: { support: "生扶音", primary: "主音", release: "疏導音", transform: "轉化音", settle: "收束音" },
  },
  "zh-Hans": {
    kicker: "ZHAOWU · FIVE TONES",
    title: "你的命盘专属五音疗愈聆听",
    lead: (element, tone, count) => `依完整命盘目前的功能取向，以${element}行・${tone}音为主，为你排出 ${count} 首聆听序列；不是按五行数量“缺什么补什么”。`,
    gift: (count) => `本次付费奉送 ${count} 首`,
    missingBirth: "先在首页保存出生资料，这里便会自动排出你的专属五音。",
    loading: "正在从昭梧音乐库取回你的曲目……",
    unavailable: "五音曲库暂时未能连接，请稍后刷新；你的付费权益不会消失。",
    pendingTrack: "此音正在从音乐后台同步",
    play: "播放",
    pause: "暂停",
    boundary: "“疗愈”在此指放松、调息与自我照顾的聆听体验；五音属于传统声音文化，不替代医疗、心理治疗或专业诊断。",
    role: { support: "生扶音", primary: "主音", release: "疏导音", transform: "转化音", settle: "收束音" },
  },
  en: {
    kicker: "ZHAOWU · FIVE TONES",
    title: "Your chart-matched five tones",
    lead: (element, tone, count) => `Built from the chart's current functional emphasis: ${element} and the ${tone} tone lead this ${count}-track sequence. It is not selected by simply replacing a “missing” element.`,
    gift: (count) => `${count} track${count === 1 ? "" : "s"} included with this purchase`,
    missingBirth: "Save a birth record on the homepage and your personal tone sequence will appear here automatically.",
    loading: "Retrieving your tracks from the Zhaowu music library…",
    unavailable: "The five-tone library is temporarily unavailable. Refresh later; your paid access remains intact.",
    pendingTrack: "This tone is syncing from the music library",
    play: "Play",
    pause: "Pause",
    boundary: "‘Healing’ here means a listening practice for rest, breath and self-care. Five-tone culture does not replace medical or mental-health diagnosis or treatment.",
    role: { support: "support", primary: "primary", release: "release", transform: "transition", settle: "settle" },
  },
};

const ELEMENT_EN = { 木: "Wood", 火: "Fire", 土: "Earth", 金: "Metal", 水: "Water" } as const;
const TONE_EN = { 角: "Jue", 徵: "Zhi", 宮: "Gong", 商: "Shang", 羽: "Yu" } as const;
const FIVE_TONE_STOP_EVENT = "zhaowu-five-tone-stop";
let musicRequest: Promise<OwnerMusicState> | null = null;

function loadMusicOnce() {
  musicRequest ??= loadOwnerMusic().catch((error) => {
    musicRequest = null;
    throw error;
  });
  return musicRequest;
}

function dispatchMusicCommand(command: "pause" | "resume") {
  window.dispatchEvent(new CustomEvent("zhaowu-music-command", { detail: { command } }));
}

export function FiveToneGift({
  birth,
  locale,
  level,
}: {
  birth?: SharedBirthRecord | null;
  locale: Locale;
  level: Exclude<ReportAccessLevel, "none">;
}) {
  const copy = COPY[locale];
  const playerId = useId();
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [tracks, setTracks] = useState<OwnerMusicState["tracks"]>([]);
  const [loading, setLoading] = useState(Boolean(birth));
  const [failed, setFailed] = useState(false);
  const [playingId, setPlayingId] = useState<string | null>(null);

  const primary = useMemo(() => {
    if (!birth) return null;
    const chart = buildChart({ ...birth, question: "paid-five-tone-gift", locale });
    return resolveFiveTonePrimary(chart);
  }, [birth, locale]);
  const plan = useMemo(() => primary ? buildFiveTonePlan(primary, level as PaidReportAccessLevel) : [], [level, primary]);
  const matches = useMemo(() => matchFiveToneTracks(plan, tracks), [plan, tracks]);

  useEffect(() => {
    if (!birth) {
      setLoading(false);
      return;
    }
    let cancelled = false;
    setLoading(true);
    setFailed(false);
    void loadMusicOnce().then((state) => {
      if (!cancelled) setTracks(state.tracks);
    }).catch(() => {
      if (!cancelled) setFailed(true);
    }).finally(() => {
      if (!cancelled) setLoading(false);
    });
    return () => { cancelled = true; };
  }, [birth]);

  useEffect(() => {
    const stopOtherPlayer = (event: Event) => {
      const owner = (event as CustomEvent<{ owner?: string }>).detail?.owner;
      if (!owner || owner === playerId) return;
      const audio = audioRef.current;
      if (audio && !audio.paused) audio.pause();
      setPlayingId(null);
    };
    window.addEventListener(FIVE_TONE_STOP_EVENT, stopOtherPlayer);
    return () => window.removeEventListener(FIVE_TONE_STOP_EVENT, stopOtherPlayer);
  }, [playerId]);

  useEffect(() => () => {
    const audio = audioRef.current;
    if (audio) {
      audio.pause();
      releaseQuietAudio(audio);
    }
    dispatchMusicCommand("resume");
  }, []);

  useEffect(() => {
    const pauseWhenHidden = () => {
      const audio = audioRef.current;
      if (!document.hidden || !audio || audio.paused) return;
      audio.pause();
      setPlayingId(null);
      dispatchMusicCommand("resume");
    };
    document.addEventListener("visibilitychange", pauseWhenHidden);
    return () => document.removeEventListener("visibilitychange", pauseWhenHidden);
  }, []);

  function pauseCurrent() {
    audioRef.current?.pause();
    setPlayingId(null);
    dispatchMusicCommand("resume");
  }

  function toggleTrack(track: OwnerMusicState["tracks"][number]) {
    const audio = audioRef.current;
    if (!audio) return;
    if (playingId === track.id && !audio.paused) {
      pauseCurrent();
      return;
    }
    window.dispatchEvent(new CustomEvent(FIVE_TONE_STOP_EVENT, { detail: { owner: playerId } }));
    audio.pause();
    if (audio.getAttribute("src") !== track.url) {
      audio.src = track.url;
      audio.load();
    }
    prepareQuietAudio(audio, 0.28);
    dispatchMusicCommand("pause");
    setPlayingId(track.id);
    void audio.play().catch(() => {
      setPlayingId(null);
      dispatchMusicCommand("resume");
    });
  }

  const elementLabel = primary ? (locale === "en" ? ELEMENT_EN[primary] : primary) : "";
  const primaryTone = plan.find((item) => item.role === "primary")?.tone;
  const toneLabel = primaryTone ? (locale === "en" ? TONE_EN[primaryTone] : primaryTone) : "";

  return (
    <section className="zhaowu-five-tone-gift" data-five-tone-gift data-five-tone-count={plan.length}>
      <audio
        ref={audioRef}
        crossOrigin="anonymous"
        preload="none"
        playsInline
        onEnded={pauseCurrent}
        onError={pauseCurrent}
      />
      <header>
        <div>
          <p>{copy.kicker}</p>
          <h3>{copy.title}</h3>
        </div>
        {plan.length ? <span>{copy.gift(plan.length)}</span> : null}
      </header>

      {!birth ? <p className="zhaowu-five-tone-gift__state">{copy.missingBirth}</p> : null}
      {birth && primary ? <p className="zhaowu-five-tone-gift__lead">{copy.lead(elementLabel, toneLabel, plan.length)}</p> : null}
      {loading ? <p className="zhaowu-five-tone-gift__state" role="status">{copy.loading}</p> : null}
      {failed ? <p className="zhaowu-five-tone-gift__state is-error" role="alert">{copy.unavailable}</p> : null}

      {!loading && !failed && matches.length ? (
        <ol className="zhaowu-five-tone-gift__tracks">
          {matches.map((item, index) => {
            const isPlaying = item.track?.id === playingId;
            const itemElement = locale === "en" ? ELEMENT_EN[item.element] : item.element;
            const itemTone = locale === "en" ? TONE_EN[item.tone] : item.tone;
            return (
              <li key={`${item.role}-${item.element}`} data-five-tone-element={item.element}>
                <i aria-hidden="true">{String(index + 1).padStart(2, "0")}</i>
                <div>
                  <small>{copy.role[item.role]} · {itemElement} · {itemTone}{locale === "en" ? " tone" : "音"}</small>
                  <strong>{item.title || copy.pendingTrack}</strong>
                </div>
                <button
                  type="button"
                  data-background-music-control
                  disabled={!item.track}
                  aria-label={`${isPlaying ? copy.pause : copy.play} · ${item.title || `${itemElement}${itemTone}`}`}
                  aria-pressed={isPlaying}
                  onClick={() => item.track && toggleTrack(item.track)}
                >
                  <span aria-hidden="true">{isPlaying ? "Ⅱ" : "▷"}</span>
                  <b>{isPlaying ? copy.pause : copy.play}</b>
                </button>
              </li>
            );
          })}
        </ol>
      ) : null}

      <footer>{copy.boundary}</footer>
    </section>
  );
}
