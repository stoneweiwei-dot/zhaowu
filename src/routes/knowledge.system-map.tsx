import { createFileRoute } from "@tanstack/react-router";
import { SYSTEM_BOUNDARIES, SYSTEM_CAPABILITIES, SYSTEM_CAPABILITY_SYNC, type CapabilityStatus, type LocalizedText } from "@/lib/system-capability-map";
import { useI18n, type Locale } from "@/lib/i18n";

export const Route = createFileRoute("/knowledge/system-map")({ component: SystemMapPage });

function text(locale: Locale, value: LocalizedText) {
  return locale === "en" ? value[2] : locale === "zh-Hans" ? value[1] : value[0];
}

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
    planned: ["已入系統規格／待實作", "已入系统规格／待实作", "Specified / not yet complete"],
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
    "這裡把正式運行、部分運行、研究中與象徵性內容分開。『已同步進網站系統』不等於『每一項都已是完成的計算引擎』；狀態標籤就是目前真實能力。",
    "这里把正式运行、部分运行、研究中与象征性内容分开。“已同步进网站系统”不等于“每一项都已是完成的计算引擎”；状态标签就是目前真实能力。",
    "This page separates active, partial, research and symbolic capabilities. Being synchronized into the system does not mean every item is already a finished calculation engine; the status label is the current truth.",
  ]);

  return (
    <main className="mx-auto min-h-screen w-full max-w-6xl px-4 py-8 sm:px-6 sm:py-12" data-system-capability-map="r142">
      <header className="seal-border rounded-3xl bg-paper p-6 sm:p-10">
        <a href="/knowledge" className="text-sm text-cinnabar hover:underline">← {text(locale, ["返回觀世錄／知識庫", "返回观世录／知识库", "Back to Knowledge"])}</a>
        <p className="mt-6 text-xs tracking-[0.24em] text-cinnabar">SYSTEM TRUTH · R6.2.1</p>
        <h1 className="mt-3 font-display text-4xl leading-tight text-ink sm:text-5xl">{title}</h1>
        <p className="mt-5 max-w-4xl text-[15px] leading-8 text-ink-soft">{lead}</p>
        <div className="mt-6 grid gap-3 sm:grid-cols-3">
          <div className="rounded-2xl border border-line bg-cream p-4"><span className="text-xs text-ink-mute">{text(locale,["同步項目","同步项目","Capabilities"])}</span><strong className="mt-1 block font-display text-3xl text-ink" data-capability-count>{SYSTEM_CAPABILITY_SYNC.capabilityCount}</strong></div>
          <div className="rounded-2xl border border-line bg-cream p-4"><span className="text-xs text-ink-mute">{text(locale,["硬邊界","硬边界","Hard boundaries"])}</span><strong className="mt-1 block font-display text-3xl text-ink" data-boundary-count>{SYSTEM_CAPABILITY_SYNC.boundaryCount}</strong></div>
          <div className="rounded-2xl border border-line bg-cream p-4"><span className="text-xs text-ink-mute">{text(locale,["主判母指令","主判母指令","Canonical doctrine"])}</span><strong className="mt-1 block text-sm leading-6 text-ink">R6.2.1</strong></div>
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
              <p className="text-xs font-semibold tracking-[0.12em] text-earth">{text(locale,["目前實作真相","目前实作真相","Current implementation truth"])}</p>
              <p className="mt-2 text-sm leading-6 text-ink-soft">{text(locale, item.implementation)}</p>
            </div>
            <div className="mt-4 flex flex-wrap items-center justify-between gap-3 text-xs text-ink-mute">
              <span>{text(locale,["證據層級","证据层级","Evidence layer"])}：{item.evidence}</span>
              {item.route ? <a href={item.route} className="inline-flex min-h-10 items-center rounded-full border border-line bg-cream px-4 text-cinnabar">{text(locale,["前往現有入口","前往现有入口","Open current route"])} →</a> : null}
            </div>
          </article>
        ))}
      </section>

      <section className="mt-8 seal-border rounded-3xl bg-paper p-6 sm:p-8" aria-label={text(locale,["不可越過的邊界","不可越过的边界","Hard boundaries"])}>
        <p className="text-xs tracking-[0.22em] text-cinnabar">GOVERNANCE BOUNDARIES</p>
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
        <strong className="text-ink">{text(locale,["同步原則：", "同步原则：", "Sync rule: "])}</strong>
        {text(locale,[
          "已存在的能力直接沿用；缺口進入明確狀態，不用規格冒充功能。任何後續命理資料仍先過 ANALYSIS-INGESTION-POLICY，計算真相與解釋真相分離。",
          "已存在的能力直接沿用；缺口进入明确状态，不用规格冒充功能。任何后续命理资料仍先过 ANALYSIS-INGESTION-POLICY，计算真相与解释真相分离。",
          "Existing capabilities are reused; gaps receive an explicit state rather than being misrepresented as features. Future material still passes the ingestion policy, with calculation truth kept separate from interpretation truth.",
        ])}
      </footer>
    </main>
  );
}
