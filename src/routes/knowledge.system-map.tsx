import { createFileRoute } from "@tanstack/react-router";
import { SYSTEM_BOUNDARIES, SYSTEM_CAPABILITIES, SYSTEM_CAPABILITY_SYNC, type CapabilityStatus, type LocalizedText, type SystemCapability } from "@/lib/system-capability-map";
import { useI18n, type Locale } from "@/lib/i18n";

export const Route = createFileRoute("/knowledge/system-map")({ component: SystemMapPage });

function text(locale: Locale, value: LocalizedText) {
  return locale === "en" ? value[2] : locale === "zh-Hans" ? value[1] : value[0];
}

const EVIDENCE_LABEL: Record<SystemCapability["evidence"], LocalizedText> = {
  "A/B/C/D governance": ["依據分級（A–D）", "依据分级（A–D）", "Graded evidence (A–D)"],
  "deterministic + evidence trace": ["固定算法，依據可查", "固定算法，依据可查", "Fixed calculation, traceable sources"],
  "independent supporting layer": ["獨立參考，不作主判", "独立参考，不作主判", "Separate reference, not the main reading"],
  "cultural / symbolic": ["文化象徵", "文化象征", "Cultural symbolism"],
  "research only": ["僅供研究", "仅供研究", "Research only"],
  "fun only": ["趣味用途", "趣味用途", "For fun"],
  "private archive": ["私人檔案", "私人档案", "Private archive"],
};

const STATUS_CLASS: Record<CapabilityStatus, string> = {
  active: "border-wood/35 bg-wood/10 text-wood",
  partial: "border-earth/35 bg-earth/10 text-earth",
  planned: "border-metal/35 bg-metal/10 text-ink",
  research: "border-water/35 bg-water/10 text-water",
  symbolic: "border-cinnabar/30 bg-cinnabar/5 text-cinnabar",
  private: "border-line bg-cream text-ink-soft",
  fun: "border-fire/30 bg-fire/5 text-fire",
};

function statusLabel(locale: Locale, status: CapabilityStatus) {
  const labels: Record<CapabilityStatus, LocalizedText> = {
    active: ["正式運行", "正式运行", "Active"],
    partial: ["部分運行／持續加固", "部分运行／持续加固", "Partial / hardening"],
    planned: ["已入系統規格／待實作", "已入系统规格／待实现", "Specified / not yet complete"],
    research: ["研究模式", "研究模式", "Research"],
    symbolic: ["象徵層", "象征层", "Symbolic"],
    private: ["私人檔案", "私人档案", "Private archive"],
    fun: ["趣味工具", "趣味工具", "Fun tool"],
  };
  return text(locale, labels[status]);
}

function SystemMapPage() {
  const { locale } = useI18n();
  const title = text(locale, ["昭梧命理系統能力地圖", "昭梧命理系统能力地图", "Zhaowu Metaphysics Capability Map"]);
  const lead = text(locale, [
    "這裡把已正式提供、部分完成、仍在研究與屬於文化象徵的內容分開列出。「已放進網站」不等於「每一項都已是完整的計算功能」；每張卡上的狀態標籤，就是它今天實際能做到的程度。",
    "这里把已正式提供、部分完成、仍在研究与属于文化象征的内容分开列出。“已放进网站”不等于“每一项都已是完整的计算功能”；每张卡上的状态标签，就是它今天实际能做到的程度。",
    "This page separates what is fully available, partly built, still in research, or cultural and symbolic. Being on the site does not mean every item is a finished calculation tool; each label shows what it can actually do today.",
  ]);

  return (
    <main className="mx-auto min-h-screen w-full max-w-6xl px-4 py-8 sm:px-6 sm:py-12" data-system-capability-map="r142">
      <header className="seal-border rounded-3xl bg-paper p-6 sm:p-10">
        <a href="/knowledge" className="text-sm text-cinnabar hover:underline">← {text(locale, ["返回觀世錄／知識庫", "返回观世录／知识库", "Back to Knowledge"])}</a>
        <p className="mt-6 text-xs tracking-[0.24em] text-cinnabar">{text(locale, ["系統現況", "系统现况", "WHERE THINGS STAND"])}</p>
        <h1 className="mt-3 font-display text-4xl leading-tight text-ink sm:text-5xl">{title}</h1>
        <p className="mt-5 max-w-4xl text-[15px] leading-8 text-ink-soft">{lead}</p>
        <div className="mt-6 grid gap-3 sm:grid-cols-3">
          <div className="rounded-2xl border border-line bg-cream p-4"><span className="text-xs text-ink-mute">{text(locale,["同步項目","同步项目","Capabilities"])}</span><strong className="mt-1 block font-display text-3xl text-ink" data-capability-count>{SYSTEM_CAPABILITY_SYNC.capabilityCount}</strong></div>
          <div className="rounded-2xl border border-line bg-cream p-4"><span className="text-xs text-ink-mute">{text(locale,["硬邊界","硬边界","Hard boundaries"])}</span><strong className="mt-1 block font-display text-3xl text-ink" data-boundary-count>{SYSTEM_CAPABILITY_SYNC.boundaryCount}</strong></div>
          <div className="rounded-2xl border border-line bg-cream p-4"><span className="text-xs text-ink-mute">{text(locale,["八字判讀規則版本","八字判读规则版本","BaZi rule version"])}</span><strong className="mt-1 block text-sm leading-6 text-ink">R6.2.1</strong></div>
        </div>
      </header>

      <section className="mt-8 grid gap-4 lg:grid-cols-2" aria-label={text(locale,["系統能力","系统能力","System capabilities"])}>
        {SYSTEM_CAPABILITIES.map((item) => (
          <article key={item.id} id={item.id} className="seal-border rounded-2xl bg-paper p-5 sm:p-6" data-capability-id={item.id} data-capability-status={item.status}>
            <div className="flex flex-wrap items-center gap-2">
              <span className="rounded-full border border-cinnabar/25 bg-cream px-3 py-1 text-[11px] font-semibold tracking-[0.12em] text-cinnabar">{item.priority}</span>
              <span className={`rounded-full border px-3 py-1 text-[11px] font-semibold ${STATUS_CLASS[item.status]}`}>{statusLabel(locale, item.status)}</span>
            </div>
            <h2 className="mt-4 font-display text-2xl leading-tight text-ink">{text(locale, item.title)}</h2>
            <p className="mt-3 text-sm leading-7 text-ink-soft">{text(locale, item.summary)}</p>
            <div className="mt-4 rounded-xl border border-line bg-cream p-4">
              <p className="text-xs font-semibold tracking-[0.12em] text-earth">{text(locale,["目前進度","目前进度","Where it stands"])}</p>
              <p className="mt-2 text-sm leading-6 text-ink-soft">{text(locale, item.implementation)}</p>
            </div>
            <div className="mt-4 flex flex-wrap items-center justify-between gap-3 text-xs text-ink-mute">
              <span>{text(locale,["依據類型","依据类型","Basis"])}：{text(locale, EVIDENCE_LABEL[item.evidence])}</span>
              {item.route ? <a href={item.route} className="inline-flex min-h-10 items-center rounded-full border border-line bg-cream px-4 text-cinnabar">{text(locale,["前往頁面","前往页面","Open this section"])} →</a> : null}
            </div>
          </article>
        ))}
      </section>

      <section className="mt-8 seal-border rounded-3xl bg-paper p-6 sm:p-8" aria-label={text(locale,["不可越過的邊界","不可越过的边界","Hard boundaries"])}>
        <p className="text-xs tracking-[0.22em] text-cinnabar">{text(locale, ["四條界線", "四条界线", "BOUNDARIES"])}</p>
        <h2 className="mt-2 font-display text-3xl text-ink">{text(locale,["四條不可偷換的界線", "四条不可偷换的界线", "Four boundaries that cannot be blurred"])}</h2>
        <div className="mt-5 grid gap-3 sm:grid-cols-2">
          {SYSTEM_BOUNDARIES.map((boundary, index) => (
            <article key={boundary.id} className="rounded-2xl border border-line bg-cream p-5" data-boundary-id={boundary.id}>
              <span className="font-display text-2xl text-earth">{String(index + 1).padStart(2, "0")}</span>
              <h3 className="mt-2 font-display text-xl text-ink">{text(locale, boundary.title)}</h3>
              <p className="mt-2 text-sm leading-7 text-ink-soft">{text(locale, boundary.rule)}</p>
            </article>
          ))}
        </div>
      </section>

      <footer className="mt-8 rounded-2xl border border-line bg-cream p-5 text-sm leading-7 text-ink-soft">
        <strong className="text-ink">{text(locale,["更新原則：", "更新原则：", "How we update: "])}</strong>
        {text(locale,[
          "已經能用的功能直接沿用；還沒完成的，就標明狀態，不把規劃說成功能。新的命理資料都要先查證來源，並且把「怎麼算」和「怎麼解讀」分開處理。",
          "已经能用的功能直接沿用；还没完成的，就标明状态，不把规划说成功能。新的命理资料都要先查证来源，并且把“怎么算”和“怎么解读”分开处理。",
          "Features that already work stay as they are; anything unfinished is labelled as such, never presented as done. New material is checked against its sources first, and how a chart is calculated is kept separate from how it is interpreted.",
        ])}
      </footer>
    </main>
  );
}
