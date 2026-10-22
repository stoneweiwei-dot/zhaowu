import { useState } from "react";
import { useI18n, type Locale } from "@/lib/i18n";

type Text3 = readonly [string, string, string];
type Shape = "cloud" | "proto" | "sun" | "giant" | "helium" | "nebula" | "white" | "blue" | "supergiant" | "collapse" | "neutron" | "blackhole";
type Stage = { id: string; title: Text3; time: Text3; lead: Text3; science: Text3; shape: Shape };

const t = (value: Text3, locale: Locale) => value[locale === "en" ? 2 : locale === "zh-Hans" ? 1 : 0];

const sunStages: readonly Stage[] = [
  {
    id: "cloud", shape: "cloud",
    title: ["分子雲", "分子云", "Molecular cloud"],
    time: ["恆星誕生之前", "恒星诞生之前", "Before stellar birth"],
    lead: ["冰冷的氣體與塵埃在局部重力作用下聚集。", "冰冷的气体与尘埃在局部引力作用下聚集。", "Cold gas and dust gather in dense regions under gravity."],
    science: ["密度較高的區域可能開始坍縮並碎裂，形成恆星的胚胎。此階段尚沒有穩定的核心氫融合。", "密度较高的区域可能开始坍缩并碎裂，形成恒星的胚胎。此阶段尚没有稳定的核心氢聚变。", "Dense pockets may collapse and fragment. Stable core hydrogen fusion has not yet begun."],
  },
  {
    id: "proto", shape: "proto",
    title: ["原恆星", "原恒星", "Protostar"],
    time: ["初期數百萬年（近似）", "初期数百万年（近似）", "First several million years (approx.)"],
    lead: ["重力使核心升溫；吸積盤持續輸送物質。", "引力使核心升温；吸积盘继续输送物质。", "Gravity heats the core while a disc feeds the growing star."],
    science: ["主要光度來自收縮與吸積。核心還沒有維持主序所需的穩定氫融合。", "主要亮度来自收缩与吸积。核心还没有维持主序所需的稳定氢聚变。", "Much of the luminosity comes from contraction and accretion, before steady core hydrogen fusion."],
  },
  {
    id: "main", shape: "sun",
    title: ["主序星｜今天的太陽", "主序星｜今天的太阳", "Main sequence | the Sun today"],
    time: ["總長約 100 億年；太陽現齡約 46 億年", "总长约 100 亿年；太阳现龄约 46 亿年", "About 10 billion years in total; Sun now ~4.6 billion years old"],
    lead: ["核心的氫融合成氦，向外壓力與重力保持近似平衡。", "核心的氢聚变成氦，向外压力与引力保持近似平衡。", "Hydrogen fuses into helium; outward pressure balances gravity."],
    science: ["主序星不是恆星的出生或死亡，而是它最長的穩定期。太陽屬 G 型主序星；質量越大的恆星，燃料通常消耗得越快。", "主序星不是恒星的出生或死亡，而是它最长的稳定期。太阳属于 G 型主序星；质量越大的恒星，燃料通常消耗得越快。", "The main sequence is usually the longest stable phase. The Sun is a G-type star; more massive stars generally burn through fuel much faster."],
  },
  {
    id: "giant", shape: "giant",
    title: ["次巨星與紅巨星", "次巨星与红巨星", "Subgiant and red giant"],
    time: ["約 50 億年後開始逐步演變", "约 50 亿年后开始逐步演变", "Evolution begins roughly 5 billion years from now"],
    lead: ["核心氫耗盡，核心收縮；外層膨脹並冷卻。", "核心氢耗尽，核心收缩；外层膨胀并冷却。", "Core hydrogen runs low; the core contracts and the envelope swells."],
    science: ["氫可在核心外的殼層繼續融合。表面較冷而呈紅色，半徑卻會大幅增加；太陽將吞沒水星與金星，地球結局依模型仍有細節差異。", "氢可在核心外的壳层继续聚变。表面较冷而呈红色，半径却会大幅增加；太阳将吞没水星与金星，地球结局依模型仍有细节差异。", "Hydrogen shell fusion continues. The cooler surface looks redder despite a much larger radius; Mercury and Venus will be engulfed, while Earth's exact fate is model-dependent."],
  },
  {
    id: "helium", shape: "helium",
    title: ["核心燃氦", "核心燃氦", "Core helium burning"],
    time: ["紅巨星之後，相對短暫", "红巨星之后，相对短暂", "After red-giant ascent; comparatively brief"],
    lead: ["核心氦融合成碳與氧，短暫達到新的平衡。", "核心氦聚变成碳与氧，短暂达到新的平衡。", "Helium fuses into carbon and oxygen in a new, shorter stable phase."],
    science: ["太陽這類低質量恆星的核心氦點燃涉及氦閃；燃氦穩定階段常稱紅團塊階段。", "太阳这类低质量恒星的核心氦点燃涉及氦闪；燃氦稳定阶段常称红团块阶段。", "In low-mass stars like the Sun, core helium ignition involves a helium flash; the stable period is often described as the red-clump phase."],
  },
  {
    id: "nebula", shape: "nebula",
    title: ["漸近巨星支與行星狀星雲", "渐近巨星支与行星状星云", "AGB and planetary nebula"],
    time: ["晚期外層流失與擴散", "晚期外层流失与扩散", "Late-stage envelope loss"],
    lead: ["恆星再次膨脹，外層物質被拋向太空。", "恒星再次膨胀，外层物质被抛向太空。", "The star expands again and sheds its outer atmosphere."],
    science: ["裸露的熱核心照亮拋出的氣體，形成行星狀星雲。這不是行星形成區，且星雲與白矮星的早期階段可以同時存在。", "裸露的热核心照亮抛出的气体，形成行星状星云。这不是行星形成区，且星云与白矮星的早期阶段可以同时存在。", "The hot exposed core can illuminate the expelled gas. It is not planet formation, and a planetary nebula can coexist with a young white dwarf."],
  },
  {
    id: "white", shape: "white",
    title: ["白矮星", "白矮星", "White dwarf"],
    time: ["餘生逐步冷卻：極其漫長", "余生逐步冷却：极其漫长", "Slow cooling over extremely long times"],
    lead: ["地球般大小的高密度殘核，不再維持正常核心核融合。", "地球般大小的高密度残核，不再维持正常核心核聚变。", "A compact, Earth-sized remnant that no longer sustains normal core fusion."],
    science: ["白矮星靠殘餘熱發光並逐漸冷卻。理論上的黑矮星需要比目前宇宙年齡更長的冷卻時間；尚未觀測到黑矮星。", "白矮星靠残余热发光并逐渐冷却。理论上的黑矮星需要比目前宇宙年龄更长的冷却时间；尚未观测到黑矮星。", "A white dwarf radiates stored heat. A hypothetical black dwarf would require longer than the current age of the universe to cool that far; none has been observed."],
  },
];

const massiveStages: readonly Stage[] = [
  {
    id: "cloud", shape: "cloud",
    title: ["巨大分子雲", "巨大分子云", "Giant molecular cloud"],
    time: ["形成之前", "形成之前", "Before formation"],
    lead: ["高密度區域形成大質量恆星的胚胎。", "高密度区域形成大质量恒星的胚胎。", "Dense gas assembles the seeds of massive stars."],
    science: ["大質量恆星的形成同樣涉及重力收縮，但吸積、輻射回饋與多星系統使過程更複雜。", "大质量恒星的形成同样涉及引力收缩，但吸积、辐射反馈与多星系统使过程更复杂。", "Gravity drives the process, while accretion, radiation feedback and multiple stars complicate it."],
  },
  {
    id: "proto", shape: "proto",
    title: ["大質量原恆星", "大质量原恒星", "Massive protostar"],
    time: ["快速形成", "快速形成", "Rapid formation"],
    lead: ["核心升溫很快，仍可能持續吸積。", "核心升温很快，仍可能持续吸积。", "The core heats rapidly, sometimes while material is still falling in."],
    science: ["大質量恆星可在吸積尚未完全停止時開始核心氫融合，階段界線未必像簡圖一樣分明。", "大质量恒星可在吸积尚未完全停止时开始核心氢聚变，阶段界线未必像简图一样分明。", "A massive star can begin core hydrogen fusion while accretion is still under way; the stages overlap."],
  },
  {
    id: "main", shape: "blue",
    title: ["高質量主序星", "高质量主序星", "Massive main-sequence star"],
    time: ["通常只有數百萬至數千萬年", "通常只有数百万至数千万年", "Usually millions to tens of millions of years"],
    lead: ["質量更大、光度極高，也更快消耗核心氫。", "质量更大、亮度极高，也更快消耗核心氢。", "Hot, luminous and fast-burning despite having more fuel."],
    science: ["以出生質量約八倍太陽以上作為教學分界；這只是近似值，實際演化依金屬豐度、旋轉與伴星而不同。", "以出生质量约八倍太阳以上作为教学分界；这只是近似值，实际演化依金属丰度、旋转与伴星而不同。", "Roughly eight solar masses is a useful teaching threshold, not an exact cutoff; metallicity, rotation and binary companions matter."],
  },
  {
    id: "supergiant", shape: "supergiant",
    title: ["超巨星與晚期融合", "超巨星与晚期聚变", "Supergiant and advanced burning"],
    time: ["主序結束後，較短暫", "主序结束后，较短暂", "Shorter than the main sequence"],
    lead: ["核心開始融合更重元素；部分恆星出現紅超巨星階段。", "核心开始聚变更重元素；部分恒星出现红超巨星阶段。", "Progressively heavier nuclei form; some become red supergiants."],
    science: ["並非全部大質量恆星都必定是紅超巨星：強烈質量流失可使外層剝除，演化為其他高溫型態。", "并非全部大质量恒星都必定是红超巨星：强烈质量流失可使外层剥离，演化为其他高温形态。", "Not every massive star becomes a red supergiant; strong mass loss can strip the envelope and produce hot, compact evolutionary stages."],
  },
  {
    id: "collapse", shape: "collapse",
    title: ["核心坍縮／超新星", "核心坍缩／超新星", "Core collapse / supernova"],
    time: ["核心失穩時，急劇發生", "核心失稳时，急剧发生", "Rapidly, when the core becomes unstable"],
    lead: ["核心失去足夠支撐，可能觸發猛烈爆炸。", "核心失去足够支撑，可能触发猛烈爆炸。", "The core loses support; an explosive event may follow."],
    science: ["典型的核心坍縮超新星會拋出外層物質；但部分大質量恆星可能出現很暗或失敗的爆炸。這並不是白矮星路徑。", "典型的核心坍缩超新星会抛出外层物质；但部分大质量恒星可能出现很暗或失败的爆炸。这并不是白矮星路径。", "Many core-collapse events eject a supernova remnant, but some explosions are faint or fail. This is distinct from the Sun-like white-dwarf path."],
  },
  {
    id: "remnant", shape: "neutron",
    title: ["中子星或黑洞", "中子星或黑洞", "Neutron star or black hole"],
    time: ["坍縮後的致密殘骸", "坍缩后的致密残骸", "Compact post-collapse remnant"],
    lead: ["最終結局取決於坍縮後殘留核心的條件。", "最终结局取决于坍缩后残留核心的条件。", "The outcome depends on the remnant core and collapse physics."],
    science: ["下方可切換兩種常見結局。出生質量不能單獨精確預言殘骸類型；特殊條件下還有其他可能結局。", "下方可切换两种常见结局。出生质量不能单独精确预言残骸类型；特殊条件下还有其他可能结局。", "Explore two common outcomes below. Birth mass alone cannot precisely predict the remnant; unusual conditions can lead to other fates."],
  },
];

function StellarDiagram({ shape, alt }: { shape: Shape; alt: string }) {
  const isCloud = shape === "cloud";
  const isProto = shape === "proto";
  const isNebula = shape === "nebula";
  const isWhite = shape === "white";
  const isNeutron = shape === "neutron";
  const isBlack = shape === "blackhole";
  const isCollapse = shape === "collapse";
  const isLarge = shape === "giant" || shape === "supergiant";
  const isBlue = shape === "blue";
  const radius = shape === "supergiant" ? 103 : shape === "giant" ? 83 : shape === "helium" ? 68 : isBlue ? 48 : 52;
  const starColor = isBlue ? "#8dbfe9" : shape === "supergiant" ? "#bc5a43" : isLarge ? "#d99763" : shape === "helium" ? "#edbc77" : "#f7d58a";
  return (
    <svg className="block h-auto w-full" viewBox="0 0 640 280" role="img" aria-label={alt} xmlns="http://www.w3.org/2000/svg">
      <title>{alt}</title>
      <defs>
        <radialGradient id="zws-star" cx="42%" cy="35%" r="69%">
          <stop offset="0%" stopColor="#fff8e4" />
          <stop offset="45%" stopColor={starColor} />
          <stop offset="100%" stopColor={isBlue ? "#426fa7" : "#b96347"} />
        </radialGradient>
        <radialGradient id="zws-haze">
          <stop offset="0%" stopColor="#b8c8bb" stopOpacity=".7" />
          <stop offset="100%" stopColor="#b8c8bb" stopOpacity="0" />
        </radialGradient>
      </defs>
      <rect width="640" height="280" rx="18" fill="#f7f2e8" />
      <circle cx="320" cy="142" r="134" fill="url(#zws-haze)" />
      {Array.from({ length: 18 }, (_, i) => (
        <circle key={i} cx={32 + ((i * 131) % 579)} cy={24 + ((i * 67) % 232)} r={i % 4 === 0 ? 2 : 1.15} fill="#72867c" opacity=".45" />
      ))}
      {isCloud || isProto ? (
        <g>
          <ellipse cx="267" cy="133" rx="164" ry="60" transform="rotate(-19 267 133)" fill="#a9b9b0" opacity=".65" />
          <ellipse cx="374" cy="150" rx="153" ry="58" transform="rotate(24 374 150)" fill="#cfb59d" opacity=".65" />
          <ellipse cx="322" cy="137" rx="124" ry="67" fill="#e2c9a5" opacity=".57" />
        </g>
      ) : null}
      {isProto ? (
        <g>
          <ellipse cx="320" cy="140" rx="129" ry="26" fill="none" stroke="#9d705a" strokeWidth="13" opacity=".67" transform="rotate(-18 320 140)" />
          <circle cx="320" cy="137" r="29" fill="url(#zws-star)" stroke="#f3d8a0" strokeWidth="3" />
          <path d="M320 101 L298 42 M320 174 L341 237" stroke="#a88769" strokeWidth="7" opacity=".55" strokeLinecap="round" />
        </g>
      ) : null}
      {!isCloud && !isProto && !isNebula && !isWhite && !isNeutron && !isBlack && !isCollapse ? (
        <g>
          <circle cx="320" cy="140" r={radius + 22} fill={starColor} opacity=".12" />
          <circle cx="320" cy="140" r={radius} fill="url(#zws-star)" stroke="#e6b778" strokeWidth="1.5" />
          <circle cx="320" cy="140" r={shape === "helium" ? 23 : Math.max(13, radius / 3.4)} fill="#fff5ca" opacity=".85" />
          {shape === "helium" ? <circle cx="320" cy="140" r="38" fill="none" stroke="#b65a35" strokeDasharray="5 7" strokeWidth="2" /> : null}
        </g>
      ) : null}
      {isNebula ? (
        <g>
          <ellipse cx="320" cy="140" rx="164" ry="105" fill="#bdd3bb" opacity=".37" />
          <ellipse cx="320" cy="140" rx="134" ry="91" fill="none" stroke="#91bbaf" strokeWidth="28" opacity=".54" />
          <ellipse cx="320" cy="140" rx="89" ry="67" fill="none" stroke="#d9aa88" strokeWidth="26" opacity=".64" />
          <ellipse cx="320" cy="140" rx="54" ry="45" fill="none" stroke="#edd7a5" strokeWidth="15" opacity=".85" />
          <circle cx="320" cy="140" r="14" fill="#fcfbf6" stroke="#aebdc5" strokeWidth="4" />
        </g>
      ) : null}
      {isWhite ? (
        <g>
          <circle cx="320" cy="140" r="63" fill="#bdd4d7" opacity=".13" />
          <circle cx="320" cy="140" r="28" fill="#ddebf0" opacity=".45" />
          <circle cx="320" cy="140" r="15" fill="#fffdf3" stroke="#aac7d3" strokeWidth="3" />
        </g>
      ) : null}
      {isCollapse ? (
        <g strokeLinecap="round">
          {Array.from({ length: 16 }, (_, i) => {
            const theta = (i / 16) * Math.PI * 2;
            return <line key={i} x1={320 + 48 * Math.cos(theta)} y1={140 + 48 * Math.sin(theta)} x2={320 + (85 + i % 3 * 24) * Math.cos(theta)} y2={140 + (85 + i % 3 * 24) * Math.sin(theta)} stroke={i % 2 ? "#d6a05d" : "#bb6854"} strokeWidth={i % 2 ? 7 : 4} opacity=".82" />;
          })}
          <circle cx="320" cy="140" r="48" fill="#eec781" opacity=".38" />
          <circle cx="320" cy="140" r="25" fill="#fff6c8" />
        </g>
      ) : null}
      {isNeutron ? (
        <g>
          <ellipse cx="320" cy="140" rx="116" ry="35" transform="rotate(-21 320 140)" fill="none" stroke="#7d9bb7" strokeWidth="7" opacity=".55" />
          <path d="M318 119 L279 24 M322 163 L363 258" stroke="#a2bbdb" strokeWidth="12" opacity=".52" strokeLinecap="round" />
          <circle cx="320" cy="140" r="27" fill="#8ba5c8" />
          <circle cx="320" cy="140" r="17" fill="#dce6ef" stroke="#5f7eaf" strokeWidth="3" />
        </g>
      ) : null}
      {isBlack ? (
        <g>
          <ellipse cx="320" cy="140" rx="119" ry="41" transform="rotate(-18 320 140)" fill="none" stroke="#c78862" strokeWidth="17" opacity=".8" />
          <ellipse cx="320" cy="140" rx="113" ry="37" transform="rotate(-18 320 140)" fill="none" stroke="#efc28a" strokeWidth="4" />
          <circle cx="320" cy="140" r="49" fill="#252b35" stroke="#a88b73" strokeWidth="8" />
          <circle cx="320" cy="140" r="37" fill="#141923" />
        </g>
      ) : null}
      <path d="M26 253 H614" stroke="#ddd4c3" strokeWidth="1" />
    </svg>
  );
}

export function StellarLifeCycleInteractive() {
  const { locale } = useI18n();
  const [mass, setMass] = useState<"solar" | "massive">("solar");
  const [index, setIndex] = useState(0);
  const [remnant, setRemnant] = useState<"neutron" | "blackhole">("neutron");
  const stages = mass === "solar" ? sunStages : massiveStages;
  const stage = stages[index];
  const hasRemnantChoice = mass === "massive" && stage.id === "remnant";
  const shape = hasRemnantChoice ? remnant : stage.shape;
  function changeMass(next: "solar" | "massive") {
    setMass(next);
    setIndex(0);
    setRemnant("neutron");
  }
  return (
    <section data-stellar-life-cycle="interactive" className="my-7 overflow-hidden rounded-2xl border border-line bg-[#fbf8f1] p-3 text-ink sm:p-5">
      <p className="text-xs font-semibold tracking-[0.16em] text-cinnabar">{t(["恆星演化圖解 · 可互動", "恒星演化图解 · 可互动", "INTERACTIVE STELLAR EVOLUTION"], locale)}</p>
      <h3 className="mt-2 font-display text-2xl leading-tight">{t(["選擇質量，按階段探索", "选择质量，按阶段探索", "Choose a mass, then explore each stage"], locale)}</h3>
      <p className="mt-2 text-sm leading-6 text-ink-soft">{t(["時間依順序排列，階段間距不代表實際時間長短。", "时间依顺序排列，阶段间距不代表实际时间长短。", "Stages appear in sequence; equal spacing does not mean equal elapsed time."], locale)}</p>
      <div className="mt-4 grid grid-cols-2 gap-2" role="group" aria-label={t(["恆星質量", "恒星质量", "Stellar mass"], locale)}>
        <button type="button" onClick={() => changeMass("solar")} aria-pressed={mass === "solar"} className={mass === "solar" ? "min-h-12 rounded-xl border border-cinnabar bg-cream px-3 py-2 text-sm font-semibold text-cinnabar" : "min-h-12 rounded-xl border border-line bg-paper px-3 py-2 text-sm text-ink"}>{t(["類太陽恆星", "类太阳恒星", "Sun-like star"], locale)}</button>
        <button type="button" onClick={() => changeMass("massive")} aria-pressed={mass === "massive"} className={mass === "massive" ? "min-h-12 rounded-xl border border-cinnabar bg-cream px-3 py-2 text-sm font-semibold text-cinnabar" : "min-h-12 rounded-xl border border-line bg-paper px-3 py-2 text-sm text-ink"}>{t(["大質量恆星", "大质量恒星", "Massive star"], locale)}</button>
      </div>
      <div className="mt-4 grid grid-cols-2 gap-2 sm:grid-cols-4" role="group" aria-label={t(["依時間排列的演化階段", "依时间排列的演化阶段", "Evolution stages in time order"], locale)}>
        {stages.map((item, i) => (
          <button key={item.id} type="button" onClick={() => setIndex(i)} aria-current={i === index ? "step" : undefined} className={i === index ? "min-h-14 rounded-xl border border-cinnabar bg-cream px-3 py-2 text-left text-xs font-semibold leading-5 text-cinnabar" : "min-h-14 rounded-xl border border-line bg-paper px-3 py-2 text-left text-xs leading-5 text-ink-soft"}>
            <span className="mr-2 font-mono">{String(i + 1).padStart(2, "0")}</span>{t(item.title, locale)}
          </button>
        ))}
      </div>
      <div className="mt-4" aria-live="polite" aria-atomic="true">
        <p className="text-xs font-semibold tracking-[0.1em] text-earth">{index + 1} / {stages.length} · {t(stage.time, locale)}</p>
        <h4 className="mt-2 font-display text-xl leading-tight text-ink">{t(stage.title, locale)}</h4>
        <figure className="mt-3 overflow-hidden rounded-xl border border-line bg-paper">
          <StellarDiagram shape={shape} alt={t(stage.title, locale)} />
          <figcaption className="px-3 py-2 text-xs text-ink-mute">{t(["概念示意｜不按真實比例", "概念示意｜不按真实比例", "Concept illustration | not to scale"], locale)}</figcaption>
        </figure>
        <p className="mt-3 text-[15px] font-medium leading-7 text-ink">{t(stage.lead, locale)}</p>
        <p className="mt-2 text-sm leading-7 text-ink-soft">{t(stage.science, locale)}</p>
        {hasRemnantChoice ? (
          <div className="mt-4">
            <p className="mb-2 text-xs font-semibold tracking-[0.1em] text-earth">{t(["選擇可能的終局", "选择可能的终局", "Explore a possible ending"], locale)}</p>
            <div className="grid grid-cols-2 gap-2">
              <button type="button" aria-pressed={remnant === "neutron"} onClick={() => setRemnant("neutron")} className={remnant === "neutron" ? "min-h-12 rounded-xl border border-cinnabar bg-cream px-3 py-2 text-sm font-semibold text-cinnabar" : "min-h-12 rounded-xl border border-line bg-paper px-3 py-2 text-sm text-ink"}>{t(["中子星", "中子星", "Neutron star"], locale)}</button>
              <button type="button" aria-pressed={remnant === "blackhole"} onClick={() => setRemnant("blackhole")} className={remnant === "blackhole" ? "min-h-12 rounded-xl border border-cinnabar bg-cream px-3 py-2 text-sm font-semibold text-cinnabar" : "min-h-12 rounded-xl border border-line bg-paper px-3 py-2 text-sm text-ink"}>{t(["黑洞", "黑洞", "Black hole"], locale)}</button>
            </div>
            <p className="mt-3 text-sm leading-7 text-ink-soft">{remnant === "neutron"
              ? t(["部分核心留下由中子簡併壓支撐的極高密度中子星；有些可被觀測為脈衝星。", "部分核心留下由中子简并压支撑的极高密度中子星；有些可被观测为脉冲星。", "Some collapses leave an ultra-dense neutron star; a subset are observable as pulsars."], locale)
              : t(["如果坍縮後的核心重力超出可維持穩定的條件，便可能形成黑洞。結果不是只由出生質量決定。", "如果坍缩后的核心引力超出可维持稳定的条件，便可能形成黑洞。结果不是只由出生质量决定。", "If gravity overwhelms all stable support, collapse may form a black hole. Birth mass alone does not determine this outcome."], locale)}</p>
          </div>
        ) : null}
      </div>
      <div className="mt-5 flex items-center justify-between gap-3">
        <button type="button" disabled={index === 0} onClick={() => setIndex((i) => Math.max(0, i - 1))} className="min-h-11 rounded-full border border-line bg-paper px-5 py-2 text-sm text-ink disabled:cursor-not-allowed disabled:opacity-40">{t(["← 上一步", "← 上一步", "← Previous"], locale)}</button>
        <button type="button" disabled={index === stages.length - 1} onClick={() => setIndex((i) => Math.min(stages.length - 1, i + 1))} className="min-h-11 rounded-full border border-line bg-paper px-5 py-2 text-sm text-ink disabled:cursor-not-allowed disabled:opacity-40">{t(["下一步 →", "下一步 →", "Next →"], locale)}</button>
      </div>
      <p className="mt-5 border-t border-line pt-4 text-xs leading-6 text-ink-mute">{t(["科學依據：NASA 恆星演化、太陽資料。年齡與質量門檻均為近似值；不同金屬豐度、旋轉、伴星與質量流失會改變演化。", "科学依据：NASA 恒星演化、太阳资料。年龄与质量门槛均为近似值；不同金属丰度、旋转、伴星与质量流失会改变演化。", "Sources: NASA stellar lifecycle and Sun facts. Times and mass thresholds are approximate; composition, rotation, companions and mass loss change the details."], locale)}</p>
      <nav className="mt-2 flex flex-wrap gap-x-4 gap-y-2 text-xs text-cinnabar" aria-label={t(["科學來源", "科学来源", "Scientific sources"], locale)}>
        <a href="https://science.nasa.gov/mission/webb/star-lifecycle/" target="_blank" rel="noopener noreferrer" className="underline underline-offset-4">NASA · Star lifecycle</a>
        <a href="https://science.nasa.gov/sun/facts/" target="_blank" rel="noopener noreferrer" className="underline underline-offset-4">NASA · The Sun</a>
        <a href="https://science.nasa.gov/universe/stories/quick-reads/the-lives-times-and-deaths-of-stars/" target="_blank" rel="noopener noreferrer" className="underline underline-offset-4">NASA · Stellar endings</a>
      </nav>
    </section>
  );
}
