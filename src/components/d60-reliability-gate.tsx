import { useEffect, useMemo, useState } from "react";
import { D60KarmaSection } from "@/components/d60-karma-section";
import type { CityHit } from "@/lib/bazi/types";
import { useI18n, type Locale } from "@/lib/i18n";
import { localBirthToUtc } from "@/lib/qizheng/engine";

const ASTRO_SCRIPT_ID = "zhaowu-astronomy-engine-d60";
const ASTRO_SCRIPT_URL = "https://cdn.jsdelivr.net/npm/astronomy-engine@2.1.19/astronomy.browser.min.js";

type AstronomyApi = {
  SiderealTime: (date: Date) => number;
};

export type D60GateBirth = {
  year: number;
  month: number;
  day: number;
  hour: number;
  minute: number;
  city: CityHit;
};

type GateState = "idle" | "checking" | "stable" | "unstable" | "error";

const COPY = {
  "zh-Hant": {
    kicker: "D60 · 出生分鐘可靠度 Gate",
    title: "先確認出生分鐘，再計算 D60",
    lead: "D60 對分鐘高度敏感。只有在你確認這是可核對到分鐘的出生時間後，昭梧才會進一步做 ±2 分鐘穩定性檢查。",
    record: "本次使用的出生記錄",
    caution: "若時間只是估算、整點填寫或家人回憶，請不要確認；D60 應維持【不作判定】。",
    confirm: "我確認這是可核對到分鐘的出生時間",
    edit: "回首頁修改出生時間",
    checking: "正在檢查這個出生分鐘前後 ±2 分鐘是否會改變 D60 上升細分…",
    withheldTitle: "D60｜不作判定",
    unstable: "前後 ±2 分鐘已足以改變 D60 上升細分。依昭梧時間可靠度 Gate，本次不輸出 D60 盤面與解讀；保留其他已成立的分析，不用 D60 反向考時。",
    error: "D60 穩定性檢查暫時無法完成，因此本次不作判定；其他分析不受影響。",
  },
  "zh-Hans": {
    kicker: "D60 · 出生分钟可靠度 Gate",
    title: "先确认出生分钟，再计算 D60",
    lead: "D60 对分钟高度敏感。只有在你确认这是可核对到分钟的出生时间后，昭梧才会进一步做 ±2 分钟稳定性检查。",
    record: "本次使用的出生记录",
    caution: "如果时间只是估算、整点填写或家人回忆，请不要确认；D60 应维持【不作判断】。",
    confirm: "我确认这是可核对到分钟的出生时间",
    edit: "回首页修改出生时间",
    checking: "正在检查这个出生分钟前后 ±2 分钟是否会改变 D60 上升细分…",
    withheldTitle: "D60｜不作判断",
    unstable: "前后 ±2 分钟已经足以改变 D60 上升细分。依昭梧时间可靠度 Gate，本次不输出 D60 盘面与解读；保留其他已成立的分析，不用 D60 反向考时。",
    error: "D60 稳定性检查暂时无法完成，因此本次不作判断；其他分析不受影响。",
  },
  en: {
    kicker: "D60 · BIRTH-MINUTE RELIABILITY GATE",
    title: "Confirm the recorded minute before calculating D60",
    lead: "D60 is extremely minute-sensitive. Zhaowu only runs the ±2-minute stability check after you confirm that this is a documented minute-level birth time.",
    record: "Birth record used for this check",
    caution: "Do not confirm an estimated, rounded, or family-remembered time. In that case D60 should remain withheld.",
    confirm: "I confirm this is a documented minute-level birth time",
    edit: "Edit birth time on the homepage",
    checking: "Checking whether moving the recorded time by ±2 minutes changes the D60 rising subdivision…",
    withheldTitle: "D60 · WITHHELD",
    unstable: "A ±2-minute change alters the D60 rising subdivision. Under Zhaowu's time-reliability gate, no D60 chart or interpretation is produced for this record. Other established readings remain available, and D60 is not used to rectify the birth time.",
    error: "The D60 stability check could not be completed, so D60 is withheld. Other readings are unaffected.",
  },
} as const satisfies Record<Locale, Record<string, string>>;

function normalize(value: number) { return ((value % 360) + 360) % 360; }
function wrap180(value: number) { return ((value + 180) % 360 + 360) % 360 - 180; }
function toRad(value: number) { return value * Math.PI / 180; }

function lahiriAyanamsa(date: Date) {
  const jd = date.getTime() / 86_400_000 + 2_440_587.5;
  const t = (jd - 2_451_545.0) / 36_525;
  const initial = 23 * 3600 + 51 * 60 + 25.532;
  return (initial + 5029.0966 * t + 1.11161 * t * t) / 3600;
}

function meanObliquity(date: Date) {
  const jd = date.getTime() / 86_400_000 + 2_440_587.5;
  const t = (jd - 2_451_545.0) / 36_525;
  return 23 + 26 / 60 + 21.448 / 3600 - (46.815 * t + 0.00059 * t * t - 0.001813 * t * t * t) / 3600;
}

function tropicalAscendant(api: AstronomyApi, date: Date, latitude: number, longitude: number) {
  const lst = normalize(api.SiderealTime(date) * 15 + longitude);
  const eps = toRad(meanObliquity(date));
  const phi = toRad(latitude);
  const altitudeTerm = (lambda: number) => {
    const lam = toRad(normalize(lambda));
    const ra = normalize(Math.atan2(Math.sin(lam) * Math.cos(eps), Math.cos(lam)) * 180 / Math.PI);
    const dec = Math.asin(Math.sin(lam) * Math.sin(eps));
    const hourAngle = wrap180(lst - ra);
    const h = toRad(hourAngle);
    const altitude = Math.sin(phi) * Math.sin(dec) + Math.cos(phi) * Math.cos(dec) * Math.cos(h);
    return { altitude, hourAngle };
  };
  const roots: number[] = [];
  let previousX = 0;
  let previous = altitudeTerm(previousX).altitude;
  for (let x = 0.5; x <= 360; x += 0.5) {
    const current = altitudeTerm(x % 360).altitude;
    if (previous === 0 || previous * current < 0) {
      let low = previousX;
      let high = x;
      for (let i = 0; i < 36; i += 1) {
        const mid = (low + high) / 2;
        const lowValue = altitudeTerm(low % 360).altitude;
        const midValue = altitudeTerm(mid % 360).altitude;
        if (lowValue * midValue <= 0) high = mid;
        else low = mid;
      }
      const root = normalize((low + high) / 2);
      if (altitudeTerm(root).hourAngle < 0) roots.push(root);
    }
    previousX = x;
    previous = current;
  }
  if (!roots.length) throw new Error("ascendant");
  return roots[0];
}

function d60Sign(siderealLongitude: number) {
  const lon = normalize(siderealLongitude);
  const natalSign = Math.floor(lon / 30);
  const part = Math.min(59, Math.floor((lon % 30) / 0.5));
  return (natalSign + part) % 12;
}

let astronomyPromise: Promise<AstronomyApi> | null = null;
function loadAstronomy() {
  const browser = window as typeof window & { Astronomy?: AstronomyApi };
  if (browser.Astronomy) return Promise.resolve(browser.Astronomy);
  if (astronomyPromise) return astronomyPromise;
  astronomyPromise = new Promise<AstronomyApi>((resolve, reject) => {
    const existing = document.getElementById(ASTRO_SCRIPT_ID) as HTMLScriptElement | null;
    const script = existing ?? document.createElement("script");
    const finish = () => browser.Astronomy ? resolve(browser.Astronomy) : reject(new Error("astronomy-global"));
    script.addEventListener("load", finish, { once: true });
    script.addEventListener("error", () => reject(new Error("astronomy-load")), { once: true });
    if (!existing) {
      script.id = ASTRO_SCRIPT_ID;
      script.src = ASTRO_SCRIPT_URL;
      script.async = true;
      script.crossOrigin = "anonymous";
      document.head.appendChild(script);
    }
  }).catch((error) => { astronomyPromise = null; throw error; });
  return astronomyPromise;
}

function birthKey(birth: D60GateBirth) {
  return [birth.year, birth.month, birth.day, birth.hour, birth.minute, birth.city.timezone, birth.city.latitude, birth.city.longitude].join("|");
}

function formatRecord(birth: D60GateBirth) {
  const pad = (value: number) => String(value).padStart(2, "0");
  return `${birth.year}-${pad(birth.month)}-${pad(birth.day)} · ${pad(birth.hour)}:${pad(birth.minute)} · ${birth.city.display}`;
}

async function isStableAtPlusMinusTwoMinutes(birth: D60GateBirth) {
  const api = await loadAstronomy();
  const utc = localBirthToUtc({ year: birth.year, month: birth.month, day: birth.day, hour: birth.hour, minute: birth.minute, timezone: birth.city.timezone });
  const signAt = (deltaMinutes: number) => {
    const shifted = new Date(utc.getTime() + deltaMinutes * 60_000);
    const siderealAsc = normalize(tropicalAscendant(api, shifted, birth.city.latitude, birth.city.longitude) - lahiriAyanamsa(shifted));
    return d60Sign(siderealAsc);
  };
  const base = signAt(0);
  return signAt(-2) === base && signAt(2) === base;
}

export function D60ReliabilityGate({ reportBirth }: { reportBirth: D60GateBirth | null }) {
  const { locale } = useI18n();
  const copy = COPY[locale];
  const key = useMemo(() => reportBirth ? birthKey(reportBirth) : "", [reportBirth]);
  const [confirmedKey, setConfirmedKey] = useState("");
  const [state, setState] = useState<GateState>("idle");

  useEffect(() => {
    setConfirmedKey("");
    setState("idle");
  }, [key]);

  useEffect(() => {
    if (!reportBirth || confirmedKey !== key) return;
    let alive = true;
    setState("checking");
    void isStableAtPlusMinusTwoMinutes(reportBirth)
      .then((stable) => { if (alive) setState(stable ? "stable" : "unstable"); })
      .catch(() => { if (alive) setState("error"); });
    return () => { alive = false; };
  }, [confirmedKey, key, reportBirth]);

  if (!reportBirth) return <D60KarmaSection variant="standalone" reportBirth={null} />;

  if (confirmedKey !== key) {
    const record = formatRecord(reportBirth);
    return (
      <article className="rounded-2xl border border-[#b99755]/35 bg-[#fffaf2] p-5" data-d60-minute-gate>
        <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-[#7c5b43]">{copy.kicker}</p>
        <h3 className="mt-1 font-display text-xl font-semibold text-ink">{copy.title}</h3>
        <p className="mt-3 text-sm leading-7 text-ink-soft">{copy.lead}</p>
        <div className="mt-4 rounded-xl border border-line/70 bg-paper/65 px-3 py-3">
          <span className="block text-[11px] font-semibold text-ink-mute">{copy.record}</span>
          <strong className="mt-1 block text-sm text-ink" data-d60-confirmed-record>{record}</strong>
        </div>
        <p className="mt-3 text-xs leading-6 text-cinnabar">{copy.caution}</p>
        <div className="mt-4 flex flex-wrap gap-2">
          <button type="button" className="rounded-xl bg-ink px-4 py-3 text-sm font-semibold text-paper" aria-label={`${copy.confirm}（${String(reportBirth.hour).padStart(2, "0")}:${String(reportBirth.minute).padStart(2, "0")}）`} onClick={() => setConfirmedKey(key)}>
            {copy.confirm}
          </button>
          <a className="rounded-xl border border-line px-4 py-3 text-sm font-semibold text-ink-soft" href="/#bazi">{copy.edit}</a>
        </div>
      </article>
    );
  }

  if (state === "checking" || state === "idle") {
    return <p className="rounded-xl border border-line/70 bg-paper/70 px-4 py-4 text-sm leading-7 text-ink-soft" data-d60-stability-check>{copy.checking}</p>;
  }

  if (state === "unstable" || state === "error") {
    return (
      <article className="rounded-2xl border border-cinnabar/25 bg-cinnabar/5 p-5" data-d60-withheld>
        <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-cinnabar">D60 · RELIABILITY</p>
        <h3 className="mt-1 font-display text-xl font-semibold text-ink">{copy.withheldTitle}</h3>
        <p className="mt-3 text-sm leading-7 text-ink-soft">{state === "unstable" ? copy.unstable : copy.error}</p>
      </article>
    );
  }

  return <D60KarmaSection variant="standalone" reportBirth={reportBirth} />;
}
