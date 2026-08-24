import { useRef, useState, type FormEvent } from "react";
import { Link } from "@tanstack/react-router";
import { BrandSeal } from "@/components/brand-seal";
import { useI18n, type Locale } from "@/lib/i18n";
import { buildPalm } from "@/lib/palm/engine";
import { palmDaoTone, presentLunarLabel, presentPalmHourLabel, presentPalmPalace } from "@/lib/palm/standalone-presentation";
import type { Gender } from "@/lib/bazi/types";
import type { PalmReading } from "@/lib/core/types";

const HOURS = [
  ["23", "子", "23:00–00:59"], ["1", "丑", "01:00–02:59"], ["3", "寅", "03:00–04:59"],
  ["5", "卯", "05:00–06:59"], ["7", "辰", "07:00–08:59"], ["9", "巳", "09:00–10:59"],
  ["11", "午", "11:00–12:59"], ["13", "未", "13:00–14:59"], ["15", "申", "15:00–16:59"],
  ["17", "酉", "17:00–18:59"], ["19", "戌", "19:00–20:59"], ["21", "亥", "21:00–22:59"],
] as const;

const COPY = {
  "zh-Hant": {
    kicker: "昭梧 · 單頁展廳 · 免費確定性排盤", title: "前世今生・達摩一掌經", lead: "一掌經最迷人的地方，不只在四個宮位，而在它把四宮串成一條前世到今生的因果線：從哪一道來、留下什麼習氣、今生又該怎麼把這份本事用好。",
    scopeTitle: "一掌之間，看四世來處", scopeFour: "四宮｜年宮、月宮、日宮、時宮依序排出四世輪迴足跡。", scopeStars: "十二星｜每一宮都有主星，說明這一世留下的性格與能力。", scopeRealms: "六道來處｜佛、仙、人、修羅、鬼、畜生六類象意，讀的是習氣與修行課題。",
    note: "它不替你證明一段無法驗證的前世歷史，而是給『我為什麼會成為現在的我』一個有秩序、可閱讀的因果框架。",
    name: "稱呼（選填）", namePh: "只顯示在本次結果，不會保存", direction: "一掌經順逆（必填）", directionHelp: "這是傳統算法的順逆參數，不用來定義你的性別身份。",
    forward: "順行（傳統男命）", reverse: "逆行（傳統女命）", date: "出生日期（國曆）", hour: "出生時辰", unknown: "不知道時辰（時宮留白）",
    submit: "開始排盤", privacy: "資料只在你的裝置上即時計算；不登入、不保存、不傳送。", required: "請填出生日期，並選擇一掌經順逆。", invalid: "這個日期無法轉換為農曆，請檢查後再試。",
    result: "一掌經四宮", resultFor: "的四宮結果", palaces: "前世四世・輪迴足跡", traceTitle: "四世六道軌跡", traceHint: "由年宮一路讀到時宮，看的不是單點吉凶，而是哪一種習氣反覆出現、最後又落回今生命宮。", realmFrom: "六道來處", storyLabel: "這一世留下的習氣", verseLabel: "古訣", readingTitle: "把四宮連起來看", readingBody: "年宮像最遠的根，月宮看你如何與人間相處，日宮把才情與關係拉近，時宮再收束成今生命宮。重複出現的六道，是反覆帶來的慣性；最後落到時宮的那一道，則是今生最值得理解與修煉的主軸。",
    missingHour: "你未提供出生時辰，因此時宮／前一世不作判定；目前只顯示年、月、日三宮。", again: "重新排盤", full: "回到昭梧完整分析", boundary: "傳統文化與象徵性解讀僅供自我觀察，不替代醫療、法律、財務或現實決策。",
  },
  "zh-Hans": {
    kicker: "昭梧 · 单页展厅 · 免费确定性排盘", title: "前世今生・达摩一掌经", lead: "一掌经最迷人的地方，不只在四个宫位，而在它把四宫串成一条前世到今生的因果线：从哪一道来、留下什么习气、今生又该怎么把这份本事用好。",
    scopeTitle: "一掌之间，看四世来处", scopeFour: "四宫｜年宫、月宫、日宫、时宫依序排出四世轮回足迹。", scopeStars: "十二星｜每一宫都有主星，说明这一世留下的性格与能力。", scopeRealms: "六道来处｜佛、仙、人、修罗、鬼、畜生六类象意，读的是习气与修行课题。",
    note: "它不替你证明一段无法验证的前世历史，而是给‘我为什么会成为现在的我’一个有秩序、可阅读的因果框架。",
    name: "称呼（选填）", namePh: "只显示在本次结果，不会保存", direction: "一掌经顺逆（必填）", directionHelp: "这是传统算法的顺逆参数，不用来定义你的性别身份。",
    forward: "顺行（传统男命）", reverse: "逆行（传统女命）", date: "出生日期（公历）", hour: "出生时辰", unknown: "不知道时辰（时宫留白）",
    submit: "开始排盘", privacy: "资料只在你的设备上即时计算；不登录、不保存、不传送。", required: "请填出生日期，并选择一掌经顺逆。", invalid: "这个日期无法转换为农历，请检查后再试。",
    result: "一掌经四宫", resultFor: "的四宫结果", palaces: "前世四世・轮回足迹", traceTitle: "四世六道轨迹", traceHint: "由年宫一路读到时宫，看的不是单点吉凶，而是哪一种习气反复出现、最后又落回今生命宫。", realmFrom: "六道来处", storyLabel: "这一世留下的习气", verseLabel: "古诀", readingTitle: "把四宫连起来看", readingBody: "年宫像最远的根，月宫看你如何与人间相处，日宫把才情与关系拉近，时宫再收束成今生命宫。重复出现的六道，是反复带来的惯性；最后落到时宫的那一道，则是今生最值得理解与修炼的主轴。",
    missingHour: "你未提供出生时辰，因此时宫／前一世不作判定；目前只显示年、月、日三宫。", again: "重新排盘", full: "回到昭梧完整分析", boundary: "传统文化与象征性解读仅供自我观察，不替代医疗、法律、财务或现实决定。",
  },
  en: {
    kicker: "Zhaowu · single-page gallery · deterministic calculation", title: "Dharma Palm · Four-Palace Reading", lead: "The appeal of the Dharma Palm is not only its four palaces, but the way they form a symbolic line from prior lives into the present: the realm a pattern comes from, what it leaves behind, and how that gift is handled now.",
    scopeTitle: "Four prior-life palaces in one palm", scopeFour: "Four palaces · Year, month, day and hour form a four-life symbolic trail.", scopeStars: "Twelve stars · Each palace carries a star describing the ability and pattern it leaves behind.", scopeRealms: "Six realms · Buddha, immortal, human, Asura, ghost and animal imagery frame the recurring lesson.",
    note: "This does not prove unverifiable past-life history. It offers a coherent symbolic framework for asking why certain strengths and habits feel so persistent.",
    name: "Name (optional)", namePh: "Shown only in this result; never saved", direction: "Palm sequence (required)", directionHelp: "This is the traditional method's calculation parameter; it does not define your gender identity.",
    forward: "Forward sequence (traditional male chart)", reverse: "Reverse sequence (traditional female chart)", date: "Date of birth (Gregorian)", hour: "Birth-hour branch", unknown: "Time unknown — leave the hour palace blank",
    submit: "Calculate four palaces", privacy: "Calculated on this device only. No sign-in, storage or transmission.", required: "Enter a birth date and choose a Palm sequence.", invalid: "This date cannot be converted to a lunar date. Check it and try again.",
    result: "Four-palace reading", resultFor: " · four-palace result", palaces: "Four symbolic prior-life palaces", traceTitle: "Four-life realm trail", traceHint: "Read from the year palace toward the hour palace: repetition matters more than a single label, and the final palace gathers the pattern into the present-life axis.", realmFrom: "Symbolic realm", storyLabel: "Pattern carried forward", verseLabel: "Traditional verse", readingTitle: "Read the four palaces as one line", readingBody: "The year palace acts like the distant root, the month palace shows how you meet the social world, the day palace brings craft and relationships closer, and the hour palace gathers the line into the present-life axis. Repeated realms show recurring habits; the final realm is the one most worth understanding and refining now.",
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

  return (
    <main className="mx-auto max-w-3xl space-y-6 pb-8 sm:space-y-8">
      <section className="relative overflow-hidden rounded-[1.75rem] border border-line/80 bg-cream/90 px-5 py-7 shadow-[0_24px_70px_rgba(74,52,28,.12)] sm:px-9 sm:py-10">
        <img src="/emblems/lotus-emblem.svg" alt="" aria-hidden className="pointer-events-none absolute -left-5 -top-4 h-24 w-24 opacity-[0.09] sm:h-32 sm:w-32" />
        <img src="/emblems/dharma-wheel-emblem.svg" alt="" aria-hidden className="pointer-events-none absolute -bottom-9 -right-7 h-28 w-28 opacity-[0.065] sm:h-40 sm:w-40" />
        <div className="pointer-events-none absolute -right-10 -top-10 opacity-[0.055]" aria-hidden><BrandSeal size="lg" decorative /></div>
        <div className="relative">
          <p className="text-[10px] font-semibold uppercase tracking-[0.25em] text-cinnabar sm:text-xs">{copy.kicker}</p>
          <h1 className="mt-3 font-display text-3xl font-semibold leading-tight tracking-[0.06em] text-ink sm:text-5xl">{copy.title}</h1>
          <div className="mt-4 flex items-center gap-3" aria-hidden>
            <span className="h-px flex-1 bg-[#b99755]/30" />
            <img src="/emblems/lotus-emblem.svg" alt="" className="h-8 w-8 opacity-70" />
            <span className="h-px flex-1 bg-[#b99755]/30" />
          </div>
          <p className="mt-4 max-w-2xl text-sm leading-7 text-ink-soft sm:text-base sm:leading-8">{copy.lead}</p>
          <div className="mt-5 rounded-2xl border border-line/75 bg-white/50 p-4 sm:p-5">
            <h2 className="font-display text-lg font-semibold tracking-[0.06em] text-ink">{copy.scopeTitle}</h2>
            <ul className="mt-3 grid gap-2 text-xs leading-6 text-ink-soft sm:text-sm sm:leading-7">
              <li className="flex gap-2"><span className="mt-[9px] h-1.5 w-1.5 shrink-0 rounded-full bg-cinnabar/65" />{copy.scopeFour}</li>
              <li className="flex gap-2"><span className="mt-[9px] h-1.5 w-1.5 shrink-0 rounded-full bg-[#9a7422]/65" />{copy.scopeStars}</li>
              <li className="flex gap-2"><span className="mt-[9px] h-1.5 w-1.5 shrink-0 rounded-full bg-[#2f7773]/65" />{copy.scopeRealms}</li>
            </ul>
          </div>
          <p className="mt-4 rounded-2xl border border-[#b99755]/30 bg-paper/65 px-4 py-3 text-xs leading-6 text-ink-soft sm:text-sm">{copy.note}</p>
        </div>
      </section>

      <form onSubmit={onSubmit} className="relative overflow-hidden rounded-[1.5rem] border border-line/80 bg-cream/92 p-5 shadow-[0_16px_48px_rgba(69,50,29,.08)] sm:p-8" noValidate>
        <img src="/emblems/dharma-wheel-emblem.svg" alt="" aria-hidden className="pointer-events-none absolute -right-8 -top-8 h-28 w-28 opacity-[0.035]" />
        <div className="relative">
          <div className="grid gap-5 sm:grid-cols-2">
            <label className="block text-sm font-medium text-ink">
              {copy.name}
              <input value={name} onChange={(event) => setName(event.target.value.slice(0, 40))} placeholder={copy.namePh} className="mt-2 min-h-12 w-full rounded-xl border border-line bg-white/65 px-4 text-base outline-none transition focus:border-cinnabar focus:ring-2 focus:ring-cinnabar/10" />
            </label>
            <label className="block text-sm font-medium text-ink">
              {copy.date}
              <input type="date" min="1900-01-31" max={maxDate} value={date} onChange={(event) => setDate(event.target.value)} className="mt-2 min-h-12 w-full rounded-xl border border-line bg-white/65 px-4 text-base outline-none transition focus:border-cinnabar focus:ring-2 focus:ring-cinnabar/10" />
            </label>
          </div>

          <fieldset className="mt-5">
            <legend className="text-sm font-medium text-ink">{copy.direction}</legend>
            <p className="mt-1 text-xs leading-5 text-ink-mute">{copy.directionHelp}</p>
            <div className="mt-3 grid gap-3 sm:grid-cols-2">
              {(["male", "female"] as const).map((value) => (
                <label key={value} className={`flex min-h-14 items-center gap-3 rounded-xl border px-4 py-3 text-sm transition ${gender === value ? "border-cinnabar bg-cinnabar/7 text-ink shadow-[inset_3px_0_0_#8f3027]" : "border-line bg-white/55 text-ink-soft"}`}>
                  <input type="radio" name="palm-direction" value={value} checked={gender === value} onChange={() => setGender(value)} className="h-4 w-4 accent-cinnabar" />
                  <span>{value === "male" ? copy.forward : copy.reverse}</span>
                </label>
              ))}
            </div>
          </fieldset>

          <label className="mt-5 block text-sm font-medium text-ink">
            {copy.hour}
            <select value={hour} onChange={(event) => setHour(event.target.value)} className="mt-2 min-h-12 w-full rounded-xl border border-line bg-white/65 px-4 text-base outline-none transition focus:border-cinnabar focus:ring-2 focus:ring-cinnabar/10">
              <option value="unknown">{copy.unknown}</option>
              {HOURS.map(([value, branch, range]) => <option key={value} value={value}>{presentPalmHourLabel(branch, range, locale)}</option>)}
            </select>
          </label>

          {error ? <p role="alert" className="mt-4 rounded-xl border border-cinnabar/25 bg-cinnabar/7 px-4 py-3 text-sm text-cinnabar-deep">{copy[error]}</p> : null}

          <button type="submit" className="mt-6 min-h-12 w-full rounded-full bg-cinnabar px-6 text-sm font-semibold tracking-[0.12em] text-cream shadow-[0_12px_28px_rgba(111,36,30,.18)] transition hover:bg-cinnabar-deep focus:outline-none focus:ring-2 focus:ring-cinnabar/35 focus:ring-offset-2">
            {copy.submit}
          </button>
          <p className="mt-3 text-center text-[11px] leading-5 text-ink-mute">{copy.privacy}</p>
        </div>
      </form>

      {result ? (
        <section ref={resultRef} className="scroll-mt-20 space-y-5 rounded-[1.75rem] border border-line bg-cream/94 p-5 shadow-[0_24px_70px_rgba(74,52,28,.12)] sm:p-8" aria-live="polite">
          <div className="border-b border-line/70 pb-5">
            <div className="flex items-center gap-3">
              <img src="/emblems/dharma-wheel-emblem.svg" alt="" aria-hidden className="h-9 w-9 opacity-70" />
              <div>
                <p className="text-[10px] font-semibold uppercase tracking-[0.24em] text-cinnabar">{copy.result}</p>
                <h2 className="mt-1 font-display text-2xl font-semibold tracking-[0.06em] text-ink sm:text-3xl">{name.trim() ? `${name.trim()}${copy.resultFor}` : copy.palaces}</h2>
              </div>
            </div>
            <p className="mt-3 text-sm text-ink-soft">{presentLunarLabel(result.lunarLabel, locale)}</p>
            {!result.ready ? <p className="mt-3 rounded-xl bg-paper/70 px-4 py-3 text-sm leading-6 text-ink-soft">{copy.missingHour}</p> : null}
          </div>

          <article className="relative overflow-hidden rounded-2xl border border-[#b99755]/35 p-4 sm:p-5" style={{ background: "linear-gradient(135deg, rgba(255,250,242,.96), rgba(246,237,217,.78))" }}>
            <img src="/emblems/lotus-emblem.svg" alt="" aria-hidden className="pointer-events-none absolute -bottom-9 -right-6 h-28 w-28 opacity-[0.07]" />
            <div className="relative">
              <h3 className="font-display text-lg font-semibold tracking-[0.06em] text-ink">{copy.traceTitle}</h3>
              <div className="mt-4 grid grid-cols-2 gap-2 sm:grid-cols-4">
                {result.palaces.map((palace) => {
                  const item = presentPalmPalace(palace, locale);
                  const tone = palmDaoTone(palace.dao);
                  return (
                    <div key={`trace-${palace.key}`} className="rounded-xl border bg-white/55 px-3 py-3" style={{ borderColor: `${tone}3d` }}>
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
            {result.palaces.map((palace) => {
              const item = presentPalmPalace(palace, locale);
              const tone = palmDaoTone(palace.dao);
              return (
                <article key={palace.key} className="relative overflow-hidden rounded-2xl border bg-[#fffaf2] p-5" style={{ borderColor: `${tone}55`, boxShadow: `inset 4px 0 0 ${tone}` }}>
                  <img src="/emblems/lotus-emblem.svg" alt="" aria-hidden className="pointer-events-none absolute -bottom-7 -right-6 h-24 w-24 opacity-[0.055]" />
                  <div className="relative">
                    <div className="flex items-start justify-between gap-3">
                      <div><p className="text-[11px] font-semibold tracking-[0.18em] text-ink-mute">{item.lifeLabel}</p><p className="mt-1 text-xs text-ink-soft">{item.range}</p></div>
                      <span className="grid h-11 w-11 shrink-0 place-items-center rounded-full border font-display text-xl" style={{ borderColor: `${tone}66`, color: tone, backgroundColor: `${tone}10` }}>{item.zhi}</span>
                    </div>
                    <h3 className="mt-5 font-display text-xl font-semibold tracking-[0.06em] text-ink">{item.star}</h3>
                    <p className="mt-2 text-[10px] font-semibold uppercase tracking-[0.16em] text-ink-mute">{copy.realmFrom}</p>
                    <p className="mt-1 inline-flex rounded-full px-3 py-1 text-xs font-semibold" style={{ color: tone, backgroundColor: `${tone}12` }}>{item.dao}</p>
                    <p className="mt-4 text-[10px] font-semibold tracking-[0.15em] text-cinnabar">{copy.storyLabel}</p>
                    <p className="mt-2 text-sm leading-7 text-ink-soft">{item.meaning}</p>
                    <div className="mt-4 flex items-center gap-2 border-t border-line/60 pt-3">
                      <img src="/emblems/dharma-wheel-emblem.svg" alt="" aria-hidden className="h-5 w-5 shrink-0 opacity-45" />
                      <p className="font-display text-xs leading-6 text-ink-mute"><span className="mr-2 text-[10px] font-sans tracking-[0.12em]">{copy.verseLabel}</span>{item.verse}</p>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>

          <article className="relative overflow-hidden rounded-2xl border border-[#b99755]/35 bg-paper/60 p-5">
            <img src="/emblems/dharma-wheel-emblem.svg" alt="" aria-hidden className="pointer-events-none absolute -right-5 -top-5 h-20 w-20 opacity-[0.055]" />
            <div className="relative">
              <h3 className="font-display text-xl font-semibold tracking-[0.06em] text-ink">{copy.readingTitle}</h3>
              <p className="mt-3 text-sm leading-7 text-ink-soft">{copy.readingBody}</p>
            </div>
          </article>

          <p className="text-xs leading-6 text-ink-mute">{copy.boundary}</p>
          <div className="grid gap-3 sm:grid-cols-2">
            <button type="button" onClick={reset} className="min-h-12 rounded-full border border-cinnabar/35 bg-transparent px-5 text-sm font-medium text-cinnabar">{copy.again}</button>
            <Link to="/" className="inline-flex min-h-12 items-center justify-center rounded-full bg-cinnabar px-5 text-sm font-medium text-cream">{copy.full}</Link>
          </div>
        </section>
      ) : null}
    </main>
  );
}
