import { useRef, useState, type FormEvent } from "react";
import { Link } from "@tanstack/react-router";
import { BrandSeal } from "@/components/brand-seal";
import { useI18n, type Locale } from "@/lib/i18n";
import { buildPalm } from "@/lib/palm/engine";
import { buildPalmSynthesis, palmDaoTone, presentLunarLabel, presentPalmHourLabel, presentPalmPalace, splitPalmMeaning } from "@/lib/palm/standalone-presentation";
import type { Gender } from "@/lib/bazi/types";
import type { PalmReading } from "@/lib/core/types";

const HOURS = [
  ["23", "子", "23:00–00:59"], ["1", "丑", "01:00–02:59"], ["3", "寅", "03:00–04:59"],
  ["5", "卯", "05:00–06:59"], ["7", "辰", "07:00–08:59"], ["9", "巳", "09:00–10:59"],
  ["11", "午", "11:00–12:59"], ["13", "未", "13:00–14:59"], ["15", "申", "15:00–16:59"],
  ["17", "酉", "17:00–18:59"], ["19", "戌", "19:00–20:59"], ["21", "亥", "21:00–22:59"],
] as const;

const AUSPICIOUS_EMBLEMS = [
  "/emblems/dharma-wheel-emblem.svg",
  "/emblems/lotus-emblem.svg",
  "/emblems/modern-endless-knot-emblem.svg",
  "/emblems/modern-conch-emblem.svg",
  "/emblems/modern-golden-fish-emblem.svg",
  "/emblems/treasure-vase-emblem.svg",
  "/emblems/modern-parasol-emblem.svg",
  "/emblems/modern-victory-banner-emblem.svg",
] as const;

const COPY = {
  "zh-Hant": {
    kicker: "昭梧 · 前世今生專題", title: "前世今生・達摩一掌經", lead: "一掌經最迷人的地方，不只在四個宮位，而在它把四宮串成一條前世到今生的因果線：從哪一道來、留下什麼習氣、今生又該怎麼把這份本事用好。",
    scopeTitle: "一掌之間，看四世來處", scopeFour: "四宮｜年宮、月宮、日宮、時宮依序排出四世輪迴足跡。", scopeStars: "十二星｜每一宮都有主星，說明這一世留下的性格與能力。", scopeRealms: "六道來處｜佛、仙、人、修羅、鬼、畜生六類象意，讀的是習氣與修行課題。",
    note: "它不替你證明一段無法驗證的前世歷史，而是給『我為什麼會成為現在的我』一個有秩序、可閱讀的因果框架。",
    formTitle: "填寫出生資料", formLead: "填好日期、時辰與順逆，直接閱讀你的四世六道報告。",
    name: "稱呼（選填）", namePh: "只顯示在本次結果，不會保存", direction: "一掌經順逆（必填）", directionHelp: "這是傳統算法的順逆參數，不用來定義你的性別身份。",
    forward: "順行（傳統男命）", reverse: "逆行（傳統女命）", date: "出生日期（國曆）", hour: "出生時辰", unknown: "不知道時辰（時宮留白）",
    submit: "生成我的報告", privacy: "傳統文化與象徵性解讀，用於自我觀察。", required: "請填出生日期，並選擇一掌經順逆。", invalid: "這個日期無法轉換為農曆，請檢查後再試。",
    result: "前世今生報告", resultFor: "的前世今生報告", palaces: "前四世・六道習性報告", traceTitle: "前四世來自哪一道", traceHint: "由最遠的前四世讀到最近的前一世。哪一道重複出現，代表那一類性格與反應在今生更容易被加強。", realmFrom: "六道來處", traitLabel: "這一世的特徵", storyLabel: "留到今生的習性", verseLabel: "古訣", readingTitle: "四世合看", readingBody: "四個宮位不是四句互不相關的標籤。年宮看最遠的根，月宮看與人群相處的舊習，日宮看關係與才情，時宮收束成離今生最近的一世。重複的六道要加重讀，最近一世則是最容易在今生被觸發的主軸。",
    missingHour: "你未提供出生時辰，因此時宮／前一世不作判定；目前只顯示年、月、日三宮。", again: "重新排盤", full: "回到昭梧完整分析", boundary: "傳統文化與象徵性解讀僅供自我觀察，不替代醫療、法律、財務或現實決策。",
  },
  "zh-Hans": {
    kicker: "昭梧 · 前世今生专题", title: "前世今生・达摩一掌经", lead: "一掌经最迷人的地方，不只在四个宫位，而在它把四宫串成一条前世到今生的因果线：从哪一道来、留下什么习气、今生又该怎么把这份本事用好。",
    scopeTitle: "一掌之间，看四世来处", scopeFour: "四宫｜年宫、月宫、日宫、时宫依序排出四世轮回足迹。", scopeStars: "十二星｜每一宫都有主星，说明这一世留下的性格与能力。", scopeRealms: "六道来处｜佛、仙、人、修罗、鬼、畜生六类象意，读的是习气与修行课题。",
    note: "它不替你证明一段无法验证的前世历史，而是给‘我为什么会成为现在的我’一个有秩序、可阅读的因果框架。",
    formTitle: "填写出生资料", formLead: "填好日期、时辰与顺逆，直接阅读你的四世六道报告。",
    name: "称呼（选填）", namePh: "只显示在本次结果，不会保存", direction: "一掌经顺逆（必填）", directionHelp: "这是传统算法的顺逆参数，不用来定义你的性别身份。",
    forward: "顺行（传统男命）", reverse: "逆行（传统女命）", date: "出生日期（公历）", hour: "出生时辰", unknown: "不知道时辰（时宫留白）",
    submit: "生成我的报告", privacy: "传统文化与象征性解读，用于自我观察。", required: "请填出生日期，并选择一掌经顺逆。", invalid: "这个日期无法转换为农历，请检查后再试。",
    result: "前世今生报告", resultFor: "的前世今生报告", palaces: "前四世・六道习性报告", traceTitle: "前四世来自哪一道", traceHint: "由最远的前四世读到最近的前一世。哪一道重复出现，代表那一类性格与反应在今生更容易被加强。", realmFrom: "六道来处", traitLabel: "这一世的特征", storyLabel: "留到今生的习性", verseLabel: "古诀", readingTitle: "四世合看", readingBody: "四个宫位不是四句互不相关的标签。年宫看最远的根，月宫看与人群相处的旧习，日宫看关系与才情，时宫收束成离今生最近的一世。重复的六道要加重读，最近一世则是最容易在今生被触发的主轴。",
    missingHour: "你未提供出生时辰，因此时宫／前一世不作判定；目前只显示年、月、日三宫。", again: "重新排盘", full: "回到昭梧完整分析", boundary: "传统文化与象征性解读仅供自我观察，不替代医疗、法律、财务或现实决定。",
  },
  en: {
    kicker: "Zhaowu · Past & Present", title: "Dharma Palm · Four-Palace Reading", lead: "The appeal of the Dharma Palm is not only its four palaces, but the way they form a symbolic line from prior lives into the present: the realm a pattern comes from, what it leaves behind, and how that gift is handled now.",
    scopeTitle: "Four prior-life palaces in one palm", scopeFour: "Four palaces · Year, month, day and hour form a four-life symbolic trail.", scopeStars: "Twelve stars · Each palace carries a star describing the ability and pattern it leaves behind.", scopeRealms: "Six realms · Buddha, immortal, human, Asura, ghost and animal imagery frame the recurring lesson.",
    note: "This does not prove unverifiable past-life history. It offers a coherent symbolic framework for asking why certain strengths and habits feel so persistent.",
    formTitle: "Birth details", formLead: "Enter the date, hour and sequence to read your four-life, six-realm report.",
    name: "Name (optional)", namePh: "Shown only in this result; never saved", direction: "Palm sequence (required)", directionHelp: "This is the traditional method's calculation parameter; it does not define your gender identity.",
    forward: "Forward sequence (traditional male chart)", reverse: "Reverse sequence (traditional female chart)", date: "Date of birth (Gregorian)", hour: "Birth-hour branch", unknown: "Time unknown — leave the hour palace blank",
    submit: "Generate my report", privacy: "Traditional symbolic interpretation for self-reflection.", required: "Enter a birth date and choose a Palm sequence.", invalid: "This date cannot be converted to a lunar date. Check it and try again.",
    result: "Past & Present report", resultFor: " · Past & Present report", palaces: "Four prior lives and carried patterns", traceTitle: "Where each prior life comes from", traceHint: "Read from the fourth prior life toward the most recent one. A repeated realm means that style of reaction is more strongly reinforced in the present.", realmFrom: "Symbolic realm", traitLabel: "Traits of this life", storyLabel: "Habit carried forward", verseLabel: "Traditional verse", readingTitle: "Read all four lives together", readingBody: "The four palaces are not isolated labels. The year palace is the distant root, the month palace describes older social habits, the day palace brings craft and relationships closer, and the hour palace becomes the pattern nearest to the present. Repetition strengthens a habit; the latest palace is the easiest pattern to trigger now.",
    missingHour: "Birth time was not provided, so the hour palace and most recent prior-life category remain blank. The year, month and day palaces are shown.", again: "Calculate again", full: "Return to full Zhaowu analysis", boundary: "Traditional and symbolic interpretation for self-reflection only. It does not replace medical, legal, financial or practical decisions.",
  },
} as const satisfies Record<Locale, Record<string, string>>;

export function PalmStandalone() {
  const { locale } = useI18n();
  const copy = COPY[locale];
  const [name, setName] = useState("");
  const [date, setDate] = useState("");
  const [gender, setGender] = useState<Gender>("unspecified");
  const [hour, setHour] = useState("unknown");
  const [error, setError] = useState<"" | "required" | "invalid">("");
  const [result, setResult] = useState<PalmReading | null>(null);
  const resultRef = useRef<HTMLElement>(null);
  const maxDate = new Date().toISOString().slice(0, 10);

  const onSubmit = (event: FormEvent) => {
    event.preventDefault();
    if (!date || gender === "unspecified") {
      setError("required");
      return;
    }
    const [year, month, day] = date.split("-").map(Number);
    const reading = buildPalm({
      year,
      month,
      day,
      hour: hour === "unknown" ? 12 : Number(hour),
      timeUnknown: hour === "unknown",
      gender,
    });
    if (!reading.palaces.length) {
      setError("invalid");
      return;
    }
    setError("");
    setResult(reading);
    window.requestAnimationFrame(() => resultRef.current?.scrollIntoView({ behavior: "smooth", block: "start" }));
  };

  const reset = () => {
    setResult(null);
    setError("");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const synthesis = result ? buildPalmSynthesis(result.palaces, locale) : null;

  return (
    <main className="palm-standalone mx-auto max-w-4xl space-y-6 pb-10 sm:space-y-8">
      <section className="palm-hero relative overflow-hidden rounded-[2rem] border border-[#b99655]/40 bg-[#17140f] shadow-[0_28px_90px_rgba(24,18,10,.28)]">
        <div className="palm-hero-overlay absolute inset-0 bg-[radial-gradient(circle_at_82%_18%,rgba(39,103,93,.34),transparent_34%),radial-gradient(circle_at_10%_90%,rgba(143,48,39,.18),transparent_38%),linear-gradient(135deg,#18140f_0%,#232019_48%,#112b28_100%)]" />
        <img src="/emblems/modern-parasol-emblem.svg" alt="" aria-hidden className="pointer-events-none absolute -right-16 -top-20 h-64 w-64 opacity-[0.08] sm:h-80 sm:w-80" />
        <img src="/emblems/modern-endless-knot-emblem.svg" alt="" aria-hidden className="pointer-events-none absolute -bottom-16 -left-14 h-52 w-52 opacity-[0.06]" />
        <div className="pointer-events-none absolute right-5 top-5 opacity-[0.12]" aria-hidden><BrandSeal size="lg" decorative /></div>

        <div className="palm-hero-copy relative grid gap-7 px-5 pb-6 pt-7 sm:px-8 sm:pb-8 sm:pt-9 lg:grid-cols-[1.35fr_.65fr] lg:items-center lg:gap-10 lg:px-10 lg:py-10">
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-[0.26em] text-[#dfbd78] sm:text-xs">{copy.kicker}</p>
            <h1 className="mt-3 max-w-2xl font-display text-3xl font-semibold leading-[1.18] tracking-[0.055em] text-[#fff8e9] sm:text-5xl">{copy.title}</h1>
            <p className="mt-4 max-w-2xl text-sm leading-7 text-[#e9ddc5]/82 sm:text-base sm:leading-8">{copy.lead}</p>

            <div className="mt-6 grid gap-3 sm:grid-cols-3">
              {([
                ["/emblems/dharma-wheel-emblem.svg", copy.scopeFour],
                ["/emblems/lotus-emblem.svg", copy.scopeStars],
                ["/emblems/modern-endless-knot-emblem.svg", copy.scopeRealms],
              ] as const).map(([icon, text]) => (
                <div key={icon} className="rounded-2xl border border-[#e7c981]/18 bg-white/[0.055] p-3.5 backdrop-blur-sm">
                  <img src={icon} alt="" aria-hidden className="h-8 w-8 opacity-85" />
                  <p className="mt-2 text-xs leading-5 text-[#f4ead6]/82">{text}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="palm-hero-art relative mx-auto hidden aspect-square w-full max-w-[15rem] place-items-center lg:grid" aria-hidden>
            <div className="absolute inset-3 rounded-full border border-[#d8b66d]/18" />
            <div className="absolute inset-9 rounded-full border border-[#d8b66d]/24" />
            <div className="absolute inset-[4.5rem] rounded-full border border-[#79a99e]/25 bg-[#0d1917]/45 shadow-[0_0_50px_rgba(94,160,145,.12)]" />
            <img src="/emblems/dharma-wheel-emblem.svg" alt="" className="relative z-10 h-24 w-24 opacity-95 drop-shadow-[0_8px_18px_rgba(0,0,0,.3)]" />
            <img src="/emblems/lotus-emblem.svg" alt="" className="absolute bottom-2 left-1/2 h-12 w-12 -translate-x-1/2 opacity-80" />
            <img src="/emblems/modern-conch-emblem.svg" alt="" className="absolute left-4 top-1/2 h-10 w-10 -translate-y-1/2 opacity-70" />
            <img src="/emblems/modern-victory-banner-emblem.svg" alt="" className="absolute right-4 top-1/2 h-10 w-10 -translate-y-1/2 opacity-70" />
            <img src="/emblems/modern-golden-fish-emblem.svg" alt="" className="absolute right-8 top-5 h-9 w-9 opacity-70" />
            <img src="/emblems/treasure-vase-emblem.svg" alt="" className="absolute left-8 top-5 h-9 w-9 opacity-70" />
          </div>
        </div>

        <div className="palm-hero-ornaments relative border-t border-[#d8b66d]/15 bg-black/10 px-4 py-3 sm:px-8">
          <div className="mx-auto flex max-w-2xl items-center justify-between gap-2" aria-hidden>
            {AUSPICIOUS_EMBLEMS.map((icon) => (
              <span key={icon} className="grid h-8 w-8 place-items-center rounded-full border border-[#e5c77d]/12 bg-white/[0.035] sm:h-9 sm:w-9">
                <img src={icon} alt="" className="h-5 w-5 opacity-70 sm:h-6 sm:w-6" />
              </span>
            ))}
          </div>
        </div>
      </section>

      <section className="palm-form-section rounded-[1.75rem] border border-[#b99755]/28 bg-[#fffaf0]/92 p-4 shadow-[0_18px_52px_rgba(70,49,26,.09)] sm:p-6">
        <div className="flex items-start gap-3 px-1 pb-4 sm:px-2">
          <span className="grid h-11 w-11 shrink-0 place-items-center rounded-full border border-[#b99755]/30 bg-[#f7ecd3]">
            <img src="/emblems/dharma-wheel-emblem.svg" alt="" aria-hidden className="h-7 w-7 opacity-75" />
          </span>
          <div>
            <h2 className="font-display text-xl font-semibold tracking-[0.06em] text-ink sm:text-2xl">{copy.formTitle}</h2>
            <p className="mt-1 text-xs leading-6 text-ink-soft sm:text-sm">{copy.formLead}</p>
          </div>
        </div>

        <form onSubmit={onSubmit} className="palm-form relative overflow-hidden rounded-[1.4rem] border border-line/80 bg-cream/92 p-5 sm:p-7" noValidate>
          <img src="/emblems/modern-conch-emblem.svg" alt="" aria-hidden className="pointer-events-none absolute -right-8 -top-8 h-28 w-28 opacity-[0.035]" />
          <div className="relative">
            <div className="grid gap-5 sm:grid-cols-2">
              <label className="block text-sm font-medium text-ink">
                {copy.name}
                <input value={name} onChange={(event) => setName(event.target.value.slice(0, 40))} placeholder={copy.namePh} className="mt-2 min-h-14 w-full rounded-xl border border-line bg-white/72 px-4 text-base outline-none transition focus:border-cinnabar focus:ring-2 focus:ring-cinnabar/10" />
              </label>
              <label className="block text-sm font-medium text-ink">
                {copy.date}
                <input type="date" min="1900-01-31" max={maxDate} value={date} onChange={(event) => setDate(event.target.value)} className="mt-2 min-h-14 w-full rounded-xl border border-line bg-white/72 px-4 text-base outline-none transition focus:border-cinnabar focus:ring-2 focus:ring-cinnabar/10" />
              </label>
            </div>

            <fieldset className="mt-5">
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

            <label className="mt-5 block text-sm font-medium text-ink">
              {copy.hour}
              <select value={hour} onChange={(event) => setHour(event.target.value)} className="mt-2 min-h-14 w-full rounded-xl border border-line bg-white/72 px-4 text-base outline-none transition focus:border-cinnabar focus:ring-2 focus:ring-cinnabar/10">
                <option value="unknown">{copy.unknown}</option>
                {HOURS.map(([value, branch, range]) => <option key={value} value={value}>{presentPalmHourLabel(branch, range, locale)}</option>)}
              </select>
            </label>

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
            <img src="/emblems/modern-parasol-emblem.svg" alt="" aria-hidden className="pointer-events-none absolute -right-8 -top-12 h-36 w-36 opacity-[0.08]" />
            <div className="relative flex items-center gap-3">
              <span className="grid h-11 w-11 shrink-0 place-items-center rounded-full border border-[#d8b66d]/30 bg-white/[0.05]">
                <img src="/emblems/dharma-wheel-emblem.svg" alt="" aria-hidden className="h-8 w-8 opacity-85" />
              </span>
              <div>
                <p className="text-[10px] font-semibold uppercase tracking-[0.24em] text-[#dfbd78]">{copy.result}</p>
                <h2 className="mt-1 font-display text-2xl font-semibold tracking-[0.06em] text-[#fff8e9] sm:text-3xl">{name.trim() ? `${name.trim()}${copy.resultFor}` : copy.palaces}</h2>
              </div>
            </div>
            <p className="relative mt-3 text-sm text-[#e8dcc4]/80">{presentLunarLabel(result.lunarLabel, locale)}</p>
            {!result.ready ? <p className="relative mt-3 rounded-xl border border-[#d8b66d]/18 bg-white/[0.05] px-4 py-3 text-sm leading-6 text-[#efe4cf]/78">{copy.missingHour}</p> : null}
          </div>

          <div className="space-y-5 px-5 pb-5 sm:px-8 sm:pb-8">
            <article className="relative overflow-hidden rounded-2xl border border-[#b99755]/35 p-4 sm:p-5" style={{ background: "linear-gradient(135deg, rgba(255,250,242,.98), rgba(242,231,207,.84))" }}>
              <img src="/emblems/modern-endless-knot-emblem.svg" alt="" aria-hidden className="pointer-events-none absolute -bottom-9 -right-6 h-28 w-28 opacity-[0.06]" />
              <div className="relative">
                <div className="flex items-center gap-2">
                  <img src="/emblems/modern-conch-emblem.svg" alt="" aria-hidden className="h-7 w-7 opacity-70" />
                  <h3 className="font-display text-lg font-semibold tracking-[0.06em] text-ink">{copy.traceTitle}</h3>
                </div>
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
              </div>
            </article>

            <div className="grid gap-4 sm:grid-cols-2">
                  {result.palaces.map((palace, index) => {
                    const item = presentPalmPalace(palace, locale);
                    const meaning = splitPalmMeaning(item.meaning, locale);
                const tone = palmDaoTone(palace.dao);
                const ornament = AUSPICIOUS_EMBLEMS[index % AUSPICIOUS_EMBLEMS.length];
                return (
                  <article key={palace.key} className="relative overflow-hidden rounded-2xl border bg-[#fffaf2] p-5" style={{ borderColor: `${tone}55`, boxShadow: `inset 4px 0 0 ${tone}` }}>
                    <img src={ornament} alt="" aria-hidden className="pointer-events-none absolute -bottom-7 -right-6 h-24 w-24 opacity-[0.055]" />
                    <div className="relative">
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
                      <div className="mt-4 flex items-center gap-2 border-t border-line/60 pt-3">
                        <img src="/emblems/dharma-wheel-emblem.svg" alt="" aria-hidden className="h-5 w-5 shrink-0 opacity-45" />
                        <p className="font-display text-xs leading-6 text-ink-mute"><span className="mr-2 text-[10px] font-sans tracking-[0.12em]">{copy.verseLabel}</span>{item.verse}</p>
                      </div>
                    </div>
                  </article>
                );
              })}
            </div>

            <article className="relative overflow-hidden rounded-2xl border border-[#b99755]/35 bg-paper/65 p-5">
              <img src="/emblems/treasure-vase-emblem.svg" alt="" aria-hidden className="pointer-events-none absolute -right-5 -top-5 h-20 w-20 opacity-[0.055]" />
              <div className="relative">
                <h3 className="font-display text-xl font-semibold tracking-[0.06em] text-ink">{copy.readingTitle}</h3>
                <p className="mt-3 text-sm leading-7 text-ink-soft">{copy.readingBody}</p>
              </div>
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
