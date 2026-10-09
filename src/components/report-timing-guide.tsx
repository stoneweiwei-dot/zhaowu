import { useMemo, useState } from "react";
import type { Chart } from "@/lib/bazi/types";
import { useI18n } from "@/lib/i18n";
import { toSimplifiedCustomerText } from "@/lib/report/reading-locale";
import { buildTimingGuide, type Favor, type HalfBlock, type TimingGuide } from "@/lib/report/timing-guidance";

type Props = { chart: Chart; unlocked: boolean };

const L = {
  "zh-Hant": {
    kicker: "ZHAOWU · 流年流月日運", title: "未來三年・當年十二月・今日行動表",
    sub: "依日主與流年、流月、流日干支的十神關係，加上用神／洩耗方向，規則化產出「宜／忌」各一件事。",
    dayun: "大運分段", dayunNote: "前五年看天干、後五年看地支主氣", career: "事業線", guard: "守財線",
    years: "未來三年流年", firstHalf: "上半年（天干）", secondHalf: "下半年（地支主氣）", doLbl: "宜", avoidLbl: "忌", workLbl: "工作", moneyLbl: "錢財", current: "目前",
    months: "當年十二流月", month: "月柱", term: "節氣起訖", mood: "吉凶偏向", doMonth: "本月宜做一件事", avoidMonth: "本月切忌一件事",
    today: "今日日運", todayDo: "宜", todayAvoid: "忌",
    lockedTitle: "完整表格為深批內容", lockedLead: "目前顯示當前流年與當月概況。解鎖後可見：",
    lockedItems: ["大運前五年／後五年的事業線與守財線", "未來三年流年上半年／下半年宜忌", "當年十二流月逐月「宜／忌」行動表", "每日日運（宜／忌、工作、錢財）"],
    cta: "前往解鎖完整殿堂", hookYear: "流年交界（立春換年）後的下一段，完整宜忌在深批內容。", hookMonth: "流月交界（換節氣）後的下一個月，逐月行動表在深批內容。",
    favor: { favor: "偏順", neutral: "持平", drain: "偏耗" } as Record<Favor, string>,
  },
  en: {
    kicker: "ZHAOWU · YEAR / MONTH / DAY TIMING", title: "Next 3 years · 12 months · today's action table",
    sub: "Rule-based: each period's ten-god relation to your day master, plus your favourable / draining elements, gives one do and one avoid.",
    dayun: "Luck-cycle segments", dayunNote: "first five years read the stem, last five read the branch's main qi", career: "Career line", guard: "Money-guard line",
    years: "Next three years", firstHalf: "First half (stem)", secondHalf: "Second half (branch main qi)", doLbl: "Do", avoidLbl: "Avoid", workLbl: "Work", moneyLbl: "Money", current: "Now",
    months: "This year's 12 months", month: "Month", term: "Solar term span", mood: "Lean", doMonth: "One thing to do this month", avoidMonth: "One thing to avoid this month",
    today: "Today", todayDo: "Do", todayAvoid: "Avoid",
    lockedTitle: "The full tables are part of the paid reading", lockedLead: "You see the current year and month overview. Unlocking adds:",
    lockedItems: ["Career and money-guard lines for each half of the current luck cycle", "Do / avoid for each half of the next three years", "A do / avoid table for all 12 months of the year", "Daily guidance (do / avoid, work, money)"],
    cta: "Go to unlock", hookYear: "The next block after the Lichun year boundary — full do / avoid is in the paid reading.", hookMonth: "The next month after the solar-term boundary — the month-by-month table is in the paid reading.",
    favor: { favor: "Favourable", neutral: "Neutral", drain: "Draining" } as Record<Favor, string>,
  },
} as const;

const FAVOR_CLASS: Record<Favor, string> = {
  favor: "text-wood", neutral: "text-ink-mute", drain: "text-cinnabar",
};

function Half({ label, half, t, showDetail }: { label: string; half: HalfBlock; t: (typeof L)["zh-Hant"] | (typeof L)["en"]; showDetail: boolean }) {
  return (
    <div className="rounded-lg border border-line/50 bg-paper-clean/60 p-3 text-xs leading-5 text-ink-soft">
      <div className="flex items-baseline justify-between gap-2">
        <strong className="text-ink">{label}</strong>
        <span className="text-ink-mute">{half.rangeLabel}</span>
      </div>
      <p className="mt-1"><b className="font-display text-sm text-ink">{half.ganZhiPart}</b> · {half.god} · <span className={FAVOR_CLASS[half.favor]}>{t.favor[half.favor]}</span></p>
      {showDetail ? (
        <>
          <p className="mt-1">{half.theme}</p>
          <p className="mt-1"><b className="text-wood">{t.doLbl}</b> {half.doOne}</p>
          <p className="mt-1"><b className="text-cinnabar">{t.avoidLbl}</b> {half.avoidOne}</p>
        </>
      ) : null}
    </div>
  );
}

export function ReportTimingGuide({ chart, unlocked }: Props) {
  const { locale } = useI18n();
  const t = locale === "en" ? L.en : L["zh-Hant"];
  const [now] = useState(() => new Date());
  const guide: TimingGuide = useMemo(() => {
    const localize = locale === "zh-Hans" ? toSimplifiedCustomerText : undefined;
    return buildTimingGuide(chart, now, locale === "en" ? "en" : "zh", localize);
  }, [chart, now, locale]);
  const s = (text: string) => (locale === "zh-Hans" ? toSimplifiedCustomerText(text) : text);

  const currentYear = guide.years.find((y) => y.current) ?? guide.years[0];
  const currentMonth = guide.months.find((m) => m.current) ?? guide.months[0];

  function goUnlock() {
    try { document.querySelector("[data-destiny-unlock-gate]")?.scrollIntoView({ behavior: "smooth", block: "start" }); } catch { /* scroll is optional */ }
  }

  return (
    <section className="zhaowu-timing-guide seal-border mt-6 rounded-xl bg-cream/95 p-5 sm:p-7" data-timing-guide data-timing-unlocked={unlocked ? "true" : "false"} aria-labelledby="zhaowu-timing-guide-title">
      <header className="border-b border-line/60 pb-3">
        <p className="text-xs font-semibold tracking-widest text-cinnabar">{s(t.kicker)}</p>
        <h3 id="zhaowu-timing-guide-title" className="mt-2 font-display text-xl text-ink">{s(t.title)}</h3>
        <p className="mt-1 text-xs leading-5 text-ink-mute">{s(t.sub)}</p>
      </header>

      <p className="mt-3 rounded-lg border border-line/40 bg-paper-clean/70 p-3 text-[11px] leading-5 text-ink-mute" data-timing-boundary>{guide.boundary}</p>

      {/* 今日日運：免費層保留干支與傾向，宜忌屬完整內容 */}
      <article className="mt-4 rounded-lg border border-line/50 p-3 text-xs leading-5 text-ink-soft" data-timing-today>
        <div className="flex items-baseline justify-between gap-2">
          <strong className="text-ink">{s(t.today)} · {guide.today.date}</strong>
          <span><b className="font-display text-sm text-ink">{guide.today.ganZhi}</b> · {guide.today.god} · <span className={FAVOR_CLASS[guide.today.favor]}>{t.favor[guide.today.favor]}</span></span>
        </div>
        <p className="mt-1 text-ink-mute">{guide.today.weather}</p>
        {unlocked ? (
          <>
            <p className="mt-1"><b className="text-wood">{s(t.todayDo)}</b> {guide.today.doList.join(locale === "en" ? "; " : "；")}</p>
            <p className="mt-1"><b className="text-cinnabar">{s(t.todayAvoid)}</b> {guide.today.avoidList.join(locale === "en" ? "; " : "；")}</p>
            <p className="mt-1"><b>{s(t.workLbl)}</b> {guide.today.work}</p>
            <p className="mt-1"><b>{s(t.moneyLbl)}</b> {guide.today.money}</p>
          </>
        ) : null}
      </article>

      {/* 大運分段（付費） */}
      {unlocked && guide.dayun ? (
        <div className="mt-5" data-timing-dayun>
          <h4 className="text-sm font-semibold text-ink">{s(t.dayun)} · {guide.dayun.ganZhi}（{guide.dayun.startYear}–{guide.dayun.endYear}）</h4>
          <p className="text-[11px] text-ink-mute">{s(t.dayunNote)}</p>
          <div className="mt-2 grid grid-cols-1 gap-3 sm:grid-cols-2">
            {[guide.dayun.first, guide.dayun.second].map((h) => (
              <div key={h.basis} className="rounded-lg border border-line/50 bg-paper-clean/60 p-3 text-xs leading-5 text-ink-soft">
                <div className="flex items-baseline justify-between gap-2">
                  <strong className="text-ink">{h.yearsLabel}{h.current ? ` · ${s(t.current)}` : ""}</strong>
                  <span><b className="font-display text-sm text-ink">{h.ganZhiPart}</b> · {h.god} · <span className={FAVOR_CLASS[h.favor]}>{t.favor[h.favor]}</span></span>
                </div>
                <p className="mt-1"><b>{s(t.career)}</b> {h.career}</p>
                <p className="mt-1"><b>{s(t.guard)}</b> {h.guard}</p>
                <p className="mt-1 text-ink-mute">{h.tone}</p>
              </div>
            ))}
          </div>
        </div>
      ) : null}

      {/* 流年：付費顯示三年，免費僅當年概況 */}
      <div className="mt-5" data-timing-years>
        <h4 className="text-sm font-semibold text-ink">{s(t.years)}</h4>
        <div className="mt-2 space-y-3">
          {(unlocked ? guide.years : [currentYear]).map((y) => (
            <article key={y.year} className="rounded-lg border border-line/50 p-3">
              <div className="flex items-baseline justify-between gap-2 text-xs">
                <strong className="font-display text-base text-ink">{y.year} · {y.ganZhi}</strong>
                {y.current ? <span className="rounded-full bg-cinnabar/10 px-2 py-0.5 text-cinnabar">{s(t.current)}</span> : null}
              </div>
              <div className="mt-2 grid grid-cols-1 gap-2 sm:grid-cols-2">
                <Half label={s(t.firstHalf)} half={y.first} t={t} showDetail={unlocked} />
                <Half label={s(t.secondHalf)} half={y.second} t={t} showDetail={unlocked} />
              </div>
              {unlocked ? (
                <p className="mt-2 text-xs leading-5 text-ink-soft"><b>{s(t.workLbl)}</b> {y.work}　<b>{s(t.moneyLbl)}</b> {y.money}</p>
              ) : null}
            </article>
          ))}
        </div>
      </div>

      {/* 流月：付費顯示十二月，免費僅當月 */}
      <div className="mt-5" data-timing-months>
        <h4 className="text-sm font-semibold text-ink">{s(t.months)}（{guide.monthsYear}）</h4>
        <div className="mt-2 overflow-x-auto">
          <table className="w-full min-w-[34rem] border-collapse text-left text-xs leading-5 text-ink-soft">
            <thead>
              <tr className="border-b border-line/60 text-ink-mute">
                <th className="py-1 pr-2 font-medium">{s(t.month)}</th>
                <th className="py-1 pr-2 font-medium">{s(t.term)}</th>
                <th className="py-1 pr-2 font-medium">{s(t.mood)}</th>
                {unlocked ? <><th className="py-1 pr-2 font-medium">{s(t.doMonth)}</th><th className="py-1 font-medium">{s(t.avoidMonth)}</th></> : null}
              </tr>
            </thead>
            <tbody>
              {(unlocked ? guide.months : [currentMonth]).map((m) => (
                <tr key={m.order} className={`border-b border-line/30 align-top ${m.current ? "bg-cinnabar/5" : ""}`}>
                  <td className="py-1.5 pr-2"><b className="font-display text-sm text-ink">{m.ganZhi}</b><span className="block text-ink-mute">{m.stemGod}／{m.branchGod}</span></td>
                  <td className="py-1.5 pr-2">{m.termName}<span className="block text-ink-mute">{m.startsOn}–{m.endsOn}</span></td>
                  <td className="py-1.5 pr-2"><span className={FAVOR_CLASS[m.favor]}>{t.favor[m.favor]}</span> · {m.mood}</td>
                  {unlocked ? <><td className="py-1.5 pr-2">{m.doOne}</td><td className="py-1.5">{m.avoidOne}</td></> : null}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {!unlocked ? (
        <div className="mt-5 rounded-lg border border-cinnabar/30 bg-cinnabar/5 p-4 text-xs leading-5 text-ink-soft" data-timing-locked>
          <strong className="block text-sm text-ink">{s(t.lockedTitle)}</strong>
          <p className="mt-1">{s(t.lockedLead)}</p>
          <ul className="mt-2 list-disc space-y-1 pl-5">{t.lockedItems.map((item) => <li key={item}>{s(item)}</li>)}</ul>
          <p className="mt-2 text-ink-mute">{s(t.hookYear)}</p>
          <p className="text-ink-mute">{s(t.hookMonth)}</p>
          <button type="button" onClick={goUnlock} className="mt-3 rounded-full bg-cinnabar px-4 py-2 text-xs font-medium text-cream hover:opacity-90">{s(t.cta)}</button>
        </div>
      ) : null}
    </section>
  );
}
