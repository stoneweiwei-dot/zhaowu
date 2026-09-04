import { useRef, useState, type FormEvent } from "react";
import { Link } from "@tanstack/react-router";
import { CityPicker } from "@/components/city-picker";
import { useI18n, type Locale } from "@/lib/i18n";
import { buildPalm } from "@/lib/palm/engine";
import { buildPalmSynthesis, palmDaoTone, presentLunarLabel, presentPalmPalace, splitPalmMeaning } from "@/lib/palm/standalone-presentation";
import { saveSpecialistHistory } from "@/lib/specialist-history";
import type { CityHit, Gender } from "@/lib/bazi/types";
import type { PalmReading } from "@/lib/core/types";

type D60BirthPayload = {
  year: number;
  month: number;
  day: number;
  hour: number;
  minute: number;
  city: CityHit;
};

const D60_BIRTH_EVENT = "zhaowu:d60-birth";

const COPY = {
  "zh-Hant": {
    kicker: "昭梧 · 前世今生專題", title: "前世今生・達摩一掌經", lead: "一掌經最迷人的地方，不只在四個宮位，而在它把四宮串成一條前世到今生的因果線：從哪一道來、留下什麼習氣、今生又該怎麼把這份本事用好。",
    scopeTitle: "一掌之間，看四世來處", scopeFour: "四宮｜年宮、月宮、日宮、時宮依序排出四世輪迴足跡。", scopeStars: "十二星｜每一宮都有主星，說明這一世留下的性格與能力。", scopeRealms: "六道來處｜佛、仙、人、修羅、鬼、畜生六類象意，讀的是習氣與修行課題。",
    note: "它不替你證明一段無法驗證的前世歷史，而是給『我為什麼會成為現在的我』一個有秩序、可閱讀的因果框架。",
    formTitle: "填寫出生資料", formLead: "同一份資料同時給一掌經與 D60 使用。D60 必須有精確到分鐘的出生時間與出生地；資料不足時只生成一掌經，不會硬算 D60。",
    name: "稱呼（選填）", namePh: "用來標記這台裝置裡的報告", direction: "一掌經順逆（必填）", directionHelp: "這是傳統算法的順逆參數，不用來定義你的性別身份。",
    forward: "順行（傳統男命）", reverse: "逆行（傳統女命）", date: "出生日期（國曆）", year: "年", month: "月", day: "日",
    time: "出生時間（精確到分鐘）", hour: "時", minute: "分", timeUnknown: "不知道出生時間（時宮留白；D60 不判定）",
    city: "出生地（D60 必填）", cityPh: "搜尋出生城市", optional: "選填", popular: "常用城市",
    d60Confirm: "D60 時間精度確認", d60ConfirmText: "我確認這個出生時間可核對到分鐘，不是估算、整點代填或四捨五入值。", d60Hint: "未勾選或未選出生地時，一掌經仍會正常生成，但 D60 只顯示資料不足，不會從帳戶舊資料自動補算。",
    submit: "生成我的報告", privacy: "報告會自動保存在這台裝置，可到「我的紀錄」查看或刪除。", required: "請填出生日期，並選擇一掌經順逆。", invalid: "這個日期無法轉換為農曆，請檢查後再試。", invalidTime: "請完整填寫出生時與分；若不知道時間，請勾選「不知道出生時間」。",
    result: "前世今生報告", resultFor: "的前世今生報告", palaces: "前四世・六道習性報告", traceTitle: "前四世來自哪一道", traceHint: "由最遠的前四世讀到最近的前一世。哪一道重複出現，代表那一類性格與反應在今生更容易被加強。", realmFrom: "六道來處", traitLabel: "這一世的特徵", storyLabel: "留到今生的習性", verseLabel: "古訣", readingTitle: "四世合看", readingBody: "四個宮位不是四句互不相關的標籤。年宮看最遠的根，月宮看與人群相處的舊習，日宮看關係與才情，時宮收束成離今生最近的一世。重複的六道要加重讀，最近一世則是最容易在今生被觸發的主軸。",
    missingHour: "你未提供出生時間，因此時宮／前一世不作判定；目前只顯示年、月、日三宮。", again: "重新排盤", full: "回到昭梧完整分析", history: "查看我的紀錄", saved: "這份報告已保存在本裝置。", saveFailed: "報告已生成，但瀏覽器阻止了本機保存。", boundary: "傳統文化與象徵性解讀僅供自我觀察，不替代醫療、法律、財務或現實決策。",
  },
  "zh-Hans": {
    kicker: "昭梧 · 前世今生专题", title: "前世今生・达摩一掌经", lead: "一掌经最迷人的地方，不只在四个宫位，而在它把四宫串成一条前世到今生的因果线：从哪一道来、留下什么习气、今生又该怎么把这份本事用好。",
    scopeTitle: "一掌之间，看四世来处", scopeFour: "四宫｜年宫、月宫、日宫、时宫依序排出四世轮回足迹。", scopeStars: "十二星｜每一宫都有主星，说明这一世留下的性格与能力。", scopeRealms: "六道来处｜佛、仙、人、修罗、鬼、畜生六类象意，读的是习气与修行课题。",
    note: "它不替你证明一段无法验证的前世历史，而是给‘我为什么会成为现在的我’一个有秩序、可阅读的因果框架。",
    formTitle: "填写出生资料", formLead: "同一份资料同时给一掌经与 D60 使用。D60 必须有精确到分钟的出生时间与出生地；资料不足时只生成一掌经，不会硬算 D60。",
    name: "称呼（选填）", namePh: "用来标记这台设备里的报告", direction: "一掌经顺逆（必填）", directionHelp: "这是传统算法的顺逆参数，不用来定义你的性别身份。",
    forward: "顺行（传统男命）", reverse: "逆行（传统女命）", date: "出生日期（公历）", year: "年", month: "月", day: "日",
    time: "出生时间（精确到分钟）", hour: "时", minute: "分", timeUnknown: "不知道出生时间（时宫留白；D60 不判断）",
    city: "出生地（D60 必填）", cityPh: "搜索出生城市", optional: "选填", popular: "常用城市",
    d60Confirm: "D60 时间精度确认", d60ConfirmText: "我确认这个出生时间可核对到分钟，不是估算、整点代填或四舍五入值。", d60Hint: "未勾选或未选出生地时，一掌经仍会正常生成，但 D60 只显示资料不足，不会从账户旧资料自动补算。",
    submit: "生成我的报告", privacy: "报告会自动保存在这台设备，可到“我的记录”查看或删除。", required: "请填出生日期，并选择一掌经顺逆。", invalid: "这个日期无法转换为农历，请检查后再试。", invalidTime: "请完整填写出生时与分；如果不知道时间，请勾选“不知道出生时间”。",
    result: "前世今生报告", resultFor: "的前世今生报告", palaces: "前四世・六道习性报告", traceTitle: "前四世来自哪一道", traceHint: "由最远的前四世读到最近的前一世。哪一道重复出现，代表那一类性格与反应在今生更容易被加强。", realmFrom: "六道來處", traitLabel: "这一世的特征", storyLabel: "留到今生的习性", verseLabel: "古诀", readingTitle: "四世合看", readingBody: "四个宫位不是四句互不相关的标签。年宫看最远的根，月宫看与人群相处的旧习，日宫看关系与才情，时宫收束成离今生最近的一世。重复的六道要加重读，最近一世则是最容易在今生被触发的主轴。",
    missingHour: "你未提供出生时间，因此时宫／前一世不作判断；目前只显示年、月、日三宫。", again: "重新排盘", full: "回到昭梧完整分析", history: "查看我的记录", saved: "这份报告已保存在本设备。", saveFailed: "报告已生成，但浏览器阻止了本地保存。", boundary: "传统文化与象征性解读仅供自我观察，不替代医疗、法律、财务或现实决定。",
  },
  en: {
    kicker: "Zhaowu · Past & Present", title: "Dharma Palm · Four-Palace Reading", lead: "The appeal of the Dharma Palm is not only its four palaces, but the way they form a symbolic line from prior lives into the present: the realm a pattern comes from, what it leaves behind, and how that gift is handled now.",
    scopeTitle: "Four prior-life palaces in one palm", scopeFour: "Four palaces · Year, month, day and hour form a four-life symbolic trail.", scopeStars: "Twelve stars · Each palace carries a star describing the ability and pattern it leaves behind.", scopeRealms: "Six realms · Buddha, immortal, human, Asura, ghost and animal imagery frame the recurring lesson.",
    note: "This does not prove unverifiable past-life history. It offers a coherent symbolic framework for asking why certain strengths and habits feel so persistent.",
    formTitle: "Birth details", formLead: "One set of birth data now feeds both the Palm reading and D60. D60 requires a minute-accurate birth time and birthplace; without them, the Palm reading still runs and D60 is withheld.",
    name: "Name (optional)", namePh: "Used to label this report on your device", direction: "Palm sequence (required)", directionHelp: "This is the traditional method's calculation parameter; it does not define your gender identity.",
    forward: "Forward sequence (traditional male chart)", reverse: "Reverse sequence (traditional female chart)", date: "Date of birth (Gregorian)", year: "Year", month: "Month", day: "Day",
    time: "Birth time (to the minute)", hour: "Hour", minute: "Minute", timeUnknown: "Birth time unknown — leave the hour palace blank and withhold D60",
    city: "Birthplace (required for D60)", cityPh: "Search birthplace", optional: "optional", popular: "Popular cities",
    d60Confirm: "D60 time-accuracy confirmation", d60ConfirmText: "I confirm this birth time is documented to the minute, not estimated, rounded, or filled in as an approximate whole hour.", d60Hint: "Without this confirmation or a birthplace, the Palm reading still runs, while D60 shows insufficient data and never falls back to old account birth data.",
    submit: "Generate my report", privacy: "Saved automatically on this device. View or delete it in My history.", required: "Enter a birth date and choose a Palm sequence.", invalid: "This date cannot be converted to a lunar date. Check it and try again.", invalidTime: "Enter both hour and minute, or mark the birth time as unknown.",
    result: "Past & Present report", resultFor: " · Past & Present report", palaces: "Four prior lives and carried patterns", traceTitle: "Where each prior life comes from", traceHint: "Read from the fourth prior life toward the most recent one. A repeated realm means that style of reaction is more strongly reinforced in the present.", realmFrom: "Symbolic realm", traitLabel: "Traits of this life", storyLabel: "Habit carried forward", verseLabel: "Traditional verse", readingTitle: "Read all four lives together", readingBody: "The four palaces are not isolated labels. The year palace is the distant root, the month palace describes older social habits, the day palace brings craft and relationships closer, and the hour palace becomes the pattern nearest to the present. Repetition strengthens a habit; the latest palace is the easiest pattern to trigger now.",
    missingHour: "Birth time was not provided, so the hour palace and most recent prior-life category remain blank. The year, month and day palaces are shown.", again: "Calculate again", full: "Return to full Zhaowu analysis", history: "View my history", saved: "This report is saved on this device.", saveFailed: "The report is ready, but this browser blocked local storage.", boundary: "Traditional and symbolic interpretation for self-reflection only. It does not replace medical, legal, financial or practical decisions.",
  },
} as const satisfies Record<Locale, Record<string, string>>;

export function PalmStandalone() {
  const { locale } = useI18n();
  const copy = COPY[locale];
  const [name, setName] = useState("");
  const [year, setYear] = useState("");
  const [month, setMonth] = useState("");
  const [day, setDay] = useState("");
  const [gender, setGender] = useState<Gender>("unspecified");
  const [birthHour, setBirthHour] = useState("");
  const [birthMinute, setBirthMinute] = useState("");
  const [timeUnknown, setTimeUnknown] = useState(false);
  const [city, setCity] = useState<CityHit | null>(null);
  const [d60Exact, setD60Exact] = useState(false);
  const [error, setError] = useState<"" | "required" | "invalid" | "invalidTime">("");
  const [result, setResult] = useState<PalmReading | null>(null);
  const [historySaved, setHistorySaved] = useState(false);
  const resultRef = useRef<HTMLElement>(null);
  const maxYear = new Date().getFullYear();

  const onSubmit = (event: FormEvent) => {
    event.preventDefault();
    if (!year || !month || !day || gender === "unspecified") {
      setError("required");
      return;
    }
    const y = Number(year), m = Number(month), d = Number(day);
    const civilCheck = new Date(Date.UTC(y, m - 1, d));
    if (civilCheck.getUTCFullYear() !== y || civilCheck.getUTCMonth() !== m - 1 || civilCheck.getUTCDate() !== d) {
      setError("invalid");
      return;
    }

    const hasAnyTime = birthHour !== "" || birthMinute !== "";
    if (!timeUnknown && (!hasAnyTime || birthHour === "" || birthMinute === "")) {
      setError("invalidTime");
      return;
    }
    const h = timeUnknown ? 12 : Number(birthHour);
    const min = timeUnknown ? 0 : Number(birthMinute);
    if (!timeUnknown && (!Number.isInteger(h) || !Number.isInteger(min) || h < 0 || h > 23 || min < 0 || min > 59)) {
      setError("invalidTime");
      return;
    }

    const reading = buildPalm({ year: y, month: m, day: d, hour: h, timeUnknown, gender });
    if (!reading.palaces.length) {
      setError("invalid");
      return;
    }

    const d60Birth: D60BirthPayload | null = !timeUnknown && city && d60Exact
      ? { year: y, month: m, day: d, hour: h, minute: min, city }
      : null;
    window.dispatchEvent(new CustomEvent<D60BirthPayload | null>(D60_BIRTH_EVENT, { detail: d60Birth }));

    const savedSynthesis = buildPalmSynthesis(reading.palaces, locale);
    const timeLabel = timeUnknown ? copy.timeUnknown : `${String(h).padStart(2, "0")}:${String(min).padStart(2, "0")}`;
    const cityLabel = city?.display ? ` · ${city.display}` : "";
    const savedEntry = saveSpecialistHistory({
      kind: "yizhangjing",
      locale,
      sourcePath: "/yizhangjing",
      title: name.trim() ? `${name.trim()}${copy.resultFor}` : copy.palaces,
      inputSummary: `${y}-${String(m).padStart(2, "0")}-${String(d).padStart(2, "0")} · ${timeLabel}${cityLabel}`,
      sections: [
        ...reading.palaces.map((palace) => {
          const item = presentPalmPalace(palace, locale);
          const meaning = splitPalmMeaning(item.meaning, locale);
          return { title: `${item.lifeLabel} · ${item.dao}`, body: `${copy.traitLabel}：${meaning.trait}\n${copy.storyLabel}：${meaning.habit}` };
        }),
        { title: savedSynthesis.repeatedTitle, body: savedSynthesis.repeatedBody },
        { title: savedSynthesis.presentTitle, body: savedSynthesis.presentBody },
        { title: savedSynthesis.directionTitle, body: savedSynthesis.directionBody },
      ],
      closing: copy.boundary,
    });
    setHistorySaved(Boolean(savedEntry));
    setError("");
    setResult(reading);
    window.requestAnimationFrame(() => resultRef.current?.scrollIntoView({ behavior: "smooth", block: "start" }));
  };

  const reset = () => {
    setResult(null);
    setHistorySaved(false);
    setError("");
    window.dispatchEvent(new CustomEvent<D60BirthPayload | null>(D60_BIRTH_EVENT, { detail: null }));
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const synthesis = result ? buildPalmSynthesis(result.palaces, locale) : null;

  return (
    <main className="palm-standalone mx-auto max-w-4xl space-y-6 pb-10 sm:space-y-8">
      <section className="palm-hero relative overflow-hidden rounded-[2rem] border border-[#b99655]/40 bg-[#17140f] shadow-[0_28px_90px_rgba(24,18,10,.28)]">
        <div className="palm-hero-overlay absolute inset-0 bg-[radial-gradient(circle_at_82%_18%,rgba(39,103,93,.34),transparent_34%),radial-gradient(circle_at_10%_90%,rgba(143,48,39,.18),transparent_38%),linear-gradient(135deg,#18140f_0%,#232019_48%,#112b28_100%)]" />
        <div className="palm-hero-copy relative px-5 pb-6 pt-7 sm:px-8 sm:pb-8 sm:pt-9 lg:px-10 lg:py-10">
          <p className="text-[10px] font-semibold uppercase tracking-[0.26em] text-[#dfbd78] sm:text-xs">{copy.kicker}</p>
          <h1 className="mt-3 max-w-2xl font-display text-3xl font-semibold leading-[1.18] tracking-[0.055em] text-[#fff8e9] sm:text-5xl">{copy.title}</h1>
          <p className="mt-4 max-w-2xl text-sm leading-7 text-[#e9ddc5]/82 sm:text-base sm:leading-8">{copy.lead}</p>
          <div className="mt-6 grid gap-3 sm:grid-cols-3">
            {[copy.scopeFour, copy.scopeStars, copy.scopeRealms].map((text) => (
              <div key={text} className="rounded-2xl border border-[#e7c981]/18 bg-white/[0.055] p-3.5 backdrop-blur-sm">
                <p className="text-xs leading-5 text-[#f4ead6]/82">{text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="palm-form-section rounded-[1.75rem] border border-[#b99755]/28 bg-[#fffaf0]/92 p-4 shadow-[0_18px_52px_rgba(70,49,26,.09)] sm:p-6">
        <div className="px-1 pb-4 sm:px-2">
          <h2 className="font-display text-xl font-semibold tracking-[0.06em] text-ink sm:text-2xl">{copy.formTitle}</h2>
          <p className="mt-1 text-xs leading-6 text-ink-soft sm:text-sm">{copy.formLead}</p>
        </div>

        <form onSubmit={onSubmit} className="palm-form relative overflow-hidden rounded-[1.4rem] border border-line/80 bg-cream/92 p-5 sm:p-7" noValidate>
          <div className="relative">
            <label className="block text-sm font-medium text-ink">
              {copy.name}
              <input value={name} onChange={(event) => setName(event.target.value.slice(0, 40))} placeholder={copy.namePh} className="mt-2 min-h-14 w-full rounded-xl border border-line bg-white/72 px-4 text-base outline-none transition focus:border-cinnabar focus:ring-2 focus:ring-cinnabar/10" />
            </label>

            <fieldset className="mt-5">
              <legend className="text-sm font-medium text-ink">{copy.date}</legend>
              <div className="palm-birth-grid mt-2">
                {([[copy.year, year, setYear, 1900, maxYear], [copy.month, month, setMonth, 1, 12], [copy.day, day, setDay, 1, 31]] as const).map(([label, value, setter, minValue, maxValue]) => (
                  <label key={label}><span>{label}</span><input required type="number" inputMode="numeric" min={minValue} max={maxValue} value={value} onChange={(event) => setter(event.target.value)} /></label>
                ))}
              </div>
            </fieldset>

            <fieldset className="mt-5">
              <legend className="text-sm font-medium text-ink">{copy.time}</legend>
              <div className="mt-2 grid grid-cols-2 gap-3">
                <label className="text-xs text-ink-soft"><span>{copy.hour}</span><input disabled={timeUnknown} type="number" inputMode="numeric" min={0} max={23} value={birthHour} onChange={(event) => setBirthHour(event.target.value)} className="mt-2 min-h-14 w-full rounded-xl border border-line bg-white/72 px-4 text-base text-ink outline-none disabled:opacity-45" /></label>
                <label className="text-xs text-ink-soft"><span>{copy.minute}</span><input disabled={timeUnknown} type="number" inputMode="numeric" min={0} max={59} value={birthMinute} onChange={(event) => setBirthMinute(event.target.value)} className="mt-2 min-h-14 w-full rounded-xl border border-line bg-white/72 px-4 text-base text-ink outline-none disabled:opacity-45" /></label>
              </div>
              <label className="mt-3 flex items-start gap-3 rounded-xl border border-line/70 bg-white/50 px-4 py-3 text-sm text-ink-soft">
                <input type="checkbox" checked={timeUnknown} onChange={(event) => { setTimeUnknown(event.target.checked); if (event.target.checked) { setD60Exact(false); } }} className="mt-0.5 h-4 w-4 accent-cinnabar" />
                <span>{copy.timeUnknown}</span>
              </label>
            </fieldset>

            <div className="mt-5">
              <CityPicker id="palm-birth-city" label={copy.city} placeholder={copy.cityPh} optional optionalLabel={copy.optional} popularLabel={copy.popular} locale={locale} value={city} onSelect={setCity} />
            </div>

            <fieldset className="palm-direction mt-5">
              <legend className="text-sm font-medium text-ink">{copy.direction}</legend>
              <p className="mt-1 text-xs leading-5 text-ink-mute">{copy.directionHelp}</p>
              <div className="mt-3 grid gap-3 sm:grid-cols-2">
                {(["male", "female"] as const).map((value) => (
                  <label key={value} className={`flex min-h-16 items-center gap-3 rounded-xl border px-4 py-3 text-sm transition ${gender === value ? "border-cinnabar bg-cinnabar/7 text-ink shadow-[inset_3px_0_0_#8f3027]" : "border-line bg-white/60 text-ink-soft"}`}>
                    <input type="radio" name="palm-direction" value={value} checked={gender === value} onChange={() => setGender(value)} className="h-4 w-4 accent-cinnabar" />
                    <span>{value === "male" ? copy.forward : copy.reverse}</span>
                  </label>
                ))}
              </div>
            </fieldset>

            <fieldset className="mt-5 rounded-xl border border-[#b99755]/28 bg-[#f7edd9]/55 p-4">
              <legend className="px-1 text-sm font-medium text-ink">{copy.d60Confirm}</legend>
              <label className="mt-1 flex items-start gap-3 text-sm leading-6 text-ink-soft">
                <input type="checkbox" disabled={timeUnknown} checked={d60Exact} onChange={(event) => setD60Exact(event.target.checked)} className="mt-1 h-4 w-4 accent-cinnabar disabled:opacity-45" />
                <span>{copy.d60ConfirmText}</span>
              </label>
              <p className="mt-2 text-xs leading-5 text-ink-mute">{copy.d60Hint}</p>
            </fieldset>

            {error ? <p role="alert" className="mt-4 rounded-xl border border-cinnabar/25 bg-cinnabar/7 px-4 py-3 text-sm text-cinnabar-deep">{copy[error]}</p> : null}

            <button type="submit" className="mt-6 min-h-14 w-full rounded-full bg-[#7f2f28] px-6 text-base font-semibold tracking-[0.1em] text-[#fff7e7] shadow-[0_14px_30px_rgba(111,36,30,.2)] transition hover:bg-[#68251f] focus:outline-none focus:ring-2 focus:ring-cinnabar/35 focus:ring-offset-2">
              {copy.submit}
            </button>
            <p className="mt-3 text-center text-[11px] leading-5 text-ink-mute">{copy.privacy}</p>
          </div>
        </form>

        <p className="mt-4 rounded-2xl border border-[#b99755]/25 bg-[#f7edd9]/72 px-4 py-3 text-xs leading-6 text-ink-soft sm:text-sm">{copy.note}</p>
      </section>

      {result ? (
        <section ref={resultRef} className="palm-result scroll-mt-20 space-y-5 overflow-hidden rounded-[1.9rem] border border-[#b99755]/35 bg-cream/95 shadow-[0_28px_80px_rgba(62,43,24,.14)]" aria-live="polite">
          <div className="palm-result-head relative overflow-hidden border-b border-[#b99755]/20 bg-[#1b1812] px-5 py-6 sm:px-8 sm:py-7">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_86%_20%,rgba(47,119,115,.25),transparent_34%),linear-gradient(135deg,rgba(127,47,40,.2),transparent_50%)]" />
            <div className="relative">
              <p className="text-[10px] font-semibold uppercase tracking-[0.24em] text-[#dfbd78]">{copy.result}</p>
              <h2 className="mt-1 font-display text-2xl font-semibold tracking-[0.06em] text-[#fff8e9] sm:text-3xl">{name.trim() ? `${name.trim()}${copy.resultFor}` : copy.palaces}</h2>
              <p className="mt-3 text-sm text-[#e8dcc4]/80">{presentLunarLabel(result.lunarLabel, locale)}</p>
              {!result.ready ? <p className="mt-3 rounded-xl border border-[#d8b66d]/18 bg-white/[0.05] px-4 py-3 text-sm leading-6 text-[#efe4cf]/78">{copy.missingHour}</p> : null}
            </div>
          </div>

          <div className="space-y-5 px-5 pb-5 sm:px-8 sm:pb-8">
            <article className="relative overflow-hidden rounded-2xl border border-[#b99755]/35 p-4 sm:p-5" style={{ background: "linear-gradient(135deg, rgba(255,250,242,.98), rgba(242,231,207,.84))" }}>
              <h3 className="font-display text-lg font-semibold tracking-[0.06em] text-ink">{copy.traceTitle}</h3>
              <div className="mt-4 grid grid-cols-2 gap-2 sm:grid-cols-4">
                {result.palaces.map((palace) => {
                  const item = presentPalmPalace(palace, locale);
                  const tone = palmDaoTone(palace.dao);
                  return (
                    <div key={`trace-${palace.key}`} className="rounded-xl border bg-white/64 px-3 py-3" style={{ borderColor: `${tone}3d` }}>
                      <p className="text-[10px] font-semibold tracking-[0.12em] text-ink-mute">{item.lifeLabel}</p>
                      <p className="mt-1 font-display text-sm font-semibold" style={{ color: tone }}>{item.dao}</p>
                      <p className="mt-1 text-[11px] leading-5 text-ink-soft">{item.zhi} · {item.star}</p>
                    </div>
                  );
                })}
              </div>
              <p className="mt-4 text-xs leading-6 text-ink-soft sm:text-sm">{copy.traceHint}</p>
            </article>

            <div className="grid gap-4 sm:grid-cols-2">
              {result.palaces.map((palace) => {
                const item = presentPalmPalace(palace, locale);
                const meaning = splitPalmMeaning(item.meaning, locale);
                const tone = palmDaoTone(palace.dao);
                return (
                  <article key={palace.key} className="relative overflow-hidden rounded-2xl border bg-[#fffaf2] p-5" style={{ borderColor: `${tone}55`, boxShadow: `inset 4px 0 0 ${tone}` }}>
                    <div className="flex items-start justify-between gap-3">
                      <div><p className="text-[11px] font-semibold tracking-[0.18em] text-ink-mute">{item.lifeLabel}</p><p className="mt-1 text-xs text-ink-soft">{item.range}</p></div>
                      <span className="grid h-11 w-11 shrink-0 place-items-center rounded-full border font-display text-xl" style={{ borderColor: `${tone}66`, color: tone, backgroundColor: `${tone}10` }}>{item.zhi}</span>
                    </div>
                    <h3 className="mt-5 font-display text-xl font-semibold tracking-[0.06em] text-ink">{item.star}</h3>
                    <p className="mt-2 text-[10px] font-semibold uppercase tracking-[0.16em] text-ink-mute">{copy.realmFrom}</p>
                    <p className="mt-1 inline-flex rounded-full px-3 py-1 text-xs font-semibold" style={{ color: tone, backgroundColor: `${tone}12` }}>{item.dao}</p>
                    <p className="mt-4 text-[10px] font-semibold tracking-[0.15em] text-cinnabar">{copy.traitLabel}</p>
                    <p className="mt-2 text-sm leading-7 text-ink-soft">{meaning.trait}</p>
                    <p className="mt-4 text-[10px] font-semibold tracking-[0.15em] text-cinnabar">{copy.storyLabel}</p>
                    <p className="mt-2 text-sm leading-7 text-ink-soft">{meaning.habit}</p>
                    <div className="mt-4 border-t border-line/60 pt-3">
                      <p className="font-display text-xs leading-6 text-ink-mute"><span className="mr-2 text-[10px] font-sans tracking-[0.12em]">{copy.verseLabel}</span>{item.verse}</p>
                    </div>
                  </article>
                );
              })}
            </div>

            <article className="rounded-2xl border border-[#b99755]/35 bg-paper/65 p-5">
              <h3 className="font-display text-xl font-semibold tracking-[0.06em] text-ink">{copy.readingTitle}</h3>
              <p className="mt-3 text-sm leading-7 text-ink-soft">{copy.readingBody}</p>
            </article>

            {synthesis ? (
              <div className="palm-synthesis-grid">
                {([
                  [synthesis.repeatedTitle, synthesis.repeatedBody],
                  [synthesis.presentTitle, synthesis.presentBody],
                  [synthesis.directionTitle, synthesis.directionBody],
                ] as const).map(([title, body], index) => (
                  <article key={title} className="palm-synthesis-card">
                    <span>{String(index + 1).padStart(2, "0")}</span>
                    <h3>{title}</h3>
                    <p>{body}</p>
                  </article>
                ))}
              </div>
            ) : null}

            <p className="text-xs leading-6 text-ink-mute">{copy.boundary}</p>
            <div className="palm-history-note"><span>{historySaved ? copy.saved : copy.saveFailed}</span>{historySaved ? <Link to="/history">{copy.history}<b aria-hidden>→</b></Link> : null}</div>
            <div className="grid gap-3 sm:grid-cols-2">
              <button type="button" onClick={reset} className="min-h-12 rounded-full border border-cinnabar/35 bg-transparent px-5 text-sm font-medium text-cinnabar">{copy.again}</button>
              <Link to="/" className="inline-flex min-h-12 items-center justify-center rounded-full bg-cinnabar px-5 text-sm font-medium text-cream">{copy.full}</Link>
            </div>
          </div>
        </section>
      ) : null}
    </main>
  );
}
