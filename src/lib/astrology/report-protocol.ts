/**
 * ZHAOWU Western Astrology · customer-report protocol v2.
 *
 * Grounded report blueprints and server-side AI prompt construction.
 * This module NEVER calculates ephemeris positions, diagnoses illnesses,
 * unlocks payment, retrieves private data or calls an LLM.
 */
import {
  TEN_PLANETS, westernGroupNarrative,
  type WesternAnalysis, type WesternLocale, type WesternPlacement,
} from "./deep-engine";
import {
  ZODIAC_SIGNS, traditionalDignity, traditionalRuler, houseOf,
  type ChartAngles, type HouseChart, type ClassicalPlanetKey,
  type ModernPlanetKey,
} from "./engine";

export type Evidence = { source: "western" | "bazi" | "ziwei" | "vedic" | "transit"; id: string; text: string };
export type ExternalReading = {
  calculated: boolean;
  sourceVersion: string;
  evidence: Evidence[];
};
export type TransitEvidence = {
  utc: string;
  movingBody: ModernPlanetKey;
  natalBody: ModernPlanetKey;
  aspect: string;
  orb: number;
};
export type WesternReportConfig = {
  locale: WesternLocale;
  style: "direct" | "gentle" | "neutral";
  targetCharacters: number;
  order?: readonly number[];
  includeBazi: boolean;
  includeZiwei: boolean;
  includeVedic: boolean;
  includeTransits: boolean;
};
export type WesternReportFacts = {
  zodiac: "tropical" | "sidereal";
  houseSystem: "placidus" | "whole" | "equal" | "alcabitius";
  source: string;
  birthTimeBasis: "documented-minute" | "entered-minute" | "unknown";
  analysis: WesternAnalysis;
  planets: WesternPlacement[];
  angles?: Pick<ChartAngles, "ascendant" | "mc">;
  houses?: Pick<HouseChart, "cusps" | "system">;
  bazi?: ExternalReading;
  ziwei?: ExternalReading;
  vedic?: ExternalReading;
  transits?: TransitEvidence[];
};
export type ReportChapter = {
  number: number;
  title: string;
  status: "supported" | "limited";
  evidence: Evidence[];
  summary: string;
  action: string;
};

export const REPORT_CHAPTERS = [
  ["命盤總覽","性格與自我","事業與財富","感情與關係","家庭與根源",
   "身心照顧","精神課題","未來12–18個月行運","特殊配置","綜合建議"],
  ["命盘总览","性格与自我","事业与财富","感情与关系","家庭与根源",
   "身心照顾","精神课题","未来12–18个月行运","特殊配置","综合建议"],
  ["Natal overview","Identity & temperament","Career & resources","Relationships","Home & roots",
   "Wellbeing","Growth & meaning","Next 12–18 months","Distinctive configurations","Practical synthesis"],
] as const;

const PLACEHOLDER: Record<WesternLocale, string> = {
  "zh-Hant": "此項尚無可核驗排盤資料，不作判定。",
  "zh-Hans": "此项尚无可核验排盘资料，不作判断。",
  en: "No verified chart data for this topic; no finding is made.",
};
const advicePrefix = (locale: WesternLocale) => locale === "en" ? "You can try: " : locale === "zh-Hans" ? "你可以这样做：" : "你可以這樣做：";
const ZZ: Record<WesternLocale, string[]> = {
  "zh-Hant": ["牡羊","金牛","雙子","巨蟹","獅子","處女","天秤","天蠍","射手","摩羯","水瓶","雙魚"],
  "zh-Hans": ["白羊","金牛","双子","巨蟹","狮子","处女","天秤","天蝎","射手","摩羯","水瓶","双鱼"],
  en: [...ZODIAC_SIGNS],
};
const PP: Record<WesternLocale, Record<ModernPlanetKey,string>> = {
  "zh-Hant": { Sun:"太陽", Moon:"月亮", Mercury:"水星", Venus:"金星", Mars:"火星", Jupiter:"木星", Saturn:"土星", Uranus:"天王星", Neptune:"海王星", Pluto:"冥王星" },
  "zh-Hans": { Sun:"太阳", Moon:"月亮", Mercury:"水星", Venus:"金星", Mars:"火星", Jupiter:"木星", Saturn:"土星", Uranus:"天王星", Neptune:"海王星", Pluto:"冥王星" },
  en: { Sun:"Sun", Moon:"Moon", Mercury:"Mercury", Venus:"Venus", Mars:"Mars", Jupiter:"Jupiter", Saturn:"Saturn", Uranus:"Uranus", Neptune:"Neptune", Pluto:"Pluto" },
};
const fmt = (n:number) => Number(n).toFixed(2);
const e = (id:string, text:string, source:Evidence["source"]="western"):Evidence=>({id,text,source});

export function validateWesternReportFacts(f: WesternReportFacts): void {
  if (!f || !f.analysis || !f.planets || f.planets.length !== 10) throw new Error("Missing ten-planet chart evidence");
  const keys = f.planets.map(p=>p.key);
  if (new Set(keys).size !== 10 || TEN_PLANETS.some(key=>!keys.includes(key))) throw new Error("Missing or duplicated planet");
  if (f.planets.some(p=>!Number.isFinite(p.longitude)||p.longitude<0||p.longitude>=360)) throw new Error("Invalid longitude");
  if (f.angles && (!Number.isFinite(f.angles.ascendant)||!Number.isFinite(f.angles.mc))) throw new Error("Invalid angles");
  if (f.houses && (f.houses.cusps.length!==12||f.houses.cusps.some(c=>!Number.isFinite(c)))) throw new Error("Invalid house cusps");
  if (f.analysis.houseCount !== f.planets.filter(p=>p.house!==null).length) throw new Error("Mismatched house census");
  if (f.zodiac !== "tropical") throw new Error("Sidereal calculations require a separate, explicitly identified ayanamsa engine");
  if (f.houseSystem === "alcabitius") throw new Error("Alcabitius must be calculated by a verified house solver first");
}

export function buildWesternReportChapters(f:WesternReportFacts, cfg:WesternReportConfig):ReportChapter[] {
  validateWesternReportFacts(f);
  const lang=cfg.locale;
  const labels=REPORT_CHAPTERS[lang==="zh-Hant"?0:lang==="zh-Hans"?1:2];
  const isEn=lang==="en";
  const timeOK=f.analysis.reliability.houses!=="low" && f.analysis.houseCount===10;
  const pl=(key:ModernPlanetKey)=>f.planets.find(p=>p.key===key)!;
  const position=(key:ModernPlanetKey)=>{
    const p=pl(key);
    const sign=ZZ[lang][Math.floor(p.longitude/30)];
    return PP[lang][key]+" "+(p.signReliable?sign:"["+ (isEn?"sign uncertain":"星座交界待定")+"]")+" "+fmt(p.longitude%30)+"°"+(timeOK&&p.house!==null?" H"+p.house:"");
  };
  const entry=(keys:ModernPlanetKey[])=>keys.map(k=>e("planet."+k,position(k)));
  const occupants=(houses:number[])=>f.planets.filter(p=>p.house!==null&&houses.includes(p.house));
  const inH=(houses:number[])=>occupants(houses).map(p=>e("house."+p.house+"."+p.key,position(p.key)));
  const cuspEv=(houses:number[])=> timeOK&&f.houses? houses.map(h=>{
    const longitude=f.houses!.cusps[h-1];
    const signIndex=Math.floor(((longitude%360)+360)%360/30);
    return e("cusp."+h,"H"+h+" "+ZZ[lang][signIndex]+" "+fmt(longitude%30)+"°; classical ruler "+traditionalRuler(signIndex));
  }):[];
  const mcHouse=timeOK&&f.houses&&f.angles?houseOf(f.angles.mc,{
    system:f.houses.system,requestedSystem:f.houses.system,cusps:f.houses.cusps,
  }):null;
  const angleEv=timeOK&&f.angles?[
    e("angle.asc","ASC "+fmt(f.angles.ascendant)+"°"),
    e("angle.mc","MC "+fmt(f.angles.mc)+"°"+(mcHouse?" H"+mcHouse:"")),
  ]:[];
  const generic=(text:string, action:string, evidence:Evidence[],number:number):ReportChapter=>({
    number,title:labels[number-1],status:evidence.length?"supported":"limited",
    evidence,summary:evidence.length?text:PLACEHOLDER[lang],action:advicePrefix(lang)+action,
  });
  const note=(zh:string,en:string)=>isEn?en:zh;
  const chapter:ReportChapter[]=[];
  const top=f.analysis.leadingGroup;
  const mainTheme=top&&timeOK?westernGroupNarrative(top,lang).label:note("分組主軸未形成單一確定結論","No single group conclusively leads.");
  chapter.push(generic(
    note("本命十大行星以此盤星位為基礎，主題為："+mainTheme+"；這是詮釋線索，不是人格定律。",
      "Ten natal planets form the basis of this reading. Main theme: "+mainTheme+"; this is an interpretive lens."),
    note("對照自己的真實經歷，先鎖定一項最值得投入的議題。","Check this against your experience and select one useful area to focus on."),
    [...entry(["Sun","Moon"]),...angleEv,...cuspEv([1]),...(timeOK?f.analysis.densities.map(g=>e("group."+g.group,g.group+" "+g.count+"/10")):[])],1));
  chapter.push(generic(
    note("以太陽看主動表達、月亮看情緒需要，再觀察命主星及上升是否有可靠資料。","Read the Sun as volition and Moon as emotional needs; chart ruler and Ascendant require verified birth time."),
    note("記錄高效時與壓力下的行為差異，不依單一星座貼標籤。","Compare your decisions in calm and stressed situations."),
    [...entry(["Sun","Moon"]),...angleEv],2));
  chapter.push(generic(
    note("2／6／10 宮與 MC 是資源、日常技藝與公共角色的觀察入口；職涯適配還需現實經驗。","Houses 2/6/10 and MC describe themes of resources, craft and public contribution; real-world experience remains decisive."),
    note("列出可變現的能力、工作負荷和風險上限，再選擇發展方向。","Identify marketable skills, workload limits and risks before choosing a career move."),
    [...inH([2,6,10]),...cuspEv([2,6,10]),...angleEv],3));
  chapter.push(generic(
    note("金星、火星、月亮與第7宮提供關係偏好及行動風格的象徵視角，不決定婚姻結果。","Venus, Mars, Moon and house 7 provide symbolic lenses for attachment and action; they cannot determine relationship outcomes."),
    note("明確說出需求、界線與可以接受的合作方式。","State your needs and boundaries in plain language."),
    [...entry(["Venus","Mars","Moon"]),...inH([7]),...cuspEv([7])],4));
  chapter.push(generic(
    note("第4宮、月亮與土星可用來討論家庭角色、情緒根基和責任分配；不對親屬貼性格標籤。","House 4, Moon and Saturn can frame domestic roles and responsibilities, not diagnose relatives."),
    note("把需要承擔與不必承擔的責任分開，維持自主生活節奏。","Separate your responsibilities from others' expectations."),
    [...entry(["Moon","Saturn"]),...inH([4]),...cuspEv([4])],5));
  chapter.push(generic(
    note("第6與12宮只討論生活規律、休息及壓力照護；不得據此推斷器官疾病。","Houses 6 and 12 address routine, rest and stress care, not bodily disease prediction."),
    note("優先使用睡眠、休息與可量測的現實健康指標；有症狀尋求醫療。","Use practical rest and health indicators, and seek medical care for symptoms."),
    [...inH([6,12]),...cuspEv([6,12]),...entry(["Moon","Neptune"])],6));
  chapter.push(generic(
    note("第9與12宮可作信念、自省與精神實踐的文化解讀；交點未核算時不杜撰靈魂歷史。","Houses 9 and 12 allow a symbolic reading of belief and introspection; uncomputed lunar nodes are not invented."),
    note("保留獨處、求知與現實行動的平衡。","Balance reflection with learning and action."),
    [...inH([9,12]),...cuspEv([9,12])],7));
  const validTransits=cfg.includeTransits?(f.transits??[]).filter(t=>Number.isFinite(Date.parse(t.utc))&&Number.isFinite(t.orb)&&t.orb>=0&&t.orb<=10):[];
  chapter.push(generic(
    note("列出已計算的行運相位與日期；沒有行運星曆資料就不宣稱未來事件。","Only verified transit aspects and dates are described; future events are never fabricated."),
    note("依真實工作、財務與關係目標規劃未來12–18個月，不用占星代替決策。","Plan the next 12–18 months against real commitments, not predictions."),
    (validTransits??[]).map((t,i)=>e("transit."+i,t.utc+" "+t.movingBody+" "+t.aspect+" "+t.natalBody+" orb "+t.orb,"transit")),8));
  const retro=f.planets.filter(p=>p.retrograde);
  const aspects=f.analysis.aspects.slice(0,6);
  chapter.push(generic(
    note("特殊配置須逐條核對：逆行與主要相位是天文描述；尊貴狀態只用於有傳統規則的七曜。","Configuration requires specific evidence: retrograde and aspects are astronomical; traditional dignity applies to classical planets."),
    note("區分可驗證配置與尚未計算的福點、凱龍及特殊度數。","Separate calculated configurations from uncomputed lots, Chiron and degree doctrines."),
    [...TEN_PLANETS.slice(0,7).filter(key=>pl(key).signReliable).map(key=>e("dignity."+key,key+" "+traditionalDignity(key as ClassicalPlanetKey,Math.floor(pl(key).longitude/30)))),
      ...retro.map(p=>e("retrograde."+p.key,position(p.key)+" retrograde")),
      ...aspects.map((a,i)=>e("aspect."+i,a.a+"-"+a.b+" "+a.type+" "+fmt(a.orb)+"°"))],9));
  const groups=top&&timeOK?westernGroupNarrative(top,lang):null;
  chapter.push(generic(
    groups?groups.strengths+" "+groups.risks:note("未能確認單一主導宮位主題，人生選擇應以現實條件為先。","No single house group is established; ground life decisions in actual circumstances."),
    groups?groups.action:note("先訂定一個可執行的目標，再檢查限制、資源及風險。","Set one practical goal, then check resources, constraints and risks."),
    timeOK?f.analysis.densities.map(g=>e("group."+g.group,g.group+" "+g.count+"/10; per-house "+fmt(g.perHouse))):[],10));
  const extra=(source:"ziwei"|"bazi"|"vedic",reading:ExternalReading|undefined,enabled:boolean)=>{
    if (!enabled||!reading?.calculated||!reading.evidence.length) return [];
    return reading.evidence.filter(v=>v.source===source);
  };
  chapter[2].evidence.push(...extra("ziwei",f.ziwei,cfg.includeZiwei),...extra("bazi",f.bazi,cfg.includeBazi));
  chapter[3].evidence.push(...extra("ziwei",f.ziwei,cfg.includeZiwei));
  chapter[4].evidence.push(...extra("bazi",f.bazi,cfg.includeBazi));
  chapter[6].evidence.push(...extra("vedic",f.vedic,cfg.includeVedic));
  for (const part of chapter) {
    part.status=part.evidence.length?"supported":"limited";
    if (!timeOK && [1,2,3,4,5,6,7].includes(part.number)) {
      part.status="limited";
      part.summary+=(isEn?" Birth time does not support house- or angle-based conclusions.":
        lang==="zh-Hans"?" 出生时间不足以确认宫位与四轴；相关部分不作判断。":
        " 出生時間不足以確認宮位與四軸；相關部分不作判定。");
    }
    if (!part.evidence.length) part.summary=PLACEHOLDER[lang];
  }
  const order=(cfg.order??Array.from({length:10},(_,i)=>i+1));
  if (order.length!==10||new Set(order).size!==10||order.some(n=>n<1||n>10)) throw new Error("Report order must contain chapters 1–10 exactly once");
  return order.map(n=>chapter[n-1]);
}

export function buildWesternReportPrompt(f:WesternReportFacts,cfg:WesternReportConfig) {
  const chapters=buildWesternReportChapters(f,cfg);
  const target=Math.max(3000,Math.min(5000,Math.floor(cfg.targetCharacters||4000)));
  const system=[
    "你是昭梧獨立西方占星報告編輯。依據傳入的可追溯天文資料與各系統獨立證據，產生個人化報告。",
    "絕不可自行排盤、補算缺失的行星/交點/福點/凱龍星/行運，也不可將本命 MC 視為 Whole Sign 必然第10宮。",
    "使用現代占星時以西方占星為主；紫微/八字/印度占星只能各自獨立附註，不能硬湊相同結論，也不得把宮位等同十神。",
    "先一句明確結論，再提供具體證據、順利面與失衡面、你可以這樣做。證據不足時須寫不作判定，不以禁用語言偽造確定性。",
    "健康僅談作息、身心照顧和壓力，不診斷、不預言疾病；不斷死亡、絕症、必離婚、必破產、必發財或前世事實。",
    "不替客人決定婚姻、移居、職涯與家庭義務。尊重獨處、邊界與個人意願，避免制式安慰與雞湯。",
    "原始事實與文化詮釋分離；僅能引用輸入證據 id；不得新增出生資料、職業、關係、行運日期、金融數字。",
    "輸出依下列10章順序、每章【標題】，先結論、證據、優勢/限制、行動建議；不用表格；中英語法自然。",
    "行運未提供時第8章如實標記未計算，不得用當前系統日期反推未提供的行運位置。",
  ].join("\n");
  const user=JSON.stringify({
    locale:cfg.locale,style:cfg.style,targetCharacters:target,
    source:{zodiac:f.zodiac,houseSystem:f.houseSystem,ephemeris:f.source,birthTimeBasis:f.birthTimeBasis},
    reliability:f.analysis.reliability,
    chapters:chapters.map(c=>({
      number:c.number,title:c.title,status:c.status,summary:c.summary,
      evidence:c.evidence,action:c.action,
    })),
    closing:"以不超過80字收束人生方向，不從固定金句隨機貼文。",
  });
  return {system,user,chapters};
}
