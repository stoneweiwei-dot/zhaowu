import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useMemo, useState, type CSSProperties } from "react";
import { useI18n, type Locale } from "@/lib/i18n";
import { toLunar } from "@/lib/bazi/calendar";
import {
  resolveTianjiBirth,
  TIANJI_MONTHS,
  type TianjiBirthResolution,
  type TianjiCalendar,
  type TianjiPalace,
} from "@/lib/tianji-xinggong";
import "@/tianji-xinggong.css";

export const Route = createFileRoute("/tianji-xinggong")({ component: TianjiXinggongPage });

const PALACE_ORDER: TianjiPalace[] = ["子", "丑", "寅", "卯", "辰", "巳", "午", "未", "申", "酉", "戌", "亥"];
const SOLAR_YEARS = Array.from({ length: 201 }, (_, index) => 2100 - index);
const LUNAR_YEARS = Array.from({ length: 200 }, (_, index) => 2099 - index);
const HOURS = Array.from({ length: 24 }, (_, index) => index);
const DAYS_30 = Array.from({ length: 30 }, (_, index) => index + 1);

const UI = {
  "zh-Hant": {
    kicker: "天機星宮 · V2.0",
    title: "十二宮照見你的天機星",
    lead: "只要選出生年月日與小時。西曆、農曆都可以；農曆月份、出生時辰與當月中氣由系統自動換算，不再把節氣判斷丟給客人。",
    back: "返回昭梧",
    inputTitle: "出生資料",
    solar: "西曆",
    lunar: "農曆",
    year: "年",
    month: "月",
    day: "日",
    hour: "時",
    birthDate: "出生年月日",
    birthHour: "出生小時",
    automatic: "中氣自動判定",
    automaticHint: "系統會先換算農曆月份，再比對該月中氣；若已過中氣，自動順延一個月查表。",
    calculate: "排出我的天機星宮",
    resultTitle: "你的星宮結果",
    birthResolved: "出生資料換算",
    palace: "命宮",
    star: "天機星",
    personality: "星宿性格",
    destiny: "命運寄語",
    invalid: "這組日期不存在，請重新選擇。",
    leap: "閏",
    systemRule: "固定查表 · 不調用 AI",
  },
  "zh-Hans": {
    kicker: "天机星宫 · V2.0",
    title: "十二宫照见你的天机星",
    lead: "只要选出生年月日与小时。西历、农历都可以；农历月份、出生时辰与当月中气由系统自动换算，不再把节气判断丢给客人。",
    back: "返回昭梧",
    inputTitle: "出生资料",
    solar: "西历",
    lunar: "农历",
    year: "年",
    month: "月",
    day: "日",
    hour: "时",
    birthDate: "出生年月日",
    birthHour: "出生小时",
    automatic: "中气自动判定",
    automaticHint: "系统会先换算农历月份，再比对该月中气；若已过中气，自动顺延一个月查表。",
    calculate: "排出我的天机星宫",
    resultTitle: "你的星宫结果",
    birthResolved: "出生资料换算",
    palace: "命宫",
    star: "天机星",
    personality: "星宿性格",
    destiny: "命运寄语",
    invalid: "这组日期不存在，请重新选择。",
    leap: "闰",
    systemRule: "固定查表 · 不调用 AI",
  },
  en: {
    kicker: "TIANJI STAR PALACE · V2.0",
    title: "Find the star that rules your Life Palace",
    lead: "Choose the birth year, month, day and hour in either Gregorian or lunar format. Lunar month, birth-hour branch and middle-qi correction are resolved automatically.",
    back: "Back to Zhaowu",
    inputTitle: "Birth details",
    solar: "Gregorian",
    lunar: "Lunar",
    year: "Year",
    month: "Month",
    day: "Day",
    hour: "Hour",
    birthDate: "Birth date",
    birthHour: "Birth hour",
    automatic: "Middle qi resolved automatically",
    automaticHint: "The system converts the date to its lunar month, checks that month's middle qi, and advances the lookup month when required.",
    calculate: "Calculate my Star Palace",
    resultTitle: "Your Star Palace",
    birthResolved: "Resolved birth data",
    palace: "Life Palace",
    star: "Tianji star",
    personality: "Star character",
    destiny: "Destiny note",
    invalid: "That date does not exist. Please choose another date.",
    leap: "Leap ",
    systemRule: "Deterministic table · no AI",
  },
} as const;

const STAR_COPY: Record<TianjiPalace, Record<Locale, { star: string; brief: string; description: string; message: string }>> = {
  子: {
    "zh-Hant": { star: "天貴星", brief: "文雅多情", description: "重情也重分寸，對人際細節敏銳。真正的優勢是溫和之外仍有自己的標準。", message: "把情分留給值得的人，把原則留給真正重要的事。" },
    "zh-Hans": { star: "天贵星", brief: "文雅多情", description: "重情也重分寸，对人际细节敏锐。真正的优势是温和之外仍有自己的标准。", message: "把情分留给值得的人，把原则留给真正重要的事。" },
    en: { star: "Celestial Noble Star", brief: "Graceful and affectionate", description: "Emotionally perceptive, considerate and refined, while still holding clear personal standards.", message: "Keep your kindness for people who value it and your principles for choices that matter." },
  },
  丑: {
    "zh-Hant": { star: "天厄星", brief: "先苦後甘", description: "成果常靠耐性累積，早段未必輕鬆，但抗壓與持久力往往比別人更強。", message: "慢不是落後；能把難處熬成資歷，就是你的後勁。" },
    "zh-Hans": { star: "天厄星", brief: "先苦后甘", description: "成果常靠耐性累积，早段未必轻松，但抗压与持久力往往比别人更强。", message: "慢不是落后；能把难处熬成资历，就是你的后劲。" },
    en: { star: "Celestial Trial Star", brief: "Hard first, easier later", description: "Progress tends to be earned through endurance, with resilience becoming a major long-term advantage.", message: "Slow progress can still compound into authority once others have stopped." },
  },
  寅: {
    "zh-Hant": { star: "天權星", brief: "大器晚成", description: "重判斷、重掌控，也願意為結果負責。能力會隨經驗逐步形成真正的話語權。", message: "不用急著證明自己，長期累積後的能力自然會替你說話。" },
    "zh-Hans": { star: "天权星", brief: "大器晚成", description: "重判断、重掌控，也愿意为结果负责。能力会随经验逐步形成真正的话语权。", message: "不用急着证明自己，长期累积后的能力自然会替你说话。" },
    en: { star: "Celestial Authority Star", brief: "Late-blooming authority", description: "Judgement, control and accountability strengthen with experience, often producing greater authority later on.", message: "You do not need to prove yourself early; durable competence eventually speaks for itself." },
  },
  卯: {
    "zh-Hant": { star: "天赦星", brief: "慷慨大方", description: "待人爽快、重義氣，願意給別人空間與機會；有邊界時，慷慨才會變成力量。", message: "善意要有方向，別讓人情把自己的資源耗空。" },
    "zh-Hans": { star: "天赦星", brief: "慷慨大方", description: "待人爽快、重义气，愿意给别人空间与机会；有边界时，慷慨才会变成力量。", message: "善意要有方向，别让人情把自己的资源耗空。" },
    en: { star: "Celestial Mercy Star", brief: "Generous and open", description: "Direct, loyal and generous, especially effective when goodwill is paired with boundaries.", message: "Give with direction so generosity becomes strength rather than depletion." },
  },
  辰: {
    "zh-Hant": { star: "天如星", brief: "事多反覆", description: "擅長反覆推演與處理複雜局面，但選項過多時容易來回修正。", message: "先定判斷標準，再讓你的變通成為優勢。" },
    "zh-Hans": { star: "天如星", brief: "事多反复", description: "擅长反复推演与处理复杂局面，但选项过多时容易来回修正。", message: "先定判断标准，再让你的变通成为优势。" },
    en: { star: "Celestial Adaptation Star", brief: "Strategically flexible", description: "Strong at modelling complex possibilities, though too many options can produce repeated revisions.", message: "Set the standard first, then let flexibility work for you." },
  },
  巳: {
    "zh-Hant": { star: "天文星", brief: "思慮縝密", description: "觀察細、理解快，對文字、結構、知識與審美通常有較強感受。", message: "細緻是天賦，但完成比無限修正更有價值。" },
    "zh-Hans": { star: "天文星", brief: "思虑缜密", description: "观察细、理解快，对文字、结构、知识与审美通常有较强感受。", message: "细致是天赋，但完成比无限修正更有价值。" },
    en: { star: "Celestial Scholar Star", brief: "Precise and thoughtful", description: "Observant, quick to understand structure, with strong sensitivity to knowledge, language and aesthetics.", message: "Precision is a gift, but completion matters more than endless refinement." },
  },
  午: {
    "zh-Hant": { star: "天福星", brief: "福氣厚實", description: "人緣與資源通常不差，較容易在關鍵時刻得到助力；真正重要的是懂得把機會接住。", message: "福不是等來的，能接得住機會的人才留得住福。" },
    "zh-Hans": { star: "天福星", brief: "福气厚实", description: "人缘与资源通常不差，较容易在关键时刻得到助力；真正重要的是懂得把机会接住。", message: "福不是等来的，能接得住机会的人才留得住福。" },
    en: { star: "Celestial Fortune Star", brief: "Well-supported fortune", description: "Often benefits from people, timing or resources, especially when opportunities are actively used rather than passively awaited.", message: "Fortune lasts when you know how to receive and use it." },
  },
  未: {
    "zh-Hant": { star: "天驛星", brief: "動中成事", description: "人生節奏較多移動、變化與跨環境發展，越能適應不同場域，越容易打開機會。", message: "你的路往往不是守出來的，而是在移動中越走越寬。" },
    "zh-Hans": { star: "天驿星", brief: "动中成事", description: "人生节奏较多移动、变化与跨环境发展，越能适应不同场域，越容易打开机会。", message: "你的路往往不是守出来的，而是在移动中越走越宽。" },
    en: { star: "Celestial Journey Star", brief: "Progress through movement", description: "Change, travel and new environments often create momentum; adaptability opens more doors than staying fixed.", message: "Your road tends to widen through movement rather than waiting in place." },
  },
  申: {
    "zh-Hant": { star: "天孤星", brief: "獨立自持", description: "自我要求高，習慣靠自己判斷與承擔，不容易隨便依附他人。", message: "獨立是優勢，但真正可靠的人不必一律擋在門外。" },
    "zh-Hans": { star: "天孤星", brief: "独立自持", description: "自我要求高，习惯靠自己判断与承担，不容易随便依附他人。", message: "独立是优势，但真正可靠的人不必一律挡在门外。" },
    en: { star: "Celestial Solitary Star", brief: "Independent and self-contained", description: "Self-reliant, selective and comfortable carrying responsibility without depending heavily on others.", message: "Independence is useful, but trustworthy support does not need to be kept outside." },
  },
  酉: {
    "zh-Hant": { star: "天秘星", brief: "深藏不露", description: "心思細密，不喜把底牌全攤開，觀察與判斷常比表面呈現得更深。", message: "保留是策略，但重要關係裡也要讓人看得懂你的真實立場。" },
    "zh-Hans": { star: "天秘星", brief: "深藏不露", description: "心思细密，不喜把底牌全摊开，观察与判断常比表面呈现得更深。", message: "保留是策略，但重要关系里也要让人看得懂你的真实立场。" },
    en: { star: "Celestial Mystery Star", brief: "Reserved and perceptive", description: "Private, observant and strategic, often understanding more than is immediately visible on the surface.", message: "Reserve can be strategic, but important people still need to understand your real position." },
  },
  戌: {
    "zh-Hant": { star: "天藝星", brief: "伶俐果斷", description: "反應快，能把想法迅速轉成做法，適合創意、技術、審美與臨場決斷。", message: "天分需要集中；選值得長做的事，讓聰明沉澱成作品。" },
    "zh-Hans": { star: "天艺星", brief: "伶俐果断", description: "反应快，能把想法迅速转成做法，适合创意、技术、审美与临场决断。", message: "天分需要集中；选值得长做的事，让聪明沉淀成作品。" },
    en: { star: "Celestial Arts Star", brief: "Quick and decisive", description: "Fast to learn and turn ideas into action, especially in creative, technical or judgement-heavy work.", message: "Talent becomes reputation through concentration and finished work." },
  },
  亥: {
    "zh-Hant": { star: "天壽星", brief: "情感豐富", description: "感受力深，容易理解他人的情緒與處境，也重公平與人情。", message: "同理心要配上邊界，才不會把自己也一起耗掉。" },
    "zh-Hans": { star: "天寿星", brief: "情感丰富", description: "感受力深，容易理解他人的情绪与处境，也重公平与人情。", message: "同理心要配上边界，才不会把自己也一起耗掉。" },
    en: { star: "Celestial Longevity Star", brief: "Emotionally rich", description: "Deeply perceptive of other people's feelings and circumstances, with a strong sense of fairness.", message: "Empathy lasts longer when it is paired with clear boundaries." },
  },
};

function daysInSolarMonth(year: number, month: number) {
  return new Date(Date.UTC(year, month, 0)).getUTCDate();
}

function lunarMonthLabel(month: number, isLeap: boolean, locale: Locale) {
  if (locale === "en") return `${isLeap ? "Leap " : ""}lunar month ${month}`;
  const names = locale === "zh-Hant"
    ? ["正", "二", "三", "四", "五", "六", "七", "八", "九", "十", "冬", "臘"]
    : ["正", "二", "三", "四", "五", "六", "七", "八", "九", "十", "冬", "腊"];
  return `${isLeap ? (locale === "zh-Hant" ? "閏" : "闰") : ""}${names[month - 1]}月`;
}

function getLunarMonthOptions(year: number) {
  const found = new Map<string, { month: number; isLeap: boolean }>();
  const start = Date.UTC(year, 0, 1);
  const end = Date.UTC(year + 1, 11, 31);
  for (let cursor = start; cursor <= end; cursor += 86400000) {
    const date = new Date(cursor);
    const lunar = toLunar(date.getUTCFullYear(), date.getUTCMonth() + 1, date.getUTCDate());
    if (lunar?.year !== year) continue;
    const key = `${lunar.month}:${lunar.isLeap ? 1 : 0}`;
    if (!found.has(key)) found.set(key, { month: lunar.month, isLeap: lunar.isLeap });
  }
  return Array.from(found.values()).sort((a, b) => a.month - b.month || Number(a.isLeap) - Number(b.isLeap));
}

function formatResolvedBirth(resolution: TianjiBirthResolution, locale: Locale) {
  const solar = `${resolution.solar.year}-${String(resolution.solar.month).padStart(2, "0")}-${String(resolution.solar.day).padStart(2, "0")} ${String(resolution.solar.hour).padStart(2, "0")}:00`;
  const lunarMonth = lunarMonthLabel(resolution.lunar.month, resolution.lunar.isLeap, locale);
  if (locale === "en") return `${solar} · ${resolution.lunar.year} ${lunarMonth} day ${resolution.lunar.day} · ${resolution.hourBranch} branch`;
  return `${solar} · 農曆${resolution.lunar.year}年${lunarMonth}${resolution.lunar.day}日 · ${resolution.hourBranch}${locale === "zh-Hant" ? "時" : "时"}`;
}

function middleQiNote(resolution: TianjiBirthResolution, locale: Locale) {
  if (!resolution.middleQi) {
    if (locale === "en") return "Leap lunar month: no middle-qi advance was applied.";
    return locale === "zh-Hant" ? "閏月本身不含當月中氣，本次不順延月份。" : "闰月本身不含当月中气，本次不顺延月份。";
  }
  if (resolution.result.afterMiddleQi) {
    const corrected = lunarMonthLabel(resolution.result.correctedMonthNumber, false, locale);
    if (locale === "en") return `Birth was after ${resolution.middleQi.name}; lookup month advanced automatically to ${corrected}.`;
    return locale === "zh-Hant"
      ? `出生已過${resolution.middleQi.name}，系統已自動順延至${corrected}查表。`
      : `出生已过${resolution.middleQi.name}，系统已自动顺延至${corrected}查表。`;
  }
  if (locale === "en") return `Birth was before ${resolution.middleQi.name}; the lunar month was kept as entered.`;
  return locale === "zh-Hant"
    ? `出生尚未過${resolution.middleQi.name}，沿用原農曆月份查表。`
    : `出生尚未过${resolution.middleQi.name}，沿用原农历月份查表。`;
}

function TianjiXinggongPage() {
  const { locale } = useI18n();
  const copy = UI[locale];
  const [calendar, setCalendar] = useState<TianjiCalendar>("solar");
  const [year, setYear] = useState(1990);
  const [month, setMonth] = useState(1);
  const [day, setDay] = useState(1);
  const [hour, setHour] = useState(12);
  const [lunarMonthKey, setLunarMonthKey] = useState("1:0");
  const [resolution, setResolution] = useState<TianjiBirthResolution | null>(null);
  const [error, setError] = useState("");

  const lunarMonthOptions = useMemo(() => getLunarMonthOptions(year), [year]);
  const selectedLunarMonth = useMemo(() => {
    const [rawMonth, rawLeap] = lunarMonthKey.split(":");
    return { month: Number(rawMonth), isLeap: rawLeap === "1" };
  }, [lunarMonthKey]);
  const maxDay = calendar === "solar" ? daysInSolarMonth(year, month) : 30;
  const yearOptions = calendar === "solar" ? SOLAR_YEARS : LUNAR_YEARS;
  const starCopy = resolution ? STAR_COPY[resolution.result.palace][locale] : null;

  useEffect(() => {
    if (day > maxDay) setDay(maxDay);
  }, [day, maxDay]);

  useEffect(() => {
    if (calendar !== "lunar") return;
    if (!lunarMonthOptions.some((item) => `${item.month}:${item.isLeap ? 1 : 0}` === lunarMonthKey)) {
      const first = lunarMonthOptions[0];
      if (first) setLunarMonthKey(`${first.month}:${first.isLeap ? 1 : 0}`);
    }
  }, [calendar, lunarMonthKey, lunarMonthOptions]);

  function resetResult() {
    setResolution(null);
    setError("");
  }

  function switchCalendar(next: TianjiCalendar) {
    setCalendar(next);
    if (next === "lunar" && year > 2099) setYear(2099);
    resetResult();
  }

  function submit() {
    try {
      const next = resolveTianjiBirth({
        calendar,
        year,
        month: calendar === "solar" ? month : selectedLunarMonth.month,
        day,
        hour,
        isLeap: calendar === "lunar" ? selectedLunarMonth.isLeap : false,
      });
      setResolution(next);
      setError("");
    } catch {
      setResolution(null);
      setError(copy.invalid);
    }
  }

  return (
    <main className="tianji-page" aria-labelledby="tianji-title">
      <div className="tianji-shell">
        <div className="tianji-topbar">
          <p className="tianji-kicker">{copy.kicker}</p>
          <Link to="/" className="tianji-back">{copy.back}</Link>
        </div>

        <section className="tianji-hero">
          <div className="tianji-hero-copy">
            <p className="tianji-rule-chip">{copy.systemRule}</p>
            <h1 id="tianji-title" className="tianji-title">{copy.title}</h1>
            <p className="tianji-lead">{copy.lead}</p>
          </div>
          <div className="tianji-sigil" aria-hidden="true"><span>天</span><i /><b>機</b></div>
        </section>

        <div className="tianji-grid">
          <section className="tianji-panel tianji-input-panel" aria-labelledby="tianji-input-title">
            <div className="tianji-panel-heading">
              <span>01</span>
              <h2 id="tianji-input-title">{copy.inputTitle}</h2>
            </div>

            <div className="tianji-calendar-tabs" role="tablist" aria-label={copy.birthDate}>
              <button type="button" role="tab" aria-selected={calendar === "solar"} onClick={() => switchCalendar("solar")}>{copy.solar}</button>
              <button type="button" role="tab" aria-selected={calendar === "lunar"} onClick={() => switchCalendar("lunar")}>{copy.lunar}</button>
            </div>

            <div className="tianji-field-block">
              <label>{copy.birthDate}</label>
              <div className="tianji-date-grid">
                <select aria-label={copy.year} className="tianji-select" value={year} onChange={(event) => { setYear(Number(event.target.value)); resetResult(); }}>
                  {yearOptions.map((value) => <option key={value} value={value}>{value}{locale === "en" ? "" : copy.year}</option>)}
                </select>

                {calendar === "solar" ? (
                  <select aria-label={copy.month} className="tianji-select" value={month} onChange={(event) => { setMonth(Number(event.target.value)); resetResult(); }}>
                    {Array.from({ length: 12 }, (_, index) => index + 1).map((value) => <option key={value} value={value}>{value}{locale === "en" ? "" : copy.month}</option>)}
                  </select>
                ) : (
                  <select aria-label={copy.month} className="tianji-select" value={lunarMonthKey} onChange={(event) => { setLunarMonthKey(event.target.value); resetResult(); }}>
                    {lunarMonthOptions.map((value) => {
                      const key = `${value.month}:${value.isLeap ? 1 : 0}`;
                      return <option key={key} value={key}>{lunarMonthLabel(value.month, value.isLeap, locale)}</option>;
                    })}
                  </select>
                )}

                <select aria-label={copy.day} className="tianji-select" value={day} onChange={(event) => { setDay(Number(event.target.value)); resetResult(); }}>
                  {(calendar === "solar" ? Array.from({ length: maxDay }, (_, index) => index + 1) : DAYS_30).map((value) => <option key={value} value={value}>{value}{locale === "en" ? "" : copy.day}</option>)}
                </select>
              </div>
            </div>

            <div className="tianji-field-block">
              <label htmlFor="tianji-hour">{copy.birthHour}</label>
              <select id="tianji-hour" className="tianji-select" value={hour} onChange={(event) => { setHour(Number(event.target.value)); resetResult(); }}>
                {HOURS.map((value) => <option key={value} value={value}>{String(value).padStart(2, "0")}:00</option>)}
              </select>
            </div>

            <div className="tianji-auto-note">
              <span className="tianji-auto-icon" aria-hidden>✓</span>
              <span><strong>{copy.automatic}</strong><small>{copy.automaticHint}</small></span>
            </div>

            {error ? <p className="tianji-error" role="alert">{error}</p> : null}
            <button type="button" className="tianji-button" onClick={submit}>{copy.calculate}</button>
          </section>

          <section className="tianji-panel tianji-result-panel" aria-live="polite" aria-labelledby="tianji-result-title">
            <div className="tianji-panel-heading">
              <span>02</span>
              <h2 id="tianji-result-title">{copy.resultTitle}</h2>
            </div>

            <div className="tianji-orbit" aria-hidden="true">
              <div className="tianji-orbit-ring" />
              <div className="tianji-core">
                <div>
                  <b>{starCopy?.star ?? "天機"}</b>
                  <span>{starCopy?.brief ?? "十二星宮"}</span>
                </div>
              </div>
              {PALACE_ORDER.map((palace, index) => {
                const angle = (index / PALACE_ORDER.length) * 360 - 90;
                const style = { transform: `rotate(${angle}deg) translate(136px) rotate(${-angle}deg)` } as CSSProperties;
                return <span key={palace} className="tianji-node" style={style} data-active={Boolean(resolution && resolution.result.palace === palace)}>{palace}</span>;
              })}
            </div>

            {resolution && starCopy ? (
              <div className="tianji-result" key={`${resolution.solar.year}-${resolution.solar.month}-${resolution.solar.day}-${resolution.solar.hour}`}>
                <div className="tianji-resolved-strip">
                  <small>{copy.birthResolved}</small>
                  <p>{formatResolvedBirth(resolution, locale)}</p>
                  <span>{middleQiNote(resolution, locale)}</span>
                </div>

                <div className="tianji-result-cards">
                  <div><small>{copy.palace}</small><strong>{resolution.result.palace}{locale === "en" ? " Palace" : "宮"}</strong></div>
                  <div><small>{copy.star}</small><strong>{starCopy.star}</strong><span>{starCopy.brief}</span></div>
                </div>

                <div className="tianji-reading">
                  <small>{copy.personality}</small>
                  <p>{starCopy.description}</p>
                </div>
                <div className="tianji-destiny">
                  <small>{copy.destiny}</small>
                  <p>{starCopy.message}</p>
                </div>
              </div>
            ) : (
              <div className="tianji-empty-state">
                <span>十二</span>
                <p>{copy.automaticHint}</p>
              </div>
            )}
          </section>
        </div>
      </div>
    </main>
  );
}
