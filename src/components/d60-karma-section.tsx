import { useEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import type { CityHit } from "@/lib/bazi/types";
import { useCurrentUserState } from "@/lib/auth/use-current-user";
import { useI18n, type Locale } from "@/lib/i18n";
import { localBirthToUtc } from "@/lib/qizheng/engine";
import { readSpecialistHistory, saveSpecialistHistory } from "@/lib/specialist-history";

const ASTRO_SCRIPT_ID = "zhaowu-astronomy-engine-d60";
const ASTRO_SCRIPT_URL = "https://cdn.jsdelivr.net/npm/astronomy-engine@2.1.19/astronomy.browser.min.js";
const BODY_KEYS = ["Sun", "Moon", "Mercury", "Venus", "Mars", "Jupiter", "Saturn"] as const;
type BodyKey = (typeof BODY_KEYS)[number];
type D60Key = "Ascendant" | BodyKey;

type AstronomyApi = {
  EclipticLongitude: (body: string, date: Date) => number;
  SiderealTime: (date: Date) => number;
};

type D60Placement = {
  key: D60Key;
  d60Sign: number;
  segment: number;
};

type D60Result = {
  utcIso: string;
  placements: D60Placement[];
  stableMinus2: boolean;
  stablePlus2: boolean;
};

type SavedBirth = {
  year: number;
  month: number;
  day: number;
  hour: number;
  minute: number;
  city: CityHit;
};

const SIGNS = {
  "zh-Hant": ["白羊", "金牛", "雙子", "巨蟹", "獅子", "處女", "天秤", "天蠍", "射手", "摩羯", "水瓶", "雙魚"],
  "zh-Hans": ["白羊", "金牛", "双子", "巨蟹", "狮子", "处女", "天秤", "天蝎", "射手", "摩羯", "水瓶", "双鱼"],
  en: ["Aries", "Taurus", "Gemini", "Cancer", "Leo", "Virgo", "Libra", "Scorpio", "Sagittarius", "Capricorn", "Aquarius", "Pisces"],
} as const satisfies Record<Locale, readonly string[]>;

const SIGN_THEMES = {
  "zh-Hant": ["先行與開創", "穩定與價值", "學習與溝通", "歸屬與情緒記憶", "表達與創造", "修正與技藝", "關係與取捨", "界線與深層轉化", "信念與視野", "責任與耐力", "獨立思考與群體", "共感、想像與放下"],
  "zh-Hans": ["先行与开创", "稳定与价值", "学习与沟通", "归属与情绪记忆", "表达与创造", "修正与技艺", "关系与取舍", "界线与深层转化", "信念与视野", "责任与耐力", "独立思考与群体", "共感、想象与放下"],
  en: ["initiative and beginnings", "stability and values", "learning and communication", "belonging and emotional memory", "expression and creativity", "refinement and craft", "relationships and choice", "boundaries and deep change", "belief and perspective", "duty and endurance", "independent thought and community", "empathy, imagination and release"],
} as const satisfies Record<Locale, readonly string[]>;

const COPY = {
  "zh-Hant": {
    title: "D60 業力旁證",
    note: "（D60 對出生分鐘非常敏感：每個分區只有 0.5°；上升點平均約每 4 分鐘移動 1°，因此大約 2 分鐘就可能跨過一個 D60 分區。實際速度會隨出生地、緯度與當時的上升速度改變。若你提供的是估算時間、整點時間或家人回憶，這部分只能作低置信度參考，不是絕對答案。）",
    unavailable: "目前沒有可核對到分鐘的出生時間與出生地，因此 D60 不作判定，也不另外要求你再填一次資料。",
    calculating: "正在把 D60 併入這份報告…",
    failed: "D60 暫時無法計算；前四世報告不受影響。",
    stable: "以你提供的時間前後各移動 2 分鐘測試，D60 上升仍在同一星座。這只代表這個很小的時間範圍相對穩定，仍不是絕對結論。",
    unstable: "以你提供的時間前後各移動 2 分鐘測試，D60 上升已發生變化，因此這一段只作弱旁證。",
    core: "核心慣性",
    emotion: "情緒慣性",
    duty: "反覆責任",
    resource: "帶得走的資源",
    relation: "關係價值",
    synthesis: "把它和前四世合起來看：重複出現的主題可以視為比較值得留意的慣性；只在 D60 單獨出現的內容，不升級成確定結論。",
  },
  "zh-Hans": {
    title: "D60 业力旁证",
    note: "（D60 对出生分钟非常敏感：每个分区只有 0.5°；上升点平均约每 4 分钟移动 1°，因此大约 2 分钟就可能跨过一个 D60 分区。实际速度会随出生地、纬度与当时的上升速度改变。如果你提供的是估算时间、整点时间或家人回忆，这部分只能作低置信度参考，不是绝对答案。）",
    unavailable: "目前没有可核对到分钟的出生时间与出生地，因此 D60 不作判断，也不另外要求你再填一次资料。",
    calculating: "正在把 D60 合并进这份报告…",
    failed: "D60 暂时无法计算；前四世报告不受影响。",
    stable: "以你提供的时间前后各移动 2 分钟测试，D60 上升仍在同一星座。这只代表这个很小的时间范围相对稳定，仍不是绝对结论。",
    unstable: "以你提供的时间前后各移动 2 分钟测试，D60 上升已经发生变化，因此这一段只作弱旁证。",
    core: "核心惯性",
    emotion: "情绪惯性",
    duty: "反复责任",
    resource: "带得走的资源",
    relation: "关系价值",
    synthesis: "把它和前四世合起来看：重复出现的主题可以视为比较值得留意的惯性；只在 D60 单独出现的内容，不升级成确定结论。",
  },
  en: {
    title: "D60 karmic cross-check",
    note: "(D60 is extremely birth-time sensitive. Each division is only 0.5°. The Ascendant moves about 1° every four minutes on average, so a D60 division can change in roughly two minutes. The real rate varies with birthplace, latitude and the rising speed at that moment. If your time is estimated, rounded or remembered by family, treat this section as low-confidence context rather than a definite answer.)",
    unavailable: "There is no saved minute-level birth time and birthplace for this report, so D60 is withheld rather than asking you to enter the same details again.",
    calculating: "Adding the D60 cross-check to this report…",
    failed: "D60 could not be calculated right now. The four-life report is unaffected.",
    stable: "Moving the supplied birth time two minutes earlier and later keeps the D60 Ascendant in the same sign. That only suggests relative stability inside this very small window; it is still not absolute.",
    unstable: "Moving the supplied birth time two minutes earlier and later changes the D60 Ascendant, so this section is treated only as weak supporting context.",
    core: "Core pattern",
    emotion: "Emotional habit",
    duty: "Repeated duty",
    resource: "Carried resource",
    relation: "Relationship values",
    synthesis: "Read this beside the four prior-life patterns. Themes that repeat across both can be treated as more noteworthy; a theme appearing only in D60 is not promoted into a definite conclusion.",
  },
} as const;

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
      let low = previousX, high = x;
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

function d60Placement(key: D60Key, siderealLongitude: number): D60Placement {
  const lon = normalize(siderealLongitude);
  const natalSign = Math.floor(lon / 30);
  const within = lon % 30;
  const part = Math.min(59, Math.floor(within / 0.5));
  return { key, d60Sign: (natalSign + part) % 12, segment: part + 1 };
}

function calculateD60(api: AstronomyApi, date: Date, city: CityHit): D60Result {
  const ayanamsa = lahiriAyanamsa(date);
  const ascTropical = tropicalAscendant(api, date, city.latitude, city.longitude);
  const asc = d60Placement("Ascendant", normalize(ascTropical - ayanamsa));
  const planets = BODY_KEYS.map((key) => d60Placement(key, normalize(api.EclipticLongitude(key, date) - ayanamsa)));
  const lagnaAt = (deltaMinutes: number) => {
    const shifted = new Date(date.getTime() + deltaMinutes * 60_000);
    const shiftedAyanamsa = lahiriAyanamsa(shifted);
    return d60Placement("Ascendant", normalize(tropicalAscendant(api, shifted, city.latitude, city.longitude) - shiftedAyanamsa)).d60Sign;
  };
  return {
    utcIso: date.toISOString(),
    placements: [asc, ...planets],
    stableMinus2: lagnaAt(-2) === asc.d60Sign,
    stablePlus2: lagnaAt(2) === asc.d60Sign,
  };
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

function asCity(value: unknown): CityHit | null {
  if (!value || typeof value !== "object") return null;
  const city = value as Partial<CityHit>;
  if (typeof city.display !== "string" || typeof city.name !== "string" || typeof city.timezone !== "string") return null;
  if (!Number.isFinite(city.latitude) || !Number.isFinite(city.longitude)) return null;
  return city as CityHit;
}

function parseSavedBirth(value: unknown): SavedBirth | null {
  if (!value || typeof value !== "object") return null;
  const raw = value as Record<string, unknown>;
  if (raw.timeUnknown) return null;
  const city = asCity(raw.city);
  if (!city || raw.hour == null || raw.minute == null || raw.minute === "") return null;
  const year = Number(raw.year), month = Number(raw.month), day = Number(raw.day), hour = Number(raw.hour), minute = Number(raw.minute);
  const civil = new Date(Date.UTC(year, month - 1, day, hour, minute));
  if (![year, month, day, hour, minute].every(Number.isFinite)) return null;
  if (civil.getUTCFullYear() !== year || civil.getUTCMonth() !== month - 1 || civil.getUTCDate() !== day) return null;
  if (hour < 0 || hour > 23 || minute < 0 || minute > 59) return null;
  return { year, month, day, hour, minute, city };
}

function usePalmReportPortalTarget() {
  const [target, setTarget] = useState<HTMLElement | null>(null);
  useEffect(() => {
    let slot: HTMLDivElement | null = null;
    const locate = () => {
      if (slot?.isConnected) return;
      const container = document.querySelector<HTMLElement>(".palm-result > .space-y-5");
      if (!container) return;
      slot = document.createElement("div");
      slot.className = "palm-d60-slot";
      const synthesis = container.querySelector(".palm-synthesis-grid");
      const history = container.querySelector(".palm-history-note");
      if (synthesis) container.insertBefore(slot, synthesis.nextSibling);
      else if (history) container.insertBefore(slot, history);
      else container.appendChild(slot);
      setTarget(slot);
    };
    locate();
    const observer = new MutationObserver(locate);
    observer.observe(document.body, { childList: true, subtree: true });
    return () => {
      observer.disconnect();
      if (slot?.isConnected) slot.remove();
      setTarget(null);
    };
  }, []);
  return target;
}

function signName(index: number, locale: Locale) {
  return SIGNS[locale][index];
}

export function D60KarmaSection() {
  const { locale } = useI18n();
  const copy = COPY[locale];
  const { user, isPending } = useCurrentUserState();
  const target = usePalmReportPortalTarget();
  const birth = useMemo(() => parseSavedBirth(user?.birthData), [user?.birthData]);
  const [result, setResult] = useState<D60Result | null>(null);
  const [status, setStatus] = useState<"idle" | "loading" | "ready" | "error">("idle");
  const syncedRef = useRef("");

  useEffect(() => {
    if (isPending) return;
    if (!birth) { setResult(null); setStatus("idle"); return; }
    let alive = true;
    setStatus("loading");
    void loadAstronomy().then((api) => {
      const utc = localBirthToUtc({ year: birth.year, month: birth.month, day: birth.day, hour: birth.hour, minute: birth.minute, timezone: birth.city.timezone });
      const next = calculateD60(api, utc, birth.city);
      if (alive) { setResult(next); setStatus("ready"); }
    }).catch(() => { if (alive) { setResult(null); setStatus("error"); } });
    return () => { alive = false; };
  }, [birth, isPending]);

  const themes = useMemo(() => {
    if (!result) return [];
    const byKey = Object.fromEntries(result.placements.map((placement) => [placement.key, placement])) as Partial<Record<D60Key, D60Placement>>;
    return [
      [copy.core, byKey.Ascendant],
      [copy.emotion, byKey.Moon],
      [copy.duty, byKey.Saturn],
      [copy.resource, byKey.Jupiter],
      [copy.relation, byKey.Venus],
    ].flatMap(([label, placement]) => placement ? [{ label: label as string, placement: placement as D60Placement }] : []);
  }, [copy, result]);

  const stable = Boolean(result?.stableMinus2 && result?.stablePlus2);
  const historyBody = useMemo(() => {
    if (!birth) return `${copy.note}\n${copy.unavailable}`;
    if (!result) return `${copy.note}\n${status === "error" ? copy.failed : copy.calculating}`;
    return [
      copy.note,
      ...themes.map(({ label, placement }) => `${label}：${signName(placement.d60Sign, locale)} · ${SIGN_THEMES[locale][placement.d60Sign]}`),
      stable ? copy.stable : copy.unstable,
      copy.synthesis,
    ].join("\n");
  }, [birth, copy, locale, result, stable, status, themes]);

  useEffect(() => {
    if (!target || isPending || status === "loading") return;
    const key = `${locale}:${result?.utcIso ?? "no-d60"}:${historyBody}`;
    if (syncedRef.current === key) return;
    const latest = readSpecialistHistory()[0];
    if (!latest || latest.kind !== "yizhangjing") return;
    const sections = latest.sections.filter((section) => !/^D60\b|^D60\s|D60 業力|D60 业力/i.test(section.title));
    const saved = saveSpecialistHistory({ ...latest, sections: [...sections, { title: copy.title, body: historyBody }] });
    if (saved) syncedRef.current = key;
  }, [copy.title, historyBody, isPending, locale, result?.utcIso, status, target]);

  if (!target) return null;

  const card = (
    <article className="relative overflow-hidden rounded-2xl border border-[#b99755]/35 bg-[#fffaf2] p-5 shadow-[inset_4px_0_0_rgba(111,82,59,.55)]" aria-label={copy.title}>
      <div aria-hidden className="pointer-events-none absolute -right-10 -top-10 h-28 w-28 rounded-full border border-[#8e4538]/10" />
      <div className="relative">
        <p className="text-[10px] font-semibold tracking-[0.18em] text-[#7c5b43]">D60 · SHASHTIAMSA</p>
        <h3 className="mt-1 font-display text-xl font-semibold tracking-[0.05em] text-ink">{copy.title}</h3>
        <p className="mt-3 text-xs leading-6 text-ink-mute">{copy.note}</p>

        {!birth ? <p className="mt-4 text-sm leading-7 text-ink-soft">{copy.unavailable}</p> : null}
        {birth && status === "loading" ? <p className="mt-4 text-sm leading-7 text-ink-soft">{copy.calculating}</p> : null}
        {birth && status === "error" ? <p className="mt-4 text-sm leading-7 text-ink-soft">{copy.failed}</p> : null}
        {result ? <>
          <div className="mt-4 grid gap-2 sm:grid-cols-2">
            {themes.map(({ label, placement }) => (
              <div key={label} className="rounded-xl border border-line/70 bg-paper/65 px-3 py-3">
                <p className="text-[10px] font-semibold tracking-[0.12em] text-cinnabar">{label}</p>
                <p className="mt-1 text-sm font-medium text-ink">{signName(placement.d60Sign, locale)}</p>
                <p className="mt-1 text-xs leading-5 text-ink-soft">{SIGN_THEMES[locale][placement.d60Sign]}</p>
              </div>
            ))}
          </div>
          <p className={`mt-4 rounded-xl border px-3 py-2 text-xs leading-6 ${stable ? "border-wood/25 bg-wood/5 text-ink-soft" : "border-cinnabar/25 bg-cinnabar/5 text-ink-soft"}`}>{stable ? copy.stable : copy.unstable}</p>
          <p className="mt-3 text-sm leading-7 text-ink-soft">{copy.synthesis}</p>
        </> : null}
      </div>
    </article>
  );

  return createPortal(card, target);
}
