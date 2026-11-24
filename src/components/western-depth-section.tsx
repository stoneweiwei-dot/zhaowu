import { useEffect, useMemo, useState } from "react";
import type { SharedBirthRecord } from "@/lib/shared-birth";
import {
  TEN_PLANETS, analyzeWesternChart, westernGroupNarrative,
  type WesternAnalysis, type WesternLocale, type WesternPlacement,
} from "@/lib/astrology/deep-engine";
import { computeAngles, computeHouses, houseOf, julianDay, ZODIAC_SIGNS, type HouseSystem } from "@/lib/astrology/engine";
import { buildWesternReportChapters, type WesternReportFacts, type WesternReportConfig } from "@/lib/astrology/report-protocol";
import { toSimplifiedCustomerText } from "@/lib/report/reading-locale";

function zhFacing(locale: string, hant: string) {
  if (locale !== "zh-Hans") return hant;
  return toSimplifiedCustomerText(hant).replaceAll("宮", "宫").replaceAll("軸", "轴");
}

type Astronomy = {
  GeoVector: (body: string, date: Date, aberration: boolean) => unknown;
  Ecliptic: (vector: unknown) => { elon: number };
};
type Snapshot = {
  format: "zhaowu-western-chart-v1";
  signature: string;
  houseSystem: HouseSystem;
  referenceUtc: string;
  source: "astronomy-engine@2.1.19";
  quality: "high" | "medium" | "low";
  provenance: "confirmed-minute" | "entered-minute" | "unknown";
  placements: WesternPlacement[];
  angles?: { ascendant: number; mc: number };
  houseCusps?: number[];
  analysis: WesternAnalysis;
};
const SCRIPT_ID = "zhaowu-astronomy-engine-d60";
const SCRIPT_SRC = "/vendor/astronomy-engine-2.1.19.browser.min.js";
const STORE = "charts";
let pending: Promise<Astronomy> | null = null;

function astronomy(): Promise<Astronomy> {
  const win = window as typeof window & { Astronomy?: Astronomy };
  if (win.Astronomy) return Promise.resolve(win.Astronomy);
  if (pending) return pending;
  pending = new Promise<Astronomy>((resolve, reject) => {
    const current = document.getElementById(SCRIPT_ID) as HTMLScriptElement | null;
    const script = current ?? document.createElement("script");
    script.addEventListener("load", () => win.Astronomy ? resolve(win.Astronomy) : reject(new Error("Astronomy API unavailable")), { once: true });
    script.addEventListener("error", () => reject(new Error("Astronomy script unavailable")), { once: true });
    if (!current) {
      script.id = SCRIPT_ID;
      script.src = SCRIPT_SRC;
      script.async = true;
      script.crossOrigin = "anonymous";
      document.head.appendChild(script);
    }
  }).catch(error => { pending = null; throw error; });
  return pending;
}

const norm = (n: number) => ((n % 360) + 360) % 360;
const signedDelta = (n: number) => ((n + 540) % 360) - 180;
const signOf = (lon: number) => Math.floor(norm(lon) / 30);
const pad = (n: number) => String(n).padStart(2, "0");
function signature(b: SharedBirthRecord) {
  return [b.year,b.month,b.day,b.timeUnknown ? "unknown" : pad(b.hour)+":"+pad(b.minute),
    b.city.timezone,b.city.latitude,b.city.longitude].join("|");
}

/** Reject ambiguous/nonexistent civil times instead of silently guessing DST. */
function localToUtc(b: SharedBirthRecord, hour: number, minute: number): Date {
  const fmt = new Intl.DateTimeFormat("en-GB", {
    timeZone: b.city.timezone, year: "numeric", month: "2-digit", day: "2-digit",
    hour: "2-digit", minute: "2-digit", hourCycle: "h23",
  });
  const target = [b.year,b.month,b.day,hour,minute].join(",");
  const matches: number[] = [];
  const localMs = Date.UTC(b.year,b.month-1,b.day,hour,minute);
  for (let i = -72; i <= 72; i++) {
    const ms = localMs + i * 15 * 60 * 1000;
    const record: Record<string, number> = {};
    for (const p of fmt.formatToParts(new Date(ms))) if (p.type !== "literal") record[p.type] = Number(p.value);
    if ([record.year,record.month,record.day,record.hour,record.minute].join(",") === target) matches.push(ms);
  }
  if (matches.length !== 1) throw new Error("Birth time is ambiguous or missing across a daylight-saving transition.");
  return new Date(matches[0]);
}
function gmstDegrees(date: Date) {
  const jd = julianDay(date);
  const t = (jd - 2451545) / 36525;
  return norm(280.46061837 + 360.98564736629 * (jd - 2451545) + 0.000387933 * t * t - t ** 3 / 38710000);
}
function longitudeOf(api: Astronomy, key: string, date: Date) {
  const lon = api.Ecliptic(api.GeoVector(key, date, true)).elon;
  if (!Number.isFinite(lon)) throw new Error("Invalid astronomical position: " + key);
  return norm(lon);
}

async function calculate(b: SharedBirthRecord, system: HouseSystem, confirmed: boolean): Promise<Snapshot> {
  const api = await astronomy();
  const reference = localToUtc(b,b.timeUnknown ? 12 : b.hour,b.timeUnknown ? 0 : b.minute);
  const earlier = b.timeUnknown ? localToUtc(b,0,0) : new Date(reference.getTime() - 120000);
  const later = b.timeUnknown ? localToUtc(b,23,59) : new Date(reference.getTime() + 120000);
  const known = !b.timeUnknown;
  const refAngles = known ? computeAngles({ date: reference, gmstDegrees: gmstDegrees(reference),
    latitude: b.city.latitude, longitude: b.city.longitude }) : null;
  const earlyAngles = known ? computeAngles({ date: earlier, gmstDegrees: gmstDegrees(earlier),
    latitude: b.city.latitude, longitude: b.city.longitude }) : null;
  const lateAngles = known ? computeAngles({ date: later, gmstDegrees: gmstDegrees(later),
    latitude: b.city.latitude, longitude: b.city.longitude }) : null;
  const refHouse = refAngles ? computeHouses(refAngles,b.city.latitude,system) : null;
  const earlyHouse = earlyAngles ? computeHouses(earlyAngles,b.city.latitude,system) : null;
  const lateHouse = lateAngles ? computeHouses(lateAngles,b.city.latitude,system) : null;
  const hasFallback = Boolean(refHouse?.fallback || earlyHouse?.fallback || lateHouse?.fallback);
  const stableHouseFrames = known && !hasFallback && Boolean(refHouse && earlyHouse && lateHouse);
  const positions: WesternPlacement[] = TEN_PLANETS.map(key => {
    const longitude = longitudeOf(api,key,reference);
    const startLon = longitudeOf(api,key,earlier);
    const endLon = longitudeOf(api,key,later);
    const retroEarlier = longitudeOf(api,key,new Date(reference.getTime() - 86400000));
    const retroLater = longitudeOf(api,key,new Date(reference.getTime() + 86400000));
    const signReliable = signOf(longitude) === signOf(startLon) && signOf(longitude) === signOf(endLon);
    const centerHouse = stableHouseFrames ? houseOf(longitude,refHouse!) : null;
    const beforeHouse = stableHouseFrames ? houseOf(startLon,earlyHouse!) : null;
    const afterHouse = stableHouseFrames ? houseOf(endLon,lateHouse!) : null;
    return {
      key,longitude,retrograde: signedDelta(retroLater-retroEarlier) < 0,
      house: centerHouse !== null && centerHouse === beforeHouse && centerHouse === afterHouse ? centerHouse : null,
      signReliable,
    };
  });
  const provenance = !known ? "unknown" : confirmed ? "confirmed-minute" : "entered-minute";
  const quality = !known ? "low" : confirmed ? "high" : "medium";
  const analysis = analyzeWesternChart({
    placements: positions, houseSystem: system, timeReliability: quality, provenance,
    houseFallback: hasFallback ? "Placidus is unavailable here; select Whole Sign explicitly." : undefined,
  });
  return {
    format: "zhaowu-western-chart-v1",signature:signature(b),houseSystem:system,
    referenceUtc:reference.toISOString(),source:"astronomy-engine@2.1.19",
    quality,provenance,placements:positions,
    angles: refAngles && stableHouseFrames ? { ascendant:refAngles.ascendant,mc:refAngles.mc } : undefined,
    houseCusps: stableHouseFrames ? refHouse!.cusps : undefined,
    analysis,
  };
}

function saveLocal(snapshot: Snapshot) {
  if (!("indexedDB" in window)) return;
  const request = indexedDB.open("zhaowu-western-local-v1",1);
  request.onupgradeneeded = () => { if (!request.result.objectStoreNames.contains(STORE)) request.result.createObjectStore(STORE); };
  request.onsuccess = () => {
    const db = request.result;
    const tx = db.transaction(STORE,"readwrite");
    tx.objectStore(STORE).put(snapshot, snapshot.signature + "/" + snapshot.houseSystem);
    tx.oncomplete = () => db.close();
    tx.onerror = () => db.close();
  };
}
function exportJSON(data: Snapshot) {
  const url = URL.createObjectURL(new Blob([JSON.stringify(data,null,2)],{type:"application/json"}));
  const anchor = document.createElement("a");
  anchor.href=url;
  anchor.download="zhaowu-western-natal.json";
  anchor.click();
  setTimeout(() => URL.revokeObjectURL(url),1000);
}
const labels: Record<string,Record<WesternLocale,string>> = {
  header: { "zh-Hant":"全盤十大行星・宮位集中度","zh-Hans":"全盘十大行星・宫位集中度",en:"Ten-planet house concentration" },
  loading: { "zh-Hant":"正在依出生地與本地時間計算天文位置…","zh-Hans":"正在按出生地与本地时间计算天文位置…",en:"Calculating positions from local birth time…" },
  export: { "zh-Hant":"匯出本機 JSON","zh-Hans":"导出本机 JSON",en:"Export local JSON" },
  import: { "zh-Hant":"匯入 JSON","zh-Hans":"导入 JSON",en:"Import JSON" },
  verified: { "zh-Hant":"我已核對出生證明上的分鐘","zh-Hans":"我已核对出生证明上的分钟",en:"I verified the minute on a birth record" },
  disclaimer: { "zh-Hant":"僅作西方占星文化詮釋；與八字十神不作等值換算，不代替醫療或重大決策。","zh-Hans":"仅作西方占星文化诠释；不与八字十神等值换算，不替代医疗或重大决策。",en:"Astrological symbolism only. Not equivalent to BaZi ten gods or a substitute for professional decisions." },
  withheld: { "zh-Hant":"時辰不足或部分星體跨宮：全盤主導組不作判定。","zh-Hans":"时辰不足或部分星体跨宫：全盘主导组不作判断。",en:"Birth time or house stability is insufficient: no dominant group assigned." },
};
const planetNames: Record<string,Record<WesternLocale,string>> = {
  Sun:{"zh-Hant":"太陽","zh-Hans":"太阳",en:"Sun"},
  Moon:{"zh-Hant":"月亮","zh-Hans":"月亮",en:"Moon"},
  Mercury:{"zh-Hant":"水星","zh-Hans":"水星",en:"Mercury"},
  Venus:{"zh-Hant":"金星","zh-Hans":"金星",en:"Venus"},
  Mars:{"zh-Hant":"火星","zh-Hans":"火星",en:"Mars"},
  Jupiter:{"zh-Hant":"木星","zh-Hans":"木星",en:"Jupiter"},
  Saturn:{"zh-Hant":"土星","zh-Hans":"土星",en:"Saturn"},
  Uranus:{"zh-Hant":"天王星","zh-Hans":"天王星",en:"Uranus"},
  Neptune:{"zh-Hant":"海王星","zh-Hans":"海王星",en:"Neptune"},
  Pluto:{"zh-Hant":"冥王星","zh-Hans":"冥王星",en:"Pluto"},
};

export function WesternDepthSection({ birth, locale, mode, houseSystem, onHouseSystemChange }: {
  birth: SharedBirthRecord; locale: WesternLocale; mode:"free"|"paid";
  houseSystem: HouseSystem; onHouseSystemChange: (system: HouseSystem) => void;
}) {
  const [confirmed,setConfirmed] = useState(false);
  const [snapshot,setSnapshot] = useState<Snapshot | null>(null);
  const [error,setError] = useState("");
  const [importNote,setImportNote] = useState("");
  const key = signature(birth);

  useEffect(() => {
    const storageKey = "zhaowu-western-minute-confirmed:" + key;
    const refresh = () => setConfirmed(window.sessionStorage.getItem(storageKey) === "yes");
    refresh();
    window.addEventListener("zhaowu-western-minute",refresh);
    return () => window.removeEventListener("zhaowu-western-minute",refresh);
  },[key]);

  useEffect(() => {
    let mounted = true;
    setSnapshot(null); setError("");
    void calculate(birth,houseSystem,confirmed).then(result => {
      if (!mounted) return;
      setSnapshot(result); saveLocal(result);
    }).catch(reason => {
      if (mounted) setError(reason instanceof Error ? reason.message : "Calculation unavailable");
    });
    return () => { mounted=false; };
  },[key,houseSystem,confirmed]);

  const label=(name:string)=>labels[name][locale];
  const analysis=snapshot?.analysis;
  const groups=analysis?.densities ?? [];
  const chapters = useMemo(() => {
    if (!snapshot) return [];
    try {
      const facts: WesternReportFacts = {
        zodiac:"tropical",houseSystem,
        source:snapshot.source,
        birthTimeBasis: snapshot.provenance==="confirmed-minute"?"documented-minute":snapshot.provenance,
        analysis:snapshot.analysis,planets:snapshot.placements,
        angles:snapshot.angles,
        houses:snapshot.houseCusps?{cusps:snapshot.houseCusps,system:houseSystem}:undefined,
      };
      const config:WesternReportConfig = {
        locale,style:"direct",targetCharacters:4000,
        includeBazi:false,includeZiwei:false,includeVedic:false,includeTransits:false,
      };
      return buildWesternReportChapters(facts,config);
    } catch { return []; }
  },[snapshot,houseSystem,locale]);


  if (mode === "paid") return <section className="zhaowu-specialist-overview" data-western-depth="paid">
    <h2>{locale==="en"?"Life themes · evidence and action":locale==="zh-Hans"?"人生主轴・证据与行动":"人生主軸・證據與行動"}</h2>
    {!analysis ? <p>{error||label("loading")}</p> :
      analysis.houseCount!==10 ? <p>{label("withheld")}</p> : <>
        <p>{analysis.leadingGroup
          ? (locale==="en"?"Convergent dominant group: ":zhFacing(locale,"集中主軸："))+analysis.leadingGroup
          : (locale==="en"?"Mixed chart: no single group wins both total and density.":zhFacing(locale,"混合盤：總數與每宮密度未同時支持單一主軸，不強判。"))}</p>
        {groups.map(group=>{
          const copy=westernGroupNarrative(group.group,locale);
          return <article key={group.group}>
            <h3>{group.group} · {copy.label} · {group.count}/10</h3>
            <p>{copy.foundation}。{copy.strengths}</p>
            <p>{locale==="en"?"Imbalance: ":zhFacing(locale,"失衡面：")}{copy.risks}</p>
            <p>{locale==="en"?"Action: ":zhFacing(locale,"行動：")}{copy.action}</p>
            <small>{locale==="en"?"Evidence: ":zhFacing(locale,"落宮依據：")}{group.occupants.map(k=>planetNames[k][locale]).join("、")||"—"}；{locale==="en"?"seven classical: ":zhFacing(locale,"古典七曜：")}{group.classicalCount}</small>
          </article>;
        })}
        <p>{locale==="en"?"Closest major aspects: ":zhFacing(locale,"主要相位（按容許度）：")}{analysis.aspects.slice(0,3).map(a=>`${planetNames[a.a][locale]}–${planetNames[a.b][locale]} ${a.type} ${a.orb.toFixed(1)}°`).join("；")||"—"}</p>
        <section aria-label={locale==="en"?"Ten-chapter Western report":zhFacing(locale,"西方占星十章報告")}>
          <h3>{locale==="en"?"Personal ten-chapter report outline":zhFacing(locale,"個人化十章報告")}</h3>
          <p>{locale==="en"
            ?"Each chapter cites actual chart positions. Unsupported techniques and future transits are explicitly withheld. No fabricated 3,000–5,000-character AI expansion is shown."
            :zhFacing(locale,"每章只使用已有命盤證據；未計算的行運、特殊點與跨系統旁證明確留白，不以模板灌水冒充三至五千字 AI 深讀。")}</p>
          {chapters.map(ch=><details key={ch.number} style={{marginBlock:12}}>
            <summary style={{cursor:"pointer",fontWeight:650,paddingBlock:6}}>【{ch.number}｜{ch.title}】{ch.status==="limited"?" · "+(locale==="en"?"unavailable":zhFacing(locale,"未判")):""}</summary>
            <p>{ch.summary}</p>
            <p>{ch.action}</p>
            <p style={{fontSize:"0.9em"}}><strong>{locale==="en"?"Evidence":zhFacing(locale,"依據")}：</strong>{ch.evidence.length
              ?ch.evidence.slice(0,12).map(item=>item.source+":"+item.text).join("；")
              :(locale==="en"?"Not calculated":zhFacing(locale,"未計算"))}</p>
          </details>)}
        </section>
        <p>{locale==="en"?"Vedic context is separate: use its D1/D60 reliability rules, never force agreement.":zhFacing(locale,"印度占星只作獨立旁證：須另依 D1／D60 自身精度規則核算，不能為一致而強行互證。")} <a href="/indian-astrology">{locale==="en"?"Indian astrology":"印度占星"}</a></p>
      </>}
    <p><small>{label("disclaimer")}</small></p>
  </section>;

  return <section className="zhaowu-specialist-overview" data-western-depth="free">
    <h2>{label("header")}</h2>
    {!birth.timeUnknown ? <label style={{display:"block",marginBottom:12}}>
      <input type="checkbox" checked={confirmed} onChange={e=>{
        window.sessionStorage.setItem("zhaowu-western-minute-confirmed:"+key,e.target.checked?"yes":"no");
        window.dispatchEvent(new Event("zhaowu-western-minute"));
      }}/> {label("verified")}
    </label>:null}
    <label>{locale==="en"?"Ten-planet house system (the classical wheel above remains Placidus)":zhFacing(locale,"十大行星宮位制（上方古典星輪維持 Placidus）")}{" "}
      <select value={houseSystem} onChange={e=>onHouseSystemChange(e.target.value as HouseSystem)}>
        <option value="placidus">Placidus</option><option value="whole">Whole Sign</option>
      </select>
    </label>
    {!analysis ? <p role="status">{error||label("loading")}</p> : <>
      <p>{locale==="en"?"Planetary positions":zhFacing(locale,"十大行星星位")}：{analysis.computedBodies}/10 ·
      {locale==="en"?" Houses confirmed ":zhFacing(locale," 已確認落宮 ")}{analysis.houseCount}/10 ·
      {locale==="en"?" Reliability ":zhFacing(locale," 可靠度 ")}{snapshot!.quality}</p>
      {analysis.houseCount!==10 ? <p>{label("withheld")}</p> : <p>{locale==="en"?"Main theme: ":zhFacing(locale,"全盤主軸：")}{analysis.leadingGroup?westernGroupNarrative(analysis.leadingGroup,locale).label:(locale==="en"?"mixed / not asserted":zhFacing(locale,"混合／不強判"))}</p>}
      <div style={{display:"grid",gridTemplateColumns:"repeat(2,minmax(0,1fr))",gap:8,marginTop:12}} aria-label={locale==="en"?"Ten planetary positions":zhFacing(locale,"十大行星黃經")}>
        {snapshot!.placements.map(p=><span key={p.key} style={{fontSize:"0.9em"}}>{planetNames[p.key][locale]}：{p.signReliable?ZODIAC_SIGNS[Math.floor(norm(p.longitude)/30)]:"?"} {p.longitude.toFixed(2)}°{p.retrograde?" R":""}</span>)}
      </div>
      {analysis.houseCount ? <div style={{display:"grid",gridTemplateColumns:"repeat(3,minmax(0,1fr))",gap:8}}>
        {analysis.byHouse.map((number,i)=><span key={i}>{locale==="en"?"H":zhFacing(locale,"宮")}{i+1}：{number}</span>)}
      </div>:null}
      <p>{groups.map(g=>`${g.group} ${g.count}/10（${g.perHouse.toFixed(2)}/宮）`).join(" · ")}</p>
      <small>{locale==="en"?"Totals are descriptive; group sizes differ.":zhFacing(locale,"分組同時公開原始數量與每宮密度；宮數不同，不以數量硬排名。")}</small>
      {analysis.warnings.map(w=><p key={w}><small>{w}</small></p>)}
      <p><button type="button" onClick={()=>snapshot&&exportJSON(snapshot)}>{label("export")}</button>{" "}
        <label>{label("import")}<input type="file" accept=".json,application/json" onChange={async e=>{
          const file=e.target.files?.[0];if(!file)return;
          try {
            const imported=JSON.parse(await file.text()) as Snapshot;
            if (imported.format!=="zhaowu-western-chart-v1" || imported.signature!==key ||
                imported.houseSystem!==houseSystem || !Array.isArray(imported.placements)) throw new Error("Birth data, system or file format mismatch");
            imported.analysis=analyzeWesternChart({
              placements:imported.placements,houseSystem,
              timeReliability:imported.quality,provenance:imported.provenance,
            });
            setSnapshot(imported);saveLocal(imported);
            setImportNote(locale==="en"?"Imported locally.":zhFacing(locale,"已匯入本機。"));
          } catch (reason) {setImportNote(String(reason));}
          e.target.value="";
        }}/></label></p>
      {importNote?<p role="status">{importNote}</p>:null}
    </>}
    <p><small>{label("disclaimer")}</small></p>
  </section>;
}
