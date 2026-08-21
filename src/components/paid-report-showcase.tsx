import { Mark } from "@/components/marks";
import { paidReportStyle } from "@/lib/report/paid-report-style";
import { useI18n } from "@/lib/i18n";

const COPY = {
  "zh-Hant": {
    kicker: "昭梧收費版 · 四柱繪意",
    title: "不是多一篇長文，而是把你的命局做成一件可收藏的作品",
    lead: "子平命理先完成判斷，再把四柱、格局、流通與人生主題轉譯成專屬畫面。每一個重要視覺元素，都必須能反查命局依據。",
    evidence: "命局證據",
    meaning: "人生含義",
    image: "視覺象徵",
    day: "日柱 · 核心本體",
    month: "月柱 · 人生環境",
    year: "年柱 · 天地背景",
    hour: "時柱 · 未來出口",
    final: "最終訂製畫",
    finalBody: "天地、主體、環境、行動與法器合成為一幅統一命局總像。",
    ratio: "9:16 iPhone 收藏版",
    cta: "先完成我的分析",
    note: "正式收費版以命理準確為第一順位；畫面不能反過來篡改命局。",
  },
  "zh-Hans": {
    kicker: "昭梧收费版 · 四柱绘意",
    title: "不是多一篇长文，而是把你的命局做成一件可收藏的作品",
    lead: "子平命理先完成判断，再把四柱、格局、流通与人生主题转译成专属画面。每一个重要视觉元素，都必须能反查命局依据。",
    evidence: "命局证据",
    meaning: "人生含义",
    image: "视觉象征",
    day: "日柱 · 核心本体",
    month: "月柱 · 人生环境",
    year: "年柱 · 天地背景",
    hour: "时柱 · 未来出口",
    final: "最终订制画",
    finalBody: "天地、主体、环境、行动与法器合成为一幅统一命局总像。",
    ratio: "9:16 iPhone 收藏版",
    cta: "先完成我的分析",
    note: "正式收费版以命理准确为第一优先；画面不能反过来篡改命局。",
  },
  en: {
    kicker: "ZHAOWU PAID EDITION · FOUR PILLARS IN ART",
    title: "Not another long report — a collectible visual interpretation of your chart",
    lead: "Zi Ping judgement comes first. Only then are the Four Pillars, structural dynamics and life themes translated into a bespoke visual system. Every major visual element must trace back to chart evidence.",
    evidence: "Chart evidence",
    meaning: "Life meaning",
    image: "Visual symbol",
    day: "Day Pillar · Core self",
    month: "Month Pillar · Life environment",
    year: "Year Pillar · World backdrop",
    hour: "Hour Pillar · Future outlet",
    final: "Final commissioned artwork",
    finalBody: "World, subject, environment, action and symbolic object resolve into one coherent chart image.",
    ratio: "9:16 iPhone collectible edition",
    cta: "Start my analysis first",
    note: "In the paid edition, accuracy comes before aesthetics. The image never overrides the chart.",
  },
} as const;

const ROLES = [
  { key: "day", mark: "05", tone: "from-[#142d2a] to-[#20483f]" },
  { key: "month", mark: "11", tone: "from-[#c9bda4] to-[#8f948b]" },
  { key: "year", mark: "03", tone: "from-[#c78944] to-[#e5b769]" },
  { key: "hour", mark: "16", tone: "from-[#294d35] to-[#60734f]" },
] as const;

export function PaidReportShowcase() {
  const { locale } = useI18n();
  const copy = COPY[locale];

  return (
    <section
      className="relative overflow-hidden rounded-[1.75rem] border border-[#b99755]/35 bg-[#f4eddf] p-5 shadow-[0_24px_70px_rgba(72,52,31,.1)] sm:p-8"
      aria-labelledby="paid-report-title"
    >
      <div className="pointer-events-none absolute inset-0 opacity-35 [background-image:radial-gradient(circle_at_15%_15%,rgba(176,137,75,.12),transparent_24%),radial-gradient(circle_at_88%_80%,rgba(52,90,76,.12),transparent_25%)]" aria-hidden />
      <div className="relative z-10 grid gap-8 lg:grid-cols-[minmax(0,1fr)_360px] lg:items-center">
        <div>
          <p className="text-[11px] font-semibold tracking-[0.28em] text-cinnabar">{copy.kicker}</p>
          <h2 id="paid-report-title" className="mt-3 max-w-3xl font-display text-2xl font-semibold leading-10 tracking-[0.04em] text-ink sm:text-3xl">
            {copy.title}
          </h2>
          <p className="mt-4 max-w-3xl text-sm leading-7 text-ink-soft">{copy.lead}</p>

          <div className="mt-6 flex flex-wrap items-center gap-2 text-xs text-ink-soft">
            <span className="rounded-full border border-line bg-cream/80 px-3 py-2">{copy.evidence}</span>
            <span className="text-cinnabar">→</span>
            <span className="rounded-full border border-line bg-cream/80 px-3 py-2">{copy.meaning}</span>
            <span className="text-cinnabar">→</span>
            <span className="rounded-full border border-line bg-cream/80 px-3 py-2">{copy.image}</span>
          </div>

          <div className="mt-6 grid gap-3 sm:grid-cols-2">
            {ROLES.map((role) => (
              <article key={role.key} className="relative overflow-hidden rounded-xl border border-line/80 bg-cream/70 p-4">
                <Mark id={role.mark} size={82} className="pointer-events-none absolute -right-3 -top-3 w-20 opacity-15" />
                <p className="relative z-10 font-display text-base tracking-[0.04em] text-ink">{copy[role.key]}</p>
                <p className="relative z-10 mt-2 text-xs leading-6 text-ink-mute">{paidReportStyle.pillarRoles[role.key]}</p>
                <div className={`mt-4 h-1.5 w-20 rounded-full bg-gradient-to-r ${role.tone}`} aria-hidden />
              </article>
            ))}
          </div>

          <div className="mt-6 rounded-xl border border-[#b99755]/40 bg-[#fffaf0]/75 p-4">
            <p className="font-display text-lg text-ink">{copy.final}</p>
            <p className="mt-2 text-sm leading-7 text-ink-soft">{copy.finalBody}</p>
          </div>

          <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center">
            <a href="#analysisForm" className="inline-flex min-h-12 items-center justify-center rounded-full bg-cinnabar px-6 text-sm tracking-[0.06em] text-cream">
              {copy.cta}
            </a>
            <span className="text-xs leading-6 text-ink-mute">{copy.note}</span>
          </div>
        </div>

        <div className="mx-auto w-full max-w-[360px]">
          <div className="relative aspect-[9/16] overflow-hidden rounded-[1.6rem] border border-[#9f7a3f]/45 bg-[#f8f1e4] p-5 shadow-[0_30px_70px_rgba(68,48,27,.18)]">
            <div className="absolute inset-x-5 top-5 flex items-center justify-between text-[10px] tracking-[0.18em] text-[#86652f]">
              <span>昭梧</span><span>{copy.ratio}</span>
            </div>
            <div className="absolute inset-x-5 top-14 h-[42%] overflow-hidden rounded-xl border border-[#ad8a51]/25 bg-[radial-gradient(circle_at_70%_20%,rgba(236,190,91,.68),transparent_28%),linear-gradient(155deg,#ddbd72_0%,#d9c59c_28%,#879a83_62%,#18342d_100%)]">
              <Mark id="brand" size={180} eager className="absolute -bottom-8 -right-6 w-36 rotate-6 opacity-45" />
              <Mark id="04" size={100} className="absolute bottom-3 left-4 w-16 opacity-40" />
              <div className="absolute bottom-4 left-4 right-4">
                <p className="font-display text-2xl tracking-[0.08em] text-[#fff5d9]">四柱繪意</p>
                <p className="mt-1 text-[10px] tracking-[0.12em] text-[#fff5d9]/70">DESTINY · TIMING · CHOICE</p>
              </div>
            </div>
            <div className="absolute inset-x-5 top-[51%]">
              <p className="text-[10px] tracking-[0.2em] text-cinnabar">01 · 命局總像</p>
              <h3 className="mt-2 font-display text-xl tracking-[0.05em] text-ink">專屬命名 · 一局一景</h3>
              <div className="mt-4 space-y-2 text-[11px] leading-5 text-ink-soft">
                <p>日柱決定核心主體，月柱決定人生場域。</p>
                <p>年柱形成天地背景，時柱決定未來出口與動作。</p>
                <p>最終畫面只保留能被命局證據支持的元素。</p>
              </div>
            </div>
            <div className="absolute inset-x-5 bottom-5 flex items-end justify-between border-t border-[#b99755]/30 pt-3">
              <span className="text-[10px] tracking-[0.14em] text-ink-mute">{paidReportStyle.id}</span>
              <span className="font-display text-xs text-cinnabar">STONE 原創</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
