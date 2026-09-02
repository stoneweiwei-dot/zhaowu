import { useI18n, type Locale } from "@/lib/i18n";

const COPY = {
  "zh-Hant": {
    eyebrow: "印度占星 · D60 SHASHTIAMSA",
    title: "D60 業力細分層",
    lead: "作為「前世今生」的第二視角，D60 用來觀察更細的業力傾向、慣性與今生容易反覆遇到的課題；它不取代子平八字，也不把象徵解讀說成可驗證的前世史實。",
    precisionTitle: "出生時間必須非常準確",
    precisionBody: "D60 把每個 30° 星座再切成 60 份，每份只有 0.5°。因此尤其是 D60 上升點，幾分鐘的出生時間誤差就可能改變判讀。請優先使用出生證明、醫院紀錄或可核對到分鐘的時間。",
    exact: "可用：出生日期＋出生地＋可核對到分鐘的出生時間",
    uncertain: "不直接下結論：家人回憶、只知道時辰、四捨五入到 5／10／15 分鐘、時間不確定",
    ruleTitle: "昭梧的 D60 使用規則",
    ruleOne: "只讀「業力主題、反覆模式、帶到今生的傾向」，不編造前世姓名、身份、年代或具體事件。",
    ruleTwo: "資料精度不足時，D60 層自動跳過；不以猜測時間硬排一張看似完整的盤。",
    ruleThree: "D60 只作印度 Jyotish 的輔助層；昭梧的人生節奏與選擇主判仍以子平八字為核心。",
    badge: "高精度時間限定",
    footer: "Shashtiamsa · symbolic karmic layer",
  },
  "zh-Hans": {
    eyebrow: "印度占星 · D60 SHASHTIAMSA",
    title: "D60 业力细分层",
    lead: "作为“前世今生”的第二视角，D60 用来观察更细的业力倾向、惯性与今生容易反复遇到的课题；它不取代子平八字，也不把象征解读说成可验证的前世史实。",
    precisionTitle: "出生时间必须非常准确",
    precisionBody: "D60 把每个 30° 星座再切成 60 份，每份只有 0.5°。因此尤其是 D60 上升点，几分钟的出生时间误差就可能改变判断。请优先使用出生证明、医院记录或可核对到分钟的时间。",
    exact: "可用：出生日期＋出生地＋可核对到分钟的出生时间",
    uncertain: "不直接下结论：家人回忆、只知道时辰、四舍五入到 5／10／15 分钟、时间不确定",
    ruleTitle: "昭梧的 D60 使用规则",
    ruleOne: "只读“业力主题、反复模式、带到今生的倾向”，不编造前世姓名、身份、年代或具体事件。",
    ruleTwo: "资料精度不足时，D60 层自动跳过；不以猜测时间硬排一张看似完整的盘。",
    ruleThree: "D60 只作印度 Jyotish 的辅助层；昭梧的人生节奏与选择主判仍以子平八字为核心。",
    badge: "高精度时间限定",
    footer: "Shashtiamsa · symbolic karmic layer",
  },
  en: {
    eyebrow: "VEDIC ASTROLOGY · D60 SHASHTIAMSA",
    title: "D60 karmic layer",
    lead: "A second lens inside Past & Present. D60 is used for subtle karmic themes, persistent patterns and tendencies carried into the present. It does not replace BaZi, and it is not presented as proof of a literal past-life biography.",
    precisionTitle: "Birth time must be highly reliable",
    precisionBody: "D60 divides each 30° zodiac sign into 60 sections of only 0.5° each. The D60 Ascendant is especially time-sensitive, so a shift of only a few minutes can change the reading. Prefer a birth certificate, hospital record or another source recorded to the minute.",
    exact: "Usable: birth date + birthplace + a recorded birth time to the minute",
    uncertain: "No definitive reading: family memory, only a two-hour birth branch, time rounded to 5/10/15 minutes, or an uncertain time",
    ruleTitle: "How Zhaowu uses D60",
    ruleOne: "Read karmic themes, repeated patterns and present-life tendencies only; never invent past-life names, identities, dates or specific events.",
    ruleTwo: "If the birth-time quality is insufficient, the D60 layer is skipped rather than forcing a plausible-looking chart from guessed data.",
    ruleThree: "D60 remains an auxiliary Jyotish layer. Zhaowu keeps classical BaZi as the primary framework for life rhythm and choice analysis.",
    badge: "PRECISION-TIME ONLY",
    footer: "Shashtiamsa · symbolic karmic layer",
  },
} as const satisfies Record<Locale, Record<string, string>>;

export function D60KarmaSection() {
  const { locale } = useI18n();
  const copy = COPY[locale];

  return (
    <section id="d60-karma" className="mx-auto w-full max-w-4xl px-4 pb-12 sm:px-6">
      <div className="relative overflow-hidden rounded-[28px] border border-[#b99755]/35 bg-[#f5ead6]/85 p-5 shadow-[0_18px_55px_rgba(70,55,35,0.08)] sm:p-7">
        <div aria-hidden className="pointer-events-none absolute -right-16 -top-16 h-48 w-48 rounded-full border border-[#b99755]/20" />
        <div aria-hidden className="pointer-events-none absolute -right-8 -top-8 h-32 w-32 rounded-full border border-[#b99755]/15" />

        <div className="relative">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <p className="text-[10px] font-semibold tracking-[0.2em] text-ink-mute">{copy.eyebrow}</p>
            <span className="rounded-full border border-cinnabar/25 bg-cinnabar/5 px-3 py-1 text-[10px] font-semibold tracking-[0.12em] text-cinnabar">{copy.badge}</span>
          </div>

          <h2 className="mt-4 font-display text-2xl font-semibold tracking-[0.06em] text-ink sm:text-3xl">{copy.title}</h2>
          <p className="mt-3 max-w-3xl text-sm leading-7 text-ink-soft">{copy.lead}</p>

          <div className="mt-6 rounded-2xl border border-cinnabar/25 bg-[#fff8ea]/80 p-4 sm:p-5">
            <h3 className="font-display text-lg font-semibold text-cinnabar">{copy.precisionTitle}</h3>
            <p className="mt-2 text-sm leading-7 text-ink-soft">{copy.precisionBody}</p>
            <div className="mt-4 grid gap-2 text-xs leading-6 sm:grid-cols-2">
              <p className="rounded-xl border border-[#66836d]/25 bg-[#66836d]/7 px-3 py-2 text-ink-soft">✓ {copy.exact}</p>
              <p className="rounded-xl border border-cinnabar/20 bg-cinnabar/5 px-3 py-2 text-ink-soft">× {copy.uncertain}</p>
            </div>
          </div>

          <div className="mt-6">
            <h3 className="font-display text-lg font-semibold tracking-[0.04em] text-ink">{copy.ruleTitle}</h3>
            <div className="mt-3 grid gap-3 sm:grid-cols-3">
              {[copy.ruleOne, copy.ruleTwo, copy.ruleThree].map((rule, index) => (
                <article key={rule} className="rounded-2xl border border-[#b99755]/25 bg-paper/55 p-4">
                  <span className="text-[10px] font-semibold tracking-[0.16em] text-cinnabar">{String(index + 1).padStart(2, "0")}</span>
                  <p className="mt-2 text-sm leading-6 text-ink-soft">{rule}</p>
                </article>
              ))}
            </div>
          </div>

          <p className="mt-5 text-[10px] tracking-[0.14em] text-ink-mute">{copy.footer}</p>
        </div>
      </div>
    </section>
  );
}
