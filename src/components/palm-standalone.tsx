import { useRef, useState, type FormEvent } from "react";
import { Link } from "@tanstack/react-router";
import { BrandSeal } from "@/components/brand-seal";
import { useI18n, type Locale } from "@/lib/i18n";
import { buildPalm } from "@/lib/palm/engine";
import { palmDaoTone, presentLunarLabel, presentPalmGuidance, presentPalmPalace } from "@/lib/palm/standalone-presentation";
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
    kicker: "昭梧 · 單頁展廳 · 免費確定性排盤", title: "前世今生・達摩一掌經", lead: "此頁把農曆出生年、月、日、時依固定順序排入四宮，顯示每一宮的地支、主星、所屬六道與習氣重點。",
    scopeTitle: "排盤內容", scopeFour: "四宮｜年宮看根基，月宮看人際，日宮看關係，時宮看本命主軸。", scopeStars: "十二星｜顯示每一宮的主星與性格功能。", scopeRealms: "六道習氣｜整理佛、仙、人、修羅、鬼、畜生六類象徵課題。",
    note: "這是傳統民俗分類，用來觀察性格慣性與人生課題；不是可驗證的歷史前世，也不是宗教裁決。",
    name: "稱呼（選填）", namePh: "只顯示在本次結果，不會保存", direction: "一掌經順逆（必填）", directionHelp: "這是傳統算法的順逆參數，不用來定義你的性別身份。",
    forward: "順行（傳統男命）", reverse: "逆行（傳統女命）", date: "出生日期（國曆）", hour: "出生時辰", unknown: "不知道時辰（時宮留白）",
    submit: "開始排盤", privacy: "資料只在你的裝置上即時計算；不登入、不保存、不傳送。", required: "請填出生日期，並選擇一掌經順逆。", invalid: "這個日期無法轉換為農曆，請檢查後再試。",
    result: "一掌經四宮", resultFor: "的四宮結果", palaces: "前世四世・輪迴足跡", axis: "本命主軸", cause: "前因", fruit: "今果", seed: "後種",
    missingHour: "你未提供出生時辰，因此時宮／最近一世不作判定；目前只顯示年、月、日三宮。", again: "重新排盤", full: "回到昭梧完整分析", boundary: "傳統文化與象徵性解讀僅供自我觀察，不替代醫療、法律、財務或現實決策。",
  },
  "zh-Hans": {
    kicker: "昭梧 · 单页展厅 · 免费确定性排盘", title: "前世今生・达摩一掌经", lead: "此页把农历出生年、月、日、时依固定顺序排入四宫，显示每一宫的地支、主星、所属六道与习气重点。",
    scopeTitle: "排盘内容", scopeFour: "四宫｜年宫看根基，月宫看人际，日宫看关系，时宫看本命主轴。", scopeStars: "十二星｜显示每一宫的主星与性格功能。", scopeRealms: "六道习气｜整理佛、仙、人、修罗、鬼、畜生六类象征课题。",
    note: "这是传统民俗分类，用来观察性格惯性与人生课题；不是可验证的历史前世，也不是宗教裁决。",
    name: "称呼（选填）", namePh: "只显示在本次结果，不会保存", direction: "一掌经顺逆（必填）", directionHelp: "这是传统算法的顺逆参数，不用来定义你的性别身份。",
    forward: "顺行（传统男命）", reverse: "逆行（传统女命）", date: "出生日期（公历）", hour: "出生时辰", unknown: "不知道时辰（时宫留白）",
    submit: "开始排盘", privacy: "资料只在你的设备上即时计算；不登录、不保存、不传送。", required: "请填出生日期，并选择一掌经顺逆。", invalid: "这个日期无法转换为农历，请检查后再试。",
    result: "一掌经四宫", resultFor: "的四宫结果", palaces: "前世四世・轮回足迹", axis: "本命主轴", cause: "前因", fruit: "今果", seed: "后种",
    missingHour: "你未提供出生时辰，因此时宫／最近一世不作判定；目前只显示年、月、日三宫。", again: "重新排盘", full: "回到昭梧完整分析", boundary: "传统文化与象征性解读仅供自我观察，不替代医疗、法律、财务或现实决定。",
  },
  en: {
    kicker: "Zhaowu · single-page gallery · deterministic calculation", title: "Dharma Palm · Four-Palace Reading", lead: "This page places the lunar birth year, month, day and hour into four palaces, then shows each palace's branch, star, symbolic realm and pattern.",
    scopeTitle: "Reading contents", scopeFour: "Four palaces · Roots, social pattern, relationships and the current-life axis.", scopeStars: "Twelve stars · The governing star and function of each palace.", scopeRealms: "Six realms · Symbolic patterns across Buddha, immortal, human, Asura, ghost and animal realms.",
    note: "This is a traditional folk classification for reflecting on patterns and life themes. It is not verifiable past-life history or a religious judgement.",
    name: "Name (optional)", namePh: "Shown only in this result; never saved", direction: "Palm sequence (required)", directionHelp: "This is the traditional method's calculation parameter; it does not define your gender identity.",
    forward: "Forward sequence (traditional male chart)", reverse: "Reverse sequence (traditional female chart)", date: "Date of birth (Gregorian)", hour: "Birth-hour branch", unknown: "Time unknown — leave the hour palace blank",
    submit: "Calculate four palaces", privacy: "Calculated on this device only. No sign-in, storage or transmission.", required: "Enter a birth date and choose a Palm sequence.", invalid: "This date cannot be converted to a lunar date. Check it and try again.",
    result: "Four-palace reading", resultFor: " · four-palace result", palaces: "Four symbolic prior-life palaces", axis: "Current life axis", cause: "Inherited pattern", fruit: "Current expression", seed: "Practice",
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

  const guidance = result ? presentPalmGuidance(result, locale) : null;

  return (
    <main className="mx-auto max-w-3xl space-y-6 pb-8 sm:space-y-8">
      <section className="relative overflow-hidden rounded-[1.75rem] border border-line/80 bg-cream/90 px-5 py-7 shadow-[0_24px_70px_rgba(74,52,28,.12)] sm:px-9 sm:py-10">
        <div className="pointer-events-none absolute -right-10 -top-10 opacity-[0.07]" aria-hidden><BrandSeal size="lg" decorative /></div>
        <p className="text-[10px] font-semibold uppercase tracking-[0.25em] text-cinnabar sm:text-xs">{copy.kicker}</p>
        <h1 className="mt-3 font-display text-3xl font-semibold leading-tight tracking-[0.06em] text-ink sm:text-5xl">{copy.title}</h1>
        <p className="mt-4 max-w-2xl text-sm leading-7 text-ink-soft sm:text-base sm:leading-8">{copy.lead}</p>
        <div className="mt-5 rounded-2xl border border-line/75 bg-white/45 p-4 sm:p-5">
          <h2 className="font-display text-lg font-semibold tracking-[0.06em] text-ink">{copy.scopeTitle}</h2>
          <ul className="mt-3 grid gap-2 text-xs leading-6 text-ink-soft sm:text-sm sm:leading-7">
            <li>{copy.scopeFour}</li>
            <li>{copy.scopeStars}</li>
            <li>{copy.scopeRealms}</li>
          </ul>
        </div>
        <p className="mt-4 rounded-2xl border border-[#b99755]/30 bg-paper/65 px-4 py-3 text-xs leading-6 text-ink-soft sm:text-sm">{copy.note}</p>
      </section>

      <form onSubmit={onSubmit} className="rounded-[1.5rem] border border-line/80 bg-cream/92 p-5 shadow-[0_16px_48px_rgba(69,50,29,.08)] sm:p-8" noValidate>
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
            {HOURS.map(([value, branch, range]) => <option key={value} value={value}>{branch} · {range}</option>)}
          </select>
        </label>

        {error ? <p role="alert" className="mt-4 rounded-xl border border-cinnabar/25 bg-cinnabar/7 px-4 py-3 text-sm text-cinnabar-deep">{copy[error]}</p> : null}

        <button type="submit" className="mt-6 min-h-12 w-full rounded-full bg-cinnabar px-6 text-sm font-semibold tracking-[0.12em] text-cream shadow-[0_12px_28px_rgba(111,36,30,.18)] transition hover:bg-cinnabar-deep focus:outline-none focus:ring-2 focus:ring-cinnabar/35 focus:ring-offset-2">
          {copy.submit}
        </button>
        <p className="mt-3 text-center text-[11px] leading-5 text-ink-mute">{copy.privacy}</p>
      </form>

      {result ? (
        <section ref={resultRef} className="scroll-mt-20 space-y-5 rounded-[1.75rem] border border-line bg-cream/94 p-5 shadow-[0_24px_70px_rgba(74,52,28,.12)] sm:p-8" aria-live="polite">
          <div className="border-b border-line/70 pb-5">
            <p className="text-[10px] font-semibold uppercase tracking-[0.24em] text-cinnabar">{copy.result}</p>
            <h2 className="mt-2 font-display text-2xl font-semibold tracking-[0.06em] text-ink sm:text-3xl">{name.trim() ? `${name.trim()}${copy.resultFor}` : copy.palaces}</h2>
            <p className="mt-2 text-sm text-ink-soft">{presentLunarLabel(result.lunarLabel, locale)}</p>
            {!result.ready ? <p className="mt-3 rounded-xl bg-paper/70 px-4 py-3 text-sm leading-6 text-ink-soft">{copy.missingHour}</p> : null}
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            {result.palaces.map((palace) => {
              const item = presentPalmPalace(palace, locale);
              const tone = palmDaoTone(palace.dao);
              return (
                <article key={palace.key} className="relative overflow-hidden rounded-2xl border bg-[#fffaf2] p-5" style={{ borderColor: `${tone}55`, boxShadow: `inset 4px 0 0 ${tone}` }}>
                  <div className="flex items-start justify-between gap-3">
                    <div><p className="text-[11px] tracking-[0.18em] text-ink-mute">{item.lifeLabel}</p><p className="mt-1 text-xs text-ink-soft">{item.range}</p></div>
                    <span className="grid h-11 w-11 shrink-0 place-items-center rounded-full border font-display text-xl" style={{ borderColor: `${tone}66`, color: tone, backgroundColor: `${tone}10` }}>{item.zhi}</span>
                  </div>
                  <h3 className="mt-5 font-display text-xl font-semibold tracking-[0.06em] text-ink">{item.star}</h3>
                  <p className="mt-2 inline-flex rounded-full px-3 py-1 text-xs font-semibold" style={{ color: tone, backgroundColor: `${tone}12` }}>{item.dao}</p>
                  <p className="mt-4 text-sm leading-7 text-ink-soft">{item.meaning}</p>
                  <p className="mt-4 border-t border-line/60 pt-3 font-display text-xs leading-6 text-ink-mute">{item.verse}</p>
                </article>
              );
            })}
          </div>

          {guidance ? (
            <article className="rounded-2xl border border-[#b99755]/35 bg-paper/60 p-5">
              <h3 className="font-display text-xl font-semibold tracking-[0.06em] text-ink">{copy.axis}</h3>
              <dl className="mt-4 grid gap-4 text-sm leading-7 sm:grid-cols-3">
                <div><dt className="font-semibold text-cinnabar">{copy.cause}</dt><dd className="mt-1 text-ink-soft">{guidance.cause}</dd></div>
                <div><dt className="font-semibold text-cinnabar">{copy.fruit}</dt><dd className="mt-1 text-ink-soft">{guidance.fruit}</dd></div>
                <div><dt className="font-semibold text-cinnabar">{copy.seed}</dt><dd className="mt-1 text-ink-soft">{guidance.seed}</dd></div>
              </dl>
            </article>
          ) : null}

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
