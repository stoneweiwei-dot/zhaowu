import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useMemo, useRef, useState, type CSSProperties } from "react";
import { calculateDualDestiny, buildDualFusion, type DualDestinyResult, type DualDirection } from "@/lib/dual-destiny";
import { toLunar } from "@/lib/bazi/calendar";
import { presentLunarLabel, presentPalmPalace } from "@/lib/palm/standalone-presentation";
import { type TianjiCalendar, type TianjiPalace } from "@/lib/tianji-xinggong";
import { useI18n, type Locale } from "@/lib/i18n";
import "@/tianji-dual.css";

export const Route = createFileRoute("/tianji-dual")({ component: TianjiDualPage });

const PALACES: TianjiPalace[] = ["子", "丑", "寅", "卯", "辰", "巳", "午", "未", "申", "酉", "戌", "亥"];
const HOURS = Array.from({ length: 24 }, (_, index) => index);
const SOLAR_YEARS = Array.from({ length: 201 }, (_, index) => 2100 - index);
const LUNAR_YEARS = Array.from({ length: 200 }, (_, index) => 2099 - index);

const COPY = {
  "zh-Hant": {
    kicker: "昭梧 · 天機雙軌命盤 V3.0", title: "一次輸入，同看外在格局與內在底色", lead: "天機星宮讀你如何在現實中立足；達摩一掌經讀反覆驅動選擇的內在習氣。兩套算法各自獨立，只共用出生資料。",
    back: "返回昭梧", input: "出生資料", solar: "西曆", lunar: "農曆", year: "年", month: "月", day: "日", hour: "時", direction: "一掌經順逆", male: "男命 · 順行", female: "女命 · 逆行", directionHint: "此項只決定一掌經的傳統順逆算法，不用來判定性別認同。", auto: "農曆、中氣與時辰由系統自動換算", submit: "啟動雙軌命盤", invalid: "出生資料無法換算，請檢查日期後重試。", privacy: "本機即時計算 · 不登入 · 不保存出生資料",
    result: "雙軌結果", outer: "軌道 A · 外在立足", inner: "軌道 B · 內在底色", palace: "命宮", star: "星曜", character: "性格主軸", four: "時 · 日 · 月 · 年四宮", lifePalace: "今生命宮", fusion: "融合星評", advice: "正向寄語", correction: "中氣修正", unchanged: "未過中氣，沿用原農曆月份。", advanced: "已過中氣，查表月份自動順延。", boundary: "兩套結果屬傳統文化與象徵性解讀，用於整理性格慣性，不是可驗證的前世事實，也不替代現實決策。",
  },
  "zh-Hans": {
    kicker: "昭梧 · 天机双轨命盘 V3.0", title: "一次输入，同看外在格局与内在底色", lead: "天机星宫读你如何在现实中立足；达摩一掌经读反复驱动选择的内在习气。两套算法各自独立，只共用出生资料。",
    back: "返回昭梧", input: "出生资料", solar: "西历", lunar: "农历", year: "年", month: "月", day: "日", hour: "时", direction: "一掌经顺逆", male: "男命 · 顺行", female: "女命 · 逆行", directionHint: "此项只决定一掌经的传统顺逆算法，不用来判定性别认同。", auto: "农历、中气与时辰由系统自动换算", submit: "启动双轨命盘", invalid: "出生资料无法换算，请检查日期后重试。", privacy: "本机即时计算 · 不登录 · 不保存出生资料",
    result: "双轨结果", outer: "轨道 A · 外在立足", inner: "轨道 B · 内在底色", palace: "命宫", star: "星曜", character: "性格主轴", four: "时 · 日 · 月 · 年四宫", lifePalace: "今生命宫", fusion: "融合星评", advice: "正向寄语", correction: "中气修正", unchanged: "未过中气，沿用原农历月份。", advanced: "已过中气，查表月份自动顺延。", boundary: "两套结果属传统文化与象征性解读，用于整理性格惯性，不是可验证的前世事实，也不替代现实决策。",
  },
  en: {
    kicker: "ZHAOWU · DUAL DESTINY ENGINE V3.0", title: "One input, two views of character", lead: "Tianji Star Palace reads how you establish yourself outwardly. Dharma Palm reads the inner habit that repeatedly drives your choices. The calculations remain independent and share only the birth data.",
    back: "Back to Zhaowu", input: "Birth details", solar: "Gregorian", lunar: "Lunar", year: "Year", month: "Month", day: "Day", hour: "Hour", direction: "Dharma Palm sequence", male: "Male chart · forward", female: "Female chart · reverse", directionHint: "This selects the traditional sequence only; it does not define gender identity.", auto: "Lunar date, middle qi and hour branch are resolved automatically", submit: "Run both charts", invalid: "The birth data could not be converted. Check the date and try again.", privacy: "Calculated on this device · no login · birth data is not saved",
    result: "Dual result", outer: "Track A · outward stance", inner: "Track B · inner pattern", palace: "Life Palace", star: "Star", character: "Character axis", four: "Hour · day · month · year palaces", lifePalace: "Present-life palace", fusion: "Integrated reading", advice: "Constructive direction", correction: "Middle-qi correction", unchanged: "Before middle qi; the original lunar month was kept.", advanced: "After middle qi; the lookup month advanced automatically.", boundary: "Both results are traditional symbolic frameworks for organising character patterns. They are not verifiable past-life facts and do not replace real-world decisions.",
  },
} as const;

const TIANJI_CHARACTER: Record<TianjiPalace, Record<Locale, string>> = {
  子: { "zh-Hant": "重情而有分寸，對人際細節敏銳。", "zh-Hans": "重情而有分寸，对人际细节敏锐。", en: "Warm, measured and attentive to social nuance." },
  丑: { "zh-Hant": "耐壓持久，常把難處熬成資歷。", "zh-Hans": "耐压持久，常把难处熬成资历。", en: "Patient under pressure, turning difficulty into durable experience." },
  寅: { "zh-Hant": "有主見、能掌局，也願意為結果負責。", "zh-Hans": "有主见、能掌局，也愿意为结果负责。", en: "Decisive, accountable and comfortable taking direction." },
  卯: { "zh-Hant": "爽快重義氣，善意有邊界時最有力量。", "zh-Hans": "爽快重义气，善意有边界时最有力量。", en: "Open and loyal, strongest when generosity has boundaries." },
  辰: { "zh-Hant": "擅長推演與變通，先定標準便不易反覆。", "zh-Hans": "擅长推演与变通，先定标准便不易反复。", en: "Adaptive and strategic, best when standards are set first." },
  巳: { "zh-Hant": "觀察細、理解快，重知識、審美與結構。", "zh-Hans": "观察细、理解快，重知识、审美与结构。", en: "Observant, quick to understand and sensitive to craft." },
  午: { "zh-Hant": "親和而有福氣感，懂得接住機會才能留福。", "zh-Hans": "亲和而有福气感，懂得接住机会才能留福。", en: "Approachable and fortunate, especially when opportunity is used well." },
  未: { "zh-Hant": "動中成事，跨環境發展反而容易打開機會。", "zh-Hans": "动中成事，跨环境发展反而容易打开机会。", en: "Progresses through movement, change and new environments." },
  申: { "zh-Hant": "獨立自持，能靠專注與判斷做到深處。", "zh-Hans": "独立自持，能靠专注与判断做到深处。", en: "Independent and capable of unusual depth through focus." },
  酉: { "zh-Hant": "深藏不露，觀察與判斷往往先於表態。", "zh-Hans": "深藏不露，观察与判断往往先于表态。", en: "Private and perceptive, forming judgement before revealing it." },
  戌: { "zh-Hant": "反應快、有技藝，適合把聰明沉澱成作品。", "zh-Hans": "反应快、有技艺，适合把聪明沉淀成作品。", en: "Quick and skilful, with talent that strengthens through finished work." },
  亥: { "zh-Hant": "感受力深、重公平，同理心需要配上邊界。", "zh-Hans": "感受力深、重公平，同理心需要配上边界。", en: "Emotionally perceptive and fair-minded, with a need for boundaries." },
};

const TIANJI_STARS: Record<TianjiPalace, Record<Locale, string>> = {
  子: { "zh-Hant": "天貴星", "zh-Hans": "天贵星", en: "Celestial Noble Star" }, 丑: { "zh-Hant": "天厄星", "zh-Hans": "天厄星", en: "Celestial Trial Star" },
  寅: { "zh-Hant": "天權星", "zh-Hans": "天权星", en: "Celestial Authority Star" }, 卯: { "zh-Hant": "天赦星", "zh-Hans": "天赦星", en: "Celestial Mercy Star" },
  辰: { "zh-Hant": "天如星", "zh-Hans": "天如星", en: "Celestial Adaptation Star" }, 巳: { "zh-Hant": "天文星", "zh-Hans": "天文星", en: "Celestial Scholar Star" },
  午: { "zh-Hant": "天福星", "zh-Hans": "天福星", en: "Celestial Fortune Star" }, 未: { "zh-Hant": "天驛星", "zh-Hans": "天驿星", en: "Celestial Journey Star" },
  申: { "zh-Hant": "天孤星", "zh-Hans": "天孤星", en: "Celestial Solitary Star" }, 酉: { "zh-Hant": "天秘星", "zh-Hans": "天秘星", en: "Celestial Mystery Star" },
  戌: { "zh-Hant": "天藝星", "zh-Hans": "天艺星", en: "Celestial Arts Star" }, 亥: { "zh-Hant": "天壽星", "zh-Hans": "天寿星", en: "Celestial Longevity Star" },
};

const EN_BRANCH: Record<TianjiPalace, string> = { 子: "Zi", 丑: "Chou", 寅: "Yin", 卯: "Mao", 辰: "Chen", 巳: "Si", 午: "Wu", 未: "Wei", 申: "Shen", 酉: "You", 戌: "Xu", 亥: "Hai" };

function daysInMonth(year: number, month: number) { return new Date(Date.UTC(year, month, 0)).getUTCDate(); }

function lunarMonthLabel(month: number, isLeap: boolean, locale: Locale) {
  if (locale === "en") return `${isLeap ? "Leap " : ""}month ${month}`;
  const names = locale === "zh-Hant" ? ["正", "二", "三", "四", "五", "六", "七", "八", "九", "十", "冬", "臘"] : ["正", "二", "三", "四", "五", "六", "七", "八", "九", "十", "冬", "腊"];
  return `${isLeap ? (locale === "zh-Hant" ? "閏" : "闰") : ""}${names[month - 1]}月`;
}

function getLunarMonths(year: number) {
  const found = new Map<string, { month: number; isLeap: boolean; days: number }>();
  for (let cursor = Date.UTC(year, 0, 1); cursor <= Date.UTC(year + 1, 11, 31); cursor += 86400000) {
    const date = new Date(cursor);
    const lunar = toLunar(date.getUTCFullYear(), date.getUTCMonth() + 1, date.getUTCDate());
    if (!lunar || lunar.year !== year) continue;
    const key = `${lunar.month}:${Number(lunar.isLeap)}`;
    const current = found.get(key);
    if (!current || lunar.day > current.days) found.set(key, { month: lunar.month, isLeap: lunar.isLeap, days: lunar.day });
  }
  return [...found.values()].sort((a, b) => a.month - b.month || Number(a.isLeap) - Number(b.isLeap));
}

function Orbit({ active, centre, locale, reverse = false }: { active: string; centre: string; locale: Locale; reverse?: boolean }) {
  return (
    <div className={`dual-orbit${reverse ? " is-reverse" : ""}${locale === "en" ? " is-en" : ""}`} aria-hidden="true">
      <div className="dual-orbit-ring" />
      <div className="dual-orbit-core"><b>{active}</b><span>{centre}</span></div>
      {PALACES.map((palace, index) => {
        const angle = (index / 12) * 360 - 90;
        const style = { transform: `rotate(${angle}deg) translate(112px) rotate(${-angle}deg)` } as CSSProperties;
        return <span key={palace} className="dual-orbit-node" style={style} data-active={palace === active}>{locale === "en" ? EN_BRANCH[palace] : palace}</span>;
      })}
    </div>
  );
}

function TianjiDualPage() {
  const { locale } = useI18n();
  const copy = COPY[locale];
  const [calendar, setCalendar] = useState<TianjiCalendar>("solar");
  const [year, setYear] = useState(1990);
  const [month, setMonth] = useState(1);
  const [day, setDay] = useState(1);
  const [hour, setHour] = useState(12);
  const [lunarMonthKey, setLunarMonthKey] = useState("1:0");
  const [direction, setDirection] = useState<DualDirection>("male");
  const [result, setResult] = useState<DualDestinyResult | null>(null);
  const [error, setError] = useState("");
  const resultRef = useRef<HTMLElement>(null);
  const lunarMonths = useMemo(() => getLunarMonths(year), [year]);
  const selectedLunarMonth = lunarMonths.find((item) => `${item.month}:${Number(item.isLeap)}` === lunarMonthKey);
  const maxDay = calendar === "solar" ? daysInMonth(year, month) : (selectedLunarMonth?.days ?? 30);
  const fusion = result ? buildDualFusion(result, locale) : null;

  useEffect(() => { if (day > maxDay) setDay(maxDay); }, [day, maxDay]);
  useEffect(() => {
    if (calendar !== "lunar" || lunarMonths.some((item) => `${item.month}:${Number(item.isLeap)}` === lunarMonthKey)) return;
    if (lunarMonths[0]) setLunarMonthKey(`${lunarMonths[0].month}:${Number(lunarMonths[0].isLeap)}`);
  }, [calendar, lunarMonthKey, lunarMonths]);

  function clear() { setResult(null); setError(""); }
  function calculate() {
    try {
      const [lunarMonth, leap] = lunarMonthKey.split(":").map(Number);
      const next = calculateDualDestiny({ calendar, year, month: calendar === "solar" ? month : lunarMonth, day, hour, isLeap: calendar === "lunar" && leap === 1, direction });
      setResult(next); setError("");
      window.setTimeout(() => resultRef.current?.scrollIntoView({ behavior: "smooth", block: "start" }), 40);
    } catch { setResult(null); setError(copy.invalid); }
  }

  const latest = result?.palm.latest ? presentPalmPalace(result.palm.latest, locale) : null;
  const reversedPalaces = result ? [...result.palm.palaces].reverse().map((item) => presentPalmPalace(item, locale)) : [];

  return (
    <main className="dual-page" aria-labelledby="dual-title">
      <div className="dual-shell">
        <div className="dual-topbar"><p>{copy.kicker}</p><Link to="/">{copy.back}</Link></div>
        <header className="dual-hero">
          <div><span>雙</span><span>軌</span></div>
          <h1 id="dual-title">{copy.title}</h1><p>{copy.lead}</p>
        </header>

        <section className="dual-input-card" aria-labelledby="dual-input-title">
          <div className="dual-section-title"><span>01</span><h2 id="dual-input-title">{copy.input}</h2></div>
          <div className="dual-tabs" role="tablist">
            <button type="button" aria-selected={calendar === "solar"} onClick={() => { setCalendar("solar"); if (year > 2100) setYear(2100); clear(); }}>{copy.solar}</button>
            <button type="button" aria-selected={calendar === "lunar"} onClick={() => { setCalendar("lunar"); if (year > 2099) setYear(2099); clear(); }}>{copy.lunar}</button>
          </div>
          <div className="dual-fields">
            <label><span>{copy.year}</span><select value={year} onChange={(event) => { setYear(Number(event.target.value)); clear(); }}>{(calendar === "solar" ? SOLAR_YEARS : LUNAR_YEARS).map((value) => <option key={value} value={value}>{value}</option>)}</select></label>
            <label><span>{copy.month}</span>{calendar === "solar" ? <select value={month} onChange={(event) => { setMonth(Number(event.target.value)); clear(); }}>{Array.from({ length: 12 }, (_, i) => i + 1).map((value) => <option key={value} value={value}>{value}</option>)}</select> : <select value={lunarMonthKey} onChange={(event) => { setLunarMonthKey(event.target.value); clear(); }}>{lunarMonths.map((value) => <option key={`${value.month}:${Number(value.isLeap)}`} value={`${value.month}:${Number(value.isLeap)}`}>{lunarMonthLabel(value.month, value.isLeap, locale)}</option>)}</select>}</label>
            <label><span>{copy.day}</span><select value={day} onChange={(event) => { setDay(Number(event.target.value)); clear(); }}>{Array.from({ length: maxDay }, (_, i) => i + 1).map((value) => <option key={value} value={value}>{value}</option>)}</select></label>
            <label><span>{copy.hour}</span><select value={hour} onChange={(event) => { setHour(Number(event.target.value)); clear(); }}>{HOURS.map((value) => <option key={value} value={value}>{String(value).padStart(2, "0")}:00</option>)}</select></label>
          </div>
          <fieldset className="dual-direction"><legend>{copy.direction}</legend><div><button type="button" aria-pressed={direction === "male"} onClick={() => { setDirection("male"); clear(); }}>{copy.male}</button><button type="button" aria-pressed={direction === "female"} onClick={() => { setDirection("female"); clear(); }}>{copy.female}</button></div><p>{copy.directionHint}</p></fieldset>
          <div className="dual-auto"><i>✓</i><span>{copy.auto}</span></div>
          {error ? <p className="dual-error" role="alert">{error}</p> : null}
          <button className="dual-submit" type="button" onClick={calculate}>{copy.submit}</button>
          <p className="dual-privacy">{copy.privacy}</p>
        </section>

        {result && latest && fusion ? (
          <section ref={resultRef} className="dual-results" aria-labelledby="dual-result-title" aria-live="polite">
            <div className="dual-section-title"><span>02</span><h2 id="dual-result-title">{copy.result}</h2></div>
            <div className="dual-engine-grid">
              <article className="dual-engine-card is-tianji">
                <p className="dual-engine-label">{copy.outer}</p>
                <Orbit active={result.tianji.result.palace} centre={TIANJI_STARS[result.tianji.result.palace][locale]} locale={locale} />
                <dl><div><dt>{copy.palace}</dt><dd>{locale === "en" ? EN_BRANCH[result.tianji.result.palace] : `${result.tianji.result.palace}宮`}</dd></div><div><dt>{copy.star}</dt><dd>{TIANJI_STARS[result.tianji.result.palace][locale]}</dd></div></dl>
                <div className="dual-reading"><small>{copy.character}</small><p>{TIANJI_CHARACTER[result.tianji.result.palace][locale]}</p></div>
                <p className="dual-lunar">{presentLunarLabel(result.palm.lunarLabel, locale)}</p>
                <p className="dual-correction"><b>{copy.correction}</b>{result.tianji.result.afterMiddleQi ? copy.advanced : copy.unchanged}</p>
              </article>
              <article className="dual-engine-card is-palm">
                <p className="dual-engine-label">{copy.inner}</p>
                <Orbit active={result.palm.latest!.zhi} centre={latest.star} locale={locale} reverse />
                <dl><div><dt>{copy.lifePalace}</dt><dd>{latest.zhi}</dd></div><div><dt>{copy.star}</dt><dd>{latest.star} · {latest.dao}</dd></div></dl>
                <div className="dual-reading"><small>{copy.character}</small><p>{latest.meaning}</p></div>
                <div className="dual-four"><small>{copy.four}</small><div>{reversedPalaces.map((item) => <span key={item.key}><b>{item.zhi}</b><em>{item.star}</em></span>)}</div></div>
              </article>
            </div>
            <article className="dual-fusion"><span>合</span><div><small>{copy.fusion}</small><h3>{fusion.title}</h3><p>{fusion.body}</p><blockquote><b>{copy.advice}</b>{fusion.guidance}</blockquote></div></article>
            <p className="dual-boundary">{copy.boundary}</p>
          </section>
        ) : null}
      </div>
    </main>
  );
}
