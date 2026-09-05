import { useEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import type { CityHit } from "@/lib/bazi/types";
import { useI18n, type Locale } from "@/lib/i18n";
import { localBirthToUtc } from "@/lib/qizheng/engine";
import { readSpecialistHistory, saveSpecialistHistory } from "@/lib/specialist-history";

const ASTRO_SCRIPT_ID = "zhaowu-astronomy-engine-d60";
const ASTRO_SCRIPT_URL = "https://cdn.jsdelivr.net/npm/astronomy-engine@2.1.19/astronomy.browser.min.js";
const D60_BIRTH_EVENT = "zhaowu:d60-birth";
const BODY_KEYS = ["Sun", "Moon", "Mercury", "Venus", "Mars", "Jupiter", "Saturn"] as const;
type BodyKey = (typeof BODY_KEYS)[number];
type D60Key = "Ascendant" | BodyKey;
type ThemeKey = "core" | "emotion" | "duty" | "resource" | "relation";

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

type ReportBirth = {
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

const SIGN_PLAIN = {
  "zh-Hant": [
    "落在白羊，通常會先行動、先試再調整；優點是直接有衝勁，壓力下要留意急躁或太快下決定。",
    "落在金牛，會先求穩、看實際價值與可持續性；優點是耐性與穩定，壓力下要留意固執或不願變動。",
    "落在雙子，會透過資訊、比較與說明來理解事情；優點是反應快、學得快，壓力下要留意分心或想太多。",
    "落在巨蟹，會先看安全感、熟悉感與情感連結；優點是敏感細膩、有照顧力，壓力下要留意防衛或被舊情緒牽動。",
    "落在獅子，會重視表達、創造與被看見；優點是存在感和帶動力，壓力下要留意自尊受傷或過度在意認可。",
    "落在處女，會先找問題、修正細節、讓事情更有效；優點是精準和實用，壓力下要留意過度挑剔或一直覺得還不夠好。",
    "落在天秤，會先衡量雙方、關係與公平；優點是協調和判斷，壓力下要留意猶豫或為了和諧壓住自己。",
    "落在天蠍，會深入看動機、界線與信任；優點是洞察和韌性，壓力下要留意控制、猜疑或不容易放下。",
    "落在射手，會先看方向、意義和更大的可能；優點是開闊和恢復力，壓力下要留意太快跳到結論或忽略細節。",
    "落在摩羯，會先穩住局面、扛責任、看長期結果；優點是耐力和可靠，壓力下要留意把自己逼太緊、什麼都自己扛。",
    "落在水瓶，會先保持距離、獨立思考並找不同做法；優點是客觀和創新，壓力下要留意過度抽離或不願被限制。",
    "落在雙魚，會先感受整體氣氛、直覺與他人狀態；優點是共感和想像，壓力下要留意界線模糊或容易被環境帶走。"
  ],
  "zh-Hans": [
    "落在白羊，通常会先行动、先试再调整；优点是直接有冲劲，压力下要留意急躁或太快下决定。",
    "落在金牛，会先求稳、看实际价值与可持续性；优点是耐性与稳定，压力下要留意固执或不愿变动。",
    "落在双子，会透过资讯、比较与说明来理解事情；优点是反应快、学得快，压力下要留意分心或想太多。",
    "落在巨蟹，会先看安全感、熟悉感与情感连结；优点是敏感细腻、有照顾力，压力下要留意防卫或被旧情绪牵动。",
    "落在狮子，会重视表达、创造与被看见；优点是存在感和带动力，压力下要留意自尊受伤或过度在意认可。",
    "落在处女，会先找问题、修正细节、让事情更有效；优点是精准和实用，压力下要留意过度挑剔或一直觉得还不够好。",
    "落在天秤，会先衡量双方、关系与公平；优点是协调和判断，压力下要留意犹豫或为了和谐压住自己。",
    "落在天蝎，会深入看动机、界线与信任；优点是洞察和韧性，压力下要留意控制、猜疑或不容易放下。",
    "落在射手，会先看方向、意义和更大的可能；优点是开阔和恢复力，压力下要留意太快跳到结论或忽略细节。",
    "落在摩羯，会先稳住局面、扛责任、看长期结果；优点是耐力和可靠，压力下要留意把自己逼太紧、什么都自己扛。",
    "落在水瓶，会先保持距离、独立思考并找不同做法；优点是客观和创新，压力下要留意过度抽离或不愿被限制。",
    "落在双鱼，会先感受整体气氛、直觉与他人状态；优点是共感和想象，压力下要留意界线模糊或容易被环境带走。"
  ],
  en: [
    "With Aries, the first move is usually action: try, then adjust. The strength is initiative; under pressure, watch haste and snap decisions.",
    "With Taurus, the first priority is stability, practical value and staying power. The strength is patience; under pressure, watch rigidity or resistance to change.",
    "With Gemini, you process through information, comparison and explanation. The strength is quick learning; under pressure, watch distraction or overthinking.",
    "With Cancer, you first register safety, familiarity and emotional connection. The strength is sensitivity and care; under pressure, watch defensiveness or old feelings taking over.",
    "With Leo, expression, creativity and being seen matter. The strength is presence and leadership; under pressure, watch wounded pride or too much dependence on recognition.",
    "With Virgo, you look for what can be fixed, refined or made more useful. The strength is precision; under pressure, watch perfectionism or feeling that nothing is good enough.",
    "With Libra, you weigh both sides, relationships and fairness. The strength is balance and coordination; under pressure, watch indecision or silencing yourself to keep the peace.",
    "With Scorpio, you look beneath the surface at motives, boundaries and trust. The strength is insight and resilience; under pressure, watch control, suspicion or difficulty letting go.",
    "With Sagittarius, you look for direction, meaning and a wider possibility. The strength is perspective and recovery; under pressure, watch jumping to conclusions or skipping details.",
    "With Capricorn, you tend to stabilise the situation, carry responsibility and think long term. The strength is endurance and reliability; under pressure, watch carrying too much alone.",
    "With Aquarius, you step back, think independently and look for a different solution. The strength is objectivity and originality; under pressure, watch over-detachment or resisting all limits.",
    "With Pisces, you absorb the atmosphere, intuition and other people's states. The strength is empathy and imagination; under pressure, watch blurred boundaries or being swept along by the environment."
  ],
} as const satisfies Record<Locale, readonly string[]>;

const DIMENSION_PLAIN = {
  "zh-Hant": {
    core: "這裡看你遇到事情時最先啟動的底層反應。",
    emotion: "這裡看壓力、親密與情緒被碰到時，你最自然的處理方式。",
    duty: "這裡看人生中容易反覆出現、需要你學會承擔或調整的課題。",
    resource: "這裡看你跨環境也能帶走、越用越熟的能力與優勢。",
    relation: "這裡看你在關係中真正重視、也最容易被觸動的價值。"
  },
  "zh-Hans": {
    core: "这里看你遇到事情时最先启动的底层反应。",
    emotion: "这里看压力、亲密与情绪被碰到时，你最自然的处理方式。",
    duty: "这里看人生中容易反复出现、需要你学会承担或调整的课题。",
    resource: "这里看你跨环境也能带走、越用越熟的能力与优势。",
    relation: "这里看你在关系中真正重视、也最容易被触动的价值。"
  },
  en: {
    core: "This describes the default response that tends to switch on first when something happens.",
    emotion: "This describes how you naturally handle pressure, closeness and emotional activation.",
    duty: "This describes responsibilities or lessons that can repeat until you learn how to carry or adjust them.",
    resource: "This describes strengths you can carry across environments and improve through repeated use.",
    relation: "This describes what you genuinely value in close relationships and what most easily affects you there."
  },
} as const satisfies Record<Locale, Record<ThemeKey, string>>;

const COPY = {
  "zh-Hant": {
    kicker: "前世今生 · 補充旁證",
    title: "印度古法占星",
    note: "（這一段採用印度古法占星的細分方法作為輔助旁證，對出生分鐘非常敏感：每個細分區只有 0.5°；上升點平均約每 4 分鐘移動 1°，因此大約 2 分鐘就可能跨過一個細分區。實際速度會隨出生地、緯度與當時的上升速度改變。若你提供的是估算時間、整點時間或家人回憶，這部分只能作低置信度參考，不是絕對答案。）",
    unavailable: "本次報告沒有同時提供「可核對到分鐘的出生時間＋出生地」，因此印度古法占星不作判定。系統不會再從帳戶舊資料或其他報告自動補算。",
    calculating: "正在用本次報告的出生時間與出生地計算印度古法占星旁證…",
    failed: "印度古法占星暫時無法計算；前四世報告不受影響。",
    stable: "以本次提供的時間前後各移動 2 分鐘測試，上升細分結果仍一致。這只代表這個很小的時間範圍相對穩定，仍不是絕對結論。",
    unstable: "以本次提供的時間前後各移動 2 分鐘測試，上升細分結果已發生變化，因此這一段只作弱旁證。",
    core: "核心慣性", emotion: "情緒慣性", duty: "反覆責任", resource: "帶得走的資源", relation: "關係價值",
    expand: "點開看白話解釋", collapse: "收起白話解釋",
    synthesis: "把它和前四世合起來看：重複出現的主題可以視為比較值得留意的慣性；只在印度古法占星單獨出現的內容，不升級成確定結論。"
  },
  "zh-Hans": {
    kicker: "前世今生 · 补充旁证",
    title: "印度古法占星",
    note: "（这一段采用印度古法占星的细分方法作为辅助旁证，对出生分钟非常敏感：每个细分区只有 0.5°；上升点平均约每 4 分钟移动 1°，因此大约 2 分钟就可能跨过一个细分区。实际速度会随出生地、纬度与当时的上升速度改变。如果你提供的是估算时间、整点时间或家人回忆，这部分只能作低置信度参考，不是绝对答案。）",
    unavailable: "本次报告没有同时提供“可核对到分钟的出生时间＋出生地”，因此印度古法占星不作判断。系统不会再从账户旧资料或其他报告自动补算。",
    calculating: "正在用本次报告的出生时间与出生地计算印度古法占星旁证…",
    failed: "印度古法占星暂时无法计算；前四世报告不受影响。",
    stable: "以本次提供的时间前后各移动 2 分钟测试，上升细分结果仍一致。这只代表这个很小的时间范围相对稳定，仍不是绝对结论。",
    unstable: "以本次提供的时间前后各移动 2 分钟测试，上升细分结果已经发生变化，因此这一段只作弱旁证。",
    core: "核心惯性", emotion: "情绪惯性", duty: "反复责任", resource: "带得走的资源", relation: "关系价值",
    expand: "点开看白话解释", collapse: "收起白话解释",
    synthesis: "把它和前四世合起来看：重复出现的主题可以视为比较值得留意的惯性；只在印度古法占星单独出现的内容，不升级成确定结论。"
  },
  en: {
    kicker: "PAST & PRESENT · SUPPORTING VIEW",
    title: "Indian Classical Astrology",
    note: "(This section uses a fine-division method from Indian classical astrology as supporting context. It is extremely sensitive to the recorded birth minute: each division is only 0.5°, and the Ascendant moves about 1° every four minutes on average, so a division can change in roughly two minutes. The real rate varies with birthplace, latitude and the rising speed at that moment. If your time is estimated, rounded or remembered by family, treat this as low-confidence context rather than a definite answer.)",
    unavailable: "This report does not contain both a documented minute-level birth time and a birthplace, so Indian classical astrology is withheld. The system no longer falls back to old account data or another report.",
    calculating: "Calculating the Indian classical astrology cross-check from this report's birth time and birthplace…",
    failed: "Indian classical astrology could not be calculated right now. The four-life report is unaffected.",
    stable: "Moving this report's supplied birth time two minutes earlier and later keeps the rising fine-division result unchanged. That only suggests relative stability inside this very small window; it is still not absolute.",
    unstable: "Moving this report's supplied birth time two minutes earlier and later changes the rising fine-division result, so this section is treated only as weak supporting context.",
    core: "Core pattern", emotion: "Emotional habit", duty: "Repeated duty", resource: "Carried resource", relation: "Relationship values",
    expand: "Tap for a plain-language explanation", collapse: "Hide plain-language explanation",
    synthesis: "Read this beside the four prior-life patterns. Themes that repeat across both can be treated as more noteworthy; a theme appearing only in Indian classical astrology is not promoted into a definite conclusion."
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

function plainExplanation(key: ThemeKey, signIndex: number, locale: Locale) {
  return `${DIMENSION_PLAIN[locale][key]} ${SIGN_PLAIN[locale][signIndex]}`;
}

export function D60KarmaSection() {
  const { locale } = useI18n();
  const copy = COPY[locale];
  const target = usePalmReportPortalTarget();
  const [birth, setBirth] = useState<ReportBirth | null>(null);
  const [result, setResult] = useState<D60Result | null>(null);
  const [status, setStatus] = useState<"idle" | "loading" | "ready" | "error">("idle");
  const [openTheme, setOpenTheme] = useState<ThemeKey | null>(null);
  const syncedRef = useRef("");

  useEffect(() => {
    const receiveBirth = (event: Event) => {
      const detail = (event as CustomEvent<ReportBirth | null>).detail;
      setBirth(detail ?? null);
      setOpenTheme(null);
      if (!detail) {
        setResult(null);
        setStatus("idle");
      }
    };
    window.addEventListener(D60_BIRTH_EVENT, receiveBirth);
    return () => window.removeEventListener(D60_BIRTH_EVENT, receiveBirth);
  }, []);

  useEffect(() => {
    if (!birth) { setResult(null); setStatus("idle"); return; }
    let alive = true;
    setStatus("loading");
    void loadAstronomy().then((api) => {
      const utc = localBirthToUtc({ year: birth.year, month: birth.month, day: birth.day, hour: birth.hour, minute: birth.minute, timezone: birth.city.timezone });
      const next = calculateD60(api, utc, birth.city);
      if (alive) { setResult(next); setStatus("ready"); }
    }).catch(() => { if (alive) { setResult(null); setStatus("error"); } });
    return () => { alive = false; };
  }, [birth]);

  const themes = useMemo(() => {
    if (!result) return [];
    const byKey = Object.fromEntries(result.placements.map((placement) => [placement.key, placement])) as Partial<Record<D60Key, D60Placement>>;
    return [
      ["core", copy.core, byKey.Ascendant],
      ["emotion", copy.emotion, byKey.Moon],
      ["duty", copy.duty, byKey.Saturn],
      ["resource", copy.resource, byKey.Jupiter],
      ["relation", copy.relation, byKey.Venus],
    ].flatMap(([key, label, placement]) => placement ? [{ key: key as ThemeKey, label: label as string, placement: placement as D60Placement }] : []);
  }, [copy, result]);

  const stable = Boolean(result?.stableMinus2 && result?.stablePlus2);
  const historyBody = useMemo(() => {
    if (!birth) return `${copy.note}\n${copy.unavailable}`;
    if (!result) return `${copy.note}\n${status === "error" ? copy.failed : copy.calculating}`;
    return [
      copy.note,
      ...themes.map(({ key, label, placement }) => `${label}：${signName(placement.d60Sign, locale)} · ${SIGN_THEMES[locale][placement.d60Sign]}\n${plainExplanation(key, placement.d60Sign, locale)}`),
      stable ? copy.stable : copy.unstable,
      copy.synthesis,
    ].join("\n");
  }, [birth, copy, locale, result, stable, status, themes]);

  useEffect(() => {
    if (!target || status === "loading") return;
    const key = `${locale}:${result?.utcIso ?? "no-d60"}:${historyBody}`;
    if (syncedRef.current === key) return;
    const latest = readSpecialistHistory()[0];
    if (!latest || latest.kind !== "yizhangjing") return;
    const sections = latest.sections.filter((section) => !/^(D60\b|印度古法占星|Indian Classical Astrology)/i.test(section.title));
    const saved = saveSpecialistHistory({ ...latest, sections: [...sections, { title: copy.title, body: historyBody }] });
    if (saved) syncedRef.current = key;
  }, [copy.title, historyBody, locale, result?.utcIso, status, target]);

  if (!target) return null;

  const card = (
    <article className="relative overflow-hidden rounded-2xl border border-[#b99755]/35 bg-[#fffaf2] p-5 shadow-[inset_4px_0_0_rgba(111,82,59,.55)]" aria-label={copy.title}>
      <div aria-hidden className="pointer-events-none absolute -right-10 -top-10 h-28 w-28 rounded-full border border-[#8e4538]/10" />
      <div className="relative">
        <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-[#7c5b43]">{copy.kicker}</p>
        <h3 className="mt-1 font-display text-xl font-semibold tracking-[0.05em] text-ink">{copy.title}</h3>
        <p className="mt-3 text-xs leading-6 text-ink-mute">{copy.note}</p>

        {!birth ? <p className="mt-4 rounded-xl border border-cinnabar/20 bg-cinnabar/5 px-3 py-3 text-sm leading-7 text-ink-soft">{copy.unavailable}</p> : null}
        {birth && status === "loading" ? <p className="mt-4 text-sm leading-7 text-ink-soft">{copy.calculating}</p> : null}
        {birth && status === "error" ? <p className="mt-4 text-sm leading-7 text-ink-soft">{copy.failed}</p> : null}
        {result ? <>
          <div className="mt-4 grid gap-2 sm:grid-cols-2">
            {themes.map(({ key, label, placement }) => {
              const isOpen = openTheme === key;
              const explanationId = `indian-astrology-${key}`;
              return (
                <div key={key} className="overflow-hidden rounded-xl border border-line/70 bg-paper/65">
                  <button
                    type="button"
                    className="w-full px-3 py-3 text-left focus:outline-none focus-visible:ring-2 focus-visible:ring-cinnabar/35"
                    aria-expanded={isOpen}
                    aria-controls={explanationId}
                    onClick={() => setOpenTheme((current) => current === key ? null : key)}
                  >
                    <span className="flex items-start justify-between gap-3">
                      <span>
                        <span className="block text-[10px] font-semibold tracking-[0.12em] text-cinnabar">{label}</span>
                        <span className="mt-1 block text-sm font-medium text-ink">{signName(placement.d60Sign, locale)}</span>
                        <span className="mt-1 block text-xs leading-5 text-ink-soft">{SIGN_THEMES[locale][placement.d60Sign]}</span>
                      </span>
                      <span aria-hidden className="pt-1 text-lg leading-none text-cinnabar">{isOpen ? "⌃" : "⌄"}</span>
                    </span>
                    <span className="mt-2 block text-[11px] leading-5 text-ink-mute">{isOpen ? copy.collapse : copy.expand}</span>
                  </button>
                  {isOpen ? (
                    <div id={explanationId} className="border-t border-line/60 px-3 pb-4 pt-3">
                      <p className="text-sm leading-7 text-ink-soft">{plainExplanation(key, placement.d60Sign, locale)}</p>
                    </div>
                  ) : null}
                </div>
              );
            })}
          </div>
          <p className={`mt-4 rounded-xl border px-3 py-2 text-xs leading-6 ${stable ? "border-wood/25 bg-wood/5 text-ink-soft" : "border-cinnabar/25 bg-cinnabar/5 text-ink-soft"}`}>{stable ? copy.stable : copy.unstable}</p>
          <p className="mt-3 text-sm leading-7 text-ink-soft">{copy.synthesis}</p>
        </> : null}
      </div>
    </article>
  );

  return createPortal(card, target);
}
