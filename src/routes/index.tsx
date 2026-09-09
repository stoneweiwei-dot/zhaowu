import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { AnalysisForm } from "@/components/analysis-form";
import { AuspiciousGallerySection } from "@/components/auspicious-gallery-section";
import { DailyAlmanacWidget } from "@/components/daily-almanac-widget";
import { FollowUpBox } from "@/components/follow-up-box";
import { HomeScreenInstallPrompt } from "@/components/home-screen-install-prompt";
import { LifeViewHomeSection } from "@/components/life-view-home-section";
import { ResultView } from "@/components/result-view";
import { ScentFiveElementTest } from "@/components/scent-five-element-test";
import { useI18n, type Locale } from "@/lib/i18n";
import { readSharedBirthRecord, SHARED_BIRTH_EVENT, type SharedBirthRecord } from "@/lib/shared-birth";
import {
  buildIndianReading,
  buildPalmReading,
  buildQizhengReading,
  buildWesternReading,
  buildZiweiReading,
  type SpecialistId,
  type SpecialistReading,
} from "@/lib/specialist-reading";
import { useAppStore } from "@/lib/store";
import "@/home-polish-v3.css";
import "@/home-portals.css";
import "@/home-portals-astrology.css";
import "@/home-layout-r46.css";
import "@/home-birth-hub-r60.css";

export const Route = createFileRoute("/")({ component: Home });

type PortalId = SpecialistId | "bazi" | "numerology";

function portalAction(locale: Locale, birth: SharedBirthRecord | null, needsTime: boolean) {
  if (!birth) return locale === "en" ? "Add birth data" : locale === "zh-Hans" ? "填写生辰" : "填寫生辰";
  if (needsTime && birth.timeUnknown) return locale === "en" ? "View · birth time needed for full precision" : locale === "zh-Hans" ? "查看分析 · 完整精度需时辰" : "查看分析 · 完整精度需時辰";
  return locale === "en" ? "Open analysis" : locale === "zh-Hans" ? "查看分析" : "查看分析";
}

function baziAction(locale: Locale, hasResult: boolean) {
  if (hasResult) return locale === "en" ? "Open BaZi analysis" : locale === "zh-Hans" ? "查看八字分析" : "查看八字分析";
  return locale === "en" ? "Start BaZi analysis" : locale === "zh-Hans" ? "开始八字分析" : "開始八字分析";
}

function buildPortalReading(id: SpecialistId, birth: SharedBirthRecord, locale: Locale): SpecialistReading {
  if (id === "western") return buildWesternReading(birth, locale);
  if (id === "ziwei") return buildZiweiReading(birth, locale);
  if (id === "qizheng") return buildQizhengReading(birth, locale);
  if (id === "indian") return buildIndianReading(birth, locale);
  return buildPalmReading(birth, locale);
}

function readingPreview(reading: SpecialistReading | undefined, locale: Locale) {
  if (!reading) return "";
  const raw = reading.warning || reading.sections.find((section) => section.body.trim())?.body || reading.lead;
  const clean = raw.replace(/\s+/g, " ").trim();
  if (clean.length <= 132) return clean;
  return `${clean.slice(0, 130)}${locale === "en" ? "…" : "……"}`;
}

function FiveElementWardrobe({ locale }: { locale: Locale }) {
  const [selected, setSelected] = useState<number | null>(null);
  const copy = locale === "en"
    ? {
        kicker: "Daily dressing · Five-element colour",
        title: "Which state do you want to wear today?",
        lead: "Choose the state you need, then use one main colour as a cue. This is a daily colour prompt, not a BaZi favourable-element judgement.",
        prompt: "Choose one state above. The colour card will give you a simple dressing cue for today.",
        footer: "Wood · Fire · Earth · Metal · Water — everyday colour symbolism only; your personal BaZi colour use is judged separately.",
        items: [
          { element: "Wood", state: "Strength", colorName: "Qingyun 青雲", color: "#4d7567", phrase: "When you need strength, wear Qingyun.", note: "Ground yourself, gather your attention, and move upward with steadiness." },
          { element: "Fire", state: "Shine", colorName: "Jianghua 絳華", color: "#9b4a45", phrase: "When you want to shine, wear Jianghua.", note: "Bring forward presence, warmth, and a clearer sense of action." },
          { element: "Earth", state: "Ease", colorName: "Kunning 坤寧", color: "#9a7b59", phrase: "When you are tired and want to relax, wear Kunning.", note: "Slow the rhythm down and return to a steadier, more settled pace." },
          { element: "Metal", state: "Clarity", colorName: "Liujin 鎏金", color: "#ad8949", phrase: "When you need clarity, wear Liujin.", note: "Reduce noise, make distinctions, and remind yourself what matters most." },
          { element: "Water", state: "Stillness", colorName: "Hanxu 涵虛", color: "#587383", phrase: "When you want a quieter mind, wear Hanxu.", note: "Lower the inner volume and leave some room for reflection." },
        ],
      }
    : locale === "zh-Hans"
      ? {
          kicker: "每日穿衣 · 五行色彩",
          title: "今天想把哪一种状态穿在身上？",
          lead: "先选你今天最需要的状态，再用一种主色做提醒。这里是日常色彩提示，不等同于命局喜忌。",
          prompt: "先选一个你今天需要的状态，下方会给出对应的穿衣色彩提示。",
          footer: "木 · 火 · 土 · 金 · 水｜这里按日常色彩象意呈现；个人命盘用色仍按命局另判。",
          items: [
            { element: "木", state: "力量", colorName: "青云", color: "#4d7567", phrase: "当你需要力量的时候，穿青云。", note: "沉着、向上，把心力重新聚回自己。" },
            { element: "火", state: "发光", colorName: "绛华", color: "#9b4a45", phrase: "当你想要发光的时候，穿绛华。", note: "提高存在感与行动感，让自己更愿意向前一步。" },
            { element: "土", state: "放松", colorName: "坤宁", color: "#9a7b59", phrase: "当你累了想放松的时候，穿坤宁。", note: "让节奏慢下来，把身心重新放回稳定的位置。" },
            { element: "金", state: "清晰", colorName: "鎏金", color: "#ad8949", phrase: "当你需要清晰的时候，穿鎏金。", note: "收敛杂讯，提醒自己做取舍、抓重点。" },
            { element: "水", state: "静心", colorName: "涵虚", color: "#587383", phrase: "当你想要静心的时候，穿涵虚。", note: "降低躁动，为思考与恢复留一点空白。" },
          ],
        }
      : {
          kicker: "每日穿衣 · 五行色彩",
          title: "今天想把哪一種狀態穿在身上？",
          lead: "先選你今天最需要的狀態，再用一種主色做提醒。這裡是日常色彩提示，不等同於命局喜忌。",
          prompt: "先選一個你今天需要的狀態，下方會給出對應的穿衣色彩提示。",
          footer: "木 · 火 · 土 · 金 · 水｜這裡按日常色彩象意呈現；個人命盤用色仍按命局另判。",
          items: [
            { element: "木", state: "力量", colorName: "青雲", color: "#4d7567", phrase: "當你需要力量的時候，穿青雲。", note: "沉著、向上，把心力重新聚回自己。" },
            { element: "火", state: "發光", colorName: "絳華", color: "#9b4a45", phrase: "當你想要發光的時候，穿絳華。", note: "提高存在感與行動感，讓自己更願意向前一步。" },
            { element: "土", state: "放鬆", colorName: "坤寧", color: "#9a7b59", phrase: "當你累了想放鬆的時候，穿坤寧。", note: "讓節奏慢下來，把身心重新放回穩定的位置。" },
            { element: "金", state: "清晰", colorName: "鎏金", color: "#ad8949", phrase: "當你需要清晰的時候，穿鎏金。", note: "收斂雜訊，提醒自己做取捨、抓重點。" },
            { element: "水", state: "靜心", colorName: "涵虛", color: "#587383", phrase: "當你想要靜心的時候，穿涵虛。", note: "降低躁動，為思考與恢復留一點空白。" },
          ],
        };
  const active = selected === null ? null : copy.items[selected];

  return (
    <section
      id="five-element-wardrobe"
      aria-label={copy.title}
      style={{
        position: "relative",
        overflow: "hidden",
        border: "1px solid var(--zw-line)",
        borderRadius: "var(--zw-card-radius, 22px)",
        background: "linear-gradient(145deg, var(--zw-paper-strong), var(--zw-paper-soft))",
        boxShadow: "var(--zw-shadow)",
        padding: "clamp(18px, 4vw, 28px)",
        color: "var(--zw-ink)",
      }}
    >
      <span
        aria-hidden="true"
        style={{
          position: "absolute",
          width: 190,
          height: 190,
          right: -82,
          top: -92,
          borderRadius: "50%",
          background: "radial-gradient(circle, rgba(168, 134, 82, .16), rgba(168, 134, 82, 0) 70%)",
          pointerEvents: "none",
        }}
      />
      <header style={{ position: "relative", display: "flex", flexWrap: "wrap", alignItems: "flex-start", justifyContent: "space-between", gap: 14 }}>
        <div style={{ maxWidth: 650 }}>
          <p style={{ margin: 0, color: "var(--zw-cinnabar)", fontSize: 12, fontWeight: 750, letterSpacing: ".16em" }}>{copy.kicker}</p>
          <h2 style={{ margin: "7px 0 0", fontFamily: 'var(--font-display, "Songti TC", "Noto Serif TC", serif)', fontSize: "clamp(24px, 5vw, 34px)", lineHeight: 1.22, fontWeight: 650, letterSpacing: ".02em" }}>{copy.title}</h2>
          <p style={{ margin: "10px 0 0", maxWidth: 620, color: "var(--zw-ink-soft)", fontSize: 14, lineHeight: 1.75 }}>{copy.lead}</p>
        </div>
        <div aria-hidden="true" style={{ display: "flex", gap: 6, paddingTop: 3 }}>
          {copy.items.map((item) => (
            <span key={item.element} style={{ display: "grid", placeItems: "center", width: 31, height: 31, borderRadius: 999, border: "1px solid var(--zw-line)", background: "var(--zw-paper-strong)", color: "var(--zw-muted)", fontFamily: 'var(--font-display, "Songti TC", serif)', fontSize: 13 }}>{item.element.slice(0, 1)}</span>
          ))}
        </div>
      </header>

      <div role="list" style={{ position: "relative", display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(126px, 1fr))", gap: 9, marginTop: 18 }}>
        {copy.items.map((item, index) => {
          const isActive = selected === index;
          return (
            <button
              key={item.colorName}
              type="button"
              aria-pressed={isActive}
              onClick={() => setSelected((value) => value === index ? null : index)}
              style={{
                minWidth: 0,
                minHeight: 78,
                display: "flex",
                alignItems: "center",
                gap: 11,
                padding: "11px 12px",
                borderRadius: 15,
                border: isActive ? `1.5px solid ${item.color}` : "1px solid var(--zw-line)",
                background: isActive ? "var(--zw-paper-strong)" : "rgba(255, 255, 255, .18)",
                boxShadow: isActive ? "0 10px 26px rgba(55, 44, 29, .09)" : "none",
                color: "var(--zw-ink)",
                textAlign: "left",
                cursor: "pointer",
                transition: "transform 160ms ease, border-color 160ms ease, box-shadow 160ms ease",
              }}
            >
              <span aria-hidden="true" style={{ flex: "0 0 auto", width: 37, height: 37, borderRadius: 999, background: item.color, border: "1px solid rgba(255,255,255,.52)", boxShadow: "inset 0 0 0 1px rgba(40,32,24,.08), 0 4px 12px rgba(40,32,24,.10)" }} />
              <span style={{ minWidth: 0, display: "grid", gap: 2 }}>
                <strong style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", fontFamily: 'var(--font-display, "Songti TC", "Noto Serif TC", serif)', fontSize: 17, lineHeight: 1.2, fontWeight: 650 }}>{item.colorName}</strong>
                <small style={{ color: "var(--zw-muted)", fontSize: 12, lineHeight: 1.3 }}>{item.element} · {item.state}</small>
              </span>
            </button>
          );
        })}
      </div>

      <div
        aria-live="polite"
        style={{
          position: "relative",
          minHeight: 82,
          marginTop: 14,
          padding: "14px 15px 13px",
          borderRadius: 15,
          border: "1px solid var(--zw-line)",
          borderLeft: active ? `4px solid ${active.color}` : "4px solid var(--zw-jade)",
          background: "rgba(255, 255, 255, .16)",
        }}
      >
        {active ? (
          <>
            <p style={{ margin: 0, fontFamily: 'var(--font-display, "Songti TC", "Noto Serif TC", serif)', fontSize: "clamp(18px, 4.4vw, 22px)", lineHeight: 1.45, fontWeight: 650 }}>{active.phrase}</p>
            <p style={{ margin: "6px 0 0", color: "var(--zw-ink-soft)", fontSize: 13, lineHeight: 1.65 }}>{active.note}</p>
          </>
        ) : (
          <p style={{ margin: 0, color: "var(--zw-ink-soft)", fontSize: 14, lineHeight: 1.7 }}>{copy.prompt}</p>
        )}
      </div>

      <p style={{ position: "relative", margin: "10px 0 0", color: "var(--zw-muted)", fontSize: 11.5, lineHeight: 1.55 }}>{copy.footer}</p>
    </section>
  );
}

function Home() {
  const { locale } = useI18n();
  const current = useAppStore((s) => s.current);
  const [birth, setBirth] = useState<SharedBirthRecord | null>(() => readSharedBirthRecord());
  const [scentOpen, setScentOpen] = useState(false);

  useEffect(() => {
    const sync = () => setBirth(readSharedBirthRecord());
    sync();
    window.addEventListener(SHARED_BIRTH_EVENT, sync);
    window.addEventListener("storage", sync);
    return () => {
      window.removeEventListener(SHARED_BIRTH_EVENT, sync);
      window.removeEventListener("storage", sync);
    };
  }, []);

  const portalReadings = useMemo<Partial<Record<SpecialistId, SpecialistReading>>>(() => {
    if (!birth) return {};
    return {
      indian: buildPortalReading("indian", birth, locale),
      western: buildPortalReading("western", birth, locale),
      ziwei: buildPortalReading("ziwei", birth, locale),
      qizheng: buildPortalReading("qizheng", birth, locale),
      past: buildPortalReading("past", birth, locale),
    };
  }, [birth, locale]);

  const portalCopy: { label: string; lead: string; items: Array<{ id: PortalId; to?: "/indian-astrology" | "/astrology" | "/ziwei" | "/qizheng" | "/yizhangjing" | "/numerology"; title: string; hint: string; needsTime: boolean }> } = locale === "en"
    ? {
        label: "Seven personal readings",
        lead: "One birth record, seven independent lenses. Open any volume to read its own analysis.",
        items: [
          { id: "bazi", title: "Four Pillars · BaZi", hint: "structure, balance, timing, and the question in front of you", needsTime: false },
          { id: "ziwei", to: "/ziwei", title: "Zi Wei Dou Shu", hint: "palaces, relationships, work, wealth, and life phases", needsTime: true },
          { id: "western", to: "/astrology", title: "Western astrology", hint: "Sun, Moon, Rising, aspects, and life areas", needsTime: false },
          { id: "indian", to: "/indian-astrology", title: "Classical Indian astrology", hint: "classical karmic patterns; D60 needs an accurate birth minute", needsTime: true },
          { id: "qizheng", to: "/qizheng", title: "Seven Luminaries", hint: "temperament, pressure response, rhythm, and timing", needsTime: true },
          { id: "past", to: "/yizhangjing", title: "Past & Present", hint: "cultural symbolism for recurring habits and themes", needsTime: false },
          { id: "numerology", to: "/numerology", title: "Numerology", hint: "your life number, strengths, pressure points, and Master Number pattern", needsTime: false },
        ],
      }
    : locale === "zh-Hans"
      ? {
          label: "七种个人分析",
          lead: "同一份出生资料，各自独立判断。点开任何一卷，直接阅读对应分析。",
          items: [
            { id: "bazi", title: "子平八字", hint: "格局、旺衰、取用、岁运，以及你正在问的事", needsTime: false },
            { id: "ziwei", to: "/ziwei", title: "紫微斗数", hint: "宫位、关系、事业、财务与人生阶段", needsTime: true },
            { id: "western", to: "/astrology", title: "西洋星座", hint: "太阳、月亮、上升、相位与人生领域", needsTime: false },
            { id: "indian", to: "/indian-astrology", title: "印度古法占星", hint: "古典业力结构；D60 需要准确出生分钟", needsTime: true },
            { id: "qizheng", to: "/qizheng", title: "七政四余", hint: "性情、压力反应、节奏与天时变化", needsTime: true },
            { id: "past", to: "/yizhangjing", title: "前世今生", hint: "以文化象意阅读反复出现的习性与课题", needsTime: false },
            { id: "numerology", to: "/numerology", title: "生命灵数", hint: "自动计算生命灵数，并看强项、课题与大师数 11／22／33", needsTime: false },
          ],
        }
      : {
          label: "七種個人分析",
          lead: "同一份出生資料，各自獨立判斷。點開任何一卷，直接閱讀對應分析。",
          items: [
            { id: "bazi", title: "子平八字", hint: "格局、旺衰、取用、歲運，以及你正在問的事", needsTime: false },
            { id: "ziwei", to: "/ziwei", title: "紫微斗數", hint: "宮位、關係、事業、財務與人生階段", needsTime: true },
            { id: "western", to: "/astrology", title: "西洋星座", hint: "太陽、月亮、上升、相位與人生領域", needsTime: false },
            { id: "indian", to: "/indian-astrology", title: "印度古法占星", hint: "古典業力結構；D60 需要準確出生分鐘", needsTime: true },
            { id: "qizheng", to: "/qizheng", title: "七政四餘", hint: "性情、壓力反應、節奏與天時變化", needsTime: true },
            { id: "past", to: "/yizhangjing", title: "前世今生", hint: "以文化象意閱讀反覆出現的習性與課題", needsTime: false },
            { id: "numerology", to: "/numerology", title: "生命靈數", hint: "自動計算生命靈數，並看強項、課題與大師數 11／22／33", needsTime: false },
          ],
        };

  const funCopy = locale === "en"
    ? {
        title: "Light self-reflection",
        lead: "Optional short tests. Nothing expands until you choose it.",
        scentTitle: "Five-Element Scent Map",
        scentHint: "sensory preference compared with five-element cultural imagery",
        cards: [
          { href: "/fun-tests?test=animal", title: "Inner Animal × Guardian Beast", hint: "current personality strategy and instinctive response" },
          { href: "/fun-tests?test=element", title: "Five-Element Function Test", hint: "which function you currently want to strengthen" },
          { href: "/quiz/six-realms", title: "Six Realms Habit Test", hint: "which everyday habit pattern is strongest now" },
        ],
      }
    : locale === "zh-Hans"
      ? {
          title: "轻测验",
          lead: "想玩再打开；未选择的内容不会占满页面。",
          scentTitle: "五行香气谱",
          scentHint: "看嗅觉偏好与五行文化象意，不当成身体缺什么",
          cards: [
            { href: "/fun-tests?test=animal", title: "内在动物 × 命局瑞兽", hint: "看现在常用的人格策略与本能反应" },
            { href: "/fun-tests?test=element", title: "五行功能测验", hint: "看现在主观上最想加强哪一种功能" },
            { href: "/quiz/six-realms", title: "六道习气测验", hint: "看目前最明显的日常惯性" },
          ],
        }
      : {
          title: "輕測驗",
          lead: "想玩再打開；未選擇的內容不會佔滿頁面。",
          scentTitle: "五行香氣譜",
          scentHint: "看嗅覺偏好與五行文化象意，不當成身體缺什麼",
          cards: [
            { href: "/fun-tests?test=animal", title: "內在動物 × 命局瑞獸", hint: "看現在常用的人格策略與本能反應" },
            { href: "/fun-tests?test=element", title: "五行功能測驗", hint: "看現在主觀上最想加強哪一種功能" },
            { href: "/quiz/six-realms", title: "六道習氣測驗", hint: "看目前最明顯的日常慣性" },
          ],
        };

  return (
    <main className="zhaowu-home-sheet-page zhaowu-home-layout">
      <div className="zhaowu-home-stage zhaowu-home-stage--daily"><DailyAlmanacWidget /></div>
      <div className="zhaowu-home-stage"><FiveElementWardrobe locale={locale} /></div>

      <div className="zhaowu-home-stage zhaowu-home-stage--primary relative">
        <AnalysisForm />
      </div>

      {current ? <div className="zhaowu-home-stage zhaowu-home-stage--result"><ResultView result={current} /></div> : null}
      {current ? <div className="zhaowu-home-stage zhaowu-home-stage--result"><FollowUpBox result={current} /></div> : null}

      <section id="analysis-reports" className="zhaowu-home-stage zhaowu-home-stage--directory zhaowu-home-portals-block" aria-label={portalCopy.label}>
        <header className="zhaowu-home-portals-heading">
          <h2>{portalCopy.label}</h2>
          <span>{portalCopy.lead}</span>
        </header>
        <div className="zhaowu-home-portals">
          {portalCopy.items.map((item, itemIndex) => {
            const reading = item.id === "bazi" || item.id === "numerology" ? undefined : portalReadings[item.id];
            const preview = readingPreview(reading, locale);
            const content = (
              <>
                <span className="zhaowu-home-portal-copy">
                  <strong>{item.title}</strong>
                  <small className="zhaowu-home-portal-hint">{item.hint}</small>
                  {birth && preview ? <small className="zhaowu-home-portal-preview">{preview}</small> : null}
                </span>
                <span className="zhaowu-home-portal-action">
                  {item.id === "bazi" ? baziAction(locale, Boolean(current)) : portalAction(locale, birth, item.needsTime)}
                  <span aria-hidden="true">›</span>
                </span>
              </>
            );

            return item.id === "bazi" ? (
              <a key={item.id} href={current ? "#result" : "#analysisForm"} data-index={String(itemIndex + 1).padStart(2, "0")} data-specialist-link="bazi" className="zhaowu-home-portal is-bazi">
                {content}
              </a>
            ) : (
              <Link
                key={item.id}
                to={item.to!}
                data-index={String(itemIndex + 1).padStart(2, "0")}
                data-specialist-link={item.id}
                className="zhaowu-home-portal"
                aria-label={`${item.title} · ${portalAction(locale, birth, item.needsTime)}`}
              >
                {content}
              </Link>
            );
          })}
        </div>
      </section>

      <section className="zhaowu-home-stage zhaowu-home-stage--directory zhaowu-home-fun-section" aria-label={funCopy.title}>
        <header className="zhaowu-home-fun-heading">
          <h2>{funCopy.title}</h2>
          <p>{funCopy.lead}</p>
        </header>
        <div className="zhaowu-home-fun-grid">
          {funCopy.cards.map((card) => (
            <a key={card.title} href={card.href} className="zhaowu-home-fun-card" aria-label={card.title}>
              <span className="min-w-0"><strong>{card.title}</strong><small>{card.hint}</small></span>
              <span className="zhaowu-home-fun-arrow" aria-hidden>›</span>
            </a>
          ))}
          <button type="button" className="zhaowu-home-fun-card text-left" aria-expanded={scentOpen} aria-controls="home-scent-test" onClick={() => setScentOpen((value) => !value)}>
            <span className="min-w-0"><strong>{funCopy.scentTitle}</strong><small>{funCopy.scentHint}</small></span>
            <span className="zhaowu-home-fun-arrow" aria-hidden>{scentOpen ? "⌃" : "›"}</span>
          </button>
        </div>
        <div id="home-scent-test" data-scent-panel hidden={!scentOpen}>
          {scentOpen ? <ScentFiveElementTest result={current} /> : null}
        </div>
      </section>

      <div className="zhaowu-home-stage zhaowu-home-stage--gallery"><AuspiciousGallerySection /></div>
      <div className="zhaowu-home-stage zhaowu-home-stage--notes"><LifeViewHomeSection /></div>
      <div className="zhaowu-home-stage"><HomeScreenInstallPrompt /></div>
    </main>
  );
}